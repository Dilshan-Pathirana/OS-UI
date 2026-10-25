# Reference: Cure HMS web app (`HMS-Dilshan`)

> Snapshot analysis taken on 2026-10-21 from a local copy of
> https://github.com/Dilshan-Pathirana/HMS-Dilshan before the copy was removed from this repo.
> The GitHub repo is the source of truth. Re-verify anything here against it before writing integration code.
> Items marked *(likely, verify)* or *(guess)* were inferred, not confirmed in a file.
> Secrets, passwords and server IPs are deliberately omitted from this file.

**Production:** web `https://cure.lk`, API `https://api.cure.lk/api/v1` (also `https://cure.lk/api/v1`). Cure.lk is a multi-branch homeopathy and medical centre chain in Sri Lanka.

## Top facts for the Home Hub

1. The backend has **no device, household, family, guardian, face or biometric tables**. Every `/patient/*` endpoint resolves the patient from the logged-in user.
2. **Patient tokens last 1 hour (access AND refresh)**, hard-coded in `core/security.py` (settings `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` exist but are ignored). Staff: 12 h access / 30 d refresh.
3. Home vitals already have a table, **`self_reported_vital`**, but it has no `source`, device or idempotency columns, and **staff have no endpoint to read it** (doctors cannot see home readings today).
4. **No push infrastructure** (no FCM/Expo/web-push). Clients poll. The only WebSocket (`/ws/alerts`) has no per-user authorisation.
5. Security items to fix before any device launch: see §5.

## 1. Stack

| Concern | Backend (`backend/`) |
|---|---|
| Framework | FastAPI ^0.109, Uvicorn ^0.27, Python 3.12 (`python:3.12-slim`), Poetry (no lock file committed) |
| ORM / DB | SQLModel ^0.0.14 (SQLAlchemy + Pydantic v2), async sessions; **MySQL 8.0** via `asyncmy`, `utf8mb4`; pool 20 / overflow 40 / recycle 3600 s; optional TLS `DB_SSL_CA` |
| Migrations | Alembic, ~160 revisions, single head `20261009_patient_privacy`; no `create_all` |
| Auth | PyJWT HS256, passlib bcrypt, `OAuth2PasswordBearer` |
| Rate limit | slowapi, in-memory, per client IP, default 60/min; login 10/min; OTP 5/min |
| Jobs | No Celery/Redis; `asyncio.create_task` loops in lifespan (`ENABLE_BACKGROUND_JOBS`) + `BackgroundTasks` |
| Storage | Local `UPLOAD_DIR` or S3 (`FILE_STORAGE_BACKEND=s3`), fallback to local |
| Integrations | Textware SMS, PayHere (LKR), WhatsApp Cloud API, IMAP/SMTP mailbox, Ollama LLM (`llama3.2:3b`) chatbot |
| Tests | pytest + pytest-asyncio + httpx `ASGITransport` + aiosqlite in-memory (~30 tests) |

Frontend (`frontend/`): React 18.3, TS 5.5, Vite 5.4, React Router 6.27, Redux Toolkit 2 + redux-persist, TanStack Query 5, Tailwind 3.4, Headless UI, framer-motion, gsap, lenis, lucide-react, Recharts 2.12, @react-pdf/renderer, jsPDF, xlsx. No i18n library. Axios base `/api/v1`, bearer token from `localStorage`, `X-Acting-Branch-Id` header for super-admin POS. Built in CI, served by nginx:alpine.

Root-level `package.json`, `vite.config.js`, `.env.example` are **Laravel leftovers**; FastAPI settings are documented in `.env.local.example`. `mobile/` is a **stale early Expo app** (SDK 54, package `com.hms.patient`) — the current patient app is the separate `patient-app` repo.

## 2. Layout and conventions

