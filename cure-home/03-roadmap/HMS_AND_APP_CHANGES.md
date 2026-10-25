# Changes needed in Cure HMS (web) and the Cure Patient app (Android) for Cure Home

*v3 · 2026-10-22 · All decisions made (§6) and the plan implemented (status below).
v2 · 2026-10-22 · Decisions of 2026-10-22 applied (§6). Sources: `HMS-Dilshan` at `origin/main` 9b711d50 (local `main` is one commit behind — pull first), `patient-app` `main` d1e354b (plus uncommitted icon / `package.json` / `app.json` edits in the working tree), and a read-only inspection of the production server. The target contract is the one Cure Home already runs against: `services/hms-stub` (behaviour + contract tests) and `docs/02-architecture/SYSTEM_DESIGN.md` §3.4 and §5.*

**IDs:** `H-` HMS backend · `W-` HMS web frontend · `A-` Android app · `D-` decision.
**Priority:** **P0** before any real household uses a hub · **P1** for the pilot · **P2** later.

**Status (v3, 2026-10-22).** Implemented on branch `feature/cure-home-integration` in all three
repos and merged to `main`:
- **HMS backend** — H-01…H-12: migration `20261022_add_home_hub` (checked on a copy of the production
  schema: upgrade, downgrade, re-upgrade), `/api/v1/hub/*` device API (Ed25519 pairing and auth,
  rotating refresh with reuse detection), patient family/photo/hub/claim/schedule/dose/target/push
  routes, clinician targets and home readings, private avatars with the YuNet scan, Expo push.
  Tests: 54 passed.
- **HMS web** — W-01…W-10 (profile photo, assisted photo, family, Cure Home pairing and claims,
  doctor's targets and home readings in the consultation and nurse views, super-admin devices,
  `assetlinks.json`).
- **Patient app** — A-01…A-10 (on-phone photo check with ML Kit + pixel checks, family, pairing by
  QR/App Link, guest claims, reading sources and idempotent ids, doctor's targets, medicine times
  synced, privacy, push, English-only strings with fallback). Release APK builds (versionCode 3).
- **Cure Home** — QR codes are `https://cure.lk/hub/pair|claim`, dose check-offs use the per-slot
  `PUT`, and the stub matches HMS. A production install for the Surface Pro test hub:
  `docs/06-operations/SURFACE_PRO_UBUNTU.md`.

Still to do outside the code: the Play App Signing SHA-256 in `assetlinks.json`, Firebase (FCM)
credentials for Android push, and an S3 policy that keeps the `private/` prefix private.

**The decisions in one paragraph.** The member's **account avatar is their face sign-in photo**. Members upload it themselves; **parents add their children** ("Add family → Child") and upload the child's photo; adults who can't do it themselves get the photo **uploaded with the help of Cure staff or another person**, and that assistance is recorded. The **Android app checks the photo on the phone** before uploading (the server checks again). **No new languages**: new screens in the web and the app are English only.

---

## 1. Where things stand (verified)

