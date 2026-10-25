# Cure Home — Local Build Roadmap (Windows + Docker Desktop, simulated Pi, PC webcam)

*v0.1 · 2026-10-21 · For Dilshan + Claude Code. Read `CLAUDE.md`, `docs/01-product/PRODUCT_SPEC.md` and `docs/02-architecture/ARCHITECTURE.md` first.*

> **Active plan since 2026-10-22: [`ROADMAP_SURFACE.md`](ROADMAP_SURFACE.md)** — a Surface Pro on Ubuntu is the hub for development and the pilot; it covers everything still open here (including the Ask Cure build). This file stays as the record of phases 0–10 and the Raspberry Pi path (Phase 8) for units sold later.

## How the simulation works

```
Windows 11 host
├─ Chrome (app window 1280×800)  ← "the Pi screen". Owns the PC webcam via getUserMedia.
│     http://localhost:5173  (hub-ui, Vite dev server, run natively or in WSL2)
├─ ble-bridge (optional, native Python + bleak)  ← real BLE scale/cuff near the PC
└─ Docker Desktop (WSL2 backend)
      compose profile "dev":      hub-core · vision · mosquitto · ble-sim · hms-stub
      compose profile "hms":      + real HMS backend + MySQL (cloned HMS-Dilshan, its own compose)
      compose profile "pi-arm64": same services built for linux/arm64, run under QEMU (compatibility only)
```

Pi fidelity knobs: containers capped at `cpus: 4`, `mem_limit` matching the board (4 GB total budget); Chrome DevTools CPU throttling 4–6× and the FPS meter for the UI; window locked to the panel's CSS size: 1280×800 (the 10.1" Touch Display 2 at 1920×1200 with device scale factor 1.5). GPU can't be emulated — buy one real Pi 5 early (Phase 2) and test on it weekly.

## Phase overview

| Phase | Weeks (solo + Claude Code) | Outcome |
|---|---|---|
| 0 Foundation | 1 | Repo skeleton, toolchain, compose up, CI |
| 1 Shell & design system | 2–3 | Boot splash, Ambient screen, tokens, kiosk window |
| 2 Camera & Orbit View | 3–5 | Live webcam face in the centre, cards orbiting, mock data |
| 3 Face identity | 5–7 | Enrolment with consent, identification, guest mode, PIN fallback |
| 4 Readings | 7–9 | BLE sim + bridge, attribution engine, policies, local store, inbox |
| 5 HMS integration | 9–12 | hms-stub → real HMS: device pairing, household, batch vitals, doctor view |
| 6 Daily utilities | 12–14 | Medicines, visits + live queue, weather, calendar, reminders, family board |
| 7 Hardening | 14–16 | Offline sync, security, accessibility, i18n, performance, tests |
| 8 Real Pi bring-up | 16–19 | arm64 images, silent boot + Plymouth, cage kiosk, LUKS, BLE, camera |
| 9 Pilot readiness | 19–22 | Usability tests, clinical sign-off, DPIA, OTA, docs, final video |
| 10 Ask Cure assistant (optional) | spike in 14–16, build 23–32 | Closed-intent EN/SI voice and text assistant over the member's own records (`docs/01-product/ASSISTANT_FEASIBILITY.md`) |

Weeks overlap deliberately; each phase ends with a demoable build and a tagged release.

---

## Phase 0 — Foundation (week 1)

**Install on Windows**
1. Docker Desktop (WSL2 backend), WSL2 Ubuntu 24.04. Keep the repo on the Windows drive (your current path) or, for faster file watching, clone a working copy into WSL (`~/code/Healthcare-Device`).
2. Node 22 LTS + pnpm (`corepack enable`), Python 3.12 + `uv`, Git, Chrome.
3. Mosquitto clients for debugging (`mosquitto_pub/sub` inside a container is fine).
4. Optional: `usbipd-win` is **not** needed — the browser owns the camera.

**Build**
- Monorepo folders from `CLAUDE.md` (apps/, services/, packages/, infra/, os/, marketing/).
- `infra/compose/docker-compose.yml` with profiles (skeleton below).
- `packages/clinical`: port `vitalRanges.ts` (plausibility), `units.ts`, the ● ▲ ! ? symbols from `toneText.ts`, and `timeAgo.ts` from patient-app + a Python twin; add a `compareToTarget(reading, doctorTarget)` function (the only status logic the hub uses); shared JSON test vectors run by both suites. Do **not** use `clinicalThresholds.ts` / `NORMAL_BAND` for hub display (PRODUCT_SPEC §4.7).
- `packages/i18n`: copy `en/si/ta` dictionaries from patient-app; add hub keys.
- CI (GitHub Actions): lint, typecheck, unit tests, `docker buildx` for amd64 + arm64 (QEMU), SBOM (syft).
- `.env.example` per service; secrets never committed.

