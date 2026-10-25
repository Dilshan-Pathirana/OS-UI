# Cure Global — Integrations

*v0.1 · 22 Oct 2026 · Devices, wearables, GPS, notifications, external health systems and terminologies. Research and sources: `docs/reference/DEVICES_WEARABLES_RESEARCH.md`, `docs/reference/STANDARDS_REGULATORY_RESEARCH.md`.*

## 1. Principles

1. **Standards first.** Integrate a standard once (a Bluetooth health profile, Health Connect, a Traccar protocol, FHIR). Add vendor APIs only when a programme needs one.
2. **Provenance on every value.** Each value records its source, device model, method (upper-arm cuff, wrist cuff, cuffless, manual), validation status, the population the device was validated for, and the last calibration date if the device needs one.
3. **Two tiers on screen:** **Measured** (a validated device or a clinic) and **Estimated** (wearables and cuffless devices). Doctor targets and clinical alert rules use measured values only, unless the doctor includes estimates.
4. **Catalogue gate.** Auto-capture accepts only peripheral models in the admin-curated catalogue. Every model is checked with nRF Connect before listing, because "Bluetooth" on the box doesn't mean a standard profile.

## 2. Bluetooth health devices (hub and app)

| Kind | Profile / method | Hub (`ble-gateway`, bleak) | App (`react-native-ble-plx`) | Notes |
|---|---|---|---|---|
| Scale (OKOK/Chipsea "Yoda1") | Advertisement only | ✔ (built) | ✔ (built) | Shared decoder vectors |
| Scale (Xiaomi Mi Scale 1/2) | Advertisement | add | add | Impedance carry-over guard |
| Weight scale / body composition | 0x181D / 0x181B | add | add | Beurer BF600/BF950 class (openScale "standard") |
| Blood pressure | 0x1810, 0x2A35 indications | ✔ (built) | add (R2) | A&D UA-651BLE (Continua). **Omron uses a proprietary protocol**, so integrate it through Omron's SDK or cloud API only if needed |
| Pregnancy BP | 0x1810 where available | ✔ (as BP above) | add (R2, with the app's BP GATT support and the pregnancy modules) | Only models validated for pregnancy (BIHS/STRIDE BP/Medaval lists); no wrist or cuffless devices |
| Pulse oximeter | 0x1822 PLX | ✔ (built) | add (R2) | Many cheap oximeters are proprietary or unvalidated (e.g. Contec CMS50D-BT) |
| Thermometer | 0x1809, 0x2A1C | ✔ (built) | add (R2) | Infant models with the standard profile: to source |
| Glucometer | 0x1808 + RACP 0x2A52 after bonding | ✔ (built) | add (R2) | Contour Next One (standard profile), Accu-Chek Guide (Continua) |
| Peak flow | Vendor BLE (MIR Smart One) | — | R3 | Asthma programme |
| Generic Health Sensor | 0x1840 (GHS / IEEE 11073-10206) | R3 | R3 | Future-proofing; few devices yet |
| Range extension | ESPHome Bluetooth Proxy (ESP32) + `bleak-esphome` | R2 | — | Scale in a far bedroom |

Rules inherited from Cure Home: dedupe by (device, value, time bucket); store stable readings only; RACP pulls only new records; time sync via Current Time Service; IEEE-11073 SFLOAT decoding; per-device user slots map to people.

## 3. Wearables

| Path | What | Plan |
|---|---|---|
| **Android Health Connect** (mobile app) | Vitals (BP, HR, resting HR, HRV RMSSD, SpO₂, respiratory rate, body/skin temperature, glucose), body (weight, height, body fat…), activity, **sleep**, **cycle** (menstruation period/flow, BBT, ovulation tests), nutrition, hydration | MVP: import vitals, weight, sleep, steps. R2: cycle types (only into `women.cycle` with consent), write-back of hub readings (opt-in). Background reads need `READ_HEALTH_DATA_IN_BACKGROUND`; history beyond 30 days needs `READ_HEALTH_DATA_HISTORY`. Built into Android 14+; a Play app on 9–13. |
| Samsung Health | Writes most vitals to Health Connect (not ECG, HRV or skin temperature) | Via Health Connect |
| Google Health app (Fitbit) | Writes HR, HRV, temperatures, sleep, weight, period. **SpO₂ is not written** | Via Health Connect. The Fitbit Web API shuts down on 30 Oct 2026, so never build on it |
| Garmin, Xiaomi/Zepp | Activity, HR, sleep (Xiaomi: SpO₂) | Via Health Connect |
| **Huawei Health** | **No official Health Connect path**; Huawei Health Kit is a separate API | R3: evaluate the Huawei Health Kit integration (common in Sri Lanka); until then, manual entry or a cuff |
| Dexcom CGM | Dexcom API v3 (OAuth2; ~1 h delay in the US, ~3 h elsewhere; a licensing agreement for scale) | R3 diabetes/GDM programme, if demanded |
| Libre CGM | No public API (LibreView/LibreLinkUp only) | Not integrated; manual or document upload |
| Cuffless BP (Samsung, Hilo) | Calibration every 28–30 days; ESH does not recommend cuffless BP for management | Stored as **Estimated**; never drives targets by default; blocked in pregnancy |
| iOS HealthKit | — | Later (an iOS app is not in scope until after the pilot) |

Health Connect records keep their record id as `client_reading_id` and their data origin (package name) as `source_app`, so re-imports are idempotent and the app never re-imports readings it wrote itself.

## 4. GPS and safety (Traccar)

```
GPS watch / pendant / phone app ──(GT06 :5023, H02 :5013, Watch :5093, OsmAnd HTTP :5055 …)──► Traccar 6
Traccar ── event webhook (geofenceExit/Enter, alarm=sos|lowBattery|…, deviceOffline) ──► api /internal/traccar/events
api/worker ── Traccar REST (devices, geofences, notifications, commands) ◄── geofence editor in the app
```

- **Registration:** carers register a tracker in the app (IMEI, model). The API creates the Traccar device with an opaque name (no person names), binds it to the person, and stores an IMEI hash.
- **Geofences:** drawn in the app, created in Traccar via its REST API, mirrored in `geofence`.
- **Events → alerts:** exit, SOS, fall (if the device reports it), low battery and offline become `location_event` → alert rules → push/SMS escalation to carers in order until someone acknowledges.
- **Last known location:** carers with a `location_safety` grant can request it. The request is audited and the person is told (if they have capacity and a login).
- **Retention:** Traccar positions are purged after 30 days or less (scheduled job); Cure Global keeps events.
- **Hardware notes:**
  - Dialog shut down 3G in 2023, so choose 4G Cat-1/LTE-M devices with VoLTE.
  - Cellular trackers need TRCSL type approval for commercial import.
  - Plan for daily charging.
  - Fall detection is a signal with many false alarms in real life, so every event first asks the person "Are you OK?".
- **Phone as tracker:** the Traccar client protocol (OsmAnd) or our app's own background location (R2). Google Play's background-location policy requires a prominent disclosure and a core-feature justification.
- **Dev:** `services/gps-sim` replays routes via the OsmAnd protocol to Traccar (inside and outside a geofence, SOS).
- **As built (R2 part B):** `services/api/app/location/` — the API registers devices and geofences in Traccar under opaque
  names (`cg-<id>`, `cg-gf-<id>`) when `TRACCAR_URL` (+ `TRACCAR_EMAIL`/`TRACCAR_PASSWORD` or `TRACCAR_TOKEN`) is set; the
  worker retries `pending`/`failed` ones every minute; in dev a fresh Traccar's first user is created by the API. The seeded
  Kamala watch uses gps-sim's id `cg-sim-0001` and her Home geofence sits on gps-sim's home point, so `--scenario wander`
  produces a geofence exit (alert after 5 minutes), `home` a low-battery alarm, and the SOS press an SOS. Position retention
  stays Traccar's (`database.historyDays` ≤ 30).

## 5. Other peripherals (later)

| Device | Use | Note |
|---|---|---|
| mmWave presence/fall radar (TI IWR6843-class, Aqara FP2) | Elder inactivity and falls without a camera (bedrooms, bathrooms) | Consumer devices are not medical; vendor accuracy claims only |
| Zigbee SOS buttons (via Zigbee2MQTT on the hub) | Bedside/bathroom SOS | Hub gains a Zigbee dongle |
| Smart pill dispensers | Adherence | Few open APIs (Hero: Wi-Fi only, US, no API) |
| Infant monitors (Owlet Dream Sock: FDA De Novo for healthy infants 1–18 months) | Not integrated in v1 | Never present any monitor as SIDS prevention (AAP) |
| Fetal dopplers | **Never integrated** | FDA advises against home use |

## 6. Notifications

| Channel | Provider | Rules |
|---|---|---|
| Push | Expo push → FCM (from the patient app; FCM credentials in EAS) | No values, condition names or sensitive module names. Deep link to the item after app unlock |
| SMS | Pluggable adapter (Textware for Sri Lanka, as in HMS; another provider per country) | Escalations and OTPs only; Sinhala/Tamil via Unicode; never store OTPs in plain text (an HMS lesson) |
| Email | SMTP (Mailpit in dev) | Account and admin mail; DSAR delivery links |
| WhatsApp Business | Later | Templates approved per Meta policy; same no-health-data rule |
| Hub banner | Hub heartbeat/refresh | Safety alerts for the household |

## 7. External health systems

| System | Integration | Release |
|---|---|---|
| **FHIR export** | `GET /persons/{id}/export/fhir`: Bundle with Patient, RelatedPerson, Observation (vital-signs profile, LOINC/UCUM), Immunization, Condition, AllergyIntolerance, MedicationStatement, DocumentReference, CareTeam, Consent | MVP |
| **IPS** | International Patient Summary (IG 2.0.1 on R4; ISO 27269:2025) for share links and travel | R3 |
| **FHIR read API + SMART App Launch 2.2** | Third-party apps and EHRs with patient consent; Backend Services for clinics | R3 |
| **Cure HMS (cure.lk)** | Link a person to an HMS patient (display id + OTP to the phone on file, the HMS pattern) → import clinic vitals, prescriptions, appointments and queue; export home summaries for HMS doctors who don't use the Cure Global console. Through APIs, never a shared database | R3 |
| **Sri Lanka national EHR** | FHIR-based with the Personal Health Number (PHN), JeMPI client registry and OpenHIM (OHIE community information). Store PHN as an identifier now; integrate when the Ministry offers an onboarding path | Later |
| Labs | Upload reports (document + optional structured values); lab interfaces later | MVP (upload) |

## 8. Terminologies and code systems

| Domain | System | Licence note |
|---|---|---|
| Observations | LOINC (+ UCUM units) | Free with the licence notice |
| Conditions (incl. special needs) | **ICD-11** by default; SNOMED CT where licensed | Sri Lanka is not a SNOMED International member, so SNOMED needs an affiliate licence there |
| Vaccines | Local codes per country pack, mapped to WHO/ATC (and CVX for US/international export) | — |
| Medicines | Free text + ATC codes where known; RxNorm for US export | — |
| Units | UCUM 2.2 | Check licence terms |
| Devices | IEEE 11073 MDC codes when GHS devices arrive | — |

The catalogue (`metrics.yaml`) holds the LOINC code for each metric. Mappings are tested by validating exported bundles with the official HL7 FHIR validator in CI.

## 9. As built (R3, 23 Oct 2026)

- **Cure HMS connector** (`services/api/app/hms`): the client speaks a small patient-connect contract — link start/confirm by
  display id + OTP (HMS texts its own phone on file), visits (with clinic vitals), prescriptions, appointments, unlink — written
  down in `app/hms/fake_server.py`, which is also the in-process fake used in dev and tests (`HMS_CONNECTOR=fake`). Real HMS:
  `HMS_CONNECTOR=http` with `HMS_CONNECT_BASE_URL` / `HMS_CONNECT_API_KEY` once HMS exposes the API (to agree with the HMS
  team; never a shared database). Endpoints: `API_DESIGN.md` §11.
- **FHIR read API + SMART App Launch 2.2 + IPS** at `/fhir/r4` (`API_DESIGN.md` §11). Not yet: Backend Services (system
  scopes), `offline_access`/refresh tokens, writes, `_revinclude`/paging links, and IPS profile validation (run the HL7 validator
  with `hl7.fhir.uv.ips#2.0.1` in CI before claiming conformance).
- **Wearable clouds** (`services/api/app/wearables`): provider adapters (`fake` for dev/tests; `huawei_health`, `dexcom` stubs),
  `source=wearable_api` = estimated tier. Evaluation: `docs/reference/DEVICES_WEARABLES_RESEARCH.md` §8.
- **Payments** (`services/api/app/billing/gateways.py`): one gateway interface; the fake local gateway (signed webhooks); PayHere
  (LKR) and Stripe (diaspora cards) adapters verify webhooks and refuse to run until their merchant credentials are configured.