| Area | Today | What Cure Home needs |
|---|---|---|
| Deployment | `cure.lk` → Apache → `hms-frontend` (:8080); `/api/` and `/uploads/` → `hms-backend` (:8000); `api.cure.lk` → :8000. Image built from `origin/main` (alembic head **`20261010_auth_hardening`**). `RUN_MIGRATIONS=0` — migrations are run by hand. A second stack `hms-in-*` (:8001/:8081) is not behind any enabled `cure.lk` vhost — out of scope. | New migration chained after `20261010_auth_hardening`; manual run. |
| Database | MySQL 8.0.46 on the host, schema `hms-new-database`. `user.id` / `patient.id` are `utf8mb4_0900_ai_ci`; new tables default to `utf8mb4_unicode_ci`. | FK columns must copy the referenced collation (the pattern in `20261009_patient_privacy.py`). |
| Patients | 4,834 patients; **4,157 are staff-registered accounts with `@guest.local` emails** (no real login). Every patient has a `user` row (`patient.user_id` unique). No household, family, guardian or dependant concept anywhere. | Households; parents adding children; assisted photos for adults who need help. |
| Avatar = face photo | `POST/DELETE /api/v1/users/me/profile-picture` (all roles) → `save_file(…, "avatars")` → **S3 `ap-south-1` with public object URLs** in production (`FILE_STORAGE_BACKEND=s3`), or the unauthenticated `/uploads` mount locally. No face check, no consent. 11 patients have one. `user.photo_path` is returned by `/users/me/profile` and, for doctors, in the consultation payload (`api/consultation.py`). | For patients the avatar becomes the face sign-in photo: scanned, consented, **private**, readable only by the member, their guardian/household, their care team and their paired hub. Staff avatars stay as they are. |
| Consent | `patient_consent(user_id, policy_version, source, consented_at, withdrawn_at)` — **no purpose column**; 3 rows (sources `mobile`, `web`). | Purposes `health_data`, `biometric_face`, `profile_photo`; who it is about; how it was given (self / parent / assisted by staff / assisted by family) and by whom; withdrawal from either side. |
| Home vitals | `self_reported_vital(kind, value, value_secondary, unit, context, recorded_at)` — 46 rows, kinds `bp, pulse, spo2, sugar, temperature, weight` + one custom. All six hub kinds are built-in parameters. Sugar contexts `fasting | random | after_meal`. Validation in `core/vital_ranges.py`. | `source`, device, `client_reading_id` idempotency, `identified_by`, `is_extra`; batch upload; a clinician read endpoint (none today — staff only see clinical `vitals-history`). |
| Doctor's targets | **None.** | New: the hub's status chips (● ▲ !) only ever compare to a target the member's own doctor set (CLAUDE.md rule 4). |
| Medicines | `consultation_prescription.frequency` / `prescription_container.frequency` are **free text**. `medication_dose_log` = one row per (patient, prescription, **day**), no slot, **no unique index**. The app keeps reminder times on the phone only. | Times of day per prescription and per-slot check-offs (the hub shows 08:00 / 20:00 separately). |
| Visits / queue | `GET /get-patient-appointments/{user_id}` already returns the session's real `current_queue_token` (`SessionQueue.current_doctor_slot`). | Reuse it — the stub only estimates. |
| Auth | Typed JWTs (`type` = access/refresh/…, `jti`); `get_current_user` only accepts `type == "access"`; `User.tokens_valid_after` revokes sessions. Patient tokens: **1 h access, 1 h refresh**. Rate limits keyed on the client IP (rightmost `X-Forwarded-For` since 9b711d50), in process memory. | A separate `device` token type, its own dependency, rotating refresh, per-device rate limits. |
| Push | None (polling only; one staff WebSocket). | P2 — see H-12. |
| Web frontend | React 18 + Vite + Redux + TanStack Query; English only. Patient PWA under `/patient-dashboard/*` (`pwa/screens/*`); `ProfileHub` shows an initial, no photo. QR *generation* exists (`qrcode`), no scanning. Doctors see vitals in `ClinicalVitalsPanel` (consultation workspace, nurse patient view). | Patient photo + consent + family + hub screens; a staff "assisted photo" screen; doctor targets + home readings. |
| Android app | Expo 57 / RN 0.86 (dev client, `android/` committed), `lk.cure.patient`, versionCode 2, scheme **`curepatient`**, API `https://cure.lk/api/v1`. No camera or image-picker module; `READ_MEDIA_IMAGES` is blocked. `src/i18n` en/si/ta with English fallback at runtime (`translate()`), but `si.ts` / `ta.ts` are typed as complete `Dict`s. SQLCipher, biometric unlock, local reminders, Health Connect import/export (client-side dedupe within 60 s), OKOK scale over BLE. | Photo capture **with an on-phone check**, consent, family, pairing scanner, deep links that match the hub's QR, sources on readings. |
| Links | `https://cure.lk/.well-known/assetlinks.json` returns **403**. | Needed for Android App Links (A-03). |

**Security status.** The security list in `docs/reference/HMS_REFERENCE.md` §5 is mostly fixed by 9b711d50 (deployed): account claiming needs the OTP-verified phone to match, SMS send and other routers are role-gated, `vitals-history` / medical records are branch/care scoped, the alerts WebSocket authorises per channel, the rate-limit key uses the real client IP, password change/reset revokes sessions, `APP_ENV=production` is set. **Still open and relevant:** patient files (avatars, `patient-observations`) are public by URL; the gated `/uploads/{documents|resignations}` route checks login but not ownership; the production env still lists `http://localhost` in `BACKEND_CORS_ORIGINS` (9b711d50 says production filters it — verify); PHI reads are not audited.

