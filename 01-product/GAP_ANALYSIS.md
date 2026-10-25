# Cure Global — Gap analysis

*v0.1 · 22 Oct 2026 · Each gap: what is missing → why it matters → the resolution and where it is specified.*

IDs: **G-D** design/UX · **G-L** business logic · **G-C** clinical · **G-P** privacy/legal · **G-S** security · **G-I** interoperability · **G-H** hardware/devices · **G-O** operations · **G-B** business. Gaps already solved in Cure Home (Healthcare-Device `PRODUCT_SPEC.md` §2) are inherited and not repeated: hub placement, presence-based camera, attribution engine, per-metric limits instead of "max 3 a day", duplicates, timestamps, offline queue, device identity, kiosk escape, signed updates.

---

## 1. Business logic and data model

| ID | Gap | Why it matters | Resolution |
|---|---|---|---|
| G-L1 | **Who is a "patient"?** The brief treats family members as patients belonging to one family. | People belong to several families (children of separated parents, grandparents in two homes, in-laws). A child grows up and leaves. Records tied to a family break. | `person` (health subject) is separate from `family` (grouping) and `user_account` (login). `family_membership` is many-to-many. Data belongs to the person. `DATA_MODEL.md` §2, ADR-0004. |
| G-L2 | **Dependants without logins.** Infants, children and many elders have no phone or email. | They still need a record, consent, a face on the hub and data entry by someone else. | Persons without accounts; `guardianship` (parent, legal guardian, health proxy) gives a named adult the right to act. Proxy entry is recorded (`entered_by`). |
| G-L3 | **"Admin family members view all records."** | An adult's health data is special-category data; a spouse or sibling being admin is not a legal basis. | Family roles (owner, admin, member, dependant) control *management*; health-data *visibility* between adults needs an `access_grant` the adult gives (all or per category), revocable. Dependants are covered by guardianship. `ACCESS_CONTROL.md` §3. |
| G-L4 | **Teenagers.** Parents are admins, but teens have sensitive data (cycle, sexual and mental health). | Adolescent confidentiality is a professional norm; leaking a teen's data to a parent can cause real harm. | From the configured age (Sri Lanka proposal 16), modules marked `teen_confidential` are private to the teen by default; parent sees that the module exists, not its data. Between 13 and the threshold, the teen can request confidentiality and the care-team doctor can approve it. `ACCESS_CONTROL.md` §5. |
| G-L5 | **Coming of age.** Nothing happens at 18. | The adult must take over their own record and decide what parents may still see. | At 18 (configurable) guardianship ends automatically; the person is invited to create a login (phone/email) and choose grants; until they do, the record is locked to them and their care team (parents lose access unless granted). `MODULE_ENGINE.md` §7. |
| G-L6 | **Member types are static.** | Age changes daily; a person can be teen + pregnant, child + autistic, elder + diabetic + dementia. | Life stage computed from date of birth; overlays (pregnancy, postpartum, special needs, programmes, dementia safety) stack. Module eligibility is rule-based. `MODULE_ENGINE.md`. |
| G-L7 | **Male/female split.** | Growth charts and screening are sex-specific, but sex at birth, gender identity and intersex conditions differ; some members want or don't want sex-specific modules. | `sex_for_clinical_use` drives references; `gender_identity` is recorded and used for address and display only; sex-specific modules can be opted in or out by the member (or guardian) and doctor. |
| G-L8 | **Pregnancy lifecycle.** | A pregnancy starts, has an expected end, ends (birth, loss) and creates a newborn who needs a record linked to the mother. | `episode(type=pregnancy)` with EDD from LMP or scan, gestational-age maths, ANC schedule; on "baby born", a newborn person is created with birth data and the mother as guardian; postpartum episode starts. Loss is handled with a gentle flow that stops all pregnancy content immediately. `MEMBER_MODULES.md` §9. |
| G-L9 | **Several doctors.** "Family doctors" and "member doctors" without scope. | An obstetrician should not see the grandfather; a family doctor should not see a teen's confidential data. | Care teams at family and person level; each membership has a role, a scope (data categories), start/end dates and the consent it relies on. `ACCESS_CONTROL.md` §4. |
| G-L10 | **How doctors join.** | Fake doctors; doctors adding themselves to families. | Doctors are verified by the super admin (licence number checked with the medical council register, e.g. SLMC). Linking needs both sides: family invites a verified doctor, or a doctor invites a family by code and an adult/guardian accepts. |
| G-L11 | **Doctor leaves, retires or dies.** | Orphaned members; data access must stop. | Care-team membership ends; the family is prompted to pick another doctor; notes stay in the record with the author's name. |
| G-L12 | **Family changes.** Separation, death of the owner, owner abroad. | Who manages the family? | Ownership transfer flow; at least one admin required; on the owner's death the next admin becomes owner; super-admin support flow with documented evidence. |
| G-L13 | **Deceased members.** | Reminders and greetings for someone who died are painful; data must be kept for legal retention. | `deceased_at` stops all reminders, hub greetings and scheduled content at once; record archived and kept per retention policy; family sees a memorial-neutral state. |
| G-L14 | **Elders who lose capacity** (dementia). | They can't consent to GPS tracking or sharing; families act anyway. | Health proxy (`guardianship.basis = health_proxy` or `legal_guardian`) with evidence uploaded and reviewed by support; consent given "on behalf" is labelled so; least-restrictive options first (geofence alerts, not continuous tracking). |
| G-L15 | **Duplicate people.** The same grandmother added by two children. | Two records for one person split her history. | Duplicate detection on name + date of birth + phone/NIC (hashed); merge flow run by support with both families' consent. |
| G-L16 | **Non-numeric data** (feeds, nappies, sleep, cycles, seizures, meltdowns). | Vital-only tables can't hold them. | Typed `tracker_entry` records validated against schemas from the module catalogue. `DATA_MODEL.md` §5. |
| G-L17 | **Who entered a reading and how reliable is it?** | Doctors need to know if a value came from a validated cuff, a watch, a typed entry or a clinic. | Every observation has `source`, `device`/`peripheral`, `entered_by`, `identified_by`, validation status of the device; charts mark sources. |
| G-L18 | **Subscriptions lapse.** | Locking people out of their own health data is unacceptable (and against data-subject rights). | Lapsed plans become read-only with export; capture and doctor features pause; nothing is deleted. |
| G-L19 | **Multi-country.** | Vaccine schedules, age thresholds, emergency numbers, languages and units differ. | Country packs in the catalogue (`packages/module-catalogue/catalogue/country_packs/LK.yaml` with thresholds, emergency number, languages and schedules such as `schedules/immunization.LK.yaml`); the super admin selects per family. |