- `backend/app/main.py` (~1,644 lines): lifespan loops, exception handlers, hard-coded CORS list, GZip, 25 MB body cap, security headers, `/uploads` static (only `documents/`, `resignations/` auth-gated), ~100 routers, legacy compat routes.
- `app/core/`: `config.py`, `database.py` (`get_session`), `security.py` (JWT, hashing, lifetimes), `permissions.py` (`ROLES`, `require_roles()`, `require_self_or_roles()`), `branch_scope.py`, `audit.py` (`ChangeLog`, `log_change()`), `file_upload.py`, `rate_limit.py`, `pagination.py`, `validation.py` (phone `0XXXXXXXXX` / `+94XXXXXXXXX`), **`vital_ranges.py`** (plausibility; "keep in sync with patient-app `src/utils/vitalRanges.ts`"), **`fhir_export.py`** (FHIR R4, LOINC/UCUM), `soft_delete.py`.
- `app/api/` (104 modules) — hub-relevant: `auth.py`, `users.py`, `patients.py`, **`patient_dashboard.py`** (notifications, medications, doses, self vitals, vital parameters, health conditions), `patient_privacy.py` (consent, export, delete), `patient_appointments.py`, `notifications.py`, `websocket_alerts.py`, `nurse.py`, `patient_sessions.py` (queue, nurse assessment), `lab_requests.py`, **`video_loop.py`** (per-branch waiting-room kiosk account, role 31 — the only device-like precedent), `online_sessions_patient.py`, `sms.py`, `whatsapp.py`.
- `app/services/` (41): `notification_service.py`, `sms_service.py`, `sms_notifications.py` (24 h, 1 h, next-visit SMS loops), `appointment_service.py`, `display_id_service.py`.
- **Per-feature pattern:** `models/<feature>.py` (Base / table / Create / Read / Update classes) → `api/<feature>.py` (`router = APIRouter()`, mounted in `main.py` at `/api/v1/<kebab-prefix>`) → `services/<feature>_service.py` (static-method classes).
- Every route: `session: AsyncSession = Depends(get_session)`, `current_user: User = Depends(get_current_user)`, then `require_roles(...)` or inline role check. Self-service: `select(Patient).where(Patient.user_id == current_user.id)`.
- Comments explain *why*, security fixes tagged `# SECURITY:`. Sri Lanka time helpers `_sl_now()`/`_sl_today()` (UTC + `APP_TZ_OFFSET_MINUTES=330`).
- **Primary keys:** `str` UUID4 (36). Table names singular snake_case.
- **Timestamps:** most `created_at` naive UTC; some columns are **naive Sri Lanka local** (`consultation.started_at`, `investigation.ordered_at`, `issued_medicine.issued_at`, `sms_log.created_at`, appointment date/time).
- **Migrations:** revision ids `YYYYMMDD[b]_snake_description` (≤64 chars); idempotent (inspect before create); **read FK collation from `information_schema`** (prod mixes `utf8mb4_0900_ai_ci` on `user.id` with `utf8mb4_unicode_ci` default); per-column `MODIFY COLUMN` for charset changes.
- Errors: `{"detail": "..."}`; 422 `{"success":false,"detail":"Validation Error","errors":{...}}`. Success envelopes vary (`bare`, `{status:200,...}`, `{success:true,data}`).
- Pagination is mixed (`skip/limit` + `X-Total-Count`, `page/page_size`, or none).

## 3. Data model (hub-relevant)