---

## 2. HMS backend (`HMS-Dilshan/backend`)

Follow the repo's conventions: `models/home_hub.py`, `api/home_hub.py` mounted at `/api/v1/hub`, patient-side routes in `api/patient_home_hub.py` under `/api/v1/patient`, logic in `services/home_hub_service.py`, one idempotent migration `2026MMDD_add_home_hub_tables.py` (inspector checks, collations read from `information_schema`), UUID4 string PKs, singular snake_case tables. Port `services/hms-stub/tests/test_contract.py` and `test_photos.py` to `backend/tests/test_home_hub.py`.

### H-01 · P0 · New tables
| Table | Columns (beyond `id`, timestamps) |
|---|---|
| `household` | `name`, `primary_user_id` → user |
| `household_member` | `household_id`, `patient_id`, `relationship` (self/spouse/parent/child/other), `role` (owner/guardian/member), `display_name` (what the hub shows, e.g. "Amma"), `avatar_color`, `sort_order`, `added_by_user_id`, `removed_at`; unique active (`household_id`, `patient_id`) |
| `patient_guardian` | `guardian_patient_id`, `dependant_patient_id`, `relationship` (parent/guardian), `created_by_user_id`, `verified_at` (when an existing record was linked by OTP — H-09), `revoked_at` |
| `hub_device` | `serial` (unique), `household_id`, `owner_user_id`, `status` pending/active/revoked, `public_key` (Ed25519, base64), `firmware_version`, `display_name`, `paired_at`, `revoked_at`, `last_seen_at`, `last_heartbeat_json` |
| `hub_pairing_code` | `code_hash` (SHA-256 of the 6-char code), `device_id`, `expires_at` (10 min), `used_at`, `claimed_by_user_id` |
| `hub_auth_nonce` | `nonce`, `serial`, `expires_at` (60 s) — in the DB so a second worker or restart can't break login |
| `hub_refresh_token` | `jti`, `device_id`, `expires_at`, `revoked_at`, `replaced_by_jti` (reuse of a rotated token revokes the chain) |
| `device_event_log` | `device_id`, `patient_id?`, `event_type`, `details_json` (ids and counts only — never values or names) |
| `vital_target` | `patient_id`, `kind`, `context?` (sugar), `low`, `high`, `low_secondary`, `high_secondary`, `attention_low`, `attention_high`, `attention_low_secondary`, `attention_high_secondary`, `set_by_doctor_id`, `note`, `retired_at` |
| `medication_schedule` (P1) | `prescription_id`, `patient_id`, `times_of_day` (JSON `["08:00","20:00"]`), `source` (doctor/app/web), `updated_by_user_id` |
| `hub_guest_claim` (P1) | `code_hash`, `device_id`, `payload_json`, `expires_at` (15 min), `claimed_by_user_id`, `claimed_at` |

