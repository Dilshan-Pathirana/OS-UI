# Reference: Cure Patient App (`patient-app`)

> Snapshot analysis taken on 2026-10-21 from a local copy of
> https://github.com/Dilshan-Pathirana/patient-app before the copy was removed from this repo.
> The GitHub repo is the source of truth. Re-check anything here against it before relying on it for code.
> Labels: facts were read from files; anything marked *(guess)* or *(suggestion)* was not verified.

---

## 1. Tech stack and versions (`package.json`, `app.json`)

| Layer | What's used |
|---|---|
| Framework | `expo ~57.0.27`, `react-native 0.86.3`, `react 19.2.3`, TypeScript `~6.0.3`. New Architecture on (`newArchEnabled=true`, `hermesEnabled=true`, `edgeToEdgeEnabled=true`). Dev client (`expo-dev-client`); Expo Go can't run it. |
| Router | `expo-router ~57.0.25`. Routes in root `app/` (not `src/app`). Alias `@/*` → `./src/*`. Scheme `curepatient`. |
| State | `zustand ^5.0.15`: `src/store/authStore.ts`, `lockStore.ts`, `settingsStore.ts`. Top-level `store/` holds Play Store graphics. |
| Server state | `@tanstack/react-query ^5.104.0` + `react-query-persist-client` + `query-async-storage-persister`. HTTP `axios ^1.20.0`. |
| UI | No component library. `StyleSheet` + home-made kit: `src/components/ui/kit.tsx`, `Controls.tsx`, `Screen.tsx`. |
| Icons / SVG | `lucide-react-native ^1.48.0`; `react-native-svg 15.15.4` (only `VitalRing`) |
| Animation / graphics | `react-native-reanimated 4.5.1` + `react-native-worklets 0.10.1`; `@shopify/react-native-skia 2.6.2` (hero, `Sparkline`, `TrendChart`); gesture-handler. `lottie-react-native` installed, unused. |
| Glass / gradients | `expo-blur` (`BlurTargetView`/`BlurView`), `expo-linear-gradient` |
| Charts | Custom Skia only (`src/components/charts/Sparkline.tsx`, `TrendChart.tsx`) |
| Notifications | `expo-notifications`, local scheduled reminders only. No FCM push. |
| Secure storage | `expo-secure-store` (tokens, cache key); `expo-sqlite` with `useSQLCipher: true` (encrypted query cache); `expo-sqlite/kv-store` (settings); `expo-crypto` |
| BLE | `react-native-ble-plx ^3.5.1` (`neverForLocation: true`, no background) |
| Camera | None |
| i18n | Custom (`src/i18n/`) + `expo-localization`. English, Sinhala, Tamil, ~500 keys each. |
| Other | `expo-local-authentication` (app lock), `expo-screen-capture` (`FLAG_SECURE`), `expo-print`, `expo-sharing`, `expo-file-system` (PDF/FHIR export), `react-native-webview` (PayHere), `react-native-health-connect ^4.1.3`, `expo-haptics` |
| Tests | `jest-expo`, `src/utils/__tests__/{clinical,vitals}.test.ts` (29 unit tests per `base.md`) |
| Install quirk | `.npmrc` `legacy-peer-deps=true` |

## 2. Route map

**Root (`app/`)**: `_layout.tsx` (providers, `PersistQueryClientProvider` with `buster: userId`, `ScreenCaptureGuard`, `AppLockGate`), `index.tsx` (redirect), `login.tsx` (email+password; rejects `role_as !== 5`), `consent.tsx` (PDPA consent → `POST /patient/consent` with `policyVersion`), `legal/[doc].tsx`.

**Signed-in (`app/(patient)/`)**: consent gate on `policy_version`; tabs `home` (vitals hero, Weight/Sugar/BMI strip, next visit), `appointments`, `medications`, `profile`. Plus `vitals/index`, `vitals/[kind]` (trend chart, 7/30-day averages, BP measuring guide, validated manual entry; weight page has `ConnectScaleCard`), `appointments/book` (branch → doctor → date → slot → confirm & pay, online payment only), `appointments/pay` (PayHere WebView; polls `/payments/status` every 3 s ×10), `records`, `health` (conditions), `queue` (live queue every 30 s), `notifications`, `reminders`, `settings`, `privacy` (FHIR export, PDF report, delete account), `profile-edit`, `delete-account`, `health-connect`.

