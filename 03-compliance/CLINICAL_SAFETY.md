# Cure Global — Clinical safety

*v0.1 · 22 Oct 2026 · Clinical risk management for a platform that is designed not to diagnose but still shapes what families and doctors do. Method: ISO 14971 risk management, organised like a DCB0129 clinical safety case (UK practice, used here as good practice).*

## 1. Roles

| Role | Responsibility |
|---|---|
| **Clinical Safety Officer (CSO)** | A registered doctor; owns the hazard log; signs off catalogue releases, clinical content, alert-rule templates and every release that changes display logic |
| Clinical content reviewers | Paediatrics, obstetrics, family medicine, geriatrics, special needs; review modules in their area; native-speaker clinicians for Sinhala and Tamil texts |
| Product owner | Ensures every feature has a hazard assessment before build |
| Engineering lead | Implements risk controls, keeps traceability (hazard → control → test) |

## 2. Process

1. **Hazard identification** for every new module, metric, schedule, alert template and screen that shows health data (workshop with CSO + reviewers).
2. **Risk estimation** (severity × likelihood, 5×5 matrix) before and after controls.
3. **Controls** in priority order: design (eliminate) → protective measures (warnings, confirmations) → information (labels, training).
4. **Verification:** each control has a test (unit/vector, e2e, usability) referenced in the hazard log.
5. **Release sign-off:** CSO approves the clinical safety case update; catalogue releases cannot go `active` without it (enforced in the admin console).
6. **Post-market surveillance:** incident reports from families and doctors, alert-acknowledgement metrics, attribution audits, complaints → hazard log review monthly.

## 3. Hazard log (starter)