### H-02 · P0 · Changes to existing tables
- **`user`** (the avatar is the face photo — **D-2**): `photo_path` now holds a *private storage key* for patients (never a public URL); add `photo_version` (opaque, new per upload), `photo_updated_at`, `photo_face_ok` (passed the face check), `photo_uploaded_by_user_id`, `photo_upload_method` (`self` / `parent` / `assisted_staff` / `assisted_family`). Staff rows are unaffected.
- **`patient_consent`**: add `purpose` (`health_data` default — backfill the 3 rows), `patient_id` (the subject — differs from the signed-in user when a parent or helper acts), `method` (`self` / `parent` / `assisted_staff` / `assisted_family`), `granted_by_user_id`, `device_id`. Keep `GET/POST /patient/consent` meaning "health_data". Withdrawing a purpose applies to every active row of it, wherever given.
- **`self_reported_vital`**: add `source` (`manual` backfill / `mobile` / `health_connect` / `hub`), `device_id`, `peripheral_id`, `client_reading_id` (unique with `patient_id`), `identified_by` (face/pin/manual_select/inbox), `is_extra`, `raw_payload` (TEXT), `duplicate_of_id`; index (`patient_id`, `recorded_at`). The app and web send `source` too.
- **`medication_dose_log`**: add `dose_slot` (`HH:MM`, NULL = whole day as today), `taken_at`, `source`, `device_id`; de-duplicate existing rows, then unique (`prescription_id`, `dose_date`, `dose_slot`).
- **Sugar contexts** (`core/vital_ranges.py` `SUGAR_CONTEXTS`): the hub offers `before_meal` and `bedtime` too — add them (and in the app's `vitalRanges.ts` and the web) or have the hub map them (**D-6**, open).

### H-03 · P0 · Device identity and pairing (`/api/v1/hub`)
Same shapes as the stub (`services/hms-stub/hms_stub/main.py`):
- `POST /hub/pairing/start {serial, public_key, fw}` → `{pairing_code, expires_in, device_id}` (serial allow-list setting; 409 `already_paired`).
- `POST /hub/pairing/claim {code}` — **patient JWT**, household owner only → device active, household linked.
- `POST /hub/auth/challenge {serial}` → `{nonce}`; `POST /hub/auth/token {serial, nonce, signature}` (Ed25519 over the nonce; 409 `pending`, 403 `revoked`) → device access JWT (`type="device"`, `sub=device_id`, `household_id`, 15 min) + refresh (`type="device_refresh"`, 30 d, rotating).
- `POST /hub/auth/refresh` — rotation with reuse detection; `POST /hub/heartbeat`.
- `api/deps.py`: `get_current_hub_device()` (type `device`, device active, `last_seen_at`), and a hub→patient access check (patient is an active member of the device's household). **SECURITY:** device tokens must never pass `get_current_user` (already true — it requires `type == "access"`).
- Rate-limit device routes per `device_id` (a household shares one IP).

### H-04 · P0 · What the hub reads
- `GET /hub/members` → household + members with `display_name`, language, `is_child`, `guardian_patient_ids`, enabled vital parameters, **doctor's targets**, consent ledger (with `source` / `method`), and `photo: {version, updated_at} | null` — non-null only while the avatar passed the face check (`photo_face_ok`) **and** `biometric_face` + `profile_photo` are active.
- `GET /hub/members/{pid}/snapshot?days=90` — self-reported (all sources) + clinical visit vitals as `source: "visit"`, timestamps with an explicit `Z`.
- `GET /hub/members/{pid}/medications` — active prescriptions with `times_of_day` (from `medication_schedule`, else parsed from `frequency`: once/twice/three/four times daily → 08:00 / 08:00+20:00 / …).
- `GET /hub/members/{pid}/doses?dose_date=` and a **set** (not toggle) endpoint `PUT /hub/members/{pid}/doses {prescription_id, dose_date, dose_slot, taken}` — idempotent, so offline retries can't flip it back (**D-7**, open).
- `GET /hub/members/{pid}/appointments` (Sri Lanka local naive date/time, documented as such) and `GET /hub/members/{pid}/queue` from `SessionQueue` (real now-serving, patients ahead, estimated wait).
- `GET /hub/members/{pid}/photo` → the avatar (JPEG ≤ 1024 px), `Cache-Control: no-store`, `X-Photo-Version`; 403 `no_consent`, 404 none.
- `POST /hub/members/{pid}/consent {purpose, policy_version, withdrawn, granted_by_patient_id}`.

### H-05 · P0 · Readings from the hub
`POST /hub/members/{pid}/vitals:batch {items[≤50]}` → per item `created | duplicate | rejected(reason)`. Reuse `validate_self_vital`, `validate_context`, `normalize_recorded_at`, `canonical_unit`; reject kinds not enabled for the member (`kind_not_enabled`); idempotent on (`patient_id`, `client_reading_id`); the hub sends pulse from BP/SpO₂ cuffs as its own item. **Cross-source duplicates:** the phone app and the hub can both hear the same OKOK scale weighing — when a reading matches another source's reading (same patient, kind, value) within 2 min, store it with `duplicate_of_id` and hide it from charts and averages.

### H-06 · P0 · The avatar is the face sign-in photo
**Who may set a patient's avatar**
| Who | Route | Consent recorded as |
|---|---|---|
| The member | `POST /users/me/profile-picture` (existing route; new behaviour for role 5) | `method=self` |
| A parent, for their child | `POST /patient/family/{patient_id}/profile-picture` (guardian link required) | `method=parent`, `granted_by_user_id` = parent |
| Another person helping an adult (e.g. a son for Amma) | same family route; the helper must be in the same household and tick *"{name} is here with me, has seen this photo and agrees to it being used for face sign-in on our Cure Home"* | `method=assisted_family`, `granted_by_user_id` = helper |
| Cure staff, in person (reception / nurse / doctor) | `POST /patients/{patient_id}/profile-picture` (staff roles, branch/care scoped like `vitals-history`), same attestation by the staff member | `method=assisted_staff`, `granted_by_user_id` = staff |

**On every upload**
- **Scan** (`core/face_check.py`, a port of `services/hms-stub/hms_stub/face_check.py`): exactly one clear, frontal face; reasons `bad_image, too_large, low_resolution, no_face, several_faces, face_too_small, not_frontal, too_dark, too_bright, blurry`. A failed scan is rejected (422 + reason). Re-encode to ≤ 1024 px JPEG (drops EXIF/GPS). Needs `opencv-python-headless` + the pinned YuNet model (SHA-256 `8f2383e4…52fa4`) in the backend image.
- **Store privately**: an S3 prefix with no public access (bucket policy denies public reads on it) or a local folder outside the `/uploads` mount; bump `photo_version`; delete the previous object.
- **Consent**: "Use this photo to recognise me on our Cure Home" records `biometric_face` (`2026-10-bio-1`) and `profile_photo` (`2026-10-photo-1`) with the method above; publish both policy texts. The photo can be the avatar without hub use; the hub only gets it with both consents.
- **When someone else set it** (`assisted_family` / `assisted_staff`): send the member an SMS on the phone on file ("Your Cure profile photo was set by … at …; reply/visit to remove it"), and show it on their account if they have one — they can remove it or stop hub use at any time; "Forget me" on the hub withdraws it too.

**Reading the photo** — never a public URL any more:
- `GET /patients/{patient_id}/profile-picture` → JPEG, `no-store`; allowed for the member, their guardians, members of the same household, staff with access to the patient, and nobody else.
- `/users/me/profile` and the consultation payload (`api/consultation.py`) return that API path (or `has_photo` + `photo_version`) instead of the S3 URL; clients fetch it with the token.
- The hub reads `GET /hub/members/{pid}/photo` (H-04).

**Existing avatars** (11 patients, public S3 objects): move each to the private prefix and delete the public object; scan it — pass → `photo_face_ok=true` but **not used on a hub until the member gives the consent** (never given for these); fail → stays the avatar with `photo_face_ok=false`, and the app/web ask for a new photo before face sign-in.

**Account deletion** (`/patient/account/delete`) also deletes the photo object, withdraws biometric consents, ends household memberships and revokes hubs the user owns. **Export** (`/patient/export`) includes consent history (with method and helper) and the photo.

### H-07 · P0 · Doctor's targets
`GET/PUT /patients/{pid}/vital-targets` for doctors (role 3; admins), scoped like `vitals-history`; audited; validation (low < high, inside plausible ranges, attention levels outside the target band). Exposed to the hub (H-04) and to the patient app/web.

### H-08 · P0 · Clinicians see home readings
`GET /patients/{pid}/self-vitals?days=&kind=` for clinical roles, same scoping as `vitals-history`, with `source`, device, `is_extra`, `duplicate_of_id`, plus 7-day averages per kind.

### H-09 · P1 · Family: households, children, hubs
- **Add family → Child** (**D-3**): `POST /patient/family/children {first_name, last_name, date_of_birth, gender, relationship}` creates the child's `user` (role 5, placeholder email, no usable password — like today's staff-registered records) + `patient` + `patient_guardian` link to the parent, and adds the child to the parent's household. Optionally **link an existing Cure record** instead (`POST /patient/family/children/link {patient_display_id, date_of_birth}` → OTP to the phone on file for that record → `verified_at`) — 4,157 staff-registered records exist, many of them children registered at the clinic.
- `GET /patient/family` (household members, children, roles, display names), `PUT /patient/family/{patient_id}` (display name, relationship), `DELETE /patient/family/{patient_id}` (leave household; a guardian link ends only by the parent or staff).
- Adults join by invitation (`POST /patient/family/invite {phone}` → they accept in their own account), or are added by Cure staff at the clinic; their consent stays theirs (assisted per H-06 when they need help).
- Hubs: `GET /patient/hub-devices`, `DELETE /patient/hub-devices/{id}` (revoke → refresh chain revoked, next device call 403 `revoked`).

### H-10 · P1 · Guest readings
`POST /hub/guest-claims` → `{claim_code, claim_uri}`; `POST /patient/hub-claims/{code}` saves the reading for the signed-in patient (`source: hub`, 15-min expiry).

### H-11 · P1 · Medicine times
`GET/PUT /patient/medications/{prescription_id}/schedule` — one source for the app's reminders and the hub's dose slots; doctors may set times when prescribing.

### H-12 · P2 · Push and alerts
Clinician-configured "Talk to your doctor" levels live in HMS (CLAUDE.md rule 4); notifying family needs push (Expo push tokens or FCM) — none exists today (**D-8**, open).

### H-13 · P0 · Security prerequisites still open
1. Patient avatars become private (H-06). Do the same for `patient-observations` images and stop storing public S3 URLs for patient files.
2. `serve_sensitive_upload` (`/uploads/{documents|resignations}/…`) requires login but not ownership — add the check.
3. Audit PHI reads on the new hub, family and clinician endpoints (`device_event_log`, `core/audit.py`), including every staff read of a patient photo.
4. Confirm `BACKEND_CORS_ORIGINS` drops `http://localhost` in production.
5. Rate limiter is in process memory — fine with one uvicorn process; move to Redis before adding workers.

---

## 3. Web frontend (`HMS-Dilshan/frontend`) — English only

| ID | P | Change | Where |
|---|---|---|---|
| W-01 | P0 | **Profile photo = face sign-in photo** (patients): the guide (same points as the hub's "Set up face sign-in"), take (`<input type="file" accept="image/*" capture="user">`) or upload, framing preview, upload, the server's scan reasons in plain words, the consent checkbox with the policy link, status (used on Cure Home / not), remove, stop using on the hub. The web relies on the server scan (the on-device check is the app's — A-01). Show the avatar in `ProfileHub` by fetching it with the token into a blob URL. | new `pwa/screens/ProfilePhoto.tsx`, route `profile/photo` in `PatientDashboardNew.tsx`, `ProfileHub.tsx` |
| W-02 | P0 | **Staff "assisted photo"** (reception, nurse, doctor): open the patient, take the photo with the desk webcam or upload, read the consent text to the patient, tick the attestation, upload (H-06 staff route). Same scan reasons. | patient views used by reception / `NursePatientProfileEntry.tsx`; new `components/patient/AssistedPhotoCapture.tsx` |
| W-03 | P1 | **Family**: Add family → Child (new child, or link an existing record by Patient ID + date of birth + OTP); family list with display names ("Amma"); upload a child's photo, or help an adult family member with theirs (attestation). | new `pwa/screens/Family*.tsx` |
| W-04 | P1 | **Cure Home**: my hubs (last seen, revoke), pair a hub (6-char code; `BarcodeDetector` QR scan where supported); pairing landing page `/patient-dashboard/hub/pair?code=` (where the hub's QR lands without the app); claim a guest reading `/patient-dashboard/hub/claim?code=`. | new `pwa/screens/CureHome*.tsx` |
| W-05 | P0 | **Doctor's targets editor** (per kind low/high, attention levels, sugar by context; "Set by Dr X on …"). | `components/vitals/ClinicalVitalsPanel.tsx` (used by `ConsultationWorkspace.tsx`; read-only in `NursePatientProfileEntry.tsx`) |
| W-06 | P0 | **Home readings** for doctors/nurses: source (Cure Home / phone / Health Connect / typed), device, extra and duplicate flags, 7-day averages. | same panel + `VitalsHistoryChart.tsx` |
| W-07 | P0 | Every place that shows a patient's avatar from `photo_path` (consultation workspace, the patient's own layout) switches to the authenticated photo route (blob URL). Staff avatars unchanged. | `ConsultationWorkspace.tsx`, `components/common/Layout/DashboardLayout.tsx`, `pages/Profile/ProfilePage.tsx` (for role 5) |
| W-08 | P1 | Super-admin: hub devices (status, last seen, firmware, queue length), revoke, device event log. | new admin page |
| W-09 | P1 | Patient vitals screens: show each reading's source; compare with the doctor's target where one exists. | `pwa/screens/AllVitals.tsx`, `VitalDetail.tsx`, `pwa/ui/tone.ts` |
| W-10 | P1 | Per-slot dose check-offs once H-11 lands. | `services/patientSelfTrackingService.ts`, `PatientMedications.tsx` |

---

## 4. Android app (`patient-app`) — English only for new screens

| ID | P | Change | Where |
|---|---|---|---|
| A-01 | P0 | **Profile photo = face sign-in photo, checked on the phone.** Guided front-camera capture with an oval overlay (`expo-camera`) or the system Photo Picker (`expo-image-picker` — no `READ_MEDIA_IMAGES`, which stays blocked); add `CAMERA` permission + rationale to `app.json`. **On-device check before upload** with ML Kit face detection (e.g. `@react-native-ml-kit/face-detection` on the dev client — confirm it builds on RN 0.86 / new architecture; fallback: a VisionCamera face-detector plugin) mapped to the same reasons as the server: one face (no `several_faces`), face size, head turned/tilted (yaw/roll → `not_frontal`), eyes open (eye-open probability), neutral expression (smiling probability), plus brightness and blur measured on the pixels (`@shopify/react-native-skia` is already a dependency) → `too_dark`/`too_bright`/`blurry`. Only a passing photo is uploaded; the server checks again and its answer wins. Consent screen for face sign-in (policy text + version). Current avatar via an authenticated fetch (cache only, excluded from backup); remove / stop using on hub. | new `app/(patient)/profile-photo.tsx`, `src/features/photo/faceCheck.ts`, `src/services/api/profilePhoto.ts`; avatar in the card in `app/(patient)/(tabs)/profile.tsx` |
| A-02 | P1 | **Add family → Child** (new child or link an existing record with Patient ID + date of birth + OTP); family list; take/upload a child's photo (same on-device check); help an adult family member with theirs (attestation, H-06). | new `app/(patient)/family/*` |
| A-03 | P0 | **Links that match the hub's QR**: the hub encodes `cure://hub/pair?code=…` but the app's scheme is `curepatient`. Use verified App Links — `https://cure.lk/hub/pair?code=…` and `…/hub/claim?code=…` with `android.intentFilters` (`autoVerify`) in `app.json`, and serve `/.well-known/assetlinks.json` (now 403) with the release signing SHA-256. The same URL opens the web page when the app isn't installed. (Cure Home changes its QR to match — §5.) | `app.json`, expo-router routes `hub/pair`, `hub/claim` |
| A-04 | P1 | **Pair a Cure Home**: QR scanner (`expo-camera` barcode) + manual 6-char code → `POST /hub/pairing/claim`; my hubs + revoke; claim a guest reading. | new `app/(patient)/cure-home/*` |
| A-05 | P0 | **Readings**: send `source: "mobile"` / `"health_connect"` and a `client_reading_id`; show each reading's source ("Cure Home · Cure Scale") instead of a blanket "self-reported" (`mergeVitalReadings.ts`); don't re-import Cure Home readings through Health Connect; skip saving a phone-captured OKOK weighing when the hub already has it (server dedupe H-05 is the backstop). | `src/services/api/selfVitals.ts`, `src/services/healthConnect.ts`, `src/utils/mergeVitalReadings.ts`, `app/(patient)/vitals/*` |
| A-06 | P1 | Doctor's targets in vitals screens (status vs the doctor's target where set). | `src/utils/toneText.ts`, vitals screens |
| A-07 | P1 | Medicine times: sync `medReminders` to `medication_schedule` (H-11) so the app and the hub remind at the same times. | `src/store/settingsStore.ts`, `src/services/reminders.ts` |
| A-08 | P0 | **Privacy**: privacy screen lists face sign-in consent (and who gave it, if assisted) with a withdraw button; account-deletion copy mentions the photo; Play Console Data safety (photos / face data: collected, purpose, retention, deletion) and the privacy pages (`src/legal/documents.ts`, cure.lk/privacy) updated. | `app/(patient)/privacy.tsx`, `delete-account.tsx`, `docs/PLAY_STORE_SUBMISSION.md` |
| A-09 | P0 | **No new languages** (**D-4**): add the new strings to `src/i18n/en.ts` only and type `si.ts` / `ta.ts` as `Partial<Dict>` — `translate()` already falls back to English, so Sinhala/Tamil users see the new screens in English and existing screens unchanged. | `src/i18n/{en,si,ta}.ts` |
| A-10 | — | Commit or discard the uncommitted icon / `package.json` / `app.json` changes first; bump `versionCode`; new native modules (camera, ML Kit) need a fresh dev-client and EAS build. | — |

---

## 5. Cure Home follow-ups once HMS lands
- QR and claim links → `https://cure.lk/hub/pair?code=…&serial=…` and `https://cure.lk/hub/claim?code=…` (today `cure://…` in `hub-core` `sync.py` / `hms-stub`).
- Doses: per-slot **set** endpoint (H-04) instead of read-then-toggle; consent purposes and `method`; real queue fields; sugar contexts per **D-6**.
- `hms-stub`'s patient-side photo routes (`/patient/profile-photo`) are a stand-in: rename them to the H-06 routes (avatar, family, staff) when HMS ships them; the hub-facing `/hub/*` routes stay as they are.
- Run against staging with `infra/compose/docker-compose.hms.yml`; keep `hms-stub` as the offline twin and keep its contract tests in sync with the HMS ones.

---

## 6. Decisions

**Made 2026-10-22**
| ID | Decision | Consequence in this plan |
|---|---|---|
| D-1 | Members who can't upload a photo themselves get it **uploaded with the help of Cure staff or another person**. | Staff route + W-02; family route + W-03/A-02; consent `method` + `granted_by_user_id`; attestation text; SMS to the member when someone else sets it (H-06). |
| D-2 | **Face sign-in photo = account avatar.** | `user.photo_path` for patients becomes private and scanned; new `photo_*` columns; one photo route for everyone who may see it; the 11 existing patient avatars migrated and never used on a hub without consent (H-02, H-06, W-07). |
| D-3 | **Parents add their children** ("Add family → Child"). | `patient_guardian`, child creation and linking (H-09, W-03, A-02). |
| D-4 | **No new languages** in the web or the app. | New screens English only; app dictionaries `Partial` with English fallback (A-09). The hub itself stays en/si/ta (CLAUDE.md rule 9). |
| D-5 | **The app checks the image** before uploading. | ML Kit + pixel checks on the phone, server re-checks (A-01). The web relies on the server check. |

| D-6 | Sugar contexts `before_meal` and `bedtime` are **added** in HMS, the app and the web. | `SUGAR_CONTEXTS` in HMS `vital_ranges.py`; app `SUGAR_CONTEXTS` and Health Connect mapping; hub unchanged. |
| D-7 | Dose check-offs are an **idempotent per-slot "set"** (`taken` true/false). | `PUT /hub/members/{pid}/doses` and `PUT /patient/medications/doses`; the toggle stays for older clients. |
| D-8 | **Push notifications: yes**, Expo push with tokens registered by the app. | `push_token` table, `/patient/push-tokens`, fixed English texts with no health data (`push_service.py`); needs FCM credentials in EAS. |

---

## 7. Suggested order
1. **HMS foundations (P0):** pull `origin/main`; H-13; migration for H-01/H-02; H-03 pairing + device auth; H-04 reads; H-05 batch; H-06 avatar = face photo (scan, private storage, consent, staff/family/self routes, migration of the 11 avatars); H-07 targets; H-08 clinician reads; contract tests ported from the stub. Ops: backend image gains OpenCV + YuNet; private S3 prefix + IAM; Apache/ModSecurity allow multipart photo uploads and serve `assetlinks.json`.
2. **Patients, staff and doctors (P0):** A-01 (photo with on-phone check) + W-01, W-02 (staff assisted photo), W-07 (private avatars everywhere), A-03 links, A-05 sources, A-08 privacy, A-09 English fallback; W-05 + W-06 for doctors.
3. **Pilot (P1):** family and children (H-09, W-03, A-02), hub pairing and management (W-04, A-04), guest claims (H-10), medicine times (H-11, A-07, W-10), admin devices (W-08), targets in patient screens (W-09, A-06).

---

## Appendix · How this was checked (2026-10-22)
- Code: both repos read in place (no edits); HMS compared against `origin/main` with `git show` (no fetch).
- Server (`root@145.223.20.29`), read-only: container list and compose labels; file fingerprints inside `hms-backend` vs `origin/main`; environment variable *names* plus non-secret values (`APP_ENV`, storage mode, DB host/name); Apache `sites-enabled` server names and proxy targets; a `READ ONLY` MySQL transaction with schema queries and aggregate counts only (no row contents). Nothing was written, restarted or pulled.