```yaml
# infra/compose/docker-compose.yml (skeleton)
name: cure-home
x-pi: &pi { cpus: 4, mem_limit: 1g, restart: unless-stopped }
services:
  mosquitto:
    image: eclipse-mosquitto:2
    ports: ["127.0.0.1:1883:1883", "127.0.0.1:9001:9001"]   # 9001 = websockets (dev only)
    volumes: ["./mosquitto:/mosquitto/config:ro"]
    healthcheck: { test: ["CMD", "mosquitto_sub", "-t", "$$SYS/#", "-C", "1", "-W", "3"], interval: 10s }
    profiles: [dev, pi-arm64]
  hub-core:
    <<: *pi
    build: ../../services/hub-core
    env_file: ../../services/hub-core/.env          # copy from .env.example first
    ports: ["127.0.0.1:8600:8600"]
    volumes: ["hubdata:/data"]
    healthcheck: { test: ["CMD", "curl", "-fs", "http://localhost:8600/health"], interval: 10s }
    depends_on: { mosquitto: { condition: service_healthy } }
    profiles: [dev, pi-arm64]
  vision:
    <<: *pi
    mem_limit: 1500m
    build: ../../services/vision
    ports: ["127.0.0.1:8700:8700"]
    volumes: ["hubdata:/data"]
    healthcheck: { test: ["CMD", "curl", "-fs", "http://localhost:8700/health"], interval: 10s }
    profiles: [dev, pi-arm64]
  ble-sim:
    build: ../../services/ble-sim
    depends_on: [mosquitto]
    profiles: [dev]
  hms-stub:
    build: ../../services/hms-stub
    ports: ["127.0.0.1:8800:8800"]
    healthcheck: { test: ["CMD", "curl", "-fs", "http://localhost:8800/health"], interval: 10s }
    profiles: [dev]
volumes: { hubdata: {} }
```

**Done when:** `cp services/*/.env.example` → `.env` for each service, then `docker compose -f infra/compose/docker-compose.yml --profile dev up` brings every service to healthy (each service defines a `healthcheck`); `pnpm --dir apps/hub-ui dev` serves a blank hub-ui; CI is green on both architectures.

**Kickoff prompt for Claude Code:** "Read CLAUDE.md and docs/03-roadmap/ROADMAP.md Phase 0. Scaffold the monorepo, the compose file with health checks, the clinical package with TS and Python twins sharing test vectors ported from patient-app (see docs/reference/PATIENT_APP_REFERENCE.md §5), and CI. Don't build features yet."

---

## Phase 1 — Shell & design system (weeks 2–3)

**Build**
- `apps/hub-ui`: React 19 + TS + Vite + Tailwind v4 + shadcn registry setup (Bklit, Cult UI, Aceternity, 21st as registries in `components.json`).
- Design tokens from `docs/04-design/DESIGN_GUIDE.md` as CSS variables + Tailwind theme; fonts self-hosted (Sora, Manrope, JetBrains Mono, Noto Sans Sinhala/Tamil).
- **Boot route**: anime.js v4 timeline (ring draw → cross → wordmark) that starts from the exact final frame of the Plymouth splash (export the same SVG to PNG frames later for Plymouth).
- **Ambient screen**: clock, date (with Poya/holidays), weather card (Open-Meteo through hub-core), "next up" card, hint line; Calm motion & Clear view settings.
- Kiosk launcher script for Windows: `scripts/kiosk.ps1` → `chrome.exe --app=http://localhost:5173 --window-size=1280,800 --kiosk-printing --disable-pinch --overscroll-history-navigation=0`.
- Storybook (or Ladle) for glass components, at panel sizes.

**Done when:** cold start shows boot → Ambient in < 3 s on the PC; tokens pass contrast checks (script) for text over the worst-case backdrop; Sinhala/Tamil render with correct shaping.

**Prompt:** "Implement Phase 1 of the roadmap: hub-ui shell, tokens and the Boot and Ambient screens exactly as in DESIGN_GUIDE (sections Foundations, Motion → Choreography, Screens & flows rows 1–2, Tokens). Use anime.js v4 named imports inside createScope; Motion for presence. Add Storybook stories at 1280×800."