**Key `src/` code**: `components/home/` (`VitalsHero`, `FloatingVitalCard`, `anatomy.ts`, `HomeHeader`, `VitalSummaryStrip`, `NextVisitCard`, `EscalationBanner`), `components/charts/` (`Sparkline`, `TrendChart`), `components/ui/` kit, `hooks/useVitalSnapshot.ts` (core vitals hook), `hooks/useScaleReading.ts`, `services/api/*`, `services/ble/okokScaleParser.ts` + `scaleScanner.ts`, `services/healthConnect.ts`, `reminders.ts`, `report.ts`, `queryClient.ts`, `utils/` (`clinicalThresholds`, `vitalRanges`, `vitalSeries`, `mergeVitalReadings`, `units`, `dates`, `timeAgo`, `readingAge`, `toneText`), `theme/colors.ts`, `theme/palette.ts`, `i18n/{en,si,ta,index,format,labels}.ts`.

## 3. Design system

### Palette (`src/theme/palette.ts`)

| Token | Light | Dark |
|---|---|---|
| `bg` | `#f8fafc` | `#0b1220` |
| `bgGradient` | `#eaf3ff → #f4f8fd → #f8fafc` | `#0d1830 → #0b1424 → #0b1220` |
| `surface` / `surfaceAlt` | `#ffffff` / `#f1f5f9` | `#131d33` / `#1a2742` |
| `border` / `borderSoft` | `#e2e8f0` / `#f1f5f9` | `#26365a` / `#1c2a47` |
| `text` / `textSecondary` | `#0f172a` / `#334155` | `#e8eef8` / `#cbd5e1` |
| `textMuted` (AA) / `textFaint` (decoration only) | `#64748b` / `#94a3b8` | `#a3b1c6` / `#6b7a93` |
| `primary` / `primaryStrong` / `primarySoft` | `#1089e3` / `#07529c` / `#e0f0ff` | `#4aa8f0` / `#8cc8f7` / `#13304f` |
| `success`, `successBg`, `successBorder` | `#047857`, `#ecfdf5`, `#6ee7b7` | `#6ee7b7`, `#0c2e24`, `#1f6f55` |
| `warning`, `warningBg` | `#b45309`, `#fffbeb` | `#fcd34d`, `#33270b` |
| `danger`, `dangerBg`, `dangerBorder` | `#b91c1c`, `#fef2f2`, `#fecaca` | `#fca5a5`, `#3a1219`, `#7f1d1d` |

### Other tokens (`src/theme/colors.ts`)
- **Brand blue** (Tailwind `primary`): 50 `#f0f7ff`, 100 `#e0f0ff`, 500 `#1089e3`, 600 `#0369c1`, 700 `#07529c`.
- **Patient accent gradient**: `#047857 → #0d9488` (next-visit / queue cards); avatar gradient `#d1fae5 → #ccfbf1`.
- **Per-vital identity colours (soft / text)**: blood `#fef2f2`/`#ef4444`; amber `#fffbeb`/`#d97706`; violet `#f5f3ff`/`#8b5cf6`; sky `#f0f9ff`/`#0284c7`; orange `#fff7ed`/`#ea580c`; emerald `#ecfdf5`/`#10b981`; pink `#fdf2f8`/`#ec4899`; neutral `#f1f5f9`/`#475569`.
- **Default colour per vital**: pulse = blood, spo2 = sky, bp = emerald, temperature = orange, weight = violet, sugar = amber, bmi = sky.
- **Status tones**: good `#10b981` (bg `#059669`, soft `#ecfdf5`, text `#047857`); watch `#f59e0b` (soft `#fffbeb`, text `#b45309`); high `#ef4444` (soft `#fef2f2`, text `#b91c1c`).
- **Status wording**: Normal / Watch / Attention with symbols `●` / `▲` / `!` so status never relies on colour alone. Implausible → `? Check value`.
- **Freshness chip**: fresh (<24 h) green dot; recent (<7 d) grey; stale (>7 d) amber; error red. Never says "live".
- Android notification colour `#1089e3`; `colorPrimary` `#023c69`.

