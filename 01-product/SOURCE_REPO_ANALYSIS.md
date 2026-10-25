# Source repository analysis

*v0.1 · 22 Oct 2026 · What Cure Global takes from the three existing repos, what it changes, and what it leaves behind.*

Read on 22 Oct 2026 from the working copies on the development PC:

| Repo | Commit read | What it is |
|---|---|---|
| `HMS-Dilshan` | `0bb4e9c1` (main) | Cure.lk hospital management system: FastAPI + MySQL 8 backend, React 18 web. Production at `cure.lk`. |
| `patient-app` | `9ae3dc9` (main) | Cure Patient Android app: Expo 57 / React Native 0.86, package `lk.cure.patient`. |
| `Healthcare-Device` | working tree of 22 Oct | **Cure Home**: family health hub (touch screen + camera + BLE devices). Monorepo with a kiosk UI, five Python services, shared clinical and i18n packages, and a design system. |

**Verdict in one line.** Healthcare-Device is the architectural template and supplies the whole hub. The patient app supplies the mobile app. HMS supplies about 15 % of its backend: identity, the Cure Home family and device tables, vitals validation, FHIR export, the face check, private files and push. Everything hospital-operational (POS, pharmacy, HRM, supply chain, labs, booking and payments, website) is cut.

---

## 1. Healthcare-Device (Cure Home): the design pattern

### 1.1 What is there

