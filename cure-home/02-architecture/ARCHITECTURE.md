# Cure Home — Architecture

*v0.1 · 2026-10-21 · Companion to `docs/01-product/PRODUCT_SPEC.md`. Research basis: `docs/reference/UI_STACK_RESEARCH.md` [U], `docs/reference/MARKET_REGULATORY_RESEARCH.md` [M], `docs/reference/HMS_REFERENCE.md` [HMS], `docs/reference/PATIENT_APP_REFERENCE.md` [PA].*

## 1. Context

```
              ┌──────────────────────── Household ────────────────────────┐
  BLE scale ─┐│                                                            │
  BP cuff ───┼┼─► ble-gateway ─┐                                           │
  Oximeter ──┤│                ▼                                           │
  Thermo ────┤│            Mosquitto (localhost MQTT) ◄── vision           │
  Glucometer ┘│                ▲            ▲                ▲ face crops  │
              │                │            │                │ (ws, local) │
              │             hub-core ◄── REST/WS ──► hub-ui (Chromium kiosk)│
              │       (SQLite+SQLCipher)                 ▲ camera (UVC)    │
              └──────────────────│─────────────────────────────────────────┘
                                 │ HTTPS (device JWT; mTLS later)
                                 ▼
                   Cure HMS  /api/v1/hub/*  (FastAPI + MySQL 8)
                                 ▲
             Cure patient app (pairing QR, caregiver view) · HMS web (doctor views)
```

Trust boundaries: (1) the BLE air interface (untrusted input), (2) the browser sandbox (UI holds no long-lived secrets), (3) the device ↔ HMS link (authenticated, encrypted), (4) the HMS staff side (role-checked, audited).

## 2. Platform

| Layer | Production (Pi) | Development (Windows 11 + Docker Desktop) |
|---|---|---|
| Board | Pi 5 4/8 GB → CM5 + carrier | PC |
| OS | Raspberry Pi OS Trixie 64-bit, read-only root (overlayfs), LUKS data partition | Windows 11 + WSL2 |
| Boot | `disable_splash=1`, quiet cmdline, Plymouth script theme `cure` | Splash route `/boot` in the UI |
| Display | `cage` → `chromium --kiosk` at device scale factor 1.5 on the 10.1" panel (1920×1200 → 1280×800 CSS px) | Chrome `--app=http://localhost:5173 --window-size=1280,800` |
| Camera | UVC USB module → `getUserMedia` (or MediaMTX `rpiCamera` → WebRTC) | PC webcam → `getUserMedia` |
| BLE | `ble-gateway` container with host D-Bus/BlueZ | `ble-sim` container, or `ble-bridge` (bleak) running natively on Windows |
| Services | Docker Compose (arm64 images) or systemd | Same compose file, amd64 images; arm64 smoke-tested under QEMU |

Why the browser owns the camera: Docker Desktop containers on Windows cannot see the webcam without a custom WSL kernel and usbipd [U§8]. Owning the camera in the browser makes dev and prod identical, and frames never cross a process boundary except as small face crops over localhost.

## 3. Services

| Service | Tech | Responsibilities | Never does |
|---|---|---|---|
| **hub-ui** | React 19, TS, Vite, Tailwind v4, Motion, anime.js v4, MediaPipe Tasks Vision, WebGL2 glass renderer, TanStack Query, zustand | All screens; camera; in-browser face **tracking** (30 Hz box → orbit layout); sends face crops for identification; guided flows | Store tokens beyond the session; talk to HMS directly; persist frames |
| **hub-core** | FastAPI (Python 3.12), SQLModel, SQLite + SQLCipher, paho-mqtt, httpx | Members, sessions, attribution engine, measurement policies, local store, sync engine, HMS client, utilities (weather cache, calendar, reminders), settings, audit log, WebSocket events to UI | Run ML; touch BLE directly |
| **vision** | Python, OpenCV (YuNet detector, SFace embedder) via ONNX Runtime; optional MobileFaceNet/ArcFace with a commercial-friendly licence | Quality checks, alignment, embedding, 1:N match against encrypted templates, enrolment, passive liveness | Persist images; send anything off-device |
| **ble-gateway** | Python, bleak (BlueZ on Pi; WinRT on Windows as `ble-bridge`) | Scan adverts (OKOK/Xiaomi scales), connect GATT devices (0x1810, 0x1822, 0x1809, 0x1808, 0x181D/0x181B, 0x180F battery), time sync (0x1805), dedupe, publish `hub/ble/reading` | Attribute readings to people |
| **ble-sim** | Python CLI + scheduler | Publish realistic readings on the same topics (scenarios: normal day, HBPM week, fever, duplicates, implausible values, two people) | — |
| **mosquitto** | Eclipse Mosquitto 2 | Local bus, bound to 127.0.0.1 (and the compose network); no anonymous access in prod | Listen on LAN |
| **hms-stub** | FastAPI | Offline fake of the HMS endpoints the hub uses, including the proposed `/api/v1/hub/*` | — |
| **updater** (later) | RAUC + hawkBit, or Mender | Signed A/B OS updates with rollback; container image updates | — |