---

## Phase 2 — Camera & Orbit View (weeks 3–5)

**Build**
- `useCamera()` (getUserMedia 1280×720@30, device picker, permission/error states, shutter-closed detection = black frames).
- MediaPipe Tasks Vision Face Detector (self-hosted WASM/models in `public/mediapipe/`), One-Euro filter, presence logic (Approach after 600 ms stable face).
- **Glass renderer v1** (WebGL2): camera texture → circular face crop in the centre; downsampled dual-Kawase blur for the background; SDF rounded-rect lenses for card positions passed as uniforms; adaptive dim from sampled luminance. CSS fallback for Clear view.
- **Orbit layout**: six slots on an ellipse around the face; Motion springs follow the face box with hysteresis; head-coupled parallax (off in Calm motion).
- Vital cards with mock data from `hub-core` `/members/{id}/snapshot` (seeded fake members); Bklit Line/Area sparklines; NumberFlow tickers.
- Buy a Pi 5 + 10" Touch Display 2 + UVC camera now; run the UI in Chromium on Raspberry Pi OS to read `chrome://gpu` and FPS weekly.

**Done when:** your own face sits in the centre with cards orbiting and following smoothly at ≥ 50 fps on the PC with 4× CPU throttle; on the real Pi ≥ 30 fps; no CSS backdrop-filter over the video.

**Prompt:** "Implement Phase 2: camera hook, MediaPipe face tracking with One-Euro smoothing, the WebGL2 glass renderer and the Orbit View per DESIGN_GUIDE sections 'Orbit View' and 'Glass & depth' and the ARCHITECTURE §13 budgets. Use mock snapshot data from hub-core."

---

## Phase 3 — Face identity (weeks 5–7)

**Build**
- `services/vision`: FastAPI + WebSocket `/vision`; YuNet + SFace (ONNX Runtime CPU); quality gate; 1:N match with accept threshold + margin; passive liveness v1; encrypted template store (AES-GCM, key from env in dev).
- Enrolment flow (UI + hub-core + vision): consent screens (3 languages), guardian step for children, guided 5–10-frame capture with ring progress, test recognition.
- Optional bootstrap from the HMS profile photo (via hms-stub `/hub/members/{pid}/photo`).
- Guest mode, "Who's measuring?" chooser, PIN fallback ("Choose your picture + PIN"), "Forget me".
- Evaluation harness: `services/vision/eval/` computes FAR/FRR from a consented local dataset; thresholds stored in config, not code.

**Done when:** you and two family members are recognised in < 1.5 s from approach; an unknown person gets guest mode; a phone photo of you doesn't open your data (passive liveness); "Forget me" removes the templates and is logged.

**Prompt:** "Implement Phase 3 per ARCHITECTURE §4.1 and §10: vision service, enrolment with consent, identification, guest mode, PIN fallback and Forget me. No image is ever written to disk or logged — add a test that asserts this."

---

## Phase 4 — Readings (weeks 7–9)