| Part | Path | State (from `docs/02-architecture/SYSTEM_DESIGN.md`) |
|---|---|---|
| Kiosk UI | `apps/hub-ui` | React 19 + TS + Vite; 20 screens (Boot, Pairing, Ambient, Identify, Who's measuring, Guest, PIN, Orbit View, Detail, Measure, BP check, Glucose context, Inbox, Medicines, Visit, Family, Enrol (add angles), Face setup, Calendar & reminders, Settings) plus the Notices and Dev overlays (`apps/hub-ui/src/store/hub.ts`); WebGL2 glass renderer; MediaPipe face tracking; vitest + Playwright walk-throughs |
| Hub core | `services/hub-core` | FastAPI: sessions, attribution engine, measurement policies, SQLCipher store, idempotent sync engine, utilities; 70 tests |
| Vision | `services/vision` | YuNet + SFace (OpenCV DNN, Apache-2.0 models), liveness v1, AES-256-GCM templates, signed identify proofs, eval harness; 20 tests |
| BLE gateway | `services/ble-gateway` | bleak (BlueZ / WinRT bridge); OKOK scale adverts and GATT BP 0x1810, PLX 0x1822, thermometer 0x1809, glucose 0x1808 decoders; 18 tests |
| BLE simulator | `services/ble-sim` | CLI + YAML scenarios (normal day, HBPM week, fever, duplicates, implausible, two people, low battery, guest) |
| HMS stub | `services/hms-stub` | Offline twin of the HMS `/api/v1/hub/*` contract with an admin console; 30 contract tests |
| Clinical package | `packages/clinical` | Plausibility, units, formatting, doctor-target status — TypeScript and Python twins checked against 81 shared vectors |
| i18n | `packages/i18n` | English, Sinhala, Tamil (patient-app keys reused); `REVIEW_KEYS` for strings awaiting clinical/native review |
| Design system | `design-system/project` | `tokens.json`, brand book, 18 reference components, self-hosted fonts (Sora, Manrope, Noto Sans Sinhala/Tamil); generators for CSS tokens and the design guide |
| Infra | `infra/compose`, `os/`, `scripts/` | Compose profiles `dev` / `pi-arm64` / `device`; Mosquitto ACLs; `init_env.py` secret bootstrap; Pi, Ubuntu (Surface Pro) and Windows kiosk installs |
| Docs | `docs/` | Product spec with gap analysis, architecture, system design (as built), two roadmaps, design guide, research files with sources |

### 1.2 Patterns Cure Global adopts as house rules

1. **Honest health display.** Value, unit, age and source on every reading. No "LIVE", no fake waveforms, no colour-only status, "? Check this reading" for implausible values.
2. **No diagnosis on family surfaces.** Status compares only to a target the member's own doctor set (● ▲ ! ?). Alert rules run on the server under clinician control. This keeps the hub and app on the "transfer, store, display" side of medical-device rules.
3. **Consent first, withdrawal wins.** Purpose-specific consent with policy versions, recorded with *how* it was given (self / parent / assisted).
4. **Face data never leaves the hub.** Embeddings and thumbnails are encrypted on the device; the reference is the member's own profile photo, released only with consent.
5. **No PHI in logs, topics, push texts or analytics.** Opaque ids only.
6. **Offline first and idempotent.** Every write gets a client id (UUIDv7) before any network call.
7. **Shared clinical logic as twin packages** with shared test vectors (TS + Python), so the app, the hub, the web and the API agree on units and plausibility.
8. **Design system as source of truth.** Tokens generate code; CI fails on drift.
9. **Docs as part of the product.** Spec → architecture → as-built system design → roadmap, with decisions and sources recorded.
10. **Docker Compose with profiles** and simulators, so every feature runs on a Windows PC without hardware.

### 1.3 Keep, adapt, cut

| Area | Decision | Notes |
|---|---|---|
| `apps/hub-ui`, `services/hub-core`, `vision`, `ble-gateway`, `ble-sim` | **Keep, then adapt** | Household becomes family; member cards come from the member's active modules; proxy measurement for dependants; new screens (growth, vaccines due, daily check-in, visual schedule, SOS). See `MIGRATION_PLAN.md`. |
| `packages/clinical`, `packages/i18n` | **Keep, extend** | Add growth z-scores, gestational age, cycle maths and new metrics, with new vectors in both languages. |
| `design-system/` | **Keep as the brand source**; add web and mobile themes | One `tokens.json` generates CSS for the hub and the web consoles and a TS theme for React Native. |
| `infra/compose`, `scripts/init_env.py`, `os/` | **Keep the pattern** | Cure Global compose adds the cloud services (API, worker, Postgres, Valkey — ADR-0013, MinIO, Traccar). |
| `services/hms-stub` | **Retire as a dependency**, keep its contract tests | In Cure Global the real `api` service runs in Docker, so the hub talks to it directly. The stub's tests become contract tests against `api`. |
| Ask Cure assistant (`ASSISTANT_FEASIBILITY.md`) | **Defer** | Revisit after the pilot; nothing in the core depends on it. |
| `marketing/video` | **Leave in Healthcare-Device** | Not part of the platform. |

---

## 2. patient-app: the mobile app's base

### 2.1 What is there

- Expo 57 / RN 0.86 dev client, expo-router, zustand, TanStack Query persisted in SQLCipher, axios with a shared refresh promise.
- Security already done right: SecureStore tokens, app lock (biometric / PIN), `FLAG_SECURE` screen-capture guard, encrypted query cache cleared on user change.
- Health features: vitals hub and per-kind trend pages (Skia charts), anatomy "vitals hero", validated manual entry, BP measuring guide, OKOK scale over BLE (reverse-engineered parser), Health Connect read/write, medicines and reminders, PDF and FHIR export, account deletion.
- Cure Home additions (Oct 2026): profile photo with on-phone ML Kit face check, family (children, invites), hub pairing by QR / App Link, guest reading claims, reading sources, doctor's targets, push tokens.
- en / si / ta dictionaries (~500 keys each); new screens English-only with fallback (decision D-4 in Healthcare-Device).
- Unit tests for clinical, vitals and Cure Home utilities.

### 2.2 Keep, adapt, cut

| Area | Decision | Notes |
|---|---|---|
| App shell, auth, secure storage, app lock, screen-capture guard, query persistence | **Keep** | Point at the Cure Global API; replace the HMS login (`role_as === 5`) with family-member login. |
| `src/utils/*` clinical utilities and tests | **Keep, then move** into `packages/clinical` so the app, hub and web share them | `clinicalThresholds.ts` stays clinician-side only (house rule 2). |
| BLE (`okokScaleParser`, `scaleScanner`) | **Keep, extend** to GATT devices (BP, PLX, thermometer, glucose) with `react-native-ble-plx` | Same decoders and vectors as the hub's `ble-gateway`. |
| Health Connect | **Keep, extend** | More types (sleep, steps, HRV, menstruation, respiratory rate, body temperature). |
| Vitals hero, charts, kit components | **Keep, restyle** with shared tokens | The hero becomes per-member; growth and pregnancy charts are new. |
| Family, photo, pairing, push | **Keep, generalise** | From "my children" to the family model in `ACCESS_CONTROL.md` (adults, dependants, guardianship, admins, consent-based sharing). |
| Appointments booking wizard + PayHere, live queue, HMS records/lab requests | **Cut** | Hospital-specific. Appointments with a member's assigned doctors replace it; HMS data comes in later through the HMS connector. |
| Single-patient assumptions (`/patients/me`, user id = patient) | **Replace** | Person ≠ user account; a signed-in user acts for several people. |
| Missing pieces | **Add** | Offline write queue, member switcher, module screens (growth, vaccines, cycle, pregnancy, elder safety, special-needs logs), doctor messaging, location sharing. |

---

## 3. HMS-Dilshan: what a hospital system gives a family platform

### 3.1 What is there

A large multi-branch hospital system: ~100 API modules, ~60 model files, 163 Alembic revisions, roles 1–31 as integers (with a known 12–15 collision), MySQL 8 with mixed collations, a 1,700-line `main.py`, and modules for POS, pharmacy, online pharmacy, HRM, payroll, supply chain, labs, appointments and payments, video-loop kiosks, website, marketing, chatbot and mailbox. Hardening commit `9b711d50` fixed account takeover and authorisation gaps; Cure Home commit `fd4f7570` added households, devices, private face photos, targets, schedules and push.

### 3.2 What Cure Global ports (and how)

| HMS source | Cure Global destination | How |
|---|---|---|
| `core/security.py` (typed JWTs, `jti`, `tokens_valid_after`, bcrypt in threadpool, OTP HMAC digests) | `services/api/app/identity/` | Port the ideas; switch to asymmetric signing (EdDSA) with a JWKS, add MFA (TOTP + WebAuthn) for staff and doctors |
| `models/home_hub.py`, `api/home_hub.py`, `services/home_hub_service.py` (pairing, Ed25519 device auth, rotating refresh with reuse detection, members, snapshot, `vitals:batch`, doses, photo, consent, guest claims) | `services/api/app/devices/` | Port with the same `/api/v1/hub/*` paths and shapes so one hub build works with HMS and with Cure Global (ADR-0007) |
| `api/patient_home_hub.py` (family, children, invites, link-by-OTP, photo, hub devices, schedules, doses, targets, push tokens) | `app/family/`, `app/care/`, `app/medication/`, `app/notify/` | Generalise from "household of patients" to families of persons with guardianship and grants |
| `core/vital_ranges.py` | `packages/clinical/python` + metric definitions in the catalogue | Ranges move into data (`packages/module-catalogue/catalogue/metrics.yaml`) |
| `core/fhir_export.py` (LOINC/UCUM vitals) | `app/fhir/` | Extend to Immunization, Condition, AllergyIntolerance, MedicationStatement, IPS |
| `core/face_check.py` (YuNet one-face scan) | `app/files/face_check.py` | As is |
| `core/private_files.py`, `file_upload.py` | `app/files/` | Private S3/MinIO prefix, signed short-lived reads, never public URLs |
| `core/audit.py`, `device_event_log` | `app/audit/` | Becomes an append-only, hash-chained audit of every PHI read and write |
| `services/push_service.py` (Expo push) | `app/notify/` | Plus SMS, email, WhatsApp adapters |
| `core/rate_limit.py`, `validation.py`, `pagination.py` | `app/core/` | Valkey-backed limits (ADR-0013); one pagination and one envelope style |
| Doctor web: `components/vitals/ClinicalVitalsPanel.tsx`, `VitalsHistoryChart.tsx`, targets editor | `apps/doctor-web` | Use as a reference; rebuild on the new design tokens |

### 3.3 What is cut

POS (all variants), pharmacy and online pharmacy, HRM, payroll, leave, shifts, resignations, supply chain (13 modules), labs and lab pricing, appointments booking and channelling, PayHere payments, cashier billing, video loop, website and marketing CMS, chatbot / LLM, mailbox, WhatsApp inbound, tasks, learning, medical insights, branch admin, receptionist and pharmacist roles. If Cure clinics need any of this for Cure Global members, it stays in HMS and is reached through the HMS connector (`docs/02-architecture/INTEGRATIONS.md` §7).

### 3.4 HMS lessons that shaped Cure Global

| HMS issue | Cure Global rule |
|---|---|
| Integer roles with collisions; role loaded from DB on every call | Named roles + attribute checks (`ACCESS_CONTROL.md`); permissions in code, tested as a matrix |
| Mixed naive UTC and naive Sri Lanka times | `timestamptz` everywhere; local dates only where the meaning is a calendar date (vaccine due date) |
| Free-text medicine frequency, one dose row per day | Structured schedules (times of day) and one dose event per slot |
| Public avatar and observation URLs | Private object storage only; reads through authorised, audited endpoints |
| PHI reads not audited | Every PHI read audited with purpose |
| Mixed response envelopes and pagination | One envelope, cursor pagination, RFC 9457 problem details for errors |
| 1,700-line `main.py`, 100 routers mounted by hand | Modular monolith with bounded contexts, each with its own router, service and tests |
| HS256 shared-secret JWTs | EdDSA-signed tokens with key rotation and a JWKS endpoint |
| Patient identity = user account (1 phone = 1 patient) | Person ≠ user account; dependants without logins; one person in several families |

---

## 4. What none of the three repos has (built new in Cure Global)

- A **life-stage and module engine**: modules switch on and off by age, sex, pregnancy, special needs and doctor decision (`MODULE_ENGINE.md`).
- **Care teams**: several doctors per family and per member, with scopes and expiry.
- **Consent-based sharing between adults** in a family, teen confidentiality, legal guardianship and health proxies for elders.
- **Super-admin console** for families, doctors (with licence verification), modules, devices, content, consents and data-subject requests.
- **Doctor console** built for remote review: worklist, alerts, growth and pregnancy charts, review acknowledgements, messages.
- **Growth references, immunisation schedules, milestones and pregnancy timelines** as versioned data.
- **GPS and safety**: Traccar-based tracker ingestion, geofences, SOS and fall events, elder daily check-ins.
- **Free-form trackers** (feeds, nappies, sleep, cycle, seizures, behaviour) validated by schema.