| ID | Hazard | Cause | Harm | Controls | Verification |
|---|---|---|---|---|---|
| HZ-01 | Reading attributed to the wrong person | Shared devices; proxy chooser error; face mismatch | Wrong clinical decisions | Attribution engine (Cure Home), inbox for uncertain readings, proxy chooser confirmation with photo/name, plausibility vs person's history, doctor sees `identified_by` | Attribution table tests; audited sample ≥ 98 % correct in pilot |
| HZ-02 | Family reassured by "Within your target" when target is outdated | Target set long ago | Delayed care | Target shows "set by Dr X on date"; targets older than 12 months flagged to the doctor's worklist | Unit tests; worklist e2e |
| HZ-03 | Family alarmed or misled by population thresholds | Thresholds shown without context | Anxiety, wrong self-treatment | No population thresholds on family surfaces (ADR-0012), except clinician-enabled references and the §4.1 safety-net register; neutral growth curves | Display-rule tests; design review |
| HZ-04 | Missed urgent pregnancy BP | Alert not configured or not seen; **no obstetrician on the platform** (most Sri Lankan pregnancies are followed by the MOH clinic and the PHM midwife) | Maternal/fetal harm | An obstetrician on the care team sets targets/attention levels or explicitly declines. **Without one** (or until they do, 7 days at most): the CSO-approved default safety net applies — severe-range readings (systolic ≥ 160 or diastolic ≥ 110, ⚠ CSO to confirm) show the pregnancy BP safety-net text and notify the family admins she chose; the app asks her to add her clinic and midwife as an external contact (§4.1). Fixed warning-symptom text always visible; "not monitored 24/7" disclosure | Alert e2e incl. the no-doctor path; usability with pregnant women |
| HZ-05 | Reduced fetal movements not acted on | Mother waits for kick-count targets | Stillbirth risk | No kick-count targets; "Reduced movements" button shows contact-now text; event appears on the obstetrician's worklist | Content review; e2e |
| HZ-06 | Wrong vaccine due date | Wrong DOB precision; schedule version error | Missed/duplicate vaccination | DOB precision handling; schedule versioning with CSO sign-off; parent-entered doses unverified until checked | Schedule vectors per country pack |
| HZ-07 | Growth chart misread | Wrong sex, unit or reference (preterm, Down syndrome) | Missed faltering / unnecessary worry | Sex and reference shown on chart; corrected age for preterm; doctor selects special charts; units fixed in storage | Growth vectors vs WHO anthro outputs |
| HZ-08 | False reassurance from wearable readings | Cuffless BP/SpO₂ inaccuracy | Missed hypertension/hypoxia | "Estimated" tier; excluded from targets by default; pregnancy blocks cuffless/wrist BP | Provenance tests |
| HZ-09 | Missed elder check-in or fall not escalated; **false reassurance from a passive check-in** | Push not delivered; phone off; a face seen in passing (or misidentified, HZ-01) counted as "I'm OK" | Injury, death | Check-in needs an explicit "I'm OK" (tap on hub or app, or the hub's voice prompt) — presence alone never counts; escalation chain (push → next carer → SMS → emergency contact), acknowledgement required, delivery monitoring, test-alert feature | Synthetic escalation tests in production (daily); e2e: face without tap → no check-in |
| HZ-10 | Medication schedule error | Free-text frequency mis-parsed | Over/under-dosing | Structured times confirmed by the person/doctor; no dose calculations; "as prescribed" wording | Schedule tests |
| HZ-11 | Seizure duration alert delayed | Carer starts timer late | Status epilepticus | Hub one-tap timer; doctor-set rescue-plan text; alert threshold from the doctor | e2e |
| HZ-12 | Teen confidential data disclosed to guardian | Access bug; export path | Psychological/social harm | Policy function single source; access matrix tests across all export paths | Matrix tests incl. FHIR/PDF/notifications |
| HZ-13 | Location data enables abuse | Controlling family member | Physical harm | Location consent; safety-concern flow; audit and notice on location requests | DPIA; e2e |
| HZ-14 | Implausible value accepted | Typo, unit confusion (°F/°C, lb/kg) | Wrong decisions | `plausible` ranges from the catalogue (twin TS/Python with shared vectors); "? Check this reading" with a unit hint — **only** for impossible values and unit mix-ups | Clinical vectors |
| HZ-18 | A real, dangerous value is dismissed as a device error | "? Check this reading" shown for possible but extreme values (SpO₂ 82 %, glucose 45 mg/dL, infant pulse 65) | Missed hypoxia, hypoglycaemia, deterioration | `urgent` bands in `metrics.yaml`: the value is stored and shown as measured, with the metric's fixed safety-net text (§4.1: measure again now; if the same or unwell, call 1990 / go to hospital); never "? Check this reading"; urgent worklist item for the care team; urgent bands and texts CSO-approved | Clinical vectors per urgent band; e2e on hub and app |
| HZ-19 | Pregnancy in a child is handled as a routine record | Self-entry or a guardian recording a pregnancy for a girl under 16 | Missed safeguarding; disclosure | Only a clinician on her care team can record a pregnancy episode under `digital_consent_age`; this starts the safeguarding pathway (§4.2) | Matrix + API tests |
| HZ-15 | Clinical content outdated | Guidelines change | Wrong advice | Content items with review dates; yearly review; country-pack versioning | Admin reminders |
| HZ-16 | Doctor acts on data outside their competence | Scope too broad | Wrong advice | Care-team role defaults; categories per role | Matrix tests |
| HZ-17 | Platform downtime during an emergency | Outage | Delayed help | Clear messaging that the platform is not an emergency service; national number shown offline on hub and app; offline-capable SOS on hub (local alarm + SMS when the network returns) | Chaos tests |

## 4. Content rules
- Fixed texts for danger signs, fever red flags in infants under 3 months, reduced fetal movements, pregnancy BP warning symptoms, SOS, check-in misses: written by clinicians, reviewed by the CSO, translated by native-speaking clinicians, versioned.
- No dosing advice on family surfaces.
- No condition names in notifications.
- Every content item cites its source and review date in the admin console.

### 4.1 Safety-net texts (the only population thresholds families see — ADR-0012 exception)
A short, closed register of CSO-approved texts. Each says **what to do**, never what the value means, and each has a hazard id and vectors.

| Text id | Trigger | Says (en, draft) | Hazard |
|---|---|---|---|
| `safety.urgent_reading.<metric>` | A value in the metric's `urgent` band (`metrics.yaml`) | "This reading is very low/high. Measure again now. If it is the same, or {name} is unwell, call 1990 or go to the nearest hospital." | HZ-18 |
| `safety.infant_fever` | Temperature ≥ 38 °C in a baby under 3 months (static rule shipped with `infant.fever_watch`, not a configurable threshold) | "Babies under 3 months with a temperature of 38 °C or more need a doctor today." + danger signs | HZ-03, HZ-18 |
| `safety.pregnancy_bp` | Severe-range pregnancy BP without a clinician's attention level (HZ-04) | "Measure again after 15 minutes of rest. If it is still this high, go to the maternity unit today. If you have headache, vision changes or pain under the ribs, go now or call 1990." | HZ-04 |
| `safety.reduced_movements` | "Reduced movements" button | "Contact your maternity unit now. Don't wait until tomorrow." | HZ-05 |

External contacts: a person's clinic, MOH office or midwife (PHM) can be stored as **external care contacts** (name, place, phone; no platform login). Safety-net texts show the person's own external contact before the national number when one exists.

### 4.2 Safeguarding pathway
Triggers: a pregnancy recorded for a girl under 16 (HZ-19); a clinician's safeguarding concern; a family member's safety concern about location tracking (HZ-13).
1. The record is restricted to the recording clinician and the CSO-designated safeguarding lead; guardians and grants are suspended for the affected modules pending review.
2. The clinician follows national child-protection procedures (Sri Lanka: National Child Protection Authority, hotline 1929 ⚠ verify; police 119). The platform records that the pathway was started, not the content of the referral.
3. Access is reopened only by the clinician's documented decision, which is audited.

## 5. Clinical safety case (deliverable)
`docs/03-compliance/clinical-safety-case/` (created in Phase 1): scope and intended purpose, system description, hazard log export, risk acceptability, outstanding risks, CSO statement per release.