### Type, spacing, shadow
- System font (Inter planned; web PWA loads Inter 300–900). Heavy weights: 800 titles/values, 700 labels.
- Sizes: greeting 22 (−0.4), section 26 (−0.6), page title 24, hero value 24/800, card label 10.5/800 uppercase +0.5, pill 10/800.
- Screen padding 16; radii: cards 18–24, buttons 16, pills 999. Touch targets ≥48 dp (rows 56).
- Shadows: card `#0f172a` 0.06 r10 y2; floating hero card `#1e3a8a` 0.10 r18 y8; off in dark mode.
- Glass: `BlurView intensity 40` + `rgba(255,255,255,0.62)` wash + `rgba(255,255,255,0.9)` border — **disabled** (`GLASS_CARDS=false`) because it cost ~20% frames on a Galaxy M31. Web PWA `.glass` = `bg-white/80 backdrop-blur-xl border-neutral-200/60`, shadow `0 8px 32px rgba(0,0,0,0.08)`.
- Motion tokens (web Tailwind): smooth `cubic-bezier(0.4,0,0.2,1)`, gentle `(0,0,0.2,1)`, bounce `(0.68,-0.55,0.265,1.55)`; durations 100/200/300/500/700 ms.

### The anatomy vitals hero (`VitalsHero.tsx`, `anatomy.ts`) — the ancestor of the hub's Orbit View
- 460-pt hero, one Skia canvas. Radial halo at (w/2, 0.42·H). Body image with faded edges; dark-mode dim overlay.
- Anchors: pulse/heart `{0.585,0.25}`, spo2/lung `{0.655,0.228}`, bp/upper arm `{0.37,0.25}`, temperature/forehead `{0.558,0.06}`.
- Condition tint clipped to body: low SpO₂ blue `rgba(56,132,255,0.24)`, fever orange `rgba(249,115,22,0.22)`; low oxygen wins.
- Heart glow: `#ff6a3d` (or `#ef4444` when high); scale `1+0.45·beat`; period `60000/clamp(bpm,40,180)` ms, 18% rise / 82% fall. Beats only when a real, fresh, plausible pulse reading drives it.
- Breathing: scale `1+0.008·breath`, 2300 ms sine in-out.
- Connectors: quadratic Bézier card→anchor, stroke 1.4, gradient `${c}33 → c`, dashes `[5,5]`, dash phase 0→−20 per 1200 ms.
- Hotspots: white dot r6 + coloured dot r4 + expanding ring r `4+10·t`, 1800 ms. Dim to 0.35 when no driving reading.
- `drives(v) = value != null && !stale(>7 d) && !implausible`.
- Cards: corner slots, entrance `FadeInDown(450).delay(120+i·90).springify()`; contents: icon chip, uppercase label, value+unit, status pill, age+source ("6 h ago · home"), 20-pt sparkline.
- Animations pause when off-screen, unfocused, or Reduce Motion is on. Canvas is decorative; all info lives in accessible cards.
- `EscalationBanner`: fresh "Attention" reading → "Call 1990" (Suwa Seriya ambulance) / "Book a visit".

## 4. Data and API layer

- `baseURL = EXPO_PUBLIC_API_BASE_URL || 'https://cure.lk/api/v1'` (web uses relative `/api/v1`).
- Bearer token interceptor; on 401 rotates once via `POST /auth/refresh-token {token}` → `{access_token, refresh_token}` (old refresh token revoked); concurrent 401s share one refresh promise.
- Login: `POST /auth/login/access-token` (form `username`, `password`) → `{access_token, refresh_token, token_type}`; then `GET /users/me`; reject unless `role_as === 5`.
- Tokens persisted in SecureStore key `cure-patient-auth`. Query cache: staleTime 30 s, gcTime 7 d, SQLCipher db `cure-cache.db` (32-byte key in SecureStore `cure-cache-key`); only own-data keys persisted; cache busted on user change.

### Endpoints used (all confirmed in HMS-Dilshan)

