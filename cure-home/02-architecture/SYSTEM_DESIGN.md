# Cure Home — System Design (as built)

*v0.3 · 2026-10-22 · Companion to `ARCHITECTURE.md` (the target) and `ROADMAP.md` (the plan). This file describes what is in the repository now: the running services, their exact contracts, and where the implementation deliberately differs from the target. Update it when a contract changes.*

## 1. The system on one page

```
 Windows 11 + Docker Desktop (dev)  ·  Raspberry Pi 5 (prod, same compose file, arm64 images)
 ┌──────────────────────────────────────────────────────────────────────────────────────────┐
 │ Chrome / Chromium kiosk  ──►  hub-ui (nginx :8080 | Vite :5173)   ← the only origin the  │
 │   camera via getUserMedia      • static React app                   browser talks to     │
 │   MediaPipe face tracking      • /api/*      → hub-core :8600  ┐ proxy adds              │
 │   WebGL2 glass renderer        • /api/events → hub-core WS     ├ X-Hub-UI-Token           │
 │   4 face crops (memory only)   • /vision     → vision WS :8700 ┘ (browser never sees it)  │
 │                                                                                          │
 │ hub-core (FastAPI)                          vision (FastAPI + OpenCV DNN)                 │
 │   SQLCipher store (WAL, FULL sync)            YuNet detect + 5 landmarks → SFace 128-d    │
 │   sessions · attribution · policies           quality gate · liveness v1 · 1:N cosine     │
 │   inbox · sync engine · views · utilities     AES-256-GCM template store (HKDF key)       │
 │   signs enrol tickets / verifies proofs ◄───► signs identify proofs / enrol receipts      │
 │        ▲ MQTT (per-service users + ACLs)                                                  │
 │ mosquitto ◄── ble-gateway (bleak: BlueZ on Pi, WinRT as Windows "ble-bridge")             │
 │           ◄── ble-sim (CLI + YAML scenarios, dev)                                         │
 └──────────────────────────────┬───────────────────────────────────────────────────────────┘
                                │ HTTPS, device JWT (Ed25519 challenge → 15 min access + 30 d rotating refresh)
                                ▼
          hms-stub :8800 (dev) — or real HMS /api/v1/hub/* (docker-compose.hms.yml)
```