## 4. Key sequences

### 4.1 Wake and identify
```
presence (touch | motion | mmWave)  → hub-ui: Ambient → Approach (camera on, LED on)
hub-ui: MediaPipe Face Detector every frame; One-Euro filter on box
  face stable ≥ 600 ms, size ≥ 18% of frame height, frontal (yaw < 25°)
  → capture 3–5 loose crops (face box expanded 1.6×, resized to 224×224, JPEG q85), in memory — no alignment in the browser
  → ws://127.0.0.1:8700/vision  {type:"identify", crops:[…], session_nonce}
vision: quality gate (blur, exposure, size) → embed → cosine vs templates
  best ≥ T_accept (default 0.45, tuned locally; SFace default 0.363 is too loose for 1:N)
     and margin to 2nd best ≥ 0.08 and passive liveness ok → {member_id, score}
  else → {unknown}
hub-core: open Session(member_id, identified_by="face", t0); publish hub/session
hub-ui: greeting → Orbit View (member data from hub-core cache)
crops are dropped from memory after the reply
```

### 4.2 A reading arrives
```
ble-gateway → hub/ble/reading {reading_id, device_id, kind, values, unit, device_time?, rx_time, stable, raw}
hub-core:
  1 validate (plausibility table, unit normalisation)       → invalid → inbox(reason)
  2 dedupe (device_id, kind, rounded value, 20 s bucket)    → duplicate → drop (count)
  3 attribute (PRODUCT_SPEC §4.5)                            → member | inbox
  4 apply policy (session grouping, daily cap → extra flag)
  5 store locally with client_reading_id (UUIDv7)
  6 enqueue sync; notify UI (ws event reading.saved)
sync worker: POST /api/v1/hub/members/{patient_id}/vitals:batch (≤ 50 items)
  per-item result: created | duplicate | rejected(reason)  → update local status
  retry with backoff (1 m → 2 m → … → 1 h), forever; idempotent by client_reading_id
```

### 4.3 Pairing (device ↔ household)
```
hub-core: POST /hub/pairing/start {serial, public_key, fw}  → {pairing_code, expires_in:600}
hub-ui: shows QR = cure://hub/pair?code=…&serial=…
owner (patient app, logged in): POST /hub/pairing/claim {code}  → HMS links device ↔ household
hub-core polls POST /hub/auth/token {serial, signature(nonce)} → {access (15 min), refresh (30 d, rotating)}
hub-core: GET /hub/members → members + consents + vital parameters + targets
```

## 5. State machines

**UI mode**
```
Boot → Ambient ⇄ Approach → Identifying → Member(Orbit) → Measuring(kind) → Member
                         ↘ Guest ↗                 ↘ Locked (PIN for sensitive actions)
Any → Ambient on: no face 60 s (Member) / 20 s (Guest) | "Done"
Second face while in Member: enrolled member + no measurement running → "Who's measuring?" chooser (never a silent switch);
  measurement running or unknown face → keep the session, show "Someone else is here — tap to hide your readings"
Setup (first run) and Settings are separate stacks; Settings with PIN.
```

**Reading status**: `received → valid | invalid → attributed | inbox → stored → queued → synced | rejected`. Inbox items: `pending → assigned | discarded | expired(7 d)`.

**Session**: `open(member, method) → active (last face seen) → grace (attribution window keeps running) → closed`. Only one active member session at a time; the session changes only when the member picks themselves in "Who's measuring?" (or enters a PIN). A running measurement always stays with the session that started it.