**Roles (`role_as`)**: 1 Super Admin, 2 Branch Admin, 3 Doctor, 4 Nurse, **5 Patient**, 6 Cashier/Receptionist, 7 Pharmacist, 8 IT Support, 9 Center Aid, 10 Auditor, 11 Supplier, 12–16 lab roles (**12–15 collide** with Support Staff/Therapist/Radiology/Med Tech — issue #2), 17 Receptionist/Surgical Tech, 18 Counselor, 19 Speech Therapist, 20 Physiotherapist, 21–26 Paramedic…Secretary, 27/28 Supply, 29 HRM Manager, 30 Dietitian, **31 Video-loop kiosk**. **32+ free.** No permission table.

**`user`**: `id`, `email` (unique), `username` (unique), `hashed_password`, `is_active`, `force_password_change`, `title`, `display_id` (e.g. `patient-014`), `role_as`, `user_type`, `branch_id`, `first_name`, `last_name`, `date_of_birth` (str 20), `gender`, `nic_number`, `contact_number_mobile`, `contact_number_landline`, `home_address`, `emergency_contact_info` (free text), **`photo_path`** (avatar), `nic_photo_path`, staff HR fields.

**`patient`**: `id`, `user_id` (unique FK, 1:1), `date_of_birth` (date), `gender`, `blood_group`, `address`, `contact_number`, `emergency_contact`, `height`, `weight`. (Duplicates some `user` fields.)
Also `patient_profile` (doctor intake: `height_cm`, `weight_kg`, `next_visit_date`), `patient_session`, `health_condition`, **`patient_consent`** (`user_id`, `policy_version` str 20, `source` default `mobile`, `consented_at`, `withdrawn_at`; never deleted).

**Family / guardians: none.** Patient phone numbers are unique, so one phone = one patient.

**Vitals — four sources:**
1. `appointment` columns (clinical, nurse/doctor): `systolic_bp`, `diastolic_bp`, `temperature`, `weight`, `height`, `pulse`, `spo2`, `blood_sugar`. Read by `GET /patients/{id}/vitals-history`.
2. `vital_sign` (nurse domain; includes respiratory rate, BMI, allergies…).
3. **`self_reported_vital`** — where hub readings belong: `id`, `patient_id`, `kind` (str 40 = parameter key), `value`, `value_secondary` (diastolic), `unit`, `context` (`fasting|random|after_meal`, sugar only), `recorded_at` (naive UTC, serialised with `Z`), `created_at`. **No source/device/idempotency columns.**
4. `patient_vital_parameter`: per-patient tile list `key, label, unit, icon, color, is_builtin, enabled, sort_order`. Built-ins: `bmi`, `bp`, `sugar`, `weight`, `pulse`, `temperature`, `spo2`. BMI cannot be self-reported.

Plausibility (`core/vital_ranges.py`): pulse 20–250; spo2 50–100; bp sys 50–260, dia 30–160, dia < sys; temperature 30–45 °C (°F gets a hint); weight 2–350 kg; sugar 20–700 mg/dL. `recorded_at` allowed from −366 days to +5 minutes (good for offline backlog). Custom kinds not range-checked.

**Medications:** `consultation` → `prescription_container` (homeopathy containers) → `consultation_prescription` (`medicine_name`, `dosage`, `frequency`, `duration` are **free text**). **`medication_dose_log`**: `patient_id`, `prescription_id`, `dose_date` — **one row per prescription per day; no dose slot/time.**

**Appointments / queue:** `appointment` (`status` pending|confirmed|in_progress|completed|cancelled|no_show|pending_payment; `queue_number`), `schedule_session`, `session_queue` (`current_doctor_slot`), `online_session_booking` (`meeting_link`).

**Notifications:** `notification` (`user_id`, `role`, `title`, `message`, `type` info|warning|success|error, `is_read`, `data` JSON text, `link` (also de-dup key), `created_at`, `read_at`; read ones >7 d deleted daily). `sms_log` stores full message text (incl. OTPs) — a privacy concern.

**Media:** avatar = `user.photo_path`, stored `avatars/<uuid>.<ext>` locally or S3, **served without authentication**. `patient_observation` photos/videos also public by unguessable URL.

**Audit:** generic `change_log` (rarely used) + domain logs. **PHI reads are not audited.**

**Branches:** `branch` (`center_name`, `code`, …); doctors ↔ branches via `doctor_branch_link`; one organisation, many branches.

## 4. API surface (all under `/api/v1`)

Auth: `POST /auth/login/access-token` (**form** `username` = email or phone, `password`; 10/min) → `{access_token, refresh_token, token_type, user:{id,email,role_as,first_name,last_name,branch_id,…,display_id}}`; `POST /auth/refresh-token {token}` (rotates; old jti blacklisted); `POST /auth/logout`; `GET /auth/validate-session`; `POST /auth/register`; OTP signup `/auth/signup/send-otp` → `/verify-otp` → `POST /users/patients`; password reset routes; account deletion.
JWT claims: `sub` (user id), `type` (access|refresh|…), `jti`, `iat`, `exp`. **No role claim** — role loaded from DB each request (2 queries/request incl. blacklist).

Profile/photo: `GET /patients/me` (role 5), `GET /users/me`, `GET /users/me/profile` (`profile_picture` URL), `PUT /patient/profile/{user_id}`, `POST /users/me/profile-picture` (multipart `profile_picture`, jpg/png/gif/webp ≤5 MB), `DELETE /users/me/profile-picture`. Photo download is an **unauthenticated** GET of the URL.

Vitals: `GET/POST /patient/vital-parameters`, `PATCH/DELETE /patient/vital-parameters/{id}`; `GET /patient/self-vitals?kind=&limit=30` (no offset/date range); `POST /patient/self-vitals {kind, value, value_secondary?, unit, context?, recorded_at?}` (422 on range errors); `GET /patients/{patient_id}/vitals-history`; nurse `POST/GET /nurse/vital-signs` (roles 1–4).

Medications (path param is **user id**): `GET /patient/medications/{user_id}` → `{status:200, medications:[{id, name, dosage, frequency, duration, start_date, end_date, prescribed_by, status, instructions, quantity}]}`; `GET …/doses?dose_date=YYYY-MM-DD` → `{date, taken_prescription_ids}`; `POST …/doses/toggle {prescription_id, dose_date}` → `{taken}`.

Appointments: `GET /patient/appointments/my-appointments?status&skip&limit` (+ `doctor_name`, `branch_name`, `slot_number`, `current_queue_token`); legacy `GET /get-patient-appointments/{user_id}`; book/cancel/reschedule; `GET /patient/online-sessions/bookings` (`meeting_link`).

Notifications: `GET /notifications?tab=new|past`, `GET /notifications/unread-count` → `{unread}` (note: `/patient/notifications/unread-count/{user_id}` → `{count}`), `PUT /notifications/{id}/read`, `PUT /notifications/read-all`.

Other: consent `GET/POST /patient/consent {policy_version}`; `GET /patient/export` (FHIR R4; self-reported readings included); `GET /lab-requests/by-patient/{patient_id}`; WebSocket `/ws/alerts?channel=low-stock-alerts|queue-updates|general&token=<JWT>` (outside `/api/v1`); `GET /health`. OpenAPI at `/docs` unless `APP_ENV=production`.

## 5. Security posture

> **2026-10-22:** most items below were fixed by HMS commit 9b711d50 (deployed). Current status and the remaining items: `docs/03-roadmap/HMS_AND_APP_CHANGES.md` §1 and H-13.

In place: bcrypt; password policy (8+, letter+digit; `/users/patients` only 6); OTPs via `secrets` and signed JWT; blacklist on logout/refresh; slowapi limits; CORS allow-list; security headers; 25 MB cap; upload validation; deny-by-default patient record access (`_assert_patient_access`); backend bound to loopback behind Apache TLS; least-privilege DB users (DML runtime user, separate migrator); 6-hourly backups + binlog PITR + pre-deploy snapshots; PDPA consent table; FHIR export; account deletion with anonymisation.

Gaps (severity order) — fix before connecting devices:
1. A **production DB password sits in plain text in `HMS-Dilshan/.claude/settings.local.json`** (Claude Code permission allow-list with SSH/MySQL commands). Checked on 2026-10-21: the file is **untracked** (not committed), so it is local-only — but add `.claude/settings.local.json` to `.gitignore` and rotate the password if the file was ever shared.
2. `APP_ENV` is never set in the production `.env` or compose → defaults to `development` → `/docs` likely public and the localhost CORS regex active *(likely, verify)*.
3. `POST /users/patients` (unauthenticated) can overwrite an existing patient's password when the email matches and the OTP-verified phone is unused, and returns the plain password *(likely, verify)*.
4. `POST /sms/send` lets any authenticated user (incl. patients) send arbitrary SMS with the Cure sender ID.
5. Uvicorn `--forwarded-allow-ips "*"` → client-controlled `X-Forwarded-For` → per-IP rate limits bypassable *(likely)*; limiter is per-process in-memory.
6. Patient files (`/uploads/avatars`, `/uploads/patient-observations/…`, S3 URLs) are public by URL.
7. No app-level encryption at rest; `sms_log` stores OTPs/passwords in plain text.
8. Password change doesn't revoke tokens; `token_blacklist` never pruned; web JWTs in `localStorage`; WebSocket token in query string with no channel authorisation (`queue-updates` carries patient names).
9. PHI reads not audited; doctors/nurses can read any patient's `vitals-history` across branches.
10. Smaller: `POST /notifications/broadcast` filters on non-existent `User.role`; email settings undefined; Textware URL `http://`; reminder loop registered with `@app.on_event("startup")` alongside `lifespan` so in-app 24 h/1 h reminders probably never fire *(likely, verify)*.

## 6. Realtime and notifications
No push. WebSocket `/ws/alerts` (heartbeat 30 s; web app polls instead: queue 30 s, unread 60 s). SMS templates via Textware (booking, 24 h/1 h reminders, queue approaching, cancellation, reschedule, next-visit, online session); Sinhala sent with `lan=u`. WhatsApp inbound webhook only.

## 7. Deployment
Hostinger VPS (Ubuntu 22.04). Apache2 TLS (Let's Encrypt) → `cure.lk` (`/api/`, `/uploads/` → backend `127.0.0.1:8000`; rest → frontend `127.0.0.1:8080`), `api.cure.lk` → backend. MySQL 8 on the host (`host.docker.internal`). `docker-compose.hostinger.yml`: backend (single uvicorn process, healthcheck `/health`, `RUN_MIGRATIONS=0`, `SKIP_DB_WAIT=1`) + frontend (nginx). Local: `docker-compose.local.yml` (MySQL 3308, backend 8000, frontend 8090, `ENABLE_BACKGROUND_JOBS=false`); `docker-compose.local-test.yml` (MySQL 3307 + migrate). CI `.github/workflows/deploy.yml`: build frontend → SCP → write `.env` from secrets → DB preflight + pre-deploy dump to S3 → Alembic as migrator → tag `:previous`, swap backend, health-check with auto-rollback → swap frontend → Apache patches.

Env var names (no values): `APP_ENV`, `FILE_STORAGE_BACKEND`, `UPLOAD_DIR`, `APP_TZ_OFFSET_MINUTES`, `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSL_CA`, `DB_SSL_VERIFY`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`, `SMS_*`, `FRONTEND_URL`, `PAYHERE_*`, `AWS_*`, `OLLAMA_*`, `ENABLE_BACKGROUND_JOBS`, `WHATSAPP_*`, `META_APP_SECRET`, `MAILBOX_*`; deploy-only `RUN_MIGRATIONS`, `SKIP_DB_WAIT`, `MIGRATION_DB_USERNAME`, `MIGRATION_DB_PASSWORD`, `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`. `BACKEND_CORS_ORIGINS` written but never read.

## 8. Known issues (from `issues.md`, `NEXT_STEPS.md`)
Open: #2 role 12–15 collision; #3 HR policy rendering; #10 six tests fail on SQLite `INSERT IGNORE`. HRM restructure follow-ups (negative-auth tests, audit stubs). Fixed: utf8mb4 mojibake, SMS `lan=u`, app-wide UTC vs SL-time bugs, server-side OTP.

## 9. Integration surface for Cure Home

### Reusable today (patient-token mode, prototype only)
Login/refresh/logout; `/patients/me`, `/users/me/profile` (photo URL); `/patient/vital-parameters`; `GET/POST /patient/self-vitals` (kinds `bp`, `pulse`, `spo2`, `temperature`, `weight`, `sugar`); medications + doses; my-appointments (slot + current token); online sessions (`meeting_link`); notifications; consent; FHIR export; `vitals-history` for clinic comparison.
Limits: 1-hour patient refresh tokens; one session per member; household NAT shares the 60/min IP limit.

### Must be added to HMS (follow conventions: `models/home_hub.py`, `api/home_hub.py` mounted at `/api/v1/hub`, `services/home_hub_service.py`, idempotent migration `YYYYMMDD_add_home_hub_tables.py` reading FK collations)
1. **Device identity**: `home_hub_device` (`id`, `serial_number` unique, `display_name`, `household_id`, `owner_user_id`, `branch_id?`, `status` pending|active|revoked, `public_key` / `secret_hash`, `firmware_version`, `last_seen_at`, `last_ip`, `paired_at`, `revoked_at`, timestamps); `hub_pairing_code` (`code_hash`, `device_id`, `claimed_by_user_id`, `expires_at`, `used_at`). JWT `type="device"`, `sub=device_id`, own rotating refresh; dependency `get_current_hub_device()` in `api/deps.py`; reuse `token_blacklist`. Endpoints `POST /hub/pairing/start`, `POST /hub/pairing/claim` (patient JWT via QR), `POST /hub/auth/token`, `POST /hub/auth/refresh`, `POST /hub/heartbeat`, `GET/DELETE /patient/hub-devices`. (Alternative: role 32 kiosk user like video-loop role 31 — the separate table is cleaner.)
2. **Household**: `household` (`id`, `name`, `primary_user_id`); `household_member` (`household_id`, `patient_id`, `relationship` self|spouse|parent|child|other, `role` owner|guardian|member, `can_view`, `can_record`, `consent_id`, `added_by`, `removed_at`); optional `patient_guardian` for login-less dependents; `hub_device_patient` (`device_id`, `patient_id`, `enrolled_at`, `enrolled_by`, `is_active`). Endpoints `GET /hub/members`, `GET /hub/members/{patient_id}/{profile|vital-parameters|self-vitals|medications|doses|appointments|notifications}` with a new hub-to-patient access check.
3. **Vitals ingestion**: extend `self_reported_vital` with `source` (manual|mobile|hub|health_connect), `device_id`, `peripheral_id`, `client_reading_id` (unique with `patient_id`), `identified_by` (face|pin|manual_select), `measured_by_user_id`, `raw_payload`. Add `POST /hub/members/{patient_id}/vitals:batch` reusing `validate_self_vital`, `validate_context`, `normalize_recorded_at`, `canonical_unit`; per-item results; idempotent. New kinds (`body_fat`, …) must be added in `core/vital_ranges.py`, the patient-app copy, `BUILTIN_VITAL_PARAMETERS`, and `core/fhir_export.py` (LOINC). `ble_peripheral` table (`device_id`, `patient_id?`, `kind`, `vendor`, `model`, `mac_hash`, `paired_at`, `last_reading_at`).
4. **Clinician visibility**: `GET /patients/{patient_id}/self-vitals` for roles 1, 2, 3, 4, 19, 20 via `_assert_patient_access`.
5. **Face**: prefer on-device embeddings only. If ever server-side: `face_embedding` (`patient_id`, `device_id`, `model_name`, `model_version`, encrypted `embedding`, `quality_score`, `revoked_at`). Biometric consent purpose on `patient_consent` (or new `policy_version`). Authenticated photo endpoint `GET /hub/members/{patient_id}/photo`.
6. **Medication schedule**: `medication_schedule` (`prescription_id`, `patient_id`, `times_of_day` JSON, `timezone`, `source`, `created_by`); extend `medication_dose_log` with `dose_slot`, `taken_at`, `source`, `device_id`, unique (`prescription_id`, `dose_date`, `dose_slot`).
7. **Alerts/push**: `vital_alert_rule`; `push_subscription`; or per-user WebSocket channel with authorisation (+ Redis pub/sub if >1 worker).
8. **Audit**: `device_event_log` (pairing, enrolment, identification, uploads).
9. **Pre-launch fixes**: set `APP_ENV=production`; rotate exposed DB password; stop `/users/patients` overwriting accounts; restrict `/sms/send`; fix forwarded-IP trust; rate-limit device routes by `device_id`; make token lifetimes configurable.
