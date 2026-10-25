# Cure Home — Product Specification and Gap Analysis

*Version 0.1 · 21 October 2026 · Owner: Dilshan Pathirana · Status: draft for decision*

Evidence for the claims here is in `docs/reference/MARKET_REGULATORY_RESEARCH.md` (cited as **[M§x]**) and `docs/reference/UI_STACK_RESEARCH.md` (**[U§x]**). Facts about the existing Cure systems are in `docs/reference/HMS_REFERENCE.md` (**[HMS]**) and `docs/reference/PATIENT_APP_REFERENCE.md` (**[PA]**).

---

## 0. One-page summary

**Original idea.** A touch screen with a camera, a weight scale and Bluetooth health monitors, running on a Raspberry Pi. It boots with an animation, recognises the user by face, greets them, listens for Bluetooth readings (max 3 a day), shows the vitals graphically around the user's face, syncs with the Cure web app and mobile app, and adds simple utilities (weather, calendar, reminders) so people use it every day.

**What the research changed.**
1. **The value is the clinical loop, not the screen.** Home BP self-monitoring alone lowers systolic BP by about 1 mmHg (not significant). With clinician co-intervention it lowers it by about 6 mmHg [M§H3]. Cure is unusually well placed because it already runs the hospital system the readings flow into. Today, though, **doctors cannot see home readings at all** [HMS §9].
2. **Consumer smart mirrors keep failing; reimbursed or hospital-run "kits" keep working** (Lululemon Mirror and Alexa Together ended, Naked Labs appears defunct; Tenovi, Omron VitalSight and HRS grew) [M§A3]. Cure Home should be sold through Cure's own clinics as a home-monitoring programme first, and retail second.
3. **The hub must stay a data system.** It should transfer, store and display, and flag nothing on its own. Alerts and risk scoring belong in HMS under clinician control. That keeps the hub out of medical-device registration while the bundled BLE devices carry their own NMRA registration [M§B6, §C1].
4. **Face data is special-category data under Sri Lanka's PDPA, whose core duties start on 1 January 2027** [M§B5]. Templates stay on the device, encrypted. Raw images are never uploaded. Every member gives explicit consent, and guardians consent for children.
5. **"Max 3 readings a day" conflicts with the home BP protocol** (2 readings morning + 2 evening for 7 days) [M§H3]. Limits must be per metric and per protocol.
6. **Older Sri Lankans are mostly offline** (21.5% of 60–69-year-olds use the internet) [M§B3], so the hub must work with no smartphone, survive outages, and speak Sinhala and Tamil.
7. **Hardware cost rose sharply.** Pi 5 4 GB went from $60 (2023) to $110 (+83%) [M§G]. The research's reference build (7" display, Camera Module 3) is about $240–255; this spec's build (10" display, UVC camera, NVMe, secure element) is an estimated $270–300. That rules out a cheap retail gadget, so the plan needs a lease/subscription model plus an Android-tablet "Lite" tier.

**The improved product, in one line.** *Cure Home is a family health hub that Cure clinics give to patients with hypertension, diabetes or heart failure. It recognises each family member, guides them through correct measurements with certified Bluetooth devices, and shows their readings around their own reflection. It gets every reading to their Cure doctor, and earns its place in the home every day with the time, the weather, medicines, visits and family reminders.*

---

## 1. The idea as given (baseline)

| # | Requirement from the brief | Kept? |
|---|---|---|
| R1 | Smart touch screen + built-in camera + weight scale + one or more BLE health monitors | Kept; the scale and monitors are certified, pre-paired devices |
| R2 | Connected to the web app's DB (and mobile app if needed) | Kept, via a new device API in HMS, not direct DB access |
| R3 | Runs on a Raspberry Pi or similar | Kept: Pi 5 prototype, CM5 for production |
| R4 | Boot animation, no BIOS/boot text | Kept: silent boot + Plymouth splash + in-app animation |
| R5 | Camera on after boot; face recognition | Changed: camera wakes on presence, not always on |
| R6 | Face images uploaded to the DB, from the web profile picture or on-device registration | **Changed:** templates stay on-device; profile photo only bootstraps enrolment |
| R7 | Greeting screen on identification | Kept, in the member's language |
| R8 | Listen for BLE broadcasts; record vitals/weight max 3×/day | **Changed:** per-metric protocols and limits; attribution rules |
| R9 | Show vitals graphically | Kept |
| R10 | **User's face in the middle, vitals and graphs around it** | Kept as the signature "Orbit View" |
| R11 | Only essential functions from the web/mobile app | Kept; explicit in/out list in §4.6 |
| R12 | Utilities: weather, calendar, reminders | Kept and extended with hospital-connected utilities (medicines, visits, live queue) |
| R13 | Design tools: anime.js, motion, Bklit UI, Cult UI, Aceternity, 21st.dev, etc.; glassmorphism, liquid glass, spatial UI | Kept; roles assigned in `docs/04-design/DESIGN_GUIDE.md` |

---

## 2. Gap analysis

Each gap: what is missing → why it matters → how this spec resolves it.

### 2.1 Design and UX gaps

| ID | Gap | Why it matters | Resolution |
|---|---|---|---|
| D1 | **Where does the device live?** The scale is used standing (often in a bedroom or bathroom), BP is measured seated at a table, and the camera must see the face. | One location can't serve all three, and a camera in a bathroom is unacceptable. | The hub lives in the **living or dining area** at seated eye height (BP is the anchor metric). Recognition opens a **session** that lasts while the member moves to the scale nearby. The scale talks to the hub over BLE (an ESP32 BLE proxy covers a far bedroom) [M§E3]. The installation guide forbids bathroom placement. |
| D2 | **Always-on camera at home.** | Privacy, trust, and power. People cover cameras they don't trust. | Presence wakes the camera (touch, motion, or an optional mmWave sensor). The camera runs only while someone is in front. A **physical shutter** with a hardware LED. The status bar always shows "Camera on device only". |
| D3 | **A live video of your whole body on a shared screen.** | Undressed users, other family members watching, low self-esteem triggers. | The Orbit View shows **only a circular face crop**, never the body. "Mirror off" replaces the face with the member's avatar. |
| D4 | **Glass over live video is hard to read and expensive on a Pi.** | Liquid Glass drew legibility complaints even on iPhones [M§H2]. Per-card CSS blur over a 30 fps video re-blurs every card every frame [U§6]. | One WebGL pass draws the camera and every glass "lens". Cards keep opaque-enough tinted fills with adaptive dimming. A **Clear view (solid cards)** setting. Contrast is tested against the worst-case backdrop [U§5–6]. |
| D5 | **Older adults and touch.** | Small targets, light type, and gestures cause errors and self-blame. | Targets ≥ 64 CSS px at 1.5× on the 10.1" panel (≈ 11 mm), primary 80 px; body text ≥ 20 px; vital numbers 48–72 px; weights 500–700 on glass; no hidden gestures; every icon has a label [U§5]. |
| D6 | **Colour-only status.** | Colour-blind users; regulatory "abnormal flag" risk. | Status is text plus symbol (● ▲ ! ?), never colour alone [PA]. Where the hub shows status at all, it compares against the **doctor's own target**, not a generic threshold (§4.7). |
| D7 | **No onboarding design.** | First-time setup decides whether the device is ever used. | A 6-step first-run (language → Wi-Fi → pair with Cure account via QR → add members → pair devices → first measurement), with a printed quick-start card. |
| D8 | **Several faces in view.** | Which person's data do we show? | One rule everywhere (ARCHITECTURE §5): the session belongs to the largest centred face held ≥ 1.5 s. If a second enrolled member appears and no measurement is running, show "Who's measuring?" with avatar buttons — never switch silently. If a measurement is running, keep the session and show "Someone else is here — tap to hide your readings". An unknown face gets the same privacy prompt. Member A's data never shows to member B unless A turns on "Share screen with family". |
| D9 | **Unknown faces (guests, maids, visiting relatives).** | They must not see family data or be tracked. | **Guest mode**: clock, weather and a guest measurement that is *not* stored, unless the guest scans a QR code to claim it into their own Cure account. Unknown faces are never stored. |
| D10 | **Boot experience.** | Rainbow/kernel text looks broken; long boots feel dead. | Silent boot (config + cmdline), a Plymouth splash whose last frame matches the app's first frame, then an anime.js continuation while services warm up, target ≤ 25 s to Ambient on NVMe (to be measured on hardware). |
| D11 | **Sinhala and Tamil.** | Most target users read neither English nor complex UI. | Full trilingual UI from the patient app's dictionaries [PA]. Optional voice prompts (TTS quality to be evaluated). Per-member language. |

### 2.2 Logic and data gaps

| ID | Gap | Why it matters | Resolution |
|---|---|---|---|
| L1 | **Attribution: whose reading is it?** BLE readings arrive with no identity; a scale reading can arrive when nobody is in front of the camera. | Wrong attribution corrupts a medical record. | The **attribution engine** (§4.5): auto-assign only when exactly one member was identified within the window (default 90 s) *and* the value is plausible for that member (weight within ±5 kg of their last weight, etc.). Otherwise the reading goes to the **"Who was this?" inbox**. Never guess silently. Per-device user slots (Omron 1/2) and GHS User Data Service are used when available [M§E3]. |
| L2 | **"Max 3 per day" is clinically wrong for some metrics.** | HBPM needs 4 BP readings a day for a week; insulin users test glucose 4–7 times a day [M§H3]. | **Per-metric policies** (§4.4), set by default and overridable by the clinician in HMS. The cap counts *sessions*, not raw readings. |
| L3 | **Duplicates.** Scales re-broadcast; BP cuffs resend their memory on reconnect. | Inflated readings and wrong averages. | Dedupe by (device, value, time bucket). Only stable readings are stored. Pull only new records (RACP / record counters). `client_reading_id` makes server writes idempotent. |
| L4 | **Timestamps.** Cheap broadcasters have no clock; HMS returns some naive timestamps. | Wrong times break protocols and charts. | Hub time from NTP plus the Pi 5 RTC (with battery). Set device clocks via Current Time Service. Store UTC; display Asia/Colombo; always `asUtc()` HMS values [PA]. |
| L5 | **Offline.** Power and internet cuts are common. | Lost readings destroy trust and adherence data. | Store-and-forward queue in an encrypted local DB; HMS accepts timestamps up to 366 days old [HMS §3]; sync status visible ("3 readings waiting to send"). |
| L6 | **Identity mapping to HMS.** HMS has no household, family or guardian model; patient phone numbers are unique [HMS §3]. | Children and elderly members without phones can't be patients today. | New HMS `household` / `household_member` / `patient_guardian` tables (§2.8; ARCHITECTURE §9). Dependents can be patients without their own login. |
| L7 | **Device sign-in.** HMS patient access *and* refresh tokens expire after 1 hour, with no device identity [HMS, Top facts #2]. | A hub signed in as a patient stops syncing after an hour offline, and storing family passwords on a shared device is unsafe. | **Device identity**: QR pairing from the patient app → device JWT (`type="device"`) with a rotating refresh, scoped to the household's members. |
| L8 | **Profile photo as the only enrolment image.** | One old, filtered photo gives poor recognition and can't detect spoofing. | The profile photo may *pre-fill* enrolment, but the member must complete a 5–10-frame guided capture on the device (angles, glasses on/off, lighting) [M§F]. |
| L9 | **Faces change.** Children grow; people get glasses, beards, illness. | Recognition rates drift down. | Template refresh only from high-confidence matches; re-enrolment prompt for children every 6 months; one-tap fallback to "Choose your picture + PIN". |
| L10 | **Medication schedules are free text in HMS** ("Twice daily"), and the dose log has one row per day [HMS §3]. | The hub can't ring a reminder at the right time or log each dose. | A new `medication_schedule` with times of day; `dose_slot` in the dose log. Until then the hub maps common frequency phrases to default times that the member can adjust. |
| L11 | **Unit and plausibility consistency.** | The phone app, HMS and the hub must agree. | One shared clinical package with twin TS/Python implementations and shared test vectors, ported from `clinicalThresholds.ts`, `vitalRanges.ts` and `core/vital_ranges.py` [PA][HMS]. |
| L12 | **Account deletion and consent withdrawal.** | PDPA rights; trust. | "Forget me" deletes templates locally (and in any backup), unlinks the member, and records consent withdrawal in HMS. |

### 2.3 Clinical gaps

| ID | Gap | Resolution |
|---|---|---|
| C1 | No measurement protocol. Untrained users measure BP wrongly (talking, crossed legs, cuff over clothes). | **Guided measurement**: a 5-minute rest timer with breathing animation, posture checklist, 2 readings 1 minute apart, averaged; morning/evening reminders. "HBPM week" mode (7 days, day 1 discarded) on doctor request [M§H3]. |
| C2 | Bundled devices may not be clinically validated. | Only devices on a validated-device list (e.g. STRIDE BP / validatebp.org) and registered with NMRA [M§B6] are sold. The device registry records model and validation status. |
| C3 | Who acts on a dangerous reading? | The hub shows fixed, clinician-approved text ("This reading is higher than your doctor's target. If you feel unwell, call 1990") [PA]. **Clinical escalation lives in HMS** (alert rules, care team inbox). The hub never says "you have hypertension". |
| C4 | Thresholds are not signed off [PA §9]. | A named clinical lead signs off thresholds, copy and escalation text before the pilot; change control after that. |
| C5 | Heart failure needs daily weights with a trend rule (> 2 kg in 3 days) [M§H3]. | "Daily weight" programme flag per patient; the trend rule runs in HMS (clinician side), and the hub only reminds and records. |

### 2.4 Business gaps

| ID | Gap | Resolution |
|---|---|---|
| B1 | No customer or payer defined. | **Primary buyer: Cure clinics' chronic-care programme** (hypertension, diabetes, heart failure, post-discharge). The clinic provides the hub on a lease and charges a monthly programme fee that includes doctor review. Secondary: families buying for elderly parents; corporates and insurers later. |
| B2 | Hardware cost vs Sri Lankan incomes. | Lease/subscription (hardware recovered over 18–24 months), refurbish-and-redeploy, and **Cure Home Lite**: the same UI as an Android-tablet app (a family's existing tablet or a low-cost one) with the same BLE devices [M§G]. |
| B3 | No retention engine. One-third of wearables are abandoned within 6 months [M§H1]. | Daily utility (clock, weather, medicines, visits, live queue), a family board, and above all **visible doctor feedback** ("Dr Perera reviewed your readings on Monday") [M§H1]. |
| B4 | No proof of value. | A 3-month pilot with 30–50 households from Cure branches, measuring adherence, BP control and clinician time (§5.5). |
| B5 | No support model. | Install at the branch (pre-paired kit), WhatsApp support line, remote diagnostics (heartbeat, sync status), swap-out within 48 h. |
| B6 | Competition from phones (Cure's own patient app). | Positioning: the app is for the patient on the go; the hub is for the **household and for people without smartphones**. Both write to the same HMS record. |
| B7 | Distribution of regulated devices. | Cure (or a distributor) acts as the local marketing authorisation holder for the bundled BP/SpO₂/glucose devices via NMRA's reliance pathway [M§B6]. |

### 2.5 Security gaps

| ID | Gap | Resolution |
|---|---|---|
| S1 | Proposal to upload face images to the DB. | Never. On-device templates only, encrypted with a key sealed in hardware (TPM/secure element, or OTP-derived key on CM5 secure boot) [M§D2–D3]. |
| S2 | No device identity; default credentials risk. | Per-device X.509 identity, provisioning record, mTLS before the pilot (Roadmap Phase 9), no default passwords, SSH disabled in production [M§D1]. |
| S3 | Kiosk escape. | `cage` single-app compositor, Chromium policies (no devtools, no URL bar, allow-listed origins), keyboard shortcuts disabled, USB storage blocked. |
| S4 | Stolen hub. | Encrypted data partition (LUKS), remote revoke from the patient app/HMS, local cache limited to 30 days of readings and no clinical notes. |
| S5 | Spoofed BLE readings. | Pre-paired allow-list, plausibility checks, `raw_payload` stored for audit, broadcast-only sources marked as such. |
| S6 | Updates. | Signed A/B OTA (RAUC + hawkBit or Mender) with automatic rollback [M§D2]. |
| S7 | Existing HMS weaknesses that the hub would inherit [HMS §5]. | Fix before connecting any device: set `APP_ENV=production`, stop `/users/patients` overwriting accounts, restrict `/sms/send`, fix forwarded-IP trust, rate-limit device routes by device id, authorise WebSocket channels, add PHI read auditing, stop serving patient photos publicly. Move the plaintext DB password out of `HMS-Dilshan/.claude/settings.local.json` (untracked, local-only) and rotate it if the file was ever shared. |
| S8 | Sensitive actions on a face match alone. | Face match opens the member's *view*. Changing sharing settings, deleting data, pairing a new phone or seeing history beyond 90 days needs a PIN or confirmation in the phone app [M§D4]. |

### 2.6 Privacy, legal and regulatory gaps

| ID | Gap | Resolution |
|---|---|---|
| P1 | PDPA special categories (health + biometric), effective 1 Jan 2027 [M§B5]. | DPO (external allowed), DPIA, s.12 data protection programme, consent records per member and purpose, retention schedule, cross-border transfer instrument if any cloud is outside Sri Lanka. |
| P2 | Children's data. | Guardian-only enrolment; children's profiles default to weight/height/temperature only; verify the age threshold in the Act [M§B5]. |
| P3 | Is the hub a medical device? | Ask NMRA for a **Product Categorisation Letter** for the hub as a non-device data display. Design to the MDDS posture: no diagnosis, no hub-side alarms, no generic "abnormal" flags [M§B6, §C1]. |
| P4 | Radio type approval. | Use the Pi 5 TRCSL exemption letter plus a vendor licence; confirm coverage for a CM5 design [M§B7]. |
| P5 | Advertising rules for health claims. | All marketing passes the compliance review (`cure-compliance-auditor` skill); no claims of diagnosis or accuracy beyond the certified peripherals [U§10]. |

### 2.7 Hardware and operations gaps

| ID | Gap | Resolution |
|---|---|---|
| H1 | SD-card corruption on power cuts. | NVMe or eMMC, read-only root with overlay, journaled data partition, optional UPS HAT for clean shutdown. |
| H2 | Heat and humidity in Sri Lanka. | Active cooler, vented enclosure, thermal throttling alarms in telemetry, dust filter. |
| H3 | Pi CSI camera isn't a webcam in Chromium [U§8]. | Use a UVC USB camera module (works with `getUserMedia` on Pi and PC), or MediaMTX `rpiCamera` → WebRTC. |
| H4 | BLE range to a bedroom scale. | Optional ESP32 BLE proxy; placement guide. |
| H5 | Fleet management. | Heartbeat, version, last sync, storage, temperature, BLE device battery levels (Battery Service 0x180F) shown to support staff in HMS. |

### 2.8 Integration gaps with HMS

Summarised from [HMS §9]; full contract in `docs/02-architecture/ARCHITECTURE.md`.
- New tables: `home_hub_device`, `hub_pairing_code`, `household`, `household_member`, `patient_guardian`, `hub_device_patient`, `ble_peripheral`, `medication_schedule`, `device_event_log`, `vital_target` (doctor's targets shown on the hub), `vital_alert_rule` (HMS-side alerting only).
- Extend `self_reported_vital` with `source`, `device_id`, `peripheral_id`, `client_reading_id` (unique per patient), `identified_by`, `measured_by_user_id`, `raw_payload`.
- New endpoints under `/api/v1/hub/*`, plus a **staff endpoint to read self-reported vitals** (`GET /patients/{id}/self-vitals`), which doesn't exist today.
- Biometric consent purpose on `patient_consent`.
- Configurable token lifetimes (currently hard-coded).

---

## 3. Positioning

**Name:** Cure Home (working). Signature screen: **Orbit View**. Tagline candidates: "Health that greets you." / "Your family's health, at home with you."

**Value by audience**

| Audience | Promise | Proof point |
|---|---|---|
| Patients with chronic conditions | "Measure correctly in two minutes; your doctor sees it." | Guided BP checks; "Dr reviewed" acknowledgements |
| Families / caregivers (often working away from home) | "Know Amma took her medicine and checked her BP — without calling three times a day." | Caregiver view in the patient app; family board |
| Older adults without smartphones | "No passwords, no apps. It knows you and speaks your language." | Face recognition; Sinhala/Tamil; big type |
| Doctors | "Trends between visits, not one clinic reading." | 7-day home averages, adherence, readings on the consultation screen |
| Hospitals / Cure branches | "A chronic-care programme that keeps patients connected to your branch." | Programme revenue; fewer no-shows; queue status at home |

**Product principles**
1. **Calm by default.** Ambient first, data on approach, nothing flashes.
2. **Your face, your data.** Only you see your numbers; only your device knows your face.
3. **Measure right, not more.** Protocol-guided readings beat many readings.
4. **The doctor closes the loop.** Every feature should make clinician review easier.
5. **Works on a bad day.** Offline, after a power cut, with shaky hands, in Sinhala.

---

## 4. Product definition

### 4.1 Personas

- **Kamala, 64 ("Amma")** — hypertension and type 2 diabetes, Kandy. Uses a basic phone. Takes Metformin and Amlodipine. Wants to stay independent. Main user.
- **Sunil, 68 ("Thaththa")** — heart failure after a hospital stay. Needs daily weights. Hard of hearing.
- **Nimal, 38** — their son, works in Colombo. Installs the Cure patient app and wants reassurance.
- **Sachi, 9** — granddaughter. Child profile (weight, height, fever checks).
- **Dr N. Perera** — cardiologist at a Cure branch. 15 minutes per patient; wants trends and adherence at a glance.
- **Branch nurse / programme coordinator** — sets up kits, calls patients who stop measuring.

### 4.2 Tiers and product lines

| Tier | What | For |
|---|---|---|
| **Cure Home** (appliance) | Pi 5 / CM5 hub, 10" touch display, UVC camera, shutter; kit with BLE scale + validated BP cuff (+ oximeter, thermometer, glucometer by programme) | Chronic-care programme patients; families who buy outright |
| **Cure Home Lite** | Same UI as an Android tablet app (kiosk mode), same BLE devices; face recognition optional | Price-sensitive households; pilots before the appliance is ready |
| **Cure Care+ programme** | Monthly service: device lease, doctor review of readings, coordinator follow-up, teleconsult discount | Sold by Cure branches |

### 4.3 Hardware reference design

| Part | Prototype | Production intent |
|---|---|---|
| Compute | Raspberry Pi 5 **8 GB** (recommended; required for the optional Ask Cure assistant — see `ASSISTANT_FEASIBILITY.md`). 4 GB works for the core hub only | CM5 4 GB **with eMMC and wireless** (not the Lite/no-wireless SKU — the hub needs BLE and Wi-Fi) + carrier, secure boot, LUKS |
| Display | Touch Display 2, 10" (1200×1920, used in landscape as 1920×1200) at device scale factor 1.5 → 1280×800 CSS px | Same, or 10.1" IPS optically bonded |
| Camera | UVC USB camera module (wide, HDR) | Same, with a physical shutter and a hard-wired LED |
| Storage | NVMe HAT or 64 GB A2 SD | eMMC 32 GB |
| Security | Secure element (ATECC608) or TPM eval board | Secure boot (`rpi-sb-provisioner`) + TPM/SE |
| Power | 27 W PSU; optional UPS HAT | Same + clean-shutdown circuit |
| Other | Active cooler, RTC battery, speaker; optional mmWave presence sensor | Moulded enclosure, wall/desk stand |
| Peripherals | OKOK/Xiaomi-class broadcast scale (protocol already decoded [PA §6]); validated BLE BP cuff with standard 0x1810; PLX oximeter 0x1822; thermometer 0x1809; glucometer 0x1808 | Pre-paired at the branch |

Electronics BOM ≈ $270–300 for this build before peripherals (estimate from Oct 2026 list prices: Pi 5 4 GB $110, 10" Touch Display 2 $80 [M§G]; UVC camera, NVMe, secure element, PSU, cooler and enclosure estimated). The research's 7"/Camera Module 3 build is ≈ $240–255 [M§G].

### 4.4 Measurement policies (replaces "max 3 per day")

Defaults below; a clinician can change them per patient in HMS (programme settings; targets in `vital_target`).

| Metric | Default policy | Session rule | Daily cap (default) | Notes |
|---|---|---|---|---|
| Weight | Once daily, morning, after waking | First stable reading of the session | 1 recorded (more are kept as "extra") | Heart-failure programme: daily weight required; trend rule in HMS |
| Blood pressure | Morning and evening | 2 readings 1 min apart, averaged | 2 sessions (4 readings) | **HBPM week** mode on request: 7 days, day 1 discarded |
| SpO₂ + pulse | When symptomatic or on programme | Stable reading after 30 s | 3 | |
| Temperature | When unwell | Single reading | 3 (6 in "fever watch") | |
| Glucose | Per regimen: fasting / pre-meal / 2 h post-meal / bedtime | Context tag required | 1–7 by regimen | mg/dL; context drives interpretation [PA §5] |

Rules: a reading beyond the cap is stored as **extra** (visible, synced with the `is_extra` flag) and never silently dropped. The member sees counters such as "1 of 2 today" (BP sessions) or "Weight saved for today".

### 4.5 Core flows

**F1 — First boot and pairing (installer or family)**
1. Silent boot → Cure splash → language choice (සිංහල / தமிழ் / English).
2. Wi-Fi (or phone hotspot).
3. The hub shows a QR code → the household owner scans it in the Cure patient app → HMS links the hub to the household (`/hub/pairing/claim`).
4. Members are pulled from the household; the owner adds dependents.
5. Pre-paired devices are confirmed by a test reading.
6. First guided measurement for the owner.

**F2 — Add a family member (on device)**
Consent screen in plain language (what is stored, where, how to delete) → guardian confirmation for children → 5–10-frame guided capture with a ring progress indicator ("Turn slightly left… now right… glasses off") → quality check → template stored encrypted → test recognition → done. Optional bootstrap from the HMS profile photo (authenticated download, not the public URL).

**F3 — Daily use (the core loop)**
Ambient → presence → camera wakes → face found (in-browser tracking) → identity check (local vision service, 3–5 crops) → greeting in the member's language → **Orbit View**: face centred, today's readings and next actions around it → member measures (scale, cuff…) → reading appears in its card with "Saved · 1 of 2 today" → next actions (medicine, next visit) → after 60 s with no face, or a tap on "Done", return to Ambient.

**F4 — Attribution (the engine behind F3)**
```
on BLE reading r:
  plausible(r)? else → inbox(reason="implausible")
  S = members identified in [r.t − W, r.t + 10 s]      (W = 90 s; 300 s for the scale)
  if |S| == 1 and fits_profile(S[0], r) → assign(S[0], confidence=high)
  elif device slot / GHS user maps to member m and m ∈ household → assign(m, high)
  elif |S| == 0 and exactly one member's weight band fits → inbox(suggest=m)     # never auto
  else → inbox(candidates=S)
inbox items expire after 7 days (then discarded, with a count kept)
```

**F5 — Guided BP check**: rest timer (skippable after 1 min, recorded as "short rest"), posture checklist, cuff animation, reading 1, 60 s pause, reading 2, average shown, context ("before medicine?").

**F6 — Medicines**: today's doses from HMS prescriptions plus the hub's schedule; reminder at the dose time (gentle chime, shown on Ambient); "Mark as taken" → dose log in HMS; missed-dose summary to the caregiver (opt-in).

**F7 — Visits and live queue**: next appointment; on visit day, the live token ("Now serving 7 · You are #12 · about 50 min") using the existing queue maths [PA §4]; "Leave home now" nudge.

**F8 — Guest mode**: unknown face → ambient plus a "Measure as guest" button; the reading is shown, not stored; QR to claim it into the guest's own Cure account.

**F9 — Emergency**: "Call 1990" (Suwa Seriya) shown as text and a number; optional SMS to the caregiver through HMS. No claim that help is on its way.

**F10 — Offline**: everything works except visits/queue refresh and weather; a banner shows "Offline · 3 readings will send later".

### 4.6 Scope: what is on the device and what is not

| On Cure Home (v1) | Left to the phone app / web |
|---|---|
| Face sign-in, guest mode, PIN fallback | Account creation, password reset |
| Orbit View with today's readings and 7/30/90-day trends | Full medical records, diagnoses, lab reports (hub shows "Your report is ready — open the Cure app") |
| Guided measurements; reading inbox | Manual entry of historical readings |
| Medicines today, dose check-off, reminders | Prescription details, pharmacy orders |
| Next visit, live queue, "leave now" | Booking, payment (PayHere), cancellation |
| Family members, family board (notes, reminders) | Household admin, sharing settings (or on device with PIN) |
| Weather, clock, calendar (household + Cure visits), timers | Chatbot, online consultations (later: video consults on the hub's screen) |
| Settings: language, text size, Clear view, Calm motion, Mirror off, camera shutter status | Data export (FHIR/PDF), account deletion (hub can trigger "Forget me") |

### 4.7 Display rules (keeps the hub a data system)

1. Show values, units, time, source, trends, and the **doctor's target** when one is set in HMS ("Target below 130/80 · set by Dr Perera").
2. Without a clinician target, show neutral trends only: no colour zones, no "high/low" words.
3. Status chips compare to the doctor's target: "● Within your target" / "▲ Above your target" (or "Below"), always with text and symbol. A third chip, "! Talk to your doctor", appears only when the clinician configured that level in HMS for this member; it uses fixed text, makes no sound and is not an alarm.
4. Out-of-plausible-range readings: "? Check this reading — measure again".
5. No hub-side alarms. Escalation text is fixed, clinician-approved, and points to 1990 or the doctor.
6. Never "LIVE", never fake waveforms, always the reading age [PA].

### 4.8 Utilities (why each earns its place)

| Utility | Daily-use reason | Data source |
|---|---|---|
| Clock, date, Poya days and public holidays | The ambient anchor | Local + static calendar |
| Weather, rain alert, heat index | Sri Lankan daily planning; heat matters for older adults | Open-Meteo (no key) |
| Medicines today | The strongest daily hook for chronic patients | HMS prescriptions + schedule |
| Next visit + live queue | Unique to Cure; saves hours waiting at the clinic | HMS appointments + queue |
| Household calendar | School, trips, visits | Local + optional Google Calendar (ICS) |
| Reminders and timers | Water, walk, insulin, cooking | Local, per member |
| Family board | Notes between family members ("Took Amma's BP ✓") | Local + caregiver app |
| Health tips (weekly, localised, clinician-approved) | Light education | Curated content |

### 4.9 Accessibility and inclusion requirements
WCAG 2.2 AA contrast against worst-case backdrops; targets ≥ 11 mm; text-size setting (3 steps); Clear view (solid surfaces); Calm motion (no parallax, no orbit drift); screen reader labels on all controls; trilingual; optional voice prompts; works without reading (icons + audio cues for "reading saved").

---

## 5. Business model and go-to-market

### 5.1 Revenue hypotheses (to validate in the pilot)
| Stream | Hypothesis |
|---|---|
| Cure Care+ monthly programme | Device lease + doctor review + coordinator; priced per month by programme (hypertension / diabetes / heart failure) |
| Outright purchase | Hub kit for families who want to own it; Care+ optional |
| Cure Home Lite | App licence + devices for households with a tablet |
| Hospital licensing (later) | Other hospitals use HMS + Cure Home for their own programmes |
| Insurers / corporates (later) | Wellness and chronic-care contracts |

US RPM codes (setup + monthly device-data + monthly clinician time) are the reference structure for pricing the programme, even though Sri Lanka has no equivalent reimbursement [M§A1].

### 5.2 Unit economics (rough, Oct 2026)
- Hub electronics ≈ $270–300 for the 10" build (≈ $240–255 for the 7" reference build [M§G]); peripherals ≈ $110–230 depending on the kit [M§G].
- Lease recovery target 18–24 months per kit, plus redeploy after refurbishment.
- Lite tier removes most of the hub cost.
All prices are hypotheses; exchange rate and import duty (VAT, PAL, CESS phase-out) must be checked per HS code [M§B7].

### 5.3 Channels
1. Cure branches (doctor prescribes the programme at a visit or discharge) — primary.
2. Cure web/app campaigns to existing patients' families.
3. Pharmacies and corporates — later.

### 5.4 KPIs
| Area | KPI | Pilot target (hypothesis) |
|---|---|---|
| Engagement | Weekly active households | ≥ 80% at week 12 |
| Adherence | Days with a protocol-complete BP session | ≥ 70% |
| Data quality | Readings auto-attributed correctly (audited) | ≥ 98%; inbox < 10% |
| Clinical | Change in 7-day home BP average | Track; compare with clinic BP |
| Clinician | Readings reviewed within 7 days | ≥ 90% |
| Ops | Sync success within 24 h | ≥ 99% |
| Trust | Members who keep face sign-in on after 30 days | ≥ 85% |

### 5.5 Pilot (after the local build reaches the "pilot-ready" milestone in the roadmap)
30–50 households from 2 Cure branches, 12 weeks, hypertension ± diabetes, with a named clinical lead, consent under the new policy version, a DPIA done, and weekly coordinator reviews.

---

## 6. Regulatory and compliance plan

| When | Action |
|---|---|
| Before pilot | Clinical sign-off of thresholds and copy; DPIA; consent texts in 3 languages; biometric policy version in HMS; NMRA PCL request for the hub; confirm peripherals' NMRA registration |
| Before 1 Jan 2027 | PDPA readiness: DPO, s.12 programme, retention schedule, transfer instrument for any non-Sri Lankan cloud; prefer Sri Lankan hosting for health data |
| Before sale | TRCSL vendor licence + Pi 5 / CM5 radio coverage; product safety labelling; Sinhala/Tamil instructions |
| Ongoing | ISO 14971-style risk file, IEC 62366 usability tests with older adults, IEC 62304-style software lifecycle (good practice even if not a device), vulnerability disclosure policy |

---

## 7. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Recognition fails for some members (lighting, age, bias) | Medium | High | Local validation on Sri Lankan families; PIN/avatar fallback; tunable threshold; HDR camera |
| Pi 5 can't hold 30 fps with glass + tracking | Medium | Medium | Single WebGL pass; Clear view default on Lite; 8 GB / CM5 option; tested weekly on real hardware |
| Wrong attribution reaches a doctor | Low | High | Conservative engine + inbox; audit sample; clinicians see source and identification method |
| Low adherence after 2 months | Medium | High | Doctor acknowledgements; coordinator follow-up; utilities; family board |
| Regulatory reclassification | Low–Medium | High | MDDS posture; PCL; alerts only in HMS |
| HMS security debt exposes data | Medium | High | Fix list S7 before any device connects |
| Hardware cost rises further | Medium | Medium | Lite tier; CM5 2 GB test; lease model |

---

## 8. Decisions needed from Dilshan

1. Confirm the name "Cure Home" and the signature "Orbit View".
2. Confirm the primary buyer is the Cure clinic programme (B2B2C) rather than retail.
3. Pick the pilot conditions and branches, and a clinical lead for sign-off.
4. Approve adding household/device tables and `/api/v1/hub/*` to HMS (and the security fix list S7 first).
5. Choose display size: 10" (recommended) vs 7".
6. Decide whether Cure Home Lite (Android tablet) is built in parallel or after the appliance.