## 6. Local data model (hub-core, SQLite + SQLCipher)

| Table | Key fields |
|---|---|
| `member` | `id`, `hms_patient_id`, `display_name`, `language`, `avatar_color`, `is_child`, `pin_hash`, `prefs_json`, `enrolled_at`, `status` |
| `face_template` | `id`, `member_id`, `model` (`sface-2021dec`), `vector` (encrypted blob), `quality`, `created_at`, `source` (`enrol`/`refresh`) |
| `consent` | `member_id`, `purpose` (`health_data`, `biometric_face`), `policy_version`, `granted_at`, `withdrawn_at`, `granted_by` |
| `peripheral` | `id`, `kind`, `vendor`, `model`, `mac_hash`, `assigned_member_id?`, `user_slot_map`, `validated` (STRIDE), `battery`, `last_seen` |
| `reading` | `client_reading_id`, `member_id?`, `kind`, `value`, `value_secondary`, `unit`, `context`, `measured_at` (UTC), `source='hub'`, `peripheral_id`, `identified_by`, `session_id`, `is_extra`, `status`, `raw_json`, `sync_attempts`, `synced_at` |
| `inbox_item` | `id`, `reading_id`, `reason`, `candidates_json`, `expires_at` |
| `session` | `id`, `member_id`, `method`, `opened_at`, `closed_at` |
| `cache_*` | Medicines, doses, appointments, queue, targets, vital parameters (TTL per type; cleared on member removal) |
| `reminder`, `calendar_event`, `board_note` | Household utilities |
| `audit_event` | `ts`, `actor` (member/system), `action`, `object`, `detail` (no PHI values) |

Retention: readings 30 days after sync; inbox 7 days; audit 180 days; templates until "Forget me".

## 7. MQTT topics (localhost)

| Topic | Publisher | Payload (JSON) |
|---|---|---|
| `hub/ble/reading` | ble-gateway / ble-sim | `{reading_id, peripheral:{id,kind,model}, kind, values:{…}, unit, device_time, rx_time, stable, raw}` |
| `hub/ble/device` | ble-gateway | `{peripheral_id, rssi, battery, state}` |
| `hub/vision/presence` | hub-core (from UI) | `{state:"approach"|"away"}` |
| `hub/session` | hub-core | `{session_id, member_id|null, mode}` |
| `hub/sync/status` | hub-core | `{queued, last_ok, last_error}` |

Never put names or values in topic names. Mosquitto: ACL per service user; TLS not needed on localhost but the listener is bound to loopback.

## 8. hub-core local API (127.0.0.1:8600)

REST: `GET /state`, `GET /members`, `GET /members/{id}/snapshot` (today + 7/30/90-day series per kind), `POST /sessions` (`{member_id, method}`), `POST /measurements/{kind}/start`, `GET /inbox`, `POST /inbox/{id}/assign`, `GET /medicines/today`, `POST /doses/{prescription_id}/toggle`, `GET /visits/next`, `GET /utilities/weather`, `GET /calendar`, `POST /reminders`, `GET/PUT /settings`, `POST /enrol/{member_id}/start|frame|finish`, `POST /members/{id}/forget`.
WebSocket `/events`: `reading.saved`, `reading.inbox`, `session.changed`, `sync.status`, `reminder.due`, `queue.update`, `device.battery_low`.
Auth: UI gets a per-boot random token injected by the kiosk launcher (header `X-Hub-UI-Token`); hub-core only listens on loopback.

## 9. HMS integration contract (to implement in HMS-Dilshan)

Follow HMS conventions [HMS §2]: `backend/app/models/home_hub.py`, `backend/app/api/home_hub.py` mounted at `/api/v1/hub`, `backend/app/services/home_hub_service.py`, idempotent migration `YYYYMMDD_add_home_hub_tables.py` reading FK collations from `information_schema`.

