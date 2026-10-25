# Cure Global — Vision and scope

*v0.1 · 22 Oct 2026 · Owner: Dilshan Pathirana · Status: draft for decision*

Companion docs: `GAP_ANALYSIS.md` (what the original idea was missing and how it is fixed), `MEMBER_MODULES.md` (every function by life stage, sex and special need), `FEATURES_BY_ENTRY_POINT.md` (what each of the four entry points does), `BUSINESS_MODEL.md`.

---

## 1. The idea as given

> A database of patients and doctors. Patients are grouped in families. Each family may have one or more doctors, and each family member may have one or more doctors. A device acts as the centralised health monitoring and record system of the family and of the individual. Member types: infants, children, teenagers, adults, middle-aged, elders, pregnant mothers and specially-abled members, male and female, each with common and unique functions. Assigned doctors see their family's and members' history and trends. Admin-level family members manage the family and view other members' records. Four entry points: super admin (web), doctors (web), Family Hub (physical device with touch screen and face recognition), mobile app. Peripherals: BLE scale, wearables for BP / heart rate / SpO₂, GPS for elders (Alzheimer's).

## 2. The improved idea in one paragraph

**Cure Global is a lifelong, person-centred health record that families keep together and share with their own doctors.** Every person has one record that starts at pregnancy or birth and follows them through every life stage. Families are a grouping of people, not the owner of their data: a child who grows up, a couple who separate, or a grandparent who moves between their children's homes keeps one record. The **Family Hub** at home recognises each member, guides them through correct measurements with certified Bluetooth devices, and shows only what that person may see. The **app** carries the same record everywhere and lets a son in Dubai look after his parents in Kandy. **Doctors** on a family's care team see trends between visits, set personal targets and alert rules, and acknowledge what they reviewed. The **super admin** runs the platform: doctors are verified, modules are configured per country, devices are provisioned and every access to health data is audited. What each person sees is decided by a **module engine**: life stage (from date of birth), sex for clinical use, pregnancy, special needs, chronic-care programmes and the doctor's choices switch functions on and off.

## 3. What changed from the brief, and why

| # | Brief | Improved | Why |
|---|---|---|---|
| 1 | Patients belong to a family | **Person ≠ family ≠ login.** A person can belong to several families; dependants have no login; a login can act for several people | Real families: divorced parents, grandparents in two homes, a child who turns 18, in-laws. The record must follow the person (GDPR/PDPA data-subject rights attach to the person). |
| 2 | Fixed member types | **Computed life stage + overlays.** Age bands are derived from date of birth and change automatically; pregnancy, postpartum, special needs, dementia safety and chronic programmes are overlays that stack | A pregnant 17-year-old is a teen *and* pregnant; an autistic child grows into an autistic adult; types defined once would be wrong within a year. |
| 3 | Male and female functions | **Sex for clinical use** drives sex-specific references (growth charts, screening); a member can opt in or out of sex-specific modules | Growth references and screening differ by sex; gender identity is recorded separately and respected (FHIR `gender` vs sex for clinical use). |
| 4 | Admin family members see everyone | **Admins manage the family; seeing an adult's health data needs that adult's consent.** Dependants (children, adults under guardianship or with a health proxy) are covered by guardianship. Teens can keep sensitive modules private from a set age | Health data is special-category under Sri Lanka's PDPA and GDPR. Parental access to older teens' sexual, reproductive and mental-health records is limited in professional guidance. |
| 5 | Family and member doctors | **Care teams** at family and member level with roles (family doctor, paediatrician, obstetrician, specialist, therapist, nurse), scopes, start and end dates, and consent; **doctor licences verified** by the super admin | Without scopes, an obstetrician would see a grandfather's records. Unverified "doctors" are the biggest abuse risk on a health platform. |
| 6 | Device is the centralised record | **The cloud record is the system of record; the hub is the household's capture and display point**, working offline and syncing | A device can be lost, stolen or broken; a record cannot. |
| 7 | Show health data | **Honest display, no diagnosis on family surfaces; alerts run on the server under clinician control** | Keeps hub and app out of medical-device classification (MDDS / "transfer, store, display" software) while the doctor console carries the clinical workflow. |
| 8 | GPS for elders | **Safety module with ethics built in**: consent or best-interest decision by a documented proxy, geofences instead of continuous tracking, short location retention | Tracking people with dementia is a liberty issue; least-restrictive practice is the norm. |
| 9 | Face recognition on the hub | Kept, with **consent, on-device templates, guardian-only enrolment of children and proxy measurement** for infants and anyone face recognition can't serve | Infants' faces change monthly; some members can't stand in front of a camera. |
| 10 | Wearables | **Standard-first integration:** BLE health profiles on the hub and app, Android Health Connect for watches, Traccar for GPS trackers; every reading labelled with its source and whether the device is validated | Dozens of vendors; one integration layer per standard instead of one per vendor. |

## 4. Product principles

1. **One person, one lifelong record.** Families group people; they don't own them.
2. **Show, don't diagnose.** Families see values, trends and their doctor's targets. Doctors interpret.
3. **The doctor closes the loop.** Every function should make review easier and visible ("Dr Perera reviewed your readings on Monday").
4. **Private by default, shared on purpose.** Consent per purpose, per person, revocable; sensitive modules never appear on the shared hub screen.
5. **Measure right, not more.** Guided protocols beat raw counts.
6. **Works on a bad day.** Offline, after a power cut, with shaky hands, in Sinhala or Tamil, without a smartphone.
7. **Configured, not coded.** Life stages, schedules, metrics and modules are data the super admin manages per country.
8. **Standards over custom formats.** FHIR R4, LOINC, UCUM, SNOMED CT, ICD-11, Bluetooth health profiles.