| Service | Path | Image | Port (127.0.0.1) | Tests |
|---|---|---|---|---|
| hub-ui | `apps/hub-ui` | `cure-home/hub-ui` (nginx) | 8080 (kiosk build), 5173 (`pnpm dev`) | vitest 12 · Playwright walk-throughs (19 screens + 10 photo screens) · real-face sign-in (`e2e/face-login.spec.ts`, Chrome plays a consented member's photo clip as the camera; skipped unless `FACE_CAM` is set) |
| hub-core | `services/hub-core` | `cure-home/hub-core` | 8600 | pytest 70 |
| vision | `services/vision` | `cure-home/vision` | 8700 | pytest 20 (incl. real-model smoke) |
| hms-stub | `services/hms-stub` | `cure-home/hms-stub` | 8800 (`/admin`) | pytest 30 (contract, photo scan, consent) |
| ble-sim | `services/ble-sim` | `cure-home/ble-sim` | — | pytest 5 |
| ble-gateway | `services/ble-gateway` | `cure-home/ble-gateway` (Pi only) | host network | pytest 18 (decoders) |
| mosquitto | `infra/compose/mosquitto` | `eclipse-mosquitto:2` | 1883, 9001 (ws, dev) | compose healthcheck |
| clinical | `packages/clinical` (TS + `python/`) | — | — | 81 shared vectors × 2 languages |
| i18n | `packages/i18n` | — | — | 7 (placeholders, banned words) |

## 2. Trust and secrets

| Secret | Who holds it | Purpose |
|---|---|---|
| `HUB_UI_TOKEN` | hub-core, vision, the kiosk proxy (nginx / Vite), ble-sim (dev scenarios) | Every REST/WS call to hub-core and every `/vision` socket must carry it. The proxy injects it, so page JavaScript never has it. |
| `HUB_DB_KEY` | hub-core | SQLCipher key (SHA-256 → raw 256-bit `PRAGMA key`). Outside `HUB_ENV=dev` hub-core refuses to start without SQLCipher. |
| `VISION_HUB_SECRET` | hub-core, vision | HMAC-SHA256 tokens between them: `enrol` tickets (hub→vision), `identify` proofs and `enrolled` receipts (vision→hub), `forget`, `photo_write`, `photo_read`, `photo_delete` requests (hub→vision, member-bound, 30 s). A pinned test vector keeps both implementations identical. |
| `VISION_TEMPLATE_KEY` | vision | HKDF → AES-256-GCM key for face templates and profile thumbnails; AAD = `member_id|kind` (`member_id|profile_photo` for the thumbnail), so a blob can't be moved to another member. |
| `MQTT_*_PASSWORD` | mosquitto + each client | One user per service; ACLs: hub-core reads `hub/ble/#`, simulators/gateway write only `hub/ble/#`. |
| `device_key.pem` (Ed25519) | hub-core data volume (SE/TPM in production) | Proves the hub's identity to HMS: `challenge → sign(nonce) → token`. |
| `HMS_STUB_JWT_SECRET` | hms-stub | Signs device and demo-user JWTs (stub only). |

`scripts/init_env.py` creates every `.env` from its `.env.example`, generating each secret once and sharing it by name (`__GENERATE__`, or `__MQTT_HUBCORE_PASSWORD__`-style explicit keys). `.env` files are git-ignored.

**Why a face match is trustworthy enough to open a view:** only vision can sign an `identify` proof; hub-core checks the signature, the member id, a 30-second freshness window and a single-use nonce, and that the member is enrolled. A compromised page can't claim to be Amma. Sensitive actions (Forget me, changing a PIN) still need the PIN (PRODUCT_SPEC S8).

## 3. Contracts

### 3.1 hub-core REST (proxied as `/api/*`, header `X-Hub-UI-Token`)

| Method · path | Who may call | Notes |
|---|---|---|
| `GET /health` | anyone (compose healthcheck) | `{status, db, encrypted, sync, ws_clients}` |
| `GET /state` | UI | version, env, serial, sync status, current session & measurement, inbox count, device settings, `encrypted_store` |
| `GET /members` | UI | public member info + "done today" counts; **never readings** |
| `GET /members/{id}/snapshot` | the identified member only | Orbit cards: latest (value, age, source, average-of-N), 12-point series, status vs **doctor's** target, freshness, today's counter |
| `GET /members/{id}/vitals/{kind}?days=7\|30\|90` | the identified member only | trend points (≤ 200), average, targets |
| `POST /sessions` `{member_id?, method: face\|choose\|pin\|guest\|dev, proof?, pin?}` | UI | face/choose need a vision proof; pin is rate-limited (5 tries → 60 s lock, doubling); dev only with `HUB_ENV=dev` |
| `POST /sessions/current/presence` `{face}` · `DELETE /sessions/current` | UI | heartbeat every 5 s; "Done" |
| `POST /presence` `{state}` | UI | publishes `hub/vision/presence` |
| `POST /measurements` `{kind, context?}` · `DELETE /measurements/{id}` | identified member | a running guided measurement owns the next reading of its kind (and applies its glucose context) |
| `GET /inbox` · `POST /inbox/{id}/assign` · `POST /inbox/{id}/discard` | any identified member | implausible readings can only be discarded |
| `GET /medicines/today` · `POST /doses/toggle` | identified member | dose check-offs are stored locally first and synced idempotently |
| `GET /visits/next` | identified member | next appointment + live queue (only on the visit's day) + leave-now nudge |
| `GET /utilities/weather` · `GET /ambient` | anyone | Ambient shows no drug names, no values — time, kind and an initial only |
| `GET/POST /calendar` · `GET/POST/DELETE /reminders` · `GET/POST /board` | identified member | household utilities |
| `GET/PUT /settings` | UI | theme, text size, Clear view, Calm motion, sound, household language, travel minutes |
| `PUT /members/{id}/prefs` | that member | language, discreet, mirror off |
| `POST /members/{id}/pin` · `POST /pin/verify` | member / guardian / owner (first PIN) | scrypt hashes |
| `POST /members/{id}/consent` `{purpose, granted, guardian_member_id?}` | the member, or a guardian for a child | grant or withdraw `biometric_face` / `profile_photo`; queued to HMS (withdrawals of consents given in the Cure app too) |
| `GET /members/{id}/photo` | UI | the member's Cure profile photo as vision's 256 px thumbnail, `Cache-Control: no-store`; 404 without one. Used by the Orbit centre, Identify (once matched), Choose your picture, PIN, Family, Pairing |
| `POST /members/{id}/photo/check` | the member, or a guardian for a child | refresh members from HMS now (≤ 1 per 20 s) instead of within 15 min → `{has_photo, photo_v, photo_status, face_enrolled}` |
| `POST /enrol/{id}/start` → `{ticket}` · `POST /enrol/{id}/finish` `{receipt}` | as consent | "Add more angles": no ticket without active `biometric_face` consent **and** a Cure photo on the hub |
| `POST /members/{id}/forget` `{pin}` | PIN of the member (or a guardian) | deletes templates and the photo in vision, withdraws both consents (here and, via sync, in HMS), audits |
| `GET /pairing` · `POST /pairing/restart` · `POST /sync/now` | UI | first run and support |
| `POST /guest/claim` | guest session | one-off HMS claim for the last guest reading (15 min) |
| `POST /dev/reading` · `POST /dev/pair` · `POST /dev/hms-offline` | dev only | same pipeline as real BLE; one-click pairing with the stub |

WebSocket `/events` (proxied as `/api/events`): `hello`, `session.changed`, `reading.saved` (full payload only to the identified member, otherwise `{member_id, kind, private: true}`), `reading.inbox`, `reading.guest`, `reading.settling`, `sync.status`, `pairing.changed`, `members.changed`, `settings.changed`, `queue.update`, `reminder.due`, `device.battery_low`, `board.changed`.

### 3.2 vision WebSocket `/vision` (header `X-Hub-UI-Token`)

| Client → | ← Server |
|---|---|
| `{type:"identify", nonce, crops:[b64 jpeg ≤ 6]}` | `{type:"identify.result", result: match\|uncertain\|unknown\|no_face\|low_quality\|spoof_suspected, member_id?, score?, accepted?, proof?, candidates?:[{member_id, score, proof}]}` |
| `{type:"enrol.begin", ticket}` | `{type:"enrol.ready", member_id, needed}` or `enrol.error` |
| `{type:"enrol.frame", crop}` | `{type:"enrol.progress", accepted, reason?, count, needed}` |
| `{type:"enrol.finish"}` | `{type:"enrol.done", receipt, exemplars}` or `{type:"enrol.error", reason: too_few\|inconsistent\|mismatch}` (`mismatch` = the angles don't match the Cure photo) |

Match rule: best ≥ `T_accept` (0.45) **and** margin to the next member ≥ 0.08 **and** liveness ok → `match`; otherwise up to two candidates ≥ `T_candidate` (0.36) → `uncertain` (the UI shows "Who's measuring?" with only those people). Internal HTTP (signed by hub-core): `DELETE /templates/{member_id}`, `GET /templates`, `PUT /photos/{member_id}` (raw image ≤ 5 MB → `{ok, replaced_capture}` or `{ok: false, reason: bad_image|no_face|several_faces|quality|other_member}`), `GET /photos/{member_id}` (decrypted thumbnail, no-store), `DELETE /photos/{member_id}`. `unknown`/`uncertain` results also carry `best` (a similarity, never an id), and every attempt logs one line — `identify <result> best=<score> usable=<n>/<m> [reason=…]` — so failed sign-ins can be diagnosed from `docker compose logs vision`.

### 3.3 MQTT (ARCHITECTURE §7, unchanged)

`hub/ble/reading` `{reading_id, peripheral:{id,kind,model,name}, kind, values:{…}, unit, device_time, rx_time, stable, raw, user_slot?, context?}` · `hub/ble/device` `{peripheral_id, battery, state}` · `hub/session` `{session_id, member_id, method, mode}` (retained) · `hub/sync/status` (retained) · `hub/vision/presence`. Opaque ids only; no names or values in topics.

### 3.4 HMS `/api/v1/hub/*` (implemented by `hms-stub`; to be built in HMS-Dilshan)

As ARCHITECTURE §9.2, with these concrete choices:

- `POST /hub/auth/challenge {serial}` → `{nonce, expires_in: 60}` precedes `POST /hub/auth/token {serial, nonce, signature}` (409 `pending` until the owner claims the code, 403 `revoked`).
- `POST /hub/auth/refresh` rotates; **reusing** an old refresh token revokes the whole chain.
- `vitals:batch` items carry `client_reading_id`, `identified_by` (`face|pin|manual_select|inbox|dev`), `is_extra`, `peripheral_id`, `raw_payload`; per-item `created|duplicate|rejected(reason)`; recorded_at window −366 d … +5 min; kinds limited to the member's vital parameters.
- BP and SpO₂ readings carrying pulse are uploaded with a derived `pulse` item whose id is `uuid5(reading_id)`, so retries stay idempotent.
- `GET /hub/members` returns targets (`vital_target`) and guardians; `GET …/snapshot?days=90` returns series per kind (naive timestamps, as HMS does, to keep `as_utc` honest).
- Dose toggles are made idempotent on the hub side: read the day's doses, toggle only when the state differs.
- `GET /hub/members` also returns each member's consents from one ledger (given in the app or on a hub; `source: app|hub`) and `photo: {version, updated_at} | null` — non-null only while `biometric_face` + `profile_photo` are active. `version` is opaque and changes with every upload.
- `GET /hub/members/{pid}/photo` → the scanned JPEG (`Cache-Control: no-store`, `X-Photo-Version`), 403 `no_consent`, 404 none. Device-authenticated and household-scoped (HMS serves avatars publicly today — HMS_REFERENCE §5 item 6).
- `POST /hub/members/{pid}/consent {withdrawn: true}` withdraws the purpose wherever it was given.
- Patient side (Cure app / web, patient JWT): `PUT /patient/profile-photo` (multipart `photo`, `use_on_hub`, `patient_id?` for a guardian acting for a child) → scan → 200 `{photo, use_on_hub}` or 422 `bad_image|too_large|low_resolution|no_face|several_faces|face_too_small|not_frontal|too_dark|too_bright|blurry`; `POST /patient/profile-photo/hub-use {use_on_hub}`; `GET`/`DELETE /patient/profile-photo`. Adults set only their own photo; guardians only a child's.

## 4. The reading pipeline

`normalise` (units → kg/°C/mg/dL/mmHg; device clock trusted only for stored records > 10 min old) → in-memory + store dedupe (same peripheral, kind, value within ±20 s or same advert id) → **stored as `pending` with a UUIDv7 before anything else** → attribution → policy → `queued | inbox | guest`.

Attribution (`engine/attribution.py`, pure, 19 table tests): implausible → inbox; a running guided measurement of that kind keeps its member; one member identified in [t − 90 s (300 s for the scale), t + 10 s] and the value fits (weight within ±5 kg of their last) → assign; a cuff user button or a personal device maps to a member → assign; two members → inbox `several`; only a guest → shown, never stored; nobody yet → wait out the 10 s grace (crash-safe: pending rows are re-decided on start-up) → inbox `no_session`, suggesting the only member whose weight fits. Never a silent guess.

Policies (`engine/policy.py`): caps per metric, sessions for BP (2 readings ≤ 10 min apart form one session, averaged), counted per Asia/Colombo day; beyond the cap → stored and synced as `is_extra`, shown as "Saved as an extra reading". Programme overrides: `caps`, `fever_watch`, `glucose_regimen_per_day`.

## 5. Face sign-in from the Cure profile photo

```
 Cure app / web ──PUT /patient/profile-photo──► HMS: scan (one clear, frontal face; ≤ 1024 px JPEG, no EXIF)
   "Use on Cure Home" ✓  → consents biometric_face + profile_photo (policy versions)
                                         │  GET /hub/members → photo {version}   (only with both consents)
                                         ▼
 hub-core member refresh (15 min, or "Check for a new photo") ── version changed? ──► GET …/photo (memory only)
                                         │  PUT /photos/{member}  (signed photo_write)
                                         ▼
 vision: detect → one face? quality? looks like another member? → embedding (`photo` template) + 256 px thumbnail, both AES-GCM
                                         │  {ok} → member.photo_at, photo_v++, photo_status = ok   ·   {ok:false, reason} → photo_status = reason
                                         ▼
 hub-ui: /api/members/{id}/photo?v=photo_v in the Orbit centre, Identify (after a match), Choose your picture, PIN, Family, Pairing
```

- **Who sets it (decided 2026-10-22).** The Cure photo *is* the member's account avatar. The member uploads it; a parent adds a child ("Add family → Child") and their photo; Cure staff or another person can upload it for an adult who needs help, recorded as assisted consent. The Android app checks the photo on the phone before uploading; HMS always re-checks. New web/app screens are English only. Full HMS / web / app plan: `docs/03-roadmap/HMS_AND_APP_CHANGES.md`.
- **The Cure photo is authoritative.** A new photo replaces the old one; on-device "extra angles" that no longer look like it are dropped (`replaced_capture`). Extra angles can only be added while a Cure photo is on the hub and must match it (`mismatch`).
- **Refused photos are not kept.** If vision refuses a new photo (e.g. `other_member` — it looks like someone else in the household), the old photo and any extra angles are deleted too, `photo_status` records why, and Family tells the member to add a different photo in the Cure app. The same version is not retried; a new upload is.
- **No Cure photo → no face sign-in.** When HMS stops listing a photo (removed in the app, or consent withdrawn anywhere), hub-core calls vision `forget` and clears `enrolled_at`. Members then use "Choose your picture" + PIN.
- **Withdrawals win.** The hub checks its own consent ledger before downloading, so a Forget me on the hub takes effect before HMS hears about it; `upload_consents` then sends the withdrawal (including for consents given in the app).
- **Shown, not streamed.** The Orbit centre shows the saved photo, never the live camera, and the layout no longer follows the face (the glass cards still refract a blurred room). A photo that fails to load (vision restarting → hub-core 503) is retried with back-off before the initial is shown. Identify shows the live face only while looking, then the matched member's photo. "Hide my photo" (`prefs.mirror_off`) shows the initial instead.
- **Where things live.** HMS: the scanned photo + consents. Hub: an encrypted 256 px thumbnail and embedding in vision's store; hub-core keeps only `photo_at`, `photo_v`, `photo_ref` (HMS version) and `photo_status`. The photo crosses hub-core in memory to reach vision or the screen; it is never written, logged or uploaded by the hub.
- **Photo guide.** Family → a member without a usable photo → **Set up face sign-in** shows how to take the photo and add it (`guide.*` strings, en/si/ta), summarised from Cure's *Guidelines To Capture Images For Face Recognition* without its size/format limits: face and top of the shoulders, face filling most of the frame and centred; looking straight at the camera, head level; camera at eye level; eyes open, not covered by hair; neutral expression, mouth closed; no glasses, hat or mask, no heavy make-up; plain white background, nobody and nothing else; even light, no shadows/reflections/red eyes; sharp, in colour, not edited; taken in the last six months. Then: Cure app (Android) Profile → Profile photo → "Use on Cure Home"; cure.lk Sign in → Profile → Profile photo → Upload; a parent does it for a child, and Cure staff or a family member can do it for an adult who needs help; the hub picks it up within 15 min or on "Check for a new photo". The Cure app and web should show the same list on their upload screens (menu names to match what they ship).
- **Risks to close before a pilot.** One photo is a weaker reference than a guided capture (PRODUCT_SPEC L8): expect more "Who's measuring?" in poor light until extra angles are added. A printed or on-screen copy of the profile photo is the obvious spoof, and liveness v1 only blocks frozen input — active liveness (blink/turn, or depth/IR) is required before face sign-in opens health data outside a supervised pilot. Mitigations now: the `other_member` check, the 0.08 margin, consent-gated release, PIN for sensitive actions, and discreet mode.

## 6. The UI

- **Screens** (`src/features/*`): Boot, Ambient, Identify, Who's measuring, Orbit (+ vital-detail sheet), Measure, BP check, Glucose context, Inbox, Medicines, Visit, Family, Set up face sign-in (photo guide), Add more angles, Calendar & reminders, Guest, PIN, Pairing, Settings, Notices, Dev panel — the 20 rows of `design-system/project/4-screens.md`.
- **State machine**: zustand `screen` + `params` + history; sessions mirror hub-core via `/state` and `session.changed`. Return to Ambient after 60 s (member) / 20 s (guest) without face **and** without touch; a reload never resumes a view.
- **Design system → code**: `python design-system/gen_tokens.py` writes `src/styles/tokens.generated.css` (fonts self-hosted from `design-system/project/fonts`, night/day variables, type classes). `src/styles/app.css` is the port of `components/bundle.css`; `src/components/*` are the 18 components rebuilt in React + TS with motion, a11y and i18n. CI fails if the generated CSS drifts from `tokens.json`.
- **Camera & glass**: `CameraProvider` owns `getUserMedia`, runs MediaPipe Face Detector (self-hosted WASM + model, SHA-256 pinned) per video frame, One-Euro smoothing, shutter detection (black frames), and builds 224 × 224 loose crops in memory. `GlassRenderer` (WebGL2): video → dual-Kawase blur at ¼ → ⅛ → 1/16 → back to ¼ → one composite pass drawing the face orb (sharp crop ≤ 1.9 × face height — never the body) and up to 12 SDF lenses with edge refraction, rim/specular highlight, desaturation and adaptive dim. Lens positions are read from `[data-lens]` DOM elements every frame, so Motion springs and the focus state drive the glass for free. No CSS `backdrop-filter` over video; ≤ 3 blurred CSS panels on other screens.
- **Honest display**: every value carries age · source ("Just now · Cure Scale", "2 h ago · home", "Sep 17 · home" when stale, "average of 2"); status chips only against the doctor's target with ● ▲ ! ? and fixed words; implausible → "? Check this reading"; escalation copy fixed (`note.esc*`), no sound, never over the face orb; no "LIVE", no fake waveforms.
- **Languages**: `@cure-home/i18n` (en source; si/ta, with patient-app keys reused verbatim). Chrome ships no Sinhala date data, so Sinhala month/day names are ours (`lib/format.ts`). `REVIEW_KEYS` lists every hub string awaiting native-speaker/clinician review.

## 7. Deviations from ARCHITECTURE.md (and why)

| Target | As built | Reason |
|---|---|---|
| SFace/YuNet "via ONNX Runtime" | OpenCV DNN (`FaceDetectorYN`, `FaceRecognizerSF`) runs the same ONNX files | OpenCV supplies YuNet's post-processing and SFace's 5-point alignment; swapping in onnxruntime later is a contained change in `vision/models.py` if the Pi needs the speed. |
| `POST /enrol/{id}/frame` on hub-core | Frames go UI → vision only; hub-core issues a signed ticket and verifies a signed receipt | Face pixels never touch hub-core (CLAUDE.md rule 1), and enrolment still can't happen without consent. |
| hub-core trusts the UI's `member_id` after a match | Signed, fresh, single-use vision proofs | A compromised page can't open someone's view. |
| One `hubdata` volume | Separate volumes per service | Templates and the health store are isolated (and can be wiped separately). |
| UI served by Vite on 5173 | Also a production nginx image on 8080 that is the kiosk proxy | Same origin + token injection + CSP; the Pi runs this image. |
| `GET /hub/auth/token {serial, signature(nonce)}` | Explicit `challenge` call first | Server-issued nonces stop replay. |
| Pulse as part of the BP reading | Stored with the reading, uploaded as a derived pulse item | Keeps one attribution decision per measurement; HMS gets pulse as its own kind. |
| HMS profile picture may only bootstrap enrolment after on-device confirmation; guided capture is the reference | The Cure profile photo (scanned at upload, released with consent) is the face sign-in reference; extra angles are optional and must match it; the Orbit centre shows that photo | Product decision 2026-10-22: one photo, managed in the Cure app, instead of an on-device enrolment step. See §5 for the risks this adds. |

## 8. Status against the roadmap

| Phase | State | Notes / what's left |
|---|---|---|
| 0 Foundation | **done** | monorepo, compose with health checks, env bootstrap, clinical twins + vectors, CI (lint/type/test, amd64+arm64 buildx, SBOM) |
| 1 Shell & design system | **done** | tokens generated from the design system, Boot (anime.js), Ambient, kiosk launcher. Storybook not added (the design-system previews serve that role); contrast script still to write |
| 2 Camera & Orbit View | **done on PC** | camera hook, MediaPipe + One-Euro, WebGL2 glass, Orbit geometry and focus state (face-following and head parallax removed 2026-10-22: the centre shows the saved photo, so the layout stays still). FPS on a real Pi 5 not yet measured |
| 3 Face identity | **built, needs people** | vision service, face sign-in from the Cure profile photo (scan at upload, consent-gated sync, refusal reasons), extra angles anchored to it, Who's measuring, PIN, Forget me, eval harness. Needs a consented local dataset to set thresholds (single-photo enrolment especially) and active liveness |
| 4 Readings | **done** | ble-sim scenarios, gateway decoders (OKOK + GATT), full pipeline with table tests. Real cuff/oximeter over bleak untested (no hardware here) |
| 5 HMS integration | **done** | HMS-Dilshan implements the contract (migration `20261022_add_home_hub`, `/api/v1/hub/*`, patient and clinician routes, private scanned avatars, push); web and patient app updated (docs/03-roadmap/HMS_AND_APP_CHANGES.md v3). The stub stays the offline twin |
| 6 Daily utilities | **mostly** | medicines + doses, visit + queue + leave-now, weather, calendar, reminders, family board, reminders due. Poya/holiday data not added (needs the official calendar) |
| 7 Hardening | **started** | offline queue + backoff, no-PHI log tests, no-image-on-disk test, Playwright walk-through. STRIDE, 24 h soak, contrast over camera frames still to do |
| 8 Pi bring-up | **files only** | `os/` (silent boot, Plymouth theme, cage + Chromium unit, policies). Plymouth frames to export; real hardware needed. Meanwhile a Surface Pro on Ubuntu is the production test hub: `os/ubuntu/install.sh` (`device` profile, real HMS, cage + Chrome kiosk) — docs/06-operations/SURFACE_PRO_UBUNTU.md |
| 9 Pilot readiness | not started | clinical sign-off, DPIA, OTA, mTLS |

## 9. Known gaps and next steps

1. **Real faces**: run `services/vision/eval` on a consented household set — with one Cure photo per person as the gallery — and tune `VISION_T_ACCEPT`/`MARGIN`; record FAR/FRR per group. Liveness v1 only blocks frozen input in `basic` mode; a printed profile photo must be defeated before pilot (§5).
2. **HMS** (done 2026-10-22): keep the stub and HMS in step — contract changes go into both, with tests on each side.
3. **Patient app** (done 2026-10-22, English-only new screens per D-4): confirm ML Kit face detection on low-end Android phones and tune the on-phone thresholds against the server's.
4. **Pi**: measure Orbit FPS with the glass renderer (fallback: Clear view), boot time, memory; export Plymouth frames; confirm `sqlcipher3-wheels` and OpenCV arm64 wheels in the image build.
5. **Translations**: native-speaker + clinician review of `REVIEW_KEYS` (si/ta), including the Sinhala date names.
6. **Holidays**: add the gazetted Poya/public-holiday calendar as data (not computed).
7. **Text entry**: the family board uses preset notes because the kiosk has no keyboard; an on-screen keyboard (si/ta/en) is a separate piece of work.