| Method and path | Purpose / shape |
|---|---|
| POST `/auth/login/access-token` | Sign in (form) |
| GET `/users/me` | id, email, first_name, last_name, role_as |
| POST `/auth/refresh-token` | `{token}` → new pair |
| PUT `/auth/change-password/{userId}` | `{current_password,new_password}` |
| GET/PUT `/users/me/profile` | profile (PUT changes phone numbers only) |
| GET `/patients/me` | `{id, firstName?, lastName?, dateOfBirth?, bloodType?, patientId?}` — patient row id |
| GET `/patients/{patientId}/vitals-history` | `{data: VitalsHistoryPoint[]}` (visit readings) |
| GET `/patients/{patientId}/medical-records` | `{data: MedicalRecords}` |
| GET `/lab-requests/by-patient/{patientId}` | `LabRequest[]` |
| GET `/patient/vital-parameters` | `VitalParameter[]` |
| GET `/patient/self-vitals?kind=&limit=` | Self-entered readings, newest first |
| POST `/patient/self-vitals` | `{kind, value, value_secondary?, unit, context?, recorded_at?}`; BMI rejected (400); unknown kind 400; range errors 422 (`core/vital_ranges.py`) |
| GET `/get-patient-appointments/{userId}[?include_pending_payment=true]` | `{appointments:[…]}` |
| POST `/patient/appointments/{id}/cancel` | `{reason}` |
| GET `/appointments/branches`, `/appointments/doctors/search`, `/availability`, `/appointments/daily-count` | Booking wizard |
| POST `/appointments` | Book (online payment) |
| GET `/payments/booking-fee`, POST `/payments/prepare`, GET `/payments/status/{orderId}` | PayHere |
| GET `/patient/medications/{userId}` | `{medications: MedicationRow[]}` |
| GET/POST/DELETE `/patient/health-conditions[/{id}]` | Conditions |
| GET `/notifications/unread-count`, `/notifications/?limit=100`; PUT `/notifications/{id}/read`, `/notifications/read-all` | Notifications |
| GET/POST `/patient/consent` | `{policy_version, consented_at}` |
| GET `/patient/export` | FHIR R4 bundle (LOINC/UCUM) |
| POST `/patient/account/delete` | `{password}` |

Web app also has dose logging: `GET/POST /patient/medications/{userId}/doses[/toggle]`.

### Types (field names verbatim)
- `VitalsHistoryPoint`: `appointment_id, date, time?, height, weight, bmi, systolic_bp, diastolic_bp, temperature, pulse, spo2, blood_sugar`.
- `SelfReportedVital`: `id, kind, value, value_secondary|null, unit, recorded_at, context?` (`recorded_at` may arrive without TZ → `asUtc()`).
- `VitalParameter`: `key, label, unit, icon, color, sort_order, enabled` (+ backend `id, patient_id, is_builtin, created_at`).
- `VitalSnapshot`: `kind, label, unit, color, display, value, secondary, tone?, recordedAt?, source?: 'clinical'|'self-reported'|'derived', context?, series:number[], stale, implausible`.
- `Appointment`: `id, doctor_first_name, doctor_last_name, doctor_title, specialization, branch_name, appointment_date, appointment_time, status` (statuses: pending, pending_payment, confirmed, cancelled, completed, no_show, in_progress, payment_failed).
- `Medication`: `id, medicine_name, dosage, frequency, duration, instructions, prescribed_date, end_date, doctor_name, status`.
- `AppNotification`: `id, title, message, type, is_read, link, created_at, read_at`.
- `QueueAppointmentItem`: `appointmentId, sessionKey, doctorName, specialization, branchName, date, time, token, nowServing, patientsAhead, estimatedWaitMinutes, status, state:'NEXT'|'UPCOMING'|'FAR_FUTURE', progressPercent, minutesUntil`. Patients ahead = `token − nowServing − 1`; wait ≈ `(token − nowServing) × 10` min.
- Reminders: no server model (local only). **Family members: no type and no backend model.**

## 5. Clinical logic (port as-is; pending clinical sign-off)

| Vital | Watch | High / Attention |
|---|---|---|
| Pulse (bpm) | ≥100 or <60 | ≥120 or <50 |
| SpO₂ (%) | <95 | <92 |
| Temperature (°C) | ≥37.5 | ≥39 or <35 |
| BP (mmHg) | Elevated ≥120 sys; Stage 1 ≥130/≥80 | Stage 2 ≥140/≥90 |
| Sugar fasting / no context (mg/dL) | ≥100 | ≥126; <70 always high |
| Sugar after meal / random | ≥140 | ≥200 |
| BMI | ≥25 | <18.5 or ≥30 |

`NORMAL_BAND` for chart shading: pulse [60,100], spo2 [95,100], temperature [35,37.5], bp systolic [90,120], sugar [70,100], bmi [18.5,25].

Plausibility (mirrors backend `core/vital_ranges.py`):

| Kind | Hard limits | Confirm if | Unit |
|---|---|---|---|
| pulse | 20–250 | <40 or >180 | bpm |
| spo2 | 50–100 | <85 | % |
| bp systolic | 50–260 | <80 or >200 | mmHg |
| temperature | 30–45 | <34 or >41 | °C |
| weight | 2–350 | — | kg |
| sugar | 20–700 | <50 or >400 | mg/dL |