### 9.1 Tables
- `home_hub_device` (`id`, `serial_number` UQ, `display_name`, `household_id`, `owner_user_id`, `branch_id?`, `status` pending|active|revoked, `public_key`, `firmware_version`, `last_seen_at`, `last_ip`, `paired_at`, `revoked_at`, timestamps)
- `hub_pairing_code` (`code_hash`, `device_id`, `claimed_by_user_id`, `expires_at`, `used_at`)
- `household` (`id`, `name`, `primary_user_id`), `household_member` (`household_id`, `patient_id`, `relationship`, `role` owner|guardian|member, `can_view`, `can_record`, `consent_id`, `added_by`, `removed_at`), `patient_guardian` (`guardian_user_id`, `dependent_patient_id`, `permissions`)
- `hub_device_patient` (`device_id`, `patient_id`, `enrolled_at`, `enrolled_by`, `is_active`)
- `ble_peripheral` (`device_id`, `patient_id?`, `kind`, `vendor`, `model`, `mac_hash`, `validated`, `paired_at`, `last_reading_at`)
- `medication_schedule` (`prescription_id`, `patient_id`, `times_of_day` JSON, `timezone`, `source`, `created_by`); `medication_dose_log` + `dose_slot`, `taken_at`, `source`, `device_id`, UQ (`prescription_id`, `dose_date`, `dose_slot`)
- `vital_target` (`patient_id`, `kind`, `target_low`, `target_high`, `target_low_secondary`, `target_high_secondary`, `attention_level?`, `set_by`, `set_at`) — the doctor's targets the hub displays
- `vital_alert_rule` (`patient_id`, `kind`, `rule`, `notify_user_ids`, `enabled`) — HMS-side alerting only; never evaluated on the hub
- `device_event_log` (`device_id`, `patient_id?`, `event_type`, `details`, `ip`, `created_at`)
- `self_reported_vital` + `source`, `device_id`, `peripheral_id`, `client_reading_id` (UQ with `patient_id`), `identified_by`, `measured_by_user_id`, `is_extra`, `raw_payload`
- `patient_consent` + `purpose` (`health_data` | `biometric_face`)

