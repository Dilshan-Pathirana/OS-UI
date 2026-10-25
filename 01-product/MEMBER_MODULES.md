# Cure Global — Member types and modules (functional catalogue)

*v0.1 · 22 Oct 2026 · The full list of functions per life stage, sex and special need. Codes match `packages/module-catalogue`. Clinical facts and their sources: `docs/reference/CLINICAL_CONTENT_RESEARCH.md`. How modules switch on and off: `docs/02-architecture/MODULE_ENGINE.md`.*

**Read this first**
- **H / A / D** = Family **H**ub / mobile **A**pp / **D**octor web. **Default**: `auto` (on by itself), `offer` (one tap to turn on), `clinician` (only a care-team clinician can turn it on).
- **Display rule for every module:** families see values, trends, sources and their doctor's targets; nothing is labelled "abnormal" and no population threshold is shown to families (ADR-0012), except a reference the person's clinician switches on (shown as that doctor's target) and the CSO-approved safety-net texts for urgent values (`CLINICAL_SAFETY.md` §4.1). Interpretation tools (z-score bands, risk charts, questionnaire scores) are in the doctor console.
- **Sensitivity:** 🔒 = sensitive (explicit sharing only; never on the hub unless it is a `hub_opt_in` module the person switched on); 🔒T = also teen-confidential from 16 (guardians see no trace).
- Every clinical schedule below is country-pack data, signed off by a clinician before release. ⚠ marks items still to confirm with Sri Lankan sources.

---

## 1. Life stages and overlays

| Stage | Code | Age (default; country pack can change) | Sub-stages |
|---|---|---|---|
| Infant | `infant` | 0 – < 12 months | newborn 0–27 days |
| Child | `child` | 1 – < 10 years | toddler 1–2, preschool 3–5, school 6–9 |
| Teenager (adolescent) | `teen` | 10 – < 20 years (WHO adolescence) | early 10–14, late 15–19 |
| Adult | `adult` | 20 – < 40 years | — |
| Middle-aged | `middle` | 40 – < 60 years | — |
| Elder | `elder` | 60 years + (Sri Lanka's elders' rights law uses 60) | 60–74, 75–84, 85+ |

**Overlays** (stack on any stage): `pregnancy`, `postpartum`, `special_needs` (+ condition packs), `programme` (hypertension, diabetes, heart failure, asthma, CKD), `dementia_safety`.

**Sex for clinical use** selects sex-specific references (growth curves, BMI-for-age, waist and haemoglobin references in the doctor view) and offers sex-specific modules; anyone can add or remove a sex-specific module that does or doesn't apply to them.

---

## 2. Common modules (every member)

| Code | Function | Data | H | A | D | Default |
|---|---|---|---|---|---|---|
| `core.profile` | Personal health summary: name, photo, DOB, blood group, conditions, allergies, current medicines, implants/devices, languages, communication needs | person, conditions, allergies, medications | name/photo | ✔ | ✔ | auto |
| `core.emergency` | ICE card (allergies, conditions, medicines, blood group, emergency contacts, doctor), lock-screen/printable QR, **SOS** to family + national number (1990 in Sri Lanka) | emergency contacts | SOS | ✔ | ✔ | auto |
| `core.vitals` | Weight, height, BMI (derived, adults), temperature, BP, pulse, SpO₂, respiratory rate (manual); guided BP check; trends 7/30/90 days; doctor's targets | metrics `weight`, `height`, `bmi`, `temperature`, `bp`, `pulse`, `spo2`, `resp_rate` | ✔ | ✔ | ✔ | auto (BP/SpO₂ from age 3; adult BP cuff from 13 unless a child cuff is catalogued) |
| `core.glucose` | Blood glucose with context (fasting, before meal, after meal, bedtime, random); regimen counters | `glucose` | ✔ | ✔ | ✔ | offer (auto with diabetes/GDM) |
| `core.medications` | Medicine list, times of day, reminders, dose check-off per slot, refill reminder, adherence summary | medication, schedule, dose events | today | ✔ | ✔ | auto |
| `core.immunizations` | Vaccine record (all ages), due/overdue from the country schedule, verification by doctor or card photo | immunization | due list | ✔ | ✔ | auto |
| `core.appointments` | Visits with care-team doctors and outside providers, reminders, visit summaries shared by the doctor | appointment | next visit | ✔ | ✔ | auto |
| `core.documents` | Vault: lab reports, prescriptions, imaging, discharge summaries, vaccination cards, growth cards; share with care team | document | — | ✔ | ✔ | auto |
| `core.symptoms` | Illness diary: symptoms, temperature episodes, medicines given (no dosing advice), recovery | tracker `symptom`, `illness_episode` | quick log | ✔ | ✔ | auto |
| `core.allergies` | Allergies and intolerances with reactions; drives ICE card | allergy_intolerance | — | ✔ | ✔ | auto |
| `core.activity_sleep` | Steps, sleep, resting heart rate, HRV from Health Connect / wearables (labelled "estimated") | metrics from Health Connect | — | ✔ | ✔ | offer (≥ 6 y) |
| `core.wellbeing` | Mood check-in (1–5 + optional note), stress, sleep quality; private by default | tracker `mood` | — | ✔ | if shared | offer (≥ 10 y) 🔒T |
| `core.care_plan` | Doctor's targets, goals and instructions; "Reviewed by Dr X" acknowledgements | target, review, notes (shared) | ✔ | ✔ | ✔ | auto |
| `core.questionnaires` | Questionnaires assigned by a care-team clinician (e.g. EPDS, PHQ-9, M-CHAT-R/F, STEADI) — licences checked per instrument | questionnaire assignment/response | — | ✔ | ✔ (scores) | clinician 🔒T |
| `core.messages` | Secure messages with the care team (not for emergencies) | message thread | — | ✔ | ✔ | auto when a care team exists |
| `core.reminders` | Personal and family reminders, family calendar | reminder | ✔ | ✔ | — | auto |
| `core.sharing` | Share links/QR (time-limited, read-only summary), FHIR export, "who viewed my record" | share link, audit view | — | ✔ | — | auto |

---

## 3. Infant (0 – < 12 months)

| Code | Function | Data | H | A | D | Default |
|---|---|---|---|---|---|---|
| `infant.birth_record` | Birth details: date/time, gestational age, birth weight, length, head circumference, Apgar (if known), delivery type, hospital, newborn screening results (e.g. TSH) | episode link, observations, documents | — | ✔ | ✔ | auto |
| `infant.growth` | 0–24 months: weight, length, head circumference on **WHO Child Growth Standards** (sex-specific); preterm babies use corrected age (and preterm charts where the doctor selects them); growth velocity | `weight`, `length`, `head_circumference` | proxy weight | ✔ (neutral curves) | ✔ (z-scores, percentiles, faltering flags) | auto |
| `infant.feeding` | Breastfeeding (side, duration), expressed/formula (ml), solids from ~6 months, burping notes | tracker `feed` | quick log | ✔ | summary | offer |
| `infant.nappies` | Wet and dirty nappies (count, colour category) | tracker `nappy` | quick log | ✔ | summary | offer |
| `infant.sleep` | Sleep sessions and night wakings; safe-sleep guidance (back to sleep) as fixed content | tracker `sleep` | — | ✔ | summary | offer |
| `infant.immunization_schedule` | Country schedule (Sri Lanka: BCG at birth; Pentavalent + OPV + fIPV at 2 and 4 months; Pentavalent + OPV at 6 months; MMR at 9 months — ⚠ BCG/JE ages confirmed only from older documents) with due dates, clinic reminders, catch-up view | immunization + schedule | "vaccine due" | ✔ | ✔ | auto |
| `infant.milestones` | Milestone checklist at 2, 4, 6, 9, 12 months (CDC-style, ⚠ check reuse terms or link to the CDC app); "talk to your doctor" prompt only via fixed text | milestone_check | — | ✔ | ✔ | auto |
| `infant.supplements` | Vitamin/iron/other supplements as prescribed (⚠ Sri Lanka vitamin A megadose and other national programmes to be confirmed with FHB) | medication | today | ✔ | ✔ | auto |
| `infant.fever_watch` | Temperature episodes with times and actions; the static safety-net text `safety.infant_fever` for babies under 3 months (a fixed, CSO-approved rule — the ADR-0012 safety-net exception, not a configurable threshold); no dosing advice | `temperature`, tracker `illness_episode` | ✔ | ✔ | ✔ | auto |
| `infant.well_baby_visits` | Clinic visit schedule (MOH / paediatrician), CHDR card photos | appointment, document | next visit | ✔ | ✔ | auto |
| `infant.teething_skin` | Teething, rashes, nappy rash with photos (private, care-team share only) | tracker `observation_photo` | — | ✔ | if shared | offer |

**Hub rules:** infants are never enrolled for face sign-in. A guardian signs in and chooses **"Measuring for: Baby Nethmi"** (proxy measurement); the infant scale or thermometer reading is attributed to the baby. Baby-holding weighing ("weigh parent, then parent + baby") is a guided flow that stores only the difference, marked as such.

**Sex differences:** sex-specific WHO curves. No other functional differences.

---

## 4. Child (1 – < 10 years)

| Code | Function | Data | H | A | D | Default |
|---|---|---|---|---|---|---|
| `child.growth` | 2–10 years (under 2s use `infant.growth`): weight, height, BMI-for-age, head circumference to 3 y; WHO standards to 5 y, WHO reference 5–19 y (US pack: CDC 2–20 y, extended BMI charts) | `weight`, `height`, `length`, `bmi`, `head_circumference` | ✔ (proxy or face from ~6 y) | ✔ | ✔ | auto |
| `child.immunization_schedule` | Sri Lanka: Live JE at 12 months ⚠, DTP + OPV at 18 months, MMR at 3 years, DT + OPV at 5 years | immunization | due | ✔ | ✔ | auto |
| `child.milestones` | Checklists at 15 and 18 months, 2 years, 30 months, 3, 4 and 5 years | milestone_check | — | ✔ | ✔ | auto (to 5 y) |
| `child.development_screening` | Developmental and autism screening questionnaires assigned by the paediatrician (AAP: general at 9, 18, 30 months; autism at 18 and 24 months). M-CHAT-R/F needs a licence | questionnaire | — | ✔ | ✔ | clinician |
| `child.illness_log` | Fever and illness episodes, medicines given, school days missed | trackers | quick log | ✔ | ✔ | auto |
| `child.school_health` | Vision, hearing and dental check reminders; school medical records; sports clearance documents | appointment, document | — | ✔ | ✔ | offer |
| `child.nutrition_programmes` | Deworming and supplementation per national programme (⚠ ages to confirm with FHB guidelines) | medication/immunization-style schedule | due | ✔ | ✔ | auto (LK) |
| `child.asthma_allergy_plan` | Written asthma/allergy action plan from the doctor (document + structured steps), inhaler reminders, peak flow from ~5 y (BLE peak-flow meter optional) | `peak_flow`, medication, document | ✔ | ✔ | ✔ | clinician / condition |
| `child.screen_sleep_activity` | Sleep and activity routines, screen-time notes (parent-entered) | trackers | — | ✔ | — | offer |
| `child.injuries` | Injury log (falls, burns, bites) with photos and visits | tracker `injury` | — | ✔ | ✔ | offer |

**Hub:** children ≥ about 6 years can be face-enrolled by a guardian (re-enrol prompt every 6 months, from Cure Home); younger children use proxy measurement. "Pick your picture" for children who can't read.

**Sex differences:** sex-specific growth references; otherwise identical.

---

## 5. Teenager (10 – < 20 years)

| Code | Function | Data | H | A | D | Default | Sex |
|---|---|---|---|---|---|---|---|
| `teen.growth` | Height, weight, BMI-for-age to 19 (WHO reference), growth spurt view | metrics | ✔ | ✔ | ✔ | auto | both (sex-specific references) |
| `teen.immunizations` | Sri Lanka: aTd at 11 years; **HPV in Grade 6 (girls), 2 doses 6 months apart** (Sri Lanka does not currently vaccinate boys); catch-up | immunization | due | ✔ | ✔ | auto | HPV girls (LK pack) |
| `women.cycle` | Period start/end, flow, pain, symptoms, cycle-length history (values only, no "irregular" label — ADR-0012), predicted next period (labelled as an estimate), share-with-doctor toggle; **never on the hub** | trackers `menstrual_day`, `cycle_symptom` (Health Connect MenstruationPeriod/Flow import) | ✖ | ✔ | if shared | offer from 9 y | female (anyone may add) 🔒T |
| `core.wellbeing` (teen) | Mood, stress, sleep check-ins; fixed help resources (national helplines); confidential to the teen from 16 | tracker `mood` | ✖ | ✔ | if shared | offer | both 🔒T |
| `teen.sleep_activity` | Sleep and activity from wearables or manual | metrics | — | ✔ | ✔ | offer | both |
| `teen.sports_injury` | Sports participation, injuries, concussion log (fixed return-to-play text from clinician content) | tracker `injury` | — | ✔ | ✔ | offer | both |
| `teen.confidential_messages` | Messages with the care-team doctor that guardians can't read (from the confidentiality age) | message thread | — | ✔ | ✔ | auto at 16 | both 🔒T |
| `teen.transition` | Preparing for adulthood: learn your own record, at 18 claim your account and choose who sees what | flow | — | ✔ | — | auto from 16 | both |

**Male teens:** no male-only functional modules (screening for testicular cancer in adolescents is not recommended by USPSTF); differences are sex-specific references and HPV eligibility per country pack.

**Teen access rules:** `ACCESS_CONTROL.md` §5 (guardian sees normal modules; from 16, cycle, wellbeing and confidential messages are private to the teen).

---

## 6. Adult (20 – < 40 years)

| Code | Function | H | A | D | Default | Sex |
|---|---|---|---|---|---|---|
| `adult.lifestyle` | Smoking, alcohol, physical activity, diet notes, weight goal (goals set with the doctor) | — | ✔ | ✔ | offer | both |
| `adult.ncd_screening` | Health-check reminders (BP, glucose, lipids) per country pack — Sri Lanka NCD protocol: adults ≥ 40, and 35–40 with risk factors (Healthy Lifestyle Centres for 35+): offered from 35, automatic from 40; results entry; risk charts only in doctor view. BP itself is in `core.vitals` for everyone (USPSTF: screen adults 18+, yearly from 40 or with risk factors, every 3–5 years at 18–39 otherwise) | due | ✔ | ✔ | offer 35, auto 40 | both |
| `adult.lab_results` | Structured entry/import of common results (HbA1c, lipids, creatinine/eGFR, haemoglobin, TSH) with LOINC codes; trends | — | ✔ | ✔ | offer | both |
| `women.cycle` | As §5 (adult) | ✖ | ✔ | if shared | offer | female 🔒 |
| `women.contraception` | Method, pill/injection/implant reminders, renewal dates; private | ✖ | ✔ | if shared | offer | female 🔒 |
| `women.preconception` | Planning a pregnancy: folic acid reminder, rubella/tetanus status check from the vaccine record, pre-existing condition review prompt to the doctor | ✖ | ✔ | ✔ | offer | female 🔒T |
| `women.cervical_screening` | Screening reminders (USPSTF: 21–29 cytology every 3 y; 30–65 every 3–5 y by test; Sri Lanka Well Woman Clinic schedule ⚠ per FHB), results vault | — | ✔ | ✔ | auto from pack age | female |
| `men.health` | Reminders only when a doctor enables them per guideline (e.g. AAA, prostate discussion later in life); waist circumference tracking | — | ✔ | ✔ | clinician | male |
| `core.wellbeing` | As §2 | ✖ | ✔ | if shared | offer | both 🔒 |

---

## 7. Middle-aged (40 – < 60 years)

| Code | Function | H | A | D | Default | Sex |
|---|---|---|---|---|---|---|
| `mid.cardiometabolic` | BP, glucose, lipids, waist, weight dashboard; WHO HEARTS-style home BP (2 readings averaged); doctor's targets; **cardiovascular risk calculation only in the doctor console** (WHO/ISH charts) | ✔ | ✔ | ✔ | auto | both |
| `mid.cancer_screening` | Reminders per country pack: colorectal (USPSTF 45–75), lung (50–80 with ≥ 20 pack-years, doctor-enabled). Eligible 45–80; each reminder keeps its own age window | — | ✔ | ✔ | auto | both |
| `women.breast_screening` | Breast screening reminders per country pack (USPSTF 40–74 every 2 years), results vault | — | ✔ | ✔ | auto | female |
| `women.menopause` | Symptom tracker (hot flushes, sleep, mood, bleeding pattern changes), last period, HRT reminders; private | ✖ | ✔ | if shared | offer 45–60 | female 🔒 |
| `women.bone_health` | Osteoporosis screening reminder (USPSTF: women 65+ and younger postmenopausal women at risk — doctor-enabled before 65), calcium/vitamin D reminders as prescribed | — | ✔ | ✔ | clinician | female |
| `men.urinary_health` | Urinary symptom diary (frequency, night-time) and questionnaire assigned by the doctor | — | ✔ | ✔ | clinician | male |
| `men.prostate_discussion` | "Talk to your doctor about PSA testing" reminder (USPSTF: individual decision 55–69), only when the doctor enables it | — | ✔ | ✔ | clinician | male |
| `adult.lab_results`, `adult.lifestyle`, `core.wellbeing` | As adult | | | | | |

---

## 8. Elder (60 +)

| Code | Function | H | A | D | Default | Sex |
|---|---|---|---|---|---|---|
| `elder.daily_checkin` | "I'm OK" each morning: an explicit tap on the hub/app, the hub's voice prompt, or a watch button counts — being recognised alone never does (HZ-09); missed by a set time → alert to chosen family carers (escalating) | ✔ | ✔ | — | offer (auto if living alone flag) | both |
| `elder.falls` | Fall log (when, where, injury, help needed), falls-risk questionnaire assigned by the doctor (CDC STEADI: yearly or after a fall), home-safety checklist content | quick log | ✔ | ✔ | auto (questionnaire: clinician) | both |
| `elder.fall_detection` | Events from a watch, pendant or mmWave radar → "Are you OK?" prompt → escalate if no answer. Labelled a signal, not a diagnosis (real-world sensitivity is far lower than lab figures) | banner | ✔ | ✔ | offer (needs device) | both |
| `elder.safety_gps` | GPS watch/pendant/phone: geofences ("home", "temple", "daughter's house"), exit alerts, SOS button, low-battery and offline alerts, last known location on demand (audited). **Requires the elder's consent or a documented best-interest decision by a health proxy; reviewed every 6 months** | status banner, opt-in | ✔ | ✖ (unless shared) | offer with `dementia_safety` | both |
| `elder.medication_safety` | Pill organiser view, dose check-off on the hub, missed-dose alerts to carers (opt-in), **polypharmacy list for doctor review** (Beers criteria in the doctor console only) | ✔ | ✔ | ✔ | auto | both |
| `elder.cognition` | Memory and cognition questionnaires assigned by the doctor (no screening by default: USPSTF finds insufficient evidence) | — | ✔ | ✔ | clinician | both |
| `elder.hearing_vision` | Hearing aid battery/cleaning reminders, eye check reminders, glasses prescription in the vault | ✔ | ✔ | ✔ | offer | both |
| `elder.carer_handover` | Notes between family carers and hired carers (meals, toileting, mood, visitors) — scoped to the carer's grant | — | ✔ | summary | offer | both |
| `elder.inactivity_watch` | No hub interaction and no presence (mmWave, optional) by a set time → check-in prompt → carers (presence only suppresses the prompt; it never replaces the daily check-in) | ✔ | ✔ | — | offer | both |
| `elder.immunizations` | Influenza and pneumococcal record and reminders where the doctor recommends them (not in the Sri Lanka national programme) | due | ✔ | ✔ | auto (record) | both |
| `women.bone_health` | As §7 (auto from 65 where the pack follows USPSTF) | — | ✔ | ✔ | auto 65+ | female |
| `men.aaa_screening` | One-time abdominal aortic aneurysm ultrasound reminder for men 65–75 who ever smoked (USPSTF), doctor-enabled | — | ✔ | ✔ | clinician | male |
| `elder.simple_mode` | Simplified hub and app layouts: bigger targets, fewer choices, voice prompts, picture buttons | ✔ | ✔ | — | offer | both |

**Alzheimer's / dementia safety pack** (`dementia_safety` overlay, set by a clinician or proxy): `elder.safety_gps`, `elder.daily_checkin`, `elder.inactivity_watch`, `elder.carer_handover`, `elder.simple_mode`, plus a "wandering plan" document (recent photo, places they may go, phone numbers) that carers can share with police or neighbours in one tap.

---

## 9. Pregnant mothers (overlay `pregnancy`, then `postpartum`)

| Code | Function | H | A | D | Default |
|---|---|---|---|---|---|
| `pregnancy.core` | Start pregnancy (LMP or scan dating) → EDD, gestational week, trimester timeline, gravida/para; week-by-week clinician-approved content | opt-in | ✔ | ✔ | auto when episode starts (under 16: recorded by a clinician only, HZ-19) |
| `pregnancy.anc_schedule` | Antenatal contacts per country pack (WHO 2016: ≤ 12, 20, 26, 30, 34, 36, 38, 40 weeks; Sri Lanka: ~9 clinic visits for low risk, booking ideally before 8 weeks, PHM home visits), reminders, visit summaries | — | ✔ | ✔ | auto |
| `pregnancy.bp` | Home BP with **pregnancy-validated cuffs only** (no wrist or cuffless devices); targets and alert rules from the obstetrician; fixed warning-symptom text (headache, visual disturbance, upper abdominal pain, swelling) that says contact the maternity unit now | ✔ (opt-in) | ✔ | ✔ | auto |
| `pregnancy.weight_gain` | Weight trend; the gain range for the pre-pregnancy BMI (IOM 2009) appears only if her doctor switches it on, as that doctor's target (ADR-0012 exception 1) | opt-in | ✔ | ✔ | auto |
| `pregnancy.glucose` | Glucose with contexts for gestational diabetes; targets from the doctor (ADA/NICE ranges are the doctor's reference, never family defaults) | opt-in | ✔ | ✔ | clinician / GDM |
| `pregnancy.movements` | "My baby's movements feel reduced" button → fixed text: contact your maternity unit today, don't wait; optional movement-pattern notes. **No kick-count targets** (RCOG/NICE) | opt-in (button) | ✔ | ✔ (events) | auto from 24 weeks |
| `pregnancy.supplements_vaccines` | Folic acid, iron, calcium reminders as prescribed; tetanus (TT/aTd per country pack) and other recommended vaccines | — | ✔ | ✔ | auto |
| `pregnancy.symptoms` | Nausea, bleeding, pain, swelling, mood log; danger-sign content | — | ✔ | ✔ | auto |
| `pregnancy.documents` | Pregnancy record card, scans, test results | — | ✔ | ✔ | auto |
| `pregnancy.birth_plan` | Birth plan, hospital bag checklist, contacts and transport plan | — | ✔ | if shared | offer |
| `pregnancy.birth` | "Baby is born" → creates the newborn (§3) with birth data, links mother as guardian, starts postpartum | — | ✔ | ✔ | auto |
| `postpartum.core` | Mother's BP and recovery checks, bleeding and wound notes, postnatal visits (Sri Lanka: PHM visits within 10 days, days 11–28, days 38–42), breastfeeding support content | opt-in | ✔ | ✔ | auto 0–6 weeks (extendable to 12 months) |
| `postpartum.mood` | Mood check-ins; EPDS assigned by the doctor or midwife (scores visible to clinicians) | ✖ | ✔ | ✔ | clinician |
| `pregnancy.loss_support` | Ends all pregnancy content at once, gentle follow-up text, optional support contacts | — | ✔ | ✔ | auto on loss |

**Privacy:** every pregnancy, postpartum and pregnancy-loss module is `reproductive_health` and teen-confidential 🔒T. Family admins see pregnancy data only if the mother shares it. "opt-in" in the H column means the hub shows it only after she turns on "Show my pregnancy on the hub" (consent `hub_display`, ADR-0011); hub BP and weight readings taken without the opt-in are stored as ordinary vitals. **A pregnant 16–17-year-old:** her guardians see no trace of the pregnancy — not the modules, nor the BP readings, visits, vaccines or documents recorded in them — and only her own consent can put it on the hub. **Under 16:** a clinician records the pregnancy and the safeguarding pathway starts (`CLINICAL_SAFETY.md` §4.2). **Without an obstetrician on the platform** (care at the MOH clinic): the default safety net applies (HZ-04) and she can add her clinic and midwife as external contacts.

---

## 10. Specially-abled members (overlay `special_needs` + condition packs)

### 10.1 For every special-needs member
| Code | Function | H | A | D | Default |
|---|---|---|---|---|---|
| `sn.care_profile` | Communication passport (how I communicate, what helps, what upsets me), sensory profile, mobility and equipment, eating/drinking needs, emergency care plan, consent/capacity notes | — | ✔ | ✔ | auto with overlay |
| `sn.care_team` | Therapists (speech, OT, physio, psychologist), special-education teacher (view-only grant), carers — scoped access | — | ✔ | ✔ | auto |
| `sn.therapy_log` | Sessions, goals and home-practice tasks set by therapists; progress notes | — | ✔ | ✔ | auto |
| `sn.visual_schedule` | Picture-based daily routine on the hub ("brush teeth → breakfast → bus"), timers, first/then boards, transition warnings; set up by carers in the app | ✔ | ✔ (editor) | — | offer |
| `sn.behaviour_log` | ABC entries (antecedent → behaviour → consequence), triggers (noise, light, routine change, pain), intensity and duration; weekly patterns for the clinician | — (app quick log; never on the hub) | ✔ | ✔ | offer |
| `sn.sleep_diary` | Two-week sleep/wake diary format (bedtime, sleep onset, wakings, wake time) | — | ✔ | ✔ | offer |
| `sn.equipment` | Wheelchairs, hearing aids, AAC devices, orthoses: maintenance and replacement reminders, warranty docs | — | ✔ | — | offer |
| `sn.school_plan` | Individual education plan, school reports, accommodations (documents) | — | ✔ | if shared | offer |
| `sn.simple_mode` | Simplified, symbol-supported UI on hub and app; voice prompts; high contrast | ✔ | ✔ | — | offer |

### 10.2 Condition packs (offered when a clinician records the condition)
| Pack | Adds | Notes |
|---|---|---|
| **Autism** (`sn.autism`) | Behaviour log with sensory triggers, sleep diary, food selectivity log, routine and transition supports (on the hub only through the visual schedule), communication preferences, meltdown plan for carers | No scoring; measures before/after interventions shown to clinicians (NICE CG170 approach) |
| **Down syndrome** (`sn.down_syndrome`) | **Health-supervision checklist** with reminders (thyroid at newborn, 6 and 12 months then yearly; hearing every 6 months until normal then yearly; eye checks; cardiac echo at birth; sleep study at 3–4 years; blood count yearly from 1 year — ⚠ confirm against AAP 2022 primary text); **Down syndrome-specific growth charts** (CDC 2015) selectable by the doctor | Doctor chooses chart set; family view stays neutral |
| **Cerebral palsy** (`sn.cerebral_palsy`) | GMFCS level recorded by the clinician (licence needed for embedded tools), equipment, positioning and pressure-care reminders, feeding/swallowing notes, seizure diary if relevant, therapy goals | |
| **Epilepsy** (`sn.epilepsy`) | **Seizure diary** (date, time, type, awake/asleep, duration, warning signs, triggers, recovery, rescue medicine, hospital visit); rescue-medicine plan; optional seizure-alarm device events; alert rule "seizure > N minutes" set by the doctor | Hub one-tap "Seizure started" timer for carers |
| **ADHD** (`sn.adhd`) | Routine supports, medication timing and side-effect notes, school feedback, sleep | |
| **Intellectual disability** (`sn.intellectual_disability`) | Simple mode, supported decision-making notes, carer handover, health-check reminders | |
| **Visual impairment** (`sn.visual`) | Screen-reader-first app, voice prompts on hub, large-print ICE card | |
| **Hearing impairment** (`sn.hearing`) | Visual alerts on hub, captioned content, hearing aid reminders | |
| **Physical disability** (`sn.mobility`) | Pressure-injury skin checks, transfers and equipment, accessible-route notes, bladder/bowel routines (private) | |

---

## 11. Chronic-care programmes (overlay `programme`, enrolled by a clinician)

| Code | Adds |
|---|---|
| `prog.hypertension` | HBPM week mode (7 days × 2 morning + 2 evening, day 1 discarded) from Cure Home; morning/evening reminders; validated cuffs only for targets |
| `prog.diabetes` | Glucose regimen (1–7 tests/day), HbA1c entries, foot check and eye check reminders, hypo log |
| `prog.heart_failure` | Daily morning weight, symptom check (breathlessness, swelling), weight-trend rule set by the doctor (server-side) |
| `prog.asthma_copd` | Peak flow, inhaler use, action plan zones from the doctor's plan document |
| `prog.ckd` | BP, weight, fluid notes, lab results (eGFR, potassium) |

---

## 12. Family and hub utilities

| Code | Function | H | A |
|---|---|---|---|
| `util.family_dashboard` | Per member: done today / due (no values without a grant) | ✔ | ✔ |
| `util.calendar` | Family calendar (visits, vaccines, school, Poya days and public holidays as data) | ✔ | ✔ |
| `util.board` | Family notes ("Took Amma's BP ✓") with presets on the hub | ✔ | ✔ |
| `util.weather` | Weather, rain and heat alerts (heat matters for elders and infants) | ✔ | — |
| `util.guest` | Guest measurement, not stored unless claimed by QR | ✔ | ✔ (claim) |
| `util.timers` | Cooking, medicine, nebuliser timers | ✔ | — |

---

## 13. What the doctor gets per module (doctor console)

| Module family | Doctor view |
|---|---|
| Vitals and programmes | Trends vs targets, 7-day averages, adherence, source/validation markers, exclude unvalidated sources |
| Growth | WHO / CDC / Down syndrome charts with z-scores and percentiles, velocity, corrected age for preterm, faltering highlights (doctor only) |
| Immunisation | Full record, verification queue, catch-up planner |
| Development | Milestone answers by age, questionnaire scores (licensed tools), referral notes |
| Pregnancy | Gestational timeline, BP/weight/glucose vs obstetric targets, reduced-movement events, ANC attendance |
| Women's health | Cycle summaries (if shared), menopause symptom trends |
| Elder | Falls timeline, check-in adherence, medication list with Beers flags, cognition questionnaires, location events (if shared) |
| Special needs | Behaviour and sleep patterns, seizure diary statistics, therapy goals, equipment |
| Everything | Targets, alert rules, notes (care-team only or shared), "Mark reviewed", questionnaires, module activation |

---

## 14. Licences and clinical sign-off before release

| Item | Action |
|---|---|
| WHO growth tables (commercial software) | Request WHO permission |
| M-CHAT-R/F | Licence |
| GMFCS-E&R | Licence |
| EPDS, PHQ-9, GAD-7, STEADI | Confirm terms per instrument |
| CDC milestone checklists | Check reuse terms or link to the CDC app |
| Sri Lanka schedules (immunisation, vitamin A, deworming, ANC, postnatal, Well Woman) | Confirm with Epidemiology Unit / FHB documents; clinical sign-off |
| All fixed texts (danger signs, fever red flags, reduced movements, SOS) | Clinical safety officer approval; Sinhala/Tamil by native-speaking clinicians |