Diastolic 30–160 and < systolic. Celsius entry 86–113 → "looks like °F". Storage units kg / °C / mg/dL; display can switch to lb, °F, mmol/L (÷18.016).

Stale = older than 7 days. BMI derived = `weight/(height/100)²` when newer weight + visit height exist.

## 6. BLE scale (already reverse-engineered)
OKOK / Chipsea "Yoda1" scale — **broadcast only, never connectable**. Manufacturer data, frame marker `0xC0`, byte 1 rolling counter, then 13-byte payload: bytes 0–1 weight (big-endian); bytes 2–3 impedance ÷10 (always reads 500.0 → probably "no contact"); byte 6 status: bit0 = stable, bits1–2 divider (0→÷10, 1→÷1, 2→÷100), bits3–4 unit (kg/jin/lb/st:lb, non-kg unverified); bytes 7–12 scale MAC. Scan with `allowDuplicates: true`, filter in code. The old Web Bluetooth `0x181D` code in the PWA does **not** work with this scale. Known bug: "Use this reading" shown before the reading is stable.

## 7. Other features
- Medication reminders: local daily notifications; BP reminder defaults 07:00 & 19:00; no dose log in app.
- Health Connect read/write for Weight, BP, HR, SpO₂, Temperature, Glucose (dedupe: same kind within 60 s and Δ<0.05). Untested on device.
- Offline: encrypted read cache; writes not queued.
- Reports: 90-day PDF + FHIR JSON export.
- Security: biometric/PIN app lock (60 s background default), screenshot blocking by default.

## 8. Docs inside the repo
- `base.md`: main brief; scale byte layout; scope cut on 2026-10-01 (removed purchases, online sessions, observations, complaints); test account `demo.patient@example.com` / `Demo1234` on the local backend only.
- `docs/HOME_VITALS_HERO_GUIDE.md`: hero build guide; honesty rules (no "LIVE" badge, no fake ECG, show freshness, disclaimer).
- `docs/LOCALIZATION.md`: `en.ts` is the source; `si`/`ta` type-checked; medical terms need native-speaking clinician review.
- `docs/PLAY_STORE_SUBMISSION.md`: release blockers (legal, clinical sign-off, NMRA opinion, translations, anatomy image rights).
- Android: package `lk.cure.patient`, min/target SDK 26/36, EAS owner `dilshan-pathirana`.

## 9. Known gaps
Body image rights unknown; thresholds await clinical sign-off; ~14 requests on Home (needs a "latest per kind" endpoint); no family/caregiver, no push, no Sentry, no signup, no dose check-off; Health Connect untested; scale parser units unverified; glass disabled for performance.

## 10. Reuse plan for Cure Home (hub)

**Port as-is (pure TS):** `clinicalThresholds.ts` (+ `NORMAL_BAND`, `bpCategory`), `vitalRanges.ts`, `units.ts`, `vitalSeries.ts`, `mergeVitalReadings.ts`, `dates.ts` (`asUtc`, `visitInstant`), `timeAgo.ts` (`freshnessOf`), `toneText.ts`, queue maths, `okokScaleParser` (port to Python for the BLE gateway), the unit tests, and the `en/si/ta` dictionaries (`vital.*`, `tone.*`, `chip.*`, `esc.*`, `card.*`, `src.*`).

**Rewrite for web:** `useVitalSnapshot` (same keys, per-kind fetch limit 12, merge, BMI, 7-day stale, alerts); `services/api/*` with the same refresh rotation; query-cache rules (own data only, clear on user change — on the hub, clear on every **profile switch**).

**Visual carry-over:** tokens above; Normal/Watch/Attention with ● ▲ !; freshness chip; escalation banner (1990); orbit maths (heartbeat glow, breathing, flowing connectors, hotspot rings, tint priority, dim when no driving reading); Sparkline smoothing; TrendChart band.

**Conflicts:** Chromium cannot reliably scan BLE advertisements (`requestLEScan` is behind a flag) → native BLE service. Backend allows one patient login per session; no device login, face record, family model, or "latest per kind" endpoint. Face data is biometric (PDPA sensitive) → consent text and `policyVersion` must change. Request count multiplies per household member. Blur cost on Pi likely high → pre-blurred layers. Backend timestamps lack TZ → always `asUtc`, visit dates as Asia/Colombo.