**Build**
- `services/ble-sim`: scenario files (YAML) + CLI (`python -m ble_sim scale --kg 62.4`, `bp --sys 124 --dia 78 --pulse 72`, `scenario hbpm_week`, `scenario two_people`, `scenario duplicates`).
- `services/ble-gateway` (Linux) and `ble-bridge` (Windows native, same code path with bleak's WinRT backend) publishing `hub/ble/reading`; OKOK parser ported from patient-app with its vectors; GATT 0x1810/0x1822/0x1809/0x1808 decoders with SFLOAT; battery 0x180F.
- hub-core: validation (clinical package), dedupe, **attribution engine** (PRODUCT_SPEC §4.5), measurement policies (§4.4) with daily counters and `is_extra`, local SQLCipher store, inbox API.
- UI: live "reading received" moments in the Orbit cards; guided BP flow (rest timer, posture checklist, 2 readings + average); inbox screen ("Who was this?").

**Done when:** all simulator scenarios produce the expected attribution (table-driven tests); duplicates are dropped; the 2nd weight of the day becomes "extra" (weight cap 1), the 3rd BP session becomes "extra" (BP cap 2 sessions); a real OKOK scale near the PC (via ble-bridge) lands on the right person.

**Prompt:** "Implement Phase 4: ble-sim with the listed scenarios, ble-gateway/ble-bridge with the OKOK and GATT decoders, and hub-core validation → dedupe → attribution → policy → store, with table-driven tests for every scenario."

---

## Phase 5 — HMS integration (weeks 9–12)

**Part A — hms-stub (week 9):** implement the full `/api/v1/hub/*` contract from ARCHITECTURE §9 in the stub, with fixtures for a demo household (Amma, Thaththa, Nimal, Sachi).

**Part B — real HMS changes (weeks 10–12)** in a branch of `HMS-Dilshan`:
1. **Security prerequisites first — all of PRODUCT_SPEC S7:** `APP_ENV=production` in deploy; `/users/patients` overwrite fix; `/sms/send` staff-only; forwarded-IP trust; device routes rate-limited by `device_id`; per-user/channel authorisation on `/ws/alerts`; audit log for reads of patient health data; stop serving patient photos and observations publicly (authenticated endpoint); configurable token lifetimes; rotate the DB password and add `.claude/settings.local.json` to `.gitignore`.
2. Migration `YYYYMMDD_add_home_hub_tables` (idempotent, collation-aware) for every table in ARCHITECTURE §9.1.
3. `api/home_hub.py` endpoints + `get_current_hub_device()` dependency + device rate limiting + `device_event_log`.
4. Staff endpoint `GET /patients/{pid}/self-vitals` and a "Home readings" panel on the doctor's consultation screen (Recharts, 7-day averages, source and identification method visible).
5. Patient app: add a camera/QR library (`expo-camera`; the app has none today) and build "Pair a Cure Home" (QR scan → `/hub/pairing/claim`), household management and the caregiver view.
6. Run HMS locally with its `docker-compose.local.yml` (MySQL 3308, backend 8000) and point hub-core at it (`HMS_BASE_URL=http://host.docker.internal:8000/api/v1`).

**Done when:** a reading taken on the hub appears in the doctor's view in HMS within 1 minute; revoking the hub in the patient app stops sync within 5 minutes; HMS tests for every new endpoint (incl. negative authorisation) pass.

**Prompt (HMS repo):** "Read Healthcare-Device/docs/02-architecture/ARCHITECTURE.md §9 and HMS conventions. First apply the security prerequisites, then add the home-hub tables, endpoints and staff self-vitals view with tests, following models/api/services patterns and an idempotent collation-aware Alembic migration."

---

## Phase 6 — Daily utilities (weeks 12–14)

**Build:** medicines today + dose check-off with slots (until HMS `medication_schedule` exists, map frequency phrases to default times the member can edit); reminders at dose time on Ambient; next visit + live queue + "leave now" nudge; weather (Open-Meteo cache, rain/heat alerts); household calendar (local + optional ICS); reminders/timers per member; family board; health tip of the week (static, clinician-approved JSON).

**Done when:** a full "morning routine" demo works end-to-end: approach → greeting → weight → BP guided → medicine taken → next visit shown → back to Ambient, all in Sinhala.

---

## Phase 7 — Hardening (weeks 14–16)

- **Offline:** kill the network mid-sync; readings queue and drain later; banner shows queue length. Power-cut test: `docker kill` hub-core mid-write → no corruption (WAL mode).
- **Security:** threat model (STRIDE) for hub-core/vision/UI; kiosk escape tests; dependency audit; secrets scan; ETSI EN 303 645 checklist; no-PHI-in-logs test.
- **Accessibility:** contrast tests over recorded worst-case camera frames; target-size audit (≥ 11 mm at panel DPI); Clear view and Calm motion; screen-reader labels; text-size setting.
- **i18n:** every string in 3 languages; pseudo-locale test for overflow; native-speaker review list for medical terms.
- **Performance:** Lighthouse/DevTools traces at panel size with 4× throttle; Pi weekly run; memory soak test 24 h.
- **Tests:** Playwright E2E with a fake camera (`--use-fake-device-for-media-stream --use-file-for-fake-video-capture=fixtures/amma.y4m`) and ble-sim scenarios; contract tests against hms-stub and real HMS.

**Done when:** E2E suite green on amd64 and arm64-QEMU; 24-hour soak without leaks; accessibility checklist complete.

---

## Phase 8 — Real Pi bring-up (weeks 16–19)

1. Raspberry Pi OS Trixie Lite 64-bit on NVMe; `config.txt`: `disable_splash=1`; `cmdline.txt`: `console=tty3 quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0 plymouth.ignore-serial-consoles consoleblank=0`; EEPROM `DISABLE_HDMI=1`.
2. Plymouth script theme `os/plymouth/cure/` (PNG frames exported from the boot SVG; last frame = UI first paint) → `sudo plymouth-set-default-theme -R cure`.
3. `cage` + Chromium systemd unit on tty1 with policies (`os/chromium/policies/managed/cure.json`), `--force-device-scale-factor=1.5`, camera allowed for `http://localhost`.
4. Docker Engine on the Pi; pull the arm64 images; `ble-gateway` with `/run/dbus` mounted and host networking.
5. UVC camera check; Touch Display 2 rotation/touch calibration; speaker.
6. Read-only root (overlayfs), LUKS data partition (dev key file → later OTP/TPM), nftables, SSH off in the prod image.
7. Image build pipeline: `rpi-image-gen` or pi-gen stage → reproducible `.img`; flash with Raspberry Pi Imager.
8. Measure: boot time (`systemd-analyze`), FPS, temps, memory.

**Done when:** power on → no text ever shown → Cure splash → Ambient in ≤ 25 s; Orbit View ≥ 30 fps; recognition and readings work with a real scale and cuff.

---

## Phase 9 — Pilot readiness (weeks 19–22)

- Usability tests with 8–10 older adults (IEC 62366-style formative): think-aloud on first-run, daily loop, inbox, medicines; fix top issues.
- Clinical sign-off of thresholds, copy, escalation text; NMRA PCL request; peripherals' NMRA status confirmed; DPIA + PDPA programme (deadline 1 Jan 2027); consent texts approved.
- OTA: RAUC + hawkBit (or Mender) with A/B and rollback; staged rollout.
- Device identity hardening: per-device X.509 in the secure element and mTLS to `api.cure.lk`.
- Support: HMS device dashboard (heartbeats), WhatsApp support runbook, swap process.
- Docs: quick-start card (3 languages), installer guide, clinician guide.
- Marketing: final promo films using real UI captures (see `docs/05-marketing/VIDEO_PRODUCTION_GUIDE.md`).

**Exit criteria for the pilot:** 10 kits built and soak-tested 72 h; all P1 bugs closed; sign-offs recorded.

---

## Phase 10 — "Ask Cure" assistant (optional; spike weeks 14–16, build weeks 23–32)

Read `docs/01-product/ASSISTANT_FEASIBILITY.md` first. Not part of the pilot unless the spike passes.

**Spike (3 weeks, real Pi 5 8 GB, dashboard running):** push-to-talk; Whisper base (EN) and SinhaSpeech whisper-small run11 (SI) via faster-whisper int8; rule-based urgent-phrase detector; intent + slot parser (XLM-R/HelaBERT fine-tune vs Gemma 4 E2B on LiteRT-LM with constrained JSON); 8 intents from the v1 set; English templates + 20 Sinhala templates; record ≥ 300 questions from ≥ 20 speakers aged 55+ (consented). Go/no-go against the targets in ASSISTANT_FEASIBILITY §8.

**Build (if go):**
- `services/assistant/` (FastAPI): ASR, urgent-phrase rules, parser, typed lookups through hub-core, template renderer (EN/SI/TA), TTS (Piper EN; SinhalaVITS → ONNX for SI after Dialog confirms the licence), per-member prefix cache.
- Identity: active-speaker check (MediaPipe lip landmarks + VAD) and the T0/T1/T2 tiers; multi-person → screen-only answers.
- Memory: allowlisted preferences + "notes for my doctor" (sent to HMS as patient messages); "What Cure remembers" screen with delete; session-only transcripts.
- UI: Ask button in the dock, listening state, "Did you ask…?" confirmation, answer card with source/date, AI disclosure line.
- Data: 10–20 h of in-domain Sinhala speech; native-speaker templates; clinical review of every template.
- Evaluation set in CI: per-intent exact match, scope precision/recall, urgent-phrase recall 100 %, wrong-member and multi-speaker cases, prompt-injection and memory-poisoning cases, SI/EN/Singlish.
- Compliance: update the DPIA, consent screens (voice, assistant, memory), NMRA categorisation request covering the assistant.

**Done when:** all §8 targets hold on 3 real households for 2 weeks with no wrong-member disclosure and no interpretation in any answer (audited sample).

## Working with Claude Code on this roadmap

- One phase per branch; open a PR per milestone; keep `CLAUDE.md` updated with new commands and decisions.
- Ask Claude to start each phase by restating the acceptance criteria and listing files it will create.
- Keep simulator scenarios and E2E fixtures as the shared truth between UI, hub-core and HMS.
- After each phase: run the full E2E on the PC, then on the Pi, and record FPS/boot/memory in `docs/03-roadmap/PERF_LOG.md`.