## 2. Design and UX

| ID | Gap | Resolution |
|---|---|---|
| G-D1 | **Shared screen shows private data.** | Sensitive modules (cycle, wellbeing, sexual health, questionnaires) and behaviour logs **never** render on the hub. The hub shows modules flagged `hub_safe` (for special needs, only the visual schedule), plus `hub_opt_in` modules (pregnancy, the location banner) only while the person's own `hub_display` consent is active (ADR-0011). |
| G-D2 | **Infants and toddlers on face recognition.** | Not enrolled for face sign-in. An identified parent or guardian chooses "Measuring for: Baby Nethmi" (proxy measurement). The infant scale or thermometer reading is attributed to the selected dependant. |
| G-D3 | **Members who can't use the touch screen** (severe disability, advanced dementia, visual impairment). | Proxy measurement by a carer; Simple mode (fewer, larger choices); voice prompts; picture-based visual schedules. |
| G-D4 | **Twelve different apps in one.** Each life stage has its own tools. | Each member's home shows only their active modules, in a fixed order (alerts → today's tasks → readings → module tiles). The member switcher always shows whose data is on screen. |
| G-D5 | **Admin of many members needs an overview.** | Family dashboard (app and hub): per member "done today" and "due" counts only — never values — unless the admin has a grant for that member. |
| G-D6 | **Remote caregivers** (diaspora). | The app works fully abroad; time zones per family and per viewer; notifications in the viewer's time zone. |
| G-D7 | **Doctors drowning in data.** | Worklist ordered by open alerts, then members due for review, then new data; summaries (7-day averages, adherence, growth z-score change) before raw points; "Mark reviewed" sends the family an acknowledgement. |
| G-D8 | **Languages.** | English, Sinhala and Tamil on the hub and app (inherited rule); doctor and admin consoles English first; content items carry per-language versions with review status. |
| G-D9 | **Accessibility.** | WCAG 2.2 AA on web and app; hub rules from Cure Home (64 px targets, 20 px body, Clear view, Calm motion). |

## 3. Clinical