### 9.2 Endpoints
| Method & path | Auth | Purpose |
|---|---|---|
| POST `/hub/pairing/start` | none (rate-limited, serial allow-list) | Device requests a pairing code |
| POST `/hub/pairing/claim` | patient JWT | Owner links device to household |
| POST `/hub/auth/token` | device signature | Device JWT (`type="device"`, `sub=device_id`) |
| POST `/hub/auth/refresh` | device refresh | Rotating refresh |
| POST `/hub/heartbeat` | device | `{fw, uptime, temp, storage, queue_len, peripherals[]}` |
| GET `/hub/members` | device | Members, relationship, language, consents, targets, vital parameters |
| GET `/hub/members/{pid}/snapshot` | device | Latest per kind + 90-day series (solves the patient app's 14-request problem too) |
| POST `/hub/members/{pid}/vitals:batch` | device | Idempotent batch upload; per-item results |
| GET `/hub/members/{pid}/medications` · `/doses` · POST `/doses/toggle` | device | Medicines and dose log with slots |
| GET `/hub/members/{pid}/appointments` · `/queue` | device | Next visit + live token |
| GET `/hub/members/{pid}/photo` | device | Authenticated profile photo for enrolment bootstrap |
| POST `/hub/members/{pid}/consent` | device | Record biometric consent captured on the hub |
| GET/DELETE `/patient/hub-devices` | patient JWT | Owner lists / revokes hubs |
| GET `/patients/{pid}/self-vitals` | staff (1,2,3,4,19,20) + `_assert_patient_access` | **Doctors see home readings** |

Device routes are rate-limited by `device_id`, not IP. Every device call writes `device_event_log`.

### 9.3 Prototype mode
Before HMS ships `/hub/*`, the hub can run against `hms-stub`, or against real HMS using each member's patient token (`/patient/self-vitals`) — lab only, because patient refresh tokens last 1 hour [HMS §4].

## 10. Face pipeline

- **Detection/tracking (browser):** MediaPipe Face Detector (BlazeFace short-range) each frame; Landmarker only for head-pose parallax. Self-host WASM + models (no CDN at runtime).
- **Identification (vision):** YuNet detects the face in the loose 224×224 crop and gives 5 landmarks → alignment to 112×112 → SFace 128-d embedding → cosine similarity. Thresholds tuned on a local validation set (Sri Lankan families, elderly, children, siblings, backlit rooms) [M§F]. Report FAR/FRR per group.
- **Enrolment:** 5–10 frames with pose prompts; reject low quality; store the mean template + up to 4 pose exemplars.
- **Refresh:** add a new exemplar only if score ≥ T_accept + 0.1 and quality high; max 8 exemplars; oldest evicted.
- **Liveness (passive):** frame-to-frame micro-motion, blink within 3 s window, texture/moiré check; failing liveness still allows "Choose your picture + PIN".
- **Encryption:** templates encrypted with AES-GCM using a data key wrapped by the hardware-sealed key (TPM/SE or the CM5 OTP-derived LUKS key). Dev: key from `.env` (never committed).
- **Licences:** OpenCV Zoo models are Apache-2.0; **InsightFace pretrained models are non-commercial** — do not ship them without a licence [U§9].

## 11. BLE gateway

| Device type | Mode | Notes |
|---|---|---|
| OKOK/Chipsea scale ("Yoda1") | Advertisement only | Marker `0xC0`, 13-byte payload; stable bit; divider and unit bits [PA §6]. Port `okokScaleParser` to Python with the same test vectors |
| Xiaomi Mi Scale 2 / Body Comp 2 | Advertisement | Weight (+ impedance) in adverts; impedance carry-over guard |
| BP cuff (standard) | Connect + indications on 0x2A35 | Bond once at the branch; set time via 0x1805; RACP for stored records where supported |
| Omron (proprietary models) | Avoid in v1 | Encrypted/EEPROM protocols, BlueZ issues [M§E2] |
| Pulse oximeter | 0x1822 PLX spot-check / continuous | Store spot-check only |
| Thermometer | 0x1809 indications | °C/°F flag |
| Glucometer | 0x1808 + RACP after bonding | Context from the device or asked on screen |
| Any | Battery 0x180F | Low battery → member reminder + support telemetry |

Allow-list by pre-paired peripheral id; unknown devices are ignored. Values decoded as IEEE-11073 SFLOAT where applicable.

## 12. Security architecture (summary)

| Control | Implementation |
|---|---|
| Device identity | Key pair generated in SE/TPM at provisioning; serial + public key registered in HMS; mTLS before the pilot (Roadmap Phase 9) |
| Tokens | Device JWT 15 min, refresh 30 d rotating, revocable from patient app/HMS |
| Data at rest | LUKS data partition; SQLCipher DB; templates double-encrypted |
| Data in transit | TLS 1.2+ to `api.cure.lk`; certificate pinning to the Cure CA/intermediate |
| Kiosk | `cage`; Chromium policies (`DeveloperToolsAvailability=2`, `URLAllowlist` localhost only, `VideoCaptureAllowedUrls`), no keyboard shortcuts, USB storage disabled |
| OS | Read-only root, unattended security updates via OTA, SSH off in prod, nftables default-deny inbound |
| Logs | Structured, no PHI or images; member ids only; remote telemetry is aggregate health only |
| Sensitive actions | PIN or patient-app confirmation |
| Physical | Camera shutter + hard-wired LED; tamper evident screws (later) |
| Process | ETSI EN 303 645 checklist; SBOM per release; vulnerability disclosure policy; annual pen test |

## 13. Performance budgets (validate on a real Pi 5)

| Item | Budget |
|---|---|
| Boot to Ambient | ≤ 25 s (NVMe) |
| Approach → greeting | ≤ 1.5 s |
| Orbit View | 60 fps target, 30 fps floor; ≤ 12 animated layers |
| Camera | 1280×720 @ 30 fps in; render canvas at 50–66 % scale |
| Glass | One WebGL2 pass for camera + lenses; ≤ 3 CSS `backdrop-filter` elsewhere, ≤ 16 px, never over video |
| Charts | ≤ 200 points per SVG; update ≤ 1 Hz |
| Memory | Chromium ≤ 600 MB; total ≤ 2.5 GB on a 4 GB board |
| Thermal | No throttling at 30 °C ambient with the active cooler |

## 14. Observability and updates
Heartbeat every 5 min (version, uptime, temps, storage, queue length, peripheral batteries) → HMS device dashboard for support staff. Crash reports without PHI. A/B OS updates with health check and automatic rollback; container updates pinned by digest; staged rollout by device cohort.
