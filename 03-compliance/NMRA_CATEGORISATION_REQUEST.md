# Cure Global — NMRA Product Categorisation Letter request (draft)

*v0.1 draft · 23 Oct 2026 · E14-10 · Status: **draft for review by counsel and the Clinical Safety Officer; not submitted**. This is not legal advice. Basis: `STANDARDS_AND_REGULATIONS.md` §1 (intended purpose and the per-function position), `CLINICAL_SAFETY.md`, `docs/cure-home/reference/MARKET_REGULATORY_RESEARCH.md` §B6, `docs/cure-home/reference/CHATBOT_SAFETY_REGULATORY_RESEARCH.md` (NMRA device definition and PCLs).*

## 0. Cover note for the submitter (internal — remove before sending)

- **What we ask for:** a Product Categorisation Letter (PCL) that states, **per function**, whether Cure Global (software) and the Cure Family Hub (hardware + software) fall under the medical-device provisions of the NMRA Act No. 5 of 2015. We describe the real feature set, including the parts most likely to be treated as a device (target comparison and physiological alerts), rather than asking for a blanket "data system" ruling (`STANDARDS_AND_REGULATIONS.md` §1).
- **Plan for the answer "the alerting functions are a device"** (decision D-13 option (a)): the alerting functions must be separable. ⚠ **Engineering action before submission:** family-facing physiological alerts (doctor thresholds, urgent bands, pregnancy BP safety net) are not yet gated by a dedicated feature flag; the `feature_flag` table and admin endpoints exist (`services/api/app/api/admin.py` feature flags), but the alert engine (`services/api/app/alerts/engine.py`) does not read one. Add the gate (e.g. `alerts.family_physiological` per country pack) and a test before the letter says so as fact.
- **Where and how:** NMRA, Medical Devices division (https://nmra.gov.lk/pages/medical-devices). ⚠ **Verify the current NMRA procedure, application form, fees and whether submission is online (e-services) or on paper before sending.** Confirm whether a local company must apply (Cure's Sri Lankan entity) and whether a local agent is needed.
- **Bundled devices are separate:** each BP cuff, oximeter, thermometer and glucometer (with strips) in a Cure kit is registered by its manufacturer's local marketing authorisation holder (Cure or a distributor), possibly via the reliance pathway. This letter does not ask NMRA to register them; it lists them (enclosure E6) so NMRA sees the whole system. Their status is tracked as data in `packages/module-catalogue/catalogue/peripherals.yaml`.
- **Who signs:** a director of the applicant company. The CSO countersigns the clinical description (§3–§5). Counsel reviews the intended purpose wording.
- **Keep the copy consistent.** Every public text (app store listing, website, leaflets, marketing videos) must match the intended purpose below. No "diagnoses", "detects", "monitors 24/7", "prevents", accuracy claims for the hub, or "approved by NMRA" (`docs/cure-home/05-marketing/VIDEO_PRODUCTION_GUIDE.md`).

### Tracking

| Step | Date | Reference | By | Notes |
|---|---|---|---|---|
| Draft reviewed by counsel | | | | |
| Clinical description signed by the CSO | | | | |
| Alert feature gate implemented and tested (see above) | | | Eng lead | |
| Submitted to NMRA | | | | Form/fee as verified |
| NMRA acknowledgement | | | | |
| Clarification requests and our answers | | | | |
| PCL received | | | | Attach to `docs/03-compliance/` evidence folder |
| Outcome applied (feature flags per country pack, labelling) | | | | |

---

## 1. Letter

**[Applicant company name]**
[Registered address] · [Company registration number] · [Phone] · [Email]

[Date]

The Chief Executive Officer
National Medicines Regulatory Authority
Medical Devices Division
No. 120, Norris Canal Road, Colombo 10 ⚠ verify address

**Subject: Request for a Product Categorisation Letter — "Cure Global" family health record software and the "Cure Family Hub" home display device**

Dear Sir/Madam,

We request a Product Categorisation Letter stating whether the products described below, or any of their functions, are medical devices under the National Medicines Regulatory Authority Act No. 5 of 2015, and, if any function is, its likely classification and the pathway you would expect us to follow.

We describe the products function by function, including the functions we consider closest to the medical-device definition, so that the Authority can categorise each one. We have designed the products so that functions can be switched off separately per country if the Authority considers them regulated.

### 1.1 The products

1. **Cure Global** — software: a mobile application for Android phones, a web application for doctors, a web console for our own administrative staff, and a cloud service that stores the records.
2. **Cure Family Hub** — a touch-screen display device kept in the family home (built on a Raspberry Pi 5 / Compute Module 5, a Microsoft Surface Pro running Ubuntu Linux, or an Android tablet in the "Lite" version). It receives readings from third-party Bluetooth measuring devices, shows them to the family, and sends them to Cure Global. It contains no sensor that measures a physiological parameter itself. (Its camera is used only to recognise which family member is in front of it so that a reading is filed under the right person; face data never leaves the device.)
3. **Third-party measuring devices** (blood pressure monitors, pulse oximeters, thermometers, glucometers, bathroom scales) supplied in Cure kits are made by other manufacturers and are registered with the Authority by their marketing authorisation holders. They are listed in Enclosure E6 for completeness only.

### 1.2 Intended purpose

> Cure Global lets families record, store, view and share personal health information. It lets the doctors they choose view that information, set personal targets and alert rules, and send messages. Family-facing parts (app, Family Hub) store and display information, compare readings with targets the person's own doctor set, deliver alerts defined by that doctor or by the family's safety settings, and show a small set of fixed safety-net texts. They do not diagnose, triage or recommend treatment.

**Intended users:** members of a family (adults for themselves; parents and legal guardians for children; carers of older relatives, with the person's consent or a documented best-interest decision); doctors registered with the Sri Lanka Medical Council whom the family chooses to add to its care team (identity and licence verified by us); our own trained support staff (administrative data only).
**Intended environment:** the family home and the doctor's own practice. Not for use in hospitals, intensive care, or as a substitute for emergency services.
**Not intended for:** diagnosis, screening, triage, treatment or dose recommendations, continuous monitoring, or emergency response. The products tell users, on every family surface, that they are not monitored 24 hours a day and that in an emergency they must call 1990 or go to the nearest hospital.

### 1.3 Functions, one by one

| # | Function | What it does | What it does not do | Our view (for the Authority's decision) |
|---|---|---|---|---|
| F1 | **Record keeping** | Stores readings (weight, blood pressure, pulse, SpO₂, temperature, glucose), vaccinations, medicines as prescribed by the person's doctor, appointments, documents and notes; shows values, charts over time, averages and the source of each reading (which device, entered by whom); exports a PDF summary or a standard FHIR file; shares read-only with chosen people | No interpretation of values; no "normal/abnormal" labels; no population thresholds shown to families | Storage, display and transfer only — we consider this not a medical device |
| F2 | **Comparison with the doctor's own targets** | When the person's own doctor has set a personal target range for that person (e.g. blood pressure below 130/80), the family sees each reading with one of four fixed phrases: "● Within your target", "▲ Above / Below your target", "! Talk to your doctor" (only when the doctor set an attention level), "? Check this reading" (only for physically impossible values and unit mix-ups, e.g. 98.6 entered as °C). The phrase always shows "target set by Dr X on [date]" | No targets of its own; nothing is shown when no doctor has set a target; no scores, risk calculations or diagnoses | Software applying a clinician's own rule to that patient's data. We ask the Authority to say whether this is a device function |
| F3 | **Alerts** | (a) **Doctor-defined:** notifies the doctor and the family members the person chose when a reading crosses a level the doctor set for that person. (b) **Family safety settings:** a missed daily "I'm OK" check-in by an older person, an SOS button press, a fall logged, a missed medicine dose → notifies the carers the family listed, in their order, until someone acknowledges. Notifications contain no health values or condition names | Not an alarm system; not monitored 24/7; delivery depends on phones and networks; never replaces emergency services | (a) is closest to "monitoring with alarms". (b) is personal safety, not physiological. We ask the Authority to categorise (a) and (b) separately. Both can be switched off per country |
| F4 | **Fixed safety-net texts** | A closed list of short texts written and approved by our Clinical Safety Officer, shown when a reading is in a very high/low range for that measurement (e.g. SpO₂ below a fixed level), for fever ≥ 38 °C in a baby under 3 months, for severe-range blood pressure in pregnancy when no obstetrician has set levels, and when a pregnant woman presses "Reduced movements". Each text says **what to do** (measure again; contact the maternity unit; call 1990 / go to hospital), never what the value means | No diagnosis; no advice on medicines; texts cannot be changed by users | Equivalent to the instructions printed in a device's leaflet; we ask the Authority's view |
| F5 | **Doctor console** | Lets the verified doctor see the data the family shared with them, set targets and attention levels, record notes, acknowledge alerts, see growth charts with WHO-style z-scores for children (doctor only), and score questionnaires that are licensed for use | No automated diagnosis; the doctor makes every clinical decision | Clinical decision support for professionals using published methods; we ask the Authority's view |
| F6 | **Family Hub hardware** | Displays the above; receives Bluetooth readings from registered third-party devices; recognises family members by face on the device to file readings under the right person | Measures nothing itself; raises no alarms of its own (alert rules run on the cloud service) | Not a medical device (a display and data-transfer appliance). Radio approval is handled with TRCSL |
| F7 | **Third-party measuring devices** | Measure BP, SpO₂, temperature, glucose, weight | — | Medical devices of their manufacturers, registered by their marketing authorisation holders (Enclosure E6) |

### 1.4 Safety and quality measures already in place

- Clinical risk management to ISO 14971 with a hazard log and a Clinical Safety Officer (a registered doctor) who signs off every clinical text, threshold and release (Enclosure E4).
- Software developed with IEC 62304 discipline (requirements traceability, automated tests, release records, list of third-party software).
- Privacy and security by design for the Personal Data Protection Act No. 9 of 2022 (DPIA, Data Protection Officer, consent records, encryption, audit of every access).
- Readings from wearables without a cuff (e.g. smartwatches) are labelled "Estimated", excluded from targets and alerts by default, and never used in pregnancy.

### 1.5 What we ask

1. Whether each of functions F1–F6 is a medical device under the Act.
2. For any function that is: its likely class, the registration pathway, and whether the remaining functions may be supplied while that function is switched off.
3. Whether the Family Hub (F6) needs any registration when supplied together with registered third-party devices.

We would be glad to demonstrate the products to the Authority. Please contact [name, role, phone, email].

Yours faithfully,

[Signature]
[Name], [Director / Chief Executive Officer], [Applicant company]

Countersigned for the clinical description (§1.3–§1.4): [Name], Clinical Safety Officer, SLMC reg. no. [ ]

---

## 2. Enclosures

| # | Enclosure | Source in this repository | Ready? |
|---|---|---|---|
| E1 | Intended purpose statement (as §1.2, signed) | `STANDARDS_AND_REGULATIONS.md` §1 | Draft |
| E2 | Feature list per surface (family app, Family Hub, doctor web, admin web) | `docs/01-product/FEATURES_BY_ENTRY_POINT.md`, `docs/01-product/MEMBER_MODULES.md` | Draft — export a short version |
| E3 | Screenshots: a reading with each of the four phrases; the "target set by Dr X on date" line; a safety-net text; the "not monitored 24/7 · call 1990" notice; the doctor's target editor; the hub home screen | hub-ui and doctor-web on the demo stack (synthetic data only — never real patients) | To capture |
| E4 | Clinical safety case summary and hazard log | `docs/03-compliance/CLINICAL_SAFETY_CASE.md`, `docs/03-compliance/CLINICAL_SAFETY.md` §3 | Draft — needs CSO signature |
| E5 | Safety-net text register (en/si/ta) with the trigger of each text | `CLINICAL_SAFETY.md` §4.1, `packages/module-catalogue/catalogue/metrics.yaml` (`urgent` bands) | Draft — CSO-approved bands and texts needed |
| E6 | Peripheral list with manufacturer, model, NMRA status of each device | `packages/module-catalogue/catalogue/peripherals.yaml` (render as a table) | Data present; NMRA status **unknown** for every model until checked |
| E7 | Company registration, authorisation of the signatory | Company records | To obtain |
| E8 | Description of how functions can be switched off per country (feature flags) | `services/api/app/api/admin.py` (feature flags), alert gate (to implement — §0) | Open |

## 3. After the answer

| If NMRA says | We do |
|---|---|
| None of F1–F6 is a device | File the PCL; keep the copy and features within the letter; re-ask if a function changes (e.g. the Ask Cure assistant) |
| F3(a) and/or F2/F4 are devices | Switch those functions off for LK until registered (feature flag per country pack); start the registration file (QMS to ISO 13485 style, technical documentation, IEC 62304 evidence); decide on D-13 |
| The hub is a device when bundled | Register as a system/kit with the distributor or supply it separately from the measuring devices; revisit labelling (Sinhala/Tamil) |