| ID | Gap | Resolution |
|---|---|---|
| G-C1 | **Growth charts need references.** | WHO Child Growth Standards (0–5 y) and WHO Growth Reference (5–19 y) LMS tables as data; z-scores and percentiles computed in `packages/clinical`; Down syndrome-specific charts as an option the doctor chooses. Family view shows neutral reference curves (no colour zones, no labels such as "underweight") unless the doctor enables interpretation. |
| G-C2 | **Vaccine schedules.** | Country schedule (Sri Lanka National Immunization Programme) as versioned data; due/overdue computed from date of birth and doses given; doses entered by parents are "unverified" until a doctor verifies or a vaccination card photo is attached. |
| G-C3 | **Pregnancy is high-risk territory.** | No risk scoring on family surfaces. BP and glucose compare only with targets the obstetrician set; danger-sign information is fixed, clinician-approved text that says "contact your midwife/doctor now or call 1990"; reduced fetal movement text tells the mother to contact her maternity unit the same day. |
| G-C4 | **Questionnaires (M-CHAT-R/F, EPDS, PHQ-9, STEADI) are clinical tools.** | Only a care-team clinician can assign them; results go to the clinician; the family sees "Shared with Dr X", not a score interpretation. Licensed instruments are checked for permissions before inclusion. |
| G-C5 | **Population thresholds vs personal targets.** | Inherited rule: family surfaces compare only with doctor targets. Population thresholds exist only in the doctor console as clinician decision support, clearly labelled. |
| G-C6 | **Clinical content governance.** | Every clinical text, schedule and reference is a `content_item` with an owner, a clinical reviewer, a version and an approval date. A named clinical safety officer signs releases. `CLINICAL_SAFETY.md`. |
| G-C7 | **Wearable readings are not cuff readings.** | Source and validation status shown everywhere; doctors can exclude unvalidated sources from averages; targets apply only to validated sources by default. |
| G-C8 | **Emergencies.** | SOS on hub and app notifies selected family members and shows 1990; never "help is coming". Server-side escalation for unacknowledged SOS (next contact after 2 min). |

## 4. Privacy and legal

