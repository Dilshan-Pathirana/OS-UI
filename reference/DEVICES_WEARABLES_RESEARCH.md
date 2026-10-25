# Reference: peripherals, wearables and GPS

*Research run on 22 Oct 2026. Items marked **[UNVERIFIED]** could not be confirmed. This file feeds `docs/02-architecture/INTEGRATIONS.md` and the peripheral catalogue.*

## 1. Android Health Connect

**Data types in the Jetpack SDK** (https://developer.android.com/health-and-fitness/guides/health-connect/plan/data-types):

| Group | Records |
|---|---|
| Vitals | BloodPressure, HeartRate, RestingHeartRate, HeartRateVariabilityRmssd, OxygenSaturation, RespiratoryRate, BodyTemperature, SkinTemperature\*, BloodGlucose |
| Body | Weight, Height, BodyFat, LeanBodyMass, BoneMass, BodyWaterMass, BasalMetabolicRate |
| Activity | Steps, Distance, ExerciseSession, calories, FloorsClimbed, Vo2Max, WheelchairPushes, … |
| Cycle | MenstruationFlow, MenstruationPeriod, BasalBodyTemperature, CervicalMucus, OvulationTest, IntermenstrualBleeding, SexualActivity |
| Other | Nutrition, Hydration, SleepSession, MindfulnessSession\* |

\* Behind a feature flag, so check at runtime. There is no ECG waveform or AFib record type.

**Reading history.** By default an app can read data from up to 30 days before its first permission grant. Older data needs `READ_HEALTH_DATA_HISTORY`. (https://developer.android.com/health-and-fitness/health-connect/read-data)

**Background reads** need `READ_HEALTH_DATA_IN_BACKGROUND` plus the feature check `FEATURE_READ_HEALTH_DATA_IN_BACKGROUND`. (Same URL.)

**Where it runs.** On Android 14+ Health Connect is part of the OS. On Android 9–13 it is a Play Store app and needs Google Play services. It does not work in work profiles. (https://developer.android.com/health-and-fitness/guides/health-connect/plan/availability)

**Android 16 permissions.** For apps targeting API 36, `BODY_SENSORS` is replaced by granular `health.READ_*` permissions. The latest connect-client needs compileSdk 36. (https://developer.android.com/training/wearables/versions/6/changes)

**Medical records (Personal Health Records).** Stored as FHIR R4/R4B and still experimental. (https://developer.android.com/health-and-fitness/guides/medical-records)

| Source app | What it writes to Health Connect |
|---|---|
| Samsung Health | Steps, BP, SpO₂, glucose, HR, exercise, sleep, weight, body fat, height, nutrition, VO₂max. Not written: ECG, HRV, skin temperature. (https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect) |
| Google Health app (Fitbit) | HR, HRV, respiratory rate, temperatures, glucose, sleep, weight, period. **SpO₂ is not written.** (https://support.google.com/fitbit/answer/14506680) |
| Fitbit Web API | **Shuts off 30 Oct 2026.** Its successor is the Google Health API. (https://developers.google.com/health/about) |
| Garmin Connect | Activity and wellness data on Android 14+. |
| Mi Fitness / Zepp | Steps, HR, sleep, SpO₂ (secondary source). |
| **Huawei Health** | **No official Health Connect path.** Huawei Health Kit is a separate API. **Huawei watches are common in Sri Lanka, so this is a gap to plan for.** (https://developer.huawei.com/consumer/en/hms/huaweihealth/) |

## 2. Wearable vitals: regulatory status and how to label them

- **Samsung Galaxy Watch BP** must be recalibrated against a cuff every 28 days. In the US it is a wellness feature, not FDA-cleared.
- **Hilo (formerly Aktiia) bracelet** got FDA 510(k) clearance in Jul 2025 as the first OTC cuffless BP monitor. It is also CE-marked and needs monthly cuff calibration.
- **Huawei Watch D2** has an inflatable wrist cuff. Its ECG has EU medical certification; its MDR class is [UNVERIFIED].
- **ESH 2022** does not recommend cuffless devices for diagnosing or managing hypertension. (https://www.phc.ox.ac.uk/publication/1264995)
- **FDA general wellness guidance (6 Jan 2026)** treats non-invasive estimates as wellness if they make no clinical thresholds or disease claims.
- **FDA pulse oximeter draft guidance (Jan 2025)** asks for skin-tone diversity in testing and for labelling of its limits.

**Cure Global labelling:**
- Every reading carries method (upper-arm cuff / wrist cuff / cuffless), regulatory status, validation-list membership, the population it was validated for, and the last calibration date.
- Readings are shown in two tiers: **Measured (validated device)** and **Estimated (wearable)**.
- Only validated readings drive BP targets and alerts.

## 3. GPS for elders

**Traccar** (https://github.com/traccar/traccar, https://www.traccar.org/docker/):
- Apache-2.0 licence, 200+ protocols, 2,000+ device models.
- Docker image `traccar/traccar` (e.g. tag 6.16.0). Web UI on port 8082; device ports 5000–5300 TCP/UDP.
- REST API with OpenAPI: `/session`, `/devices`, `/positions`, `/geofences`, `/notifications`, `/reports/events`, `/commands/send`.
- Events (https://traccar.org/events): geofence enter/exit, device offline/inactive, and alarms (SOS, low battery, tampering…). A "fall" alarm is [UNVERIFIED].

**Common tracker ports in Traccar:**

| Protocol | Port |
|---|---|
| GT06 | 5023 |
| H02 | 5013 |
| TK103 | 5002 |
| Watch / SeTracker | 5093 |

**Hardware and networks:**
- Dialog shut down 3G in 2023, so avoid 3G-only watches. Prefer 4G Cat-1 or LTE-M devices with VoLTE. (https://dialog.lk/news/dialog-to-shut-down-its-3g-network-to-give-more-spectrum-capacity-to-expand-4g-broadband)
- Dialog ran LTE-M and NB-IoT trials in 2018. Consumer IoT SIM availability is [UNVERIFIED].
- TRCSL type approval applies to cellular trackers above 50 mW.
- Anything marketed as a medical device needs NMRA registration.

**Fall detection:**
- Real-world falls: average sensitivity 57 %, with 3–85 false alarms per day. (https://pmc.ncbi.nlm.nih.gov/articles/PMC3353905)
- Lab sensitivity is ≥ 93 %, but real-world evidence in frail elders is lacking.

**Ethics of tracking:** least-restrictive option; the person's preferences first; decide early and jointly; review periodically (Landau & Werner 2012; UK Mental Capacity Act s1).

## 4. Infant and child devices

- **Owlet Dream Sock:** FDA De Novo (Nov 2023), OTC, for healthy infants 1–18 months. Measures pulse and SpO₂ and alarms outside preset ranges. Makes no SIDS claim.
- **Owlet BabySat:** prescription-only.
- **AAP:** cardiorespiratory monitors have not been shown to reduce SIDS, so never present an infant monitor as SIDS prevention.
- BLE infant scales and BLE thermometers using standard 0x1809: [UNVERIFIED], so plan for manual entry.

## 5. Pregnancy devices

- **NHS England:** use monitors validated for pregnancy and pre-eclampsia (BIHS / STRIDE BP lists). No cuffless devices. No wrist monitors in pregnancy (OUH leaflet).
- **Medaval pregnancy-validated list (Jan 2023)** includes iHealth Feel BP5, Omron HEM-9210T, Omron Evolv HEM-7600T-E, Omron M3 Comfort and iHealth Track KN-550BT (Bluetooth). (https://bgm.medaval.ie/docs/lists/Medaval-BPMs-Validated-for-Pregnancy.pdf)
- **Microlife 3AS1-2:** validated in pregnancy including pre-eclampsia (LMIC study). No Bluetooth.
- **Fetal dopplers:** the FDA advises against home use, so **don't integrate them**.
- **Glucose meters:**
  - Contour Next One uses the standard Glucose profile (0x2A18, 0x2A34, RACP 0x2A52).
  - Accu-Chek Guide is Continua-certified.
- **CGMs:**
  - Dexcom API v3 uses OAuth2. Data arrives about 1 h late in the US and 3 h elsewhere. Full access needs a data licensing agreement.
  - Libre has no public API.
  - Whether either writes to Health Connect is [UNVERIFIED].

## 6. Standard BLE health devices

Standard service IDs: BP 0x1810 (0x2A35) · PLX 0x1822 · Thermometer 0x1809 (0x2A1C) · Glucose 0x1808 · Weight 0x181D (0x2A9D) · Body composition 0x181B · CGM 0x181F · GHS 0x1840.

| Device | How to integrate |
|---|---|
| A&D UA-651BLE (BP) | Continua-certified; standard 0x1810 by indication; needs pairing |
| A&D UC-352BLE (scale), UT-201BLE-A (thermometer) | Continua-listed; exact services [UNVERIFIED] |
| Omron Connect BP | Proprietary protocol; some models encrypted. Use the Omron SDK or cloud API |
| Microlife BP3GY1-2N | Vendor service 0xFFF0 |
| Nonin 3230 oximeter | Proprietary profile |
| Contec CMS50D-BT | No validation evidence |
| Xiaomi Mi Scale v1/v2 | Passive broadcast (v2 adds impedance) |
| OKOK / Chipsea "Yoda1" scale | Passive broadcast; parser already in patient-app and Healthcare-Device |
| Beurer BF600/BF950, Sanitas | openScale "Standard" handler |

- **Rule:** before adding a device to the catalogue, check it with nRF Connect. "Bluetooth" on the box does not mean a standard profile.
- **Extending range:** an ESPHome Bluetooth Proxy (ESP32, Ethernet recommended) and `bleak-esphome` (MIT, pre-alpha) let the hub's bleak gateway use remote radios. (https://esphome.io/components/bluetooth_proxy/)

## 7. Other peripherals

- **Peak flow / spirometry:** MIR Smart One, FDA K181666, home PEF and FEV1, ages over 5, Bluetooth.
- **Pill dispensers:** Hero is Wi-Fi-only, US-only and has no public API. BLE pillboxes are [UNVERIFIED].
- **Withings Sleep Rx:** FDA 510(k) Sep 2024, prescription use.
- **Aqara FP2 mmWave sensor:** fall detection needs ceiling mounting; covers 40 m²; not a medical device; accuracy claims come from the vendor only.
- **TI IWR6843AOP 60 GHz radar:** produces no image, so it can be used in bedrooms and bathrooms; detects falls and HR at rest.
- **SOS buttons:** Zigbee options such as Tuya TS0601_sos (via Zigbee2MQTT) and Heiman.

## 8. R3 evaluation (23 Oct 2026): Huawei Health Kit, Dexcom, GHS devices

*Desk evaluation for the R3 roadmap items, written with the provider-adapter framework that now exists in the API
(`services/api/app/wearables/`: `WearableProvider` protocol, encrypted tokens, idempotent sync by the vendor's record id,
`source=wearable_api` = the estimated tier, plan-limited connections). No third-party call was made; vendor terms and
programme details below must be re-checked when an integration starts — items not re-verified today are marked [UNVERIFIED].*

### 8.1 Huawei Health Kit

- **Why it matters:** Huawei watches and bands are common in Sri Lanka and Huawei Health has no Health Connect path (§1), so
  these users can't share watch data with us today except by typing it in.
- **What an integration needs:**
  - A Huawei developer account (enterprise verification) and an approved **Health Kit** service application. Each data scope
    (e.g. steps, heart rate, SpO₂, sleep, weight, blood pressure) is requested and reviewed separately, with the privacy policy
    and a use-case description; approval takes weeks [UNVERIFIED].
  - Choice of route: the **cloud REST API** (OAuth 2.0 with Huawei ID; server-to-server reads — fits our adapter: `authorize_url`
    → `exchange` → `fetch(cursor)`) or the **Android Health Kit SDK**, which needs HMS Core on the phone (absent on most non-Huawei
    phones, and present on Huawei phones that lack Google Play). The cloud route works for every app user.
  - Data mapping to catalogue metrics (pulse, spo2, steps, sleep_duration, weight, bp) with the vendor's record ids as
    `client_reading_id`, and the user's region-specific endpoint (Huawei keeps health data in regional data centres) [UNVERIFIED].
- **Licensing / regulatory notes:** Huawei's Health Kit terms restrict use to the declared purpose and forbid resale/advertising
  use [UNVERIFIED wording] — compatible with our "never sell health data" rule. Most Huawei measurements are wellness-grade
  (estimated tier). The **Watch D/D2** wrist cuff has medical certification in some markets; even so a wrist cuff is not on the
  validated-cuff lists we use for targets — keep its BP as estimated. Adding Huawei as a source is a new data flow for the DPIA
  (records of processing, cross-border source).
- **Recommendation:** **go for a spike, then build** once the pilot shows demand (count Huawei users in onboarding). Start with
  the cloud REST route, read-only, steps/sleep/HR/SpO₂ first; implement it as `huawei_health` in the adapter framework (the stub
  exists and refuses to run until configured). Effort: ~2–3 weeks after Huawei approval.

### 8.2 Dexcom CGM

- **What an integration needs:** Dexcom Developer API v3 (OAuth 2.0 authorization code; endpoints for estimated glucose values,
  events, devices and data range), a sandbox with simulated users, then a production partnership/licensing agreement for
  scale (§5). Data arrive with a delay (about 1 h in the US, ~3 h elsewhere) and the API is meant for retrospective review.
- **Licensing / regulatory notes:** CGM values are medical-device data from Dexcom's cleared system; showing them is fine as a
  record, but **no alerting or target status** on delayed third-party CGM data (HZ-08: estimated tier; the alert engine already
  ignores `wearable_api`). Dexcom devices are not widely sold in Sri Lanka [UNVERIFIED]; FreeStyle Libre is more common and has no
  public API (LibreView reports can be uploaded as documents).
- **Recommendation:** **do not integrate now.** Keep the `dexcom` adapter stub; revisit if a diabetes or GDM programme partner asks
  (the diabetes pack's outcomes would then read CGM time-in-range as a clinician-only view).

### 8.3 Generic Health Sensor (GHS) devices

- **What it is:** the Bluetooth SIG **GHS** service (0x1840, GHS 1.0) carrying ISO/IEEE 11073-10206 (ACOM) observations — one
  profile for many measurement types, with stored-observation transfer (RACP) and time sync (Elapsed Time Service).
- **What an integration needs:** a GHS observation decoder in the hub's `ble-gateway` (bleak) and in the app
  (react-native-ble-plx); a mapping table from IEEE 11073 **MDC** codes to catalogue metrics and UCUM units (add `mdc` codes next
  to the LOINC codes in `metrics.yaml`); `peripheral_model` rows with `ble_profiles: [0x1840]`; conformance checks against a
  reference device or the SIG test tools; the usual "check with nRF Connect before listing" rule.
- **Market:** very few retail devices expose GHS yet [UNVERIFIED]; validated BP cuffs, oximeters and glucometers still use the
  dedicated profiles (0x1810, 0x1822, 0x1808), which we already support.
- **Recommendation:** **prepare, don't build yet.** Add MDC codes to the catalogue now (cheap, also useful for FHIR `Device`
  data), and implement the decoder when the first validated GHS device is sourced through the distributor.