## 5. The four entry points

| Entry point | Users | Purpose |
|---|---|---|
| **Super Admin web** (`apps/admin-web`) | Platform staff: super admin, operations/support, clinical content manager, DPO/auditor, organisation admins | Run the platform: families, people, doctors and verification, care teams, module catalogue, schedules and content, devices and peripherals, consents and policies, data-subject requests, billing, audit |
| **Doctor web** (`apps/doctor-web`) | Doctors, nurses, therapists, care coordinators | Panel and worklist, member chart (timeline, trends, growth, pregnancy, immunisation, logs), targets and alert rules, assign modules and questionnaires, notes, review acknowledgements, messages, appointments |
| **Family Hub** (`apps/hub-ui` + hub services) | Everyone in the household, including members without phones | Face sign-in, guided measurements with BLE devices, member-specific Orbit View, proxy measurement for dependants, medicines, vaccines and visits due, daily check-in, SOS, visual schedules, family calendar and board |
| **Mobile app** (`apps/mobile`) | Family members, admins, remote caregivers | Full personal and family record, onboarding and consent, BLE and Health Connect capture, private modules (cycle, wellbeing), pregnancy and child tools, elder safety and location, documents, messages with doctors, notifications |

## 6. Scope

### 6.1 Release plan at a glance (detail in `docs/05-roadmap/ROADMAP.md`)

| Release | Contents |
|---|---|
| **MVP (pilot)** | Identity and families, consent and sharing, teen confidentiality enforcement (from 16) and teen login, care teams and doctor verification, module engine with core vitals, medicines, documents, immunisations, infant/child growth and vaccines, elder daily check-in and SOS, alerts engine v1 (missed check-ins, SOS, doctor targets, missed readings) with escalation, Family Hub ported from Cure Home with module-driven cards and proxy measurement, mobile app ported from the patient app, doctor console (panel, chart, targets, review), super-admin console (families, doctors, modules, devices, audit), FHIR R4 export |
| **R2** | Pregnancy and postpartum (with the hub opt-in), women's health (cycle, contraception, menopause), teen tools (13–15 confidentiality opt-in, wellbeing, confidential messages), special-needs v1 (care profile, behaviour, sleep, seizure diaries, visual schedule, Down syndrome checklist), GPS and geofences via Traccar, the doctors' alert rules editor, doctor messaging, questionnaires |
| **R3** | Chronic-care programmes (hypertension, diabetes, heart failure, asthma/COPD, CKD), wearable integrations beyond Health Connect, HMS connector, billing and subscriptions, provider organisations (clinics as tenants), IPS and SMART on FHIR API |
| **Later** | Teleconsultation on the hub, Ask Cure assistant, pill dispensers, mmWave fall radar, research data platform (separate consent), other countries |

### 6.2 Out of scope (all releases unless reopened)

- Diagnosis, triage scores or treatment advice shown to families.
- E-prescribing and dispensing, pharmacy, POS, hospital operations (these stay in HMS).
- Emergency dispatch ("help is on the way" claims). The platform shows the national emergency number (1990 Suwa Seriya in Sri Lanka) and notifies family and care team; it never promises a response.
- Continuous real-time monitoring presented as clinical surveillance (no ICU-style monitoring, no alarms that imply someone is watching 24/7).
- Selling or sharing data for advertising.

## 7. Success measures

| Area | Measure | Pilot target (hypothesis) |
|---|---|---|
| Engagement | Families with ≥ 3 active members using the hub weekly | ≥ 70 % at week 12 |
| Clinical loop | Members whose doctor reviewed their data in the last 30 days | ≥ 80 % of members on a care team |
| Data quality | Hub readings attributed to the right person (audited sample) | ≥ 98 % |
| Child health | Children with up-to-date vaccine records entered | ≥ 90 % |
| Safety | Elder check-in misses that reached a caregiver within 15 min | 100 % (synthetic tests) |
| Trust | Members keeping face sign-in on after 30 days | ≥ 85 % |
| Privacy | PHI reads with a recorded purpose | 100 % |
| Reliability | Readings synced within 24 h | ≥ 99 % |

## 8. Decisions needed from Dilshan

See `docs/05-roadmap/RISKS_AND_DECISIONS.md` §2 for the full list. The ones that change the plan most:

1. **Relationship to Cure Home and HMS.** Recommended: Cure Home continues its HMS-based pilot unchanged; Cure Global builds its own backend and reuses the same hub software (one `/api/v1/hub/*` contract), then absorbs Cure Home after the pilot.
2. **Primary buyer for the pilot**: families direct (including diaspora), Cure clinics' programmes, or both.
3. **Age thresholds** for Sri Lanka: teen self-consent and confidentiality age (proposed 16), handover of a child's account to themselves (18).
4. **Hosting** for health data: in Sri Lanka, or a regional cloud with a PDPA transfer instrument.
5. **App identity**: a new app (`lk.cure.global`) or the existing `lk.cure.patient` evolving.