| ID | Gap | Resolution |
|---|---|---|
| G-P1 | **Special-category data** (health, biometric, children's data, location). | Explicit, purpose-specific consent with policy versions; DPIA before pilot; DPO; records of processing; retention schedule. `PRIVACY_CONSENT_SECURITY.md`. |
| G-P2 | **Children's consent.** | Guardian consent below the configured digital-consent age; re-consent by the person at the threshold; children's data never used beyond care. |
| G-P3 | **Location of elders.** | Separate `location_tracking` consent (or documented best-interest decision by a proxy); geofence events stored, raw positions kept 30 days at most; access limited to named carers. |
| G-P4 | **Cross-border** (diaspora viewers, cloud region). | Data hosted in one region per country pack; remote viewers see data through the API (access, not transfer of the database); transfer instrument documented where hosting is outside Sri Lanka. |
| G-P5 | **Data-subject rights.** | Access/export (FHIR + PDF), correction requests, erasure with legal-retention exceptions, restriction, consent withdrawal, all tracked as DSAR tickets in the admin console. |
| G-P6 | **Is this a medical device?** | Assessed per function (`STANDARDS_AND_REGULATIONS.md` §1): record keeping is likely not a device; target comparison and physiological alerts to families are decision-support / monitoring functions that may be regulated (EU Rule 11 IIb for alarms). Keep rules clinician-configured and transparent, keep alerting behind a feature flag, describe the real features in the NMRA categorisation request, decide per market (D-13). |
| G-P7 | **Doctors' professional duties.** | Terms for doctors: what review means, response-time expectations ("not monitored 24/7"), record keeping, telemedicine guidelines of the medical council. |

## 5. Security

| ID | Gap | Resolution |
|---|---|---|
| G-S1 | **Strong authentication for doctors and admins.** | Mandatory MFA (TOTP or passkeys/WebAuthn) for every staff and doctor account; short sessions; re-authentication for exports and break-glass. |
| G-S2 | **Platform staff seeing PHI.** | Support roles see no health data by default; break-glass access needs a reason, is time-boxed, notifies the DPO and is visible to the family. |
| G-S3 | **Audit.** | Append-only, hash-chained audit of every PHI read and write, including the purpose; families can see who looked at their records. |
| G-S4 | **Secrets and keys.** | Asymmetric token signing with rotation (JWKS); envelope encryption for sensitive columns (national ids, location, notes); KMS in production. |
| G-S5 | **Hub theft.** | Inherited: encrypted store, revoke from app/admin, local cache limits. |
| G-S6 | **Tracker spoofing.** | Trackers registered by IMEI (hashed) and bound to a person; Traccar positions accepted only from registered devices; SOS without a recent heartbeat flagged. |
| G-S7 | **Secure development.** | OWASP ASVS L2 (L3 for auth and access control), MASVS for the app, SAST/DAST/dependency scanning, SBOM, annual penetration test, vulnerability disclosure policy. |

## 6. Interoperability

| ID | Gap | Resolution |
|---|---|---|
| G-I1 | **Proprietary formats.** | Internal model aligned to FHIR R4 resources; LOINC + UCUM for observations; SNOMED CT / ICD-11 for conditions; CVX/local codes for vaccines; FHIR export and IPS. |
| G-I2 | **Many wearables.** | Health Connect on Android for watches and phones; BLE standard GATT profiles for medical devices; Traccar for GPS trackers; vendor cloud APIs only when a programme needs them. |
| G-I3 | **Cure hospital data.** | HMS connector (R3): link a person to an HMS patient by display id + OTP; import visit vitals, prescriptions and appointments; push home summaries to HMS doctors if they don't use the Cure Global console. |
| G-I4 | **Sharing with any doctor.** | Time-limited share link or QR (IPS summary + selected history), read-only, audited, revocable. |
| G-I5 | **Sri Lanka's public-sector care isn't on the platform.** Most pregnancies and child health checks are followed by the MOH clinic and the Public Health Midwife (PHM), with paper records (CHDR, pregnancy record). | External care contacts (clinic, MOH office, PHM) with no login (E3-09), shown in safety-net texts; photos of the paper records as documents; a default pregnancy safety net when no obstetrician is linked (HZ-04, E9-07); later, MOH clinics as organisations with read access granted by the family (R3) and the national EHR (ADR-0010). |
| G-I6 | **Schedules as computable guidance.** | Model immunisation and ANC schedules so they can map to the WHO SMART Guidelines digital adaptation kits and FHIR IGs (ANC, immunisation) when Sri Lanka adopts them. |

## 7. Hardware and devices

| ID | Gap | Resolution |
|---|---|---|
| G-H1 | **Infant measurements** (length, head circumference) can't come from a home BLE scale reliably. | Manual entry with guidance (or from clinic records); infant BLE scale optional; values marked "home measurement". |
| G-H2 | **GPS trackers** come in dozens of protocols. | Traccar server (supports most tracker protocols) in the stack; Cure Global consumes its events; the phone app can act as a tracker for elders who carry a phone. |
| G-H3 | **Validated devices.** | Peripheral catalogue in the admin console: model, profiles, validation (e.g. STRIDE BP / validatebp.org), regulatory status per country; the hub and app accept only catalogued models for auto-capture. |
| G-H4 | **Fall detection reliability.** | Treated as a signal, not a diagnosis: false alarms are expected; every event asks the elder "Are you OK?" on the watch/hub before escalating, unless no response. |

## 8. Operations

| ID | Gap | Resolution |
|---|---|---|
| G-O1 | **Onboarding families at scale.** | Self-service in the app (owner creates family, invites members, adds dependants); assisted onboarding by staff; hub pairing by QR. |
| G-O2 | **Support without PHI.** | Support console shows device health, sync status, account state; PHI only via break-glass. |
| G-O3 | **Content and schedule updates.** | Catalogue versions deployed without app releases; hub and app fetch catalogue updates. |
| G-O4 | **Monitoring.** | OpenTelemetry traces and metrics, structured logs without PHI, uptime checks, hub fleet heartbeat dashboard. |
| G-O5 | **Backups and disaster recovery.** | Point-in-time recovery for Postgres, encrypted backups in a second location, restore drills quarterly; RPO 15 min, RTO 4 h targets. |

## 9. Business

| ID | Gap | Resolution |
|---|---|---|
| G-B1 | **No buyer defined.** | Three segments: families (direct, including the Sri Lankan diaspora paying for parents at home), clinics and doctors (care-team seats, programmes), corporates and insurers (later). `BUSINESS_MODEL.md`. |
| G-B2 | **Hub cost.** | App-only plan first; hub on lease or bundle; Lite hub on an Android tablet (from Cure Home's plan). |
| G-B3 | **Doctor incentives.** | Doctors earn from care-team review fees or clinic programme fees; review time is logged; the console saves time over phone calls. |
| G-B4 | **Retention.** | Daily-use features (medicines, vaccines due, calendar, check-ins), visible doctor review, family coordination. |
