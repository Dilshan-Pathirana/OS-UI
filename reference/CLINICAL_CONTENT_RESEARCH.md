# Reference: clinical content for life-stage modules

*Research run 22 Oct 2026. Every fact has its source. ⚠ = not verified or needs confirmation. This file feeds `docs/01-product/MEMBER_MODULES.md` and `packages/module-catalogue`. Nothing here is clinical advice. Every item a family sees goes through clinical sign-off first (`docs/03-compliance/CLINICAL_SAFETY.md`).*

**Gaps in this research.** Some NICE and PMC pages blocked fetching. Several Family Health Bureau (FHB) PDFs are scanned images whose text could not be read. The search budget ran out before the last few ⚠ items could be checked.

---

## 1. Growth

### WHO Child Growth Standards (0–5 years)
- **Indicators:**
  - Core: length/height-for-age, weight-for-age, weight-for-length/height, BMI-for-age, head circumference-for-age.
  - Also: arm circumference-for-age (MUAC), subscapular and triceps skinfold-for-age, motor development milestones.
  - Velocity: weight, length and head circumference.
  - Source: https://www.who.int/tools/child-growth-standards/standards
- **Downloads** (weight-for-age example):
  - Charts (PDF) for 0–6 months, 0–2 years, 6 months–2 years, 2–5 years and 0–5 years.
  - z-score and percentile tables (PDF and Excel) for 0–13 weeks and 0–5 years.
  - Simplified field tables, and expanded tables for national health cards (XLSX).
  - Source: https://www.who.int/tools/child-growth-standards/standards/weight-for-age
  - ⚠ Check whether the XLSX files include LMS columns.

### WHO Growth Reference (5–19 years)
- Covers height-for-age (5–19), BMI-for-age (5–19) and weight-for-age (5–10 only).
- Tables come as PDF and expanded XLSX, with computation instructions. WHO warns that some file links are mislabelled, so check the contents of each file.
- Source: https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/height-for-age

### Licence for software use
- The growth pages state no specific licence. WHO's site terms allow extracts "for research or private study". Commercial use, or substantial reproduction, needs **explicit prior written authorisation** and attribution to WHO.
  - https://www.who.int/about/policies/terms-of-use
  - Permission request form: https://www.who.int/about/policies/publishing/permissions
- WHO's `anthro` R package is GPL-3.0 and computes z-scores for 8 indicators. The standards data is in `data-raw/growthstandards`. https://github.com/WorldHealthOrganization/anthro
- **Action:** Cure Global is commercial, so request WHO permission before shipping the tables (tracked as decision D-9 in `RISKS_AND_DECISIONS.md`).

### CDC (US)
- CDC recommends the WHO standards from birth to 2 years, then the CDC charts for 2–20 years (MMWR Recomm Rep 2010;59(RR-9)). https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/who-using.html
- The CDC 2000 LMS files are downloadable as XLS/CSV. ⚠ The page makes no public-domain statement. https://www.cdc.gov/growthcharts/cdc-data-files.htm
- **Extended BMI-for-age (Dec 2022):**
  - For ages 2–20 with BMI above the 97th percentile.
  - Adds the 98th, 99th, 99.9th and 99.99th percentiles, plotting up to BMI 60.
  - Severe obesity is ≥120 % of the 95th percentile or ≥35 kg/m².
  - Source: https://www.cdc.gov/growth-chart-training/hcp/extended-growth-charts/

### Down syndrome growth charts
- CDC charts, based on Zemel et al., Pediatrics 2015. Page published May 2024, reviewed 19 Nov 2024. https://www.cdc.gov/birth-defects/hcp/down-syndrome-growth-charts/
  - Birth–36 months: weight, length, head circumference, weight-for-length.
  - 2–20 years: weight, height, head circumference.
  - Percentiles 5th–95th only. The sample is 637 children, mostly from Philadelphia.
  - Available as PDFs only.
- AAP 2022, as summarised by a secondary source: use the Down syndrome BMI chart through age 10, then the CDC BMI charts. https://childrenswi.org/-/media/chwlibrary/files/medical-care/down-syndrome-clinic/down_syndrome_english.pdf

---

## 2. Immunisation

### Sri Lanka National Immunization Programme (as presented in the NIS 2025 report, 18 Aug 2025)
Source: https://www.epid.gov.lk/storage/post/pdfs/en_68a7e565a6832_FINAL%20NIS%202025%20Report%20-%2018.08.2025_compressed.pdf

| Age | Vaccine |
|---|---|
| Birth (0–4 weeks, before discharge) | BCG ⚠ confirmed only from the 2007 schedule: http://old.epid.gov.lk/web/attachments/article/138/Immunization_Schedule.pdf |
| 2 months | Pentavalent (DTP-HepB-Hib) 1 + OPV 1 + fIPV 1 |
| 4 months | Pentavalent 2 + OPV 2 + fIPV 2 |
| 6 months | Pentavalent 3 + OPV 3 |
| 9 months | MMR 1 |
| 12 months | Live JE ⚠ from WER 2010: https://www.epid.gov.lk/storage/post/pdfs/vol_37_no_19_english.pdf |
| 18 months | DTP 4 + OPV 4 |
| 3 years | MMR 2 |
| 5 years | DT + OPV 5 |
| Grade 6 (girls) | HPV, 2 doses 6 months apart. ⚠ Sources state the age differently ("Grade 6, age 10", "completed 12 years or grade six", "completion of 10 years"); use **Grade 6** |
| 11 years | aTd |
| Pregnancy | Tetanus toxoid (TT) by pregnancy number and dose history. Older schedule: TT1 after 12 weeks in the first pregnancy, TT2 6–8 weeks later, then one dose per later pregnancy up to 5 |

**History of changes:**
- IPV at 4 months, intramuscular, from 4 Jul 2015. https://www.epid.gov.lk/storage/post/pdfs/en_6412a93e63e8f_inactivated_polio_vaccine.pdf
- Switched to intradermal fIPV 0.1 mL at 2 and 4 months from 15 Jul 2016. https://www.epid.gov.lk/storage/post/pdfs/vol_43_no_28-english.pdf
- Trivalent OPV replaced by bivalent OPV in Apr 2016. https://www.epid.gov.lk/storage/post/pdfs/vol_46_no_01-english.pdf
- Quadrivalent HPV introduced in 2017, for girls only. https://www.epid.gov.lk/storage/post/pdfs/vol_44_no_43-english.pdf
- HPV vaccine shortage 2022–24, followed by catch-up from Apr 2024. https://www.gavi.org/vaccineswork/jab-hope-kindness-fuels-sri-lankas-hpv-vaccination-success

**Recommendations from the 4th National Immunization Summit (28 Mar 2025).** None of these has an implementation date yet (NIS 2025 report). The January 2026 WER reports no decisions. https://www.epid.gov.lk/storage/post/pdfs/en_69b4f96b72152_Vol_53_no_02-english.pdf
- **Polio:** bOPV at 2, 4 and 6 months plus fIPV at 4 and 9 months was the preferred option, with hexavalent vaccine later.
- **Measles:** MCV1 stays at 9 months; moving MCV2 to 18 months is under review.
- **HPV:** stays at 2 doses; vaccinating boys is not recommended.
- **Tetanus:** TT to be replaced by aTd, including in pregnancy.
- **Pneumococcal:** PCV "could be considered"; the adult pneumococcal vaccine "should be further assessed".
- **Not recommended for routine use now:** rotavirus, RSV, meningococcal and dengue.
- **Design implication:** keep the schedule as versioned data, and let the super admin activate a new version when the Epidemiology Unit announces one.
- **Adults:** influenza and adult pneumococcal vaccines are not in the national programme.

### WHO global fallback (Table 1, December 2025)
Source: https://cdn.who.int/media/docs/default-source/immunization/immunization_schedules/immunization-summary-table-1.pdf

**For all programmes:**
- BCG.
- HepB, with a birth dose within 24 h.
- Polio, with at least 2 IPV doses.
- DTP: 3 primary doses plus boosters at 12–23 months, 4–7 years and 9–15 years.
- Hib, PCV and rotavirus.
- Measles (2 doses) and rubella.
- HPV for girls aged 9–14, with a single-dose off-label option for ages 9–20; boys are a secondary target.
- RSV, as a maternal vaccine at ≥28 weeks or an infant monoclonal antibody.

**For some regions or groups:**
- JE in certain regions.
- Influenza for priority groups, including pregnant women and older adults.
- Tetanus in pregnancy depends on dose history.

---

## 3. Sri Lanka Child Health Development Record (CHDR)

From a university SOP (secondary source, Apr 2026): https://med.uwu.ac.lk/wp-content/uploads/2026/06/sop1-growth-charts-Public-Health-final-11.pdf
- **CHDR charts:** weight-for-age 0–5 years, length-for-age 0–2 years, height-for-age 2–5 years, BMI-for-age 2–20 years, head circumference 0–3 years, weight-for-height 0–5 years.
- Weight-for-age uses colour zones (green, light green, purple, orange, red).
- Growth faltering means inadequate or no gain over 2 consecutive weighings, or any weight loss.
- Preterm babies use separate preterm charts.

FHB holds the following documents. ⚠ Their contents were not read, so exact vitamin A and deworming ages are unverified.
- CHDR circular 01-20/2022, the 2016 preterm growth chart guideline, the 2024 vitamin A megadose amendment, and deworming guidelines 2019–2022: https://fhb.health.gov.lk/technical-units/child-nutrition
- Development screening guideline 2020, autism identification and management guidelines 2023, and care pathways for developmental disabilities: https://fhb.health.gov.lk/technical-units/child-care-development

**Cure Global note:** the CHDR uses colour zones. The family view deliberately does not (ADR-0012). Doctors see z-scores and can turn on the national chart's interpretation for a child if they want it.

---

## 4. Development

- **CDC milestone checklists** cover 2, 4, 6, 9, 12, 15 and 18 months, and 2 years, 30 months, 3, 4 and 5 years. They are "not a substitute for standardized, validated developmental screening tools". https://www.cdc.gov/act-early/milestones/index.html
- **2022 revision:** milestones are now set at what at least 75 % of children achieve (previously 50 %). The 15- and 30-month checklists were added and the "warning signs" removed. https://www.cdc.gov/ncbddd/actearly/hcp/HCP-PPT-Presentation_FINAL_CLEARED_Updated-1.19.24.pdf
- **AAP schedule:** developmental surveillance at every well-child visit; general screening at 9, 18 and 30 months; autism-specific screening at 18 and 24 months. "Screening tools do not… result in diagnoses." https://www.cdc.gov/autism/hcp/diagnosis/screening.html
- **USPSTF:** evidence is insufficient for universal autism screening (same page).
- **M-CHAT-R/F is copyrighted.** Distributing it in software needs a licence from Diana Robins, and the items may not be altered. https://mchatscreen.com/
- **CDC milestone content:** ⚠ check the reuse terms before embedding the checklists. Linking to the CDC Milestone Tracker app is a safe alternative.

---

## 5. Pregnancy

### Antenatal care
- **WHO 2016:** 8 contacts — the first at ≤12 weeks, then 20, 26, 30, 34, 36, 38 and 40 weeks. https://www.who.int/news/item/07-11-2016-new-guidelines-on-antenatal-care-for-a-positive-pregnancy-experience
- **Sri Lanka (WER 2014):** https://www.epid.gov.lk/storage/post/pdfs/vol_41_no_24-english.pdf
  - Antenatal: 9 clinic visits for a low-risk pregnancy, at least 3 home visits by the Public Health Midwife (PHM), and booking ideally before 8 weeks. Screening covers BMI, haemoglobin, VDRL and blood group/Rh.
  - Postpartum: at least 4 PHM visits (2 within 10 days, 1 at days 11–28, 1 at days 38–42) plus a clinic visit that includes EPDS screening.
- ⚠ The 2023 FHB maternal care manual is a scanned PDF and was not read: https://fhb.health.gov.lk/technical-units/maternal-care
- ⚠ WHO 2022 postnatal contact timing was not verified.

### Blood pressure
- **USPSTF (Sept 2023, grade B):** measure BP throughout pregnancy. https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations
- **NHS England:** https://www.england.nhs.uk/long-read/recommendations-for-digital-blood-pressure-monitoring-in-maternity-services/
  - Monitors must be validated for pregnancy and pre-eclampsia, using the BIHS or STRIDE BP lists (the two lists differ).
  - Cuffless devices are not recommended.
  - Trials of self-monitoring showed no change in outcomes and no safety issue.
  - Users should get a factsheet on warning symptoms.
- **STRIDE BP** lists devices validated for adults, children and pregnancy: https://stridebp.org/about-us

### Weight gain (Institute of Medicine, singleton pregnancy)
Source: https://www.cdc.gov/maternal-infant-health/pregnancy-weight/index.html

| Pre-pregnancy BMI | Total gain |
|---|---|
| < 18.5 | 28–40 lb (12.5–18 kg) |
| 18.5–24.9 | 25–35 lb (11.5–16 kg) |
| 25–29.9 | 15–25 lb (7–11.5 kg) |
| ≥ 30 | 11–20 lb (5–9 kg) |

### Fetal movements
- **RCOG Green-top Guideline 57:** "insufficient evidence to recommend formal fetal movement counting using specified numbers"; women should report any reduction in movements. https://opqic.org/bjog-reduced-fetal-movements-green-top-guideline-no-57/
- **NICE NG201 evidence review:** formal counting showed no benefit; services should respond promptly to concerns from 24 weeks. https://nice.org.uk/guidance/ng201/documents/evidence-review-21
- **Design:** a "My baby's movements feel reduced" action that shows fixed contact-now text. No kick-count targets.

### Gestational diabetes
- **ADA targets:** fasting < 95 mg/dL, 1 h after a meal < 140, 2 h after a meal < 120; A1C < 6 %. https://professional.diabetes.org/sites/dpro/files/2025-04/glucosemonitoringduringpregnancy-professional-2025.pdf
- **NICE NG3** (via ABCD): https://www.bjd-abcd.com/index.php/bjd/article/download/80/172?inline=1
  - Targets: fasting < 5.3 mmol/L, 1 h after a meal < 7.8 mmol/L. ⚠ The 2 h target was not checked.
  - Testing: 7 times a day on multiple daily injections; fasting plus 1 h after meals if not on insulin.
- In Cure Global these are **doctor-set targets**, never defaults shown to the family.

---

## 6. Menstrual and adolescent health

- **ACOG Committee Opinion 651 (Dec 2015):** clinicians should treat the menstrual cycle as "an additional vital sign". Median age at menarche is about 12–13. https://pubmed.ncbi.nlm.nih.gov/26595586/
  - ⚠ Normal ranges and reaffirmation status not verified.
- **Privacy lessons:**
  - FTC v. Flo Health (2021): the app shared pregnancy events with third parties. https://www.ftc.gov/node/48635
  - After Dobbs, most femtech apps fall outside HIPAA, and the data can be subpoenaed. https://jtip.law.northwestern.edu/2023/04/19/the-femtech-problem-how-dobbs-shifted-the-data-privacy-landscape-for-period-tracking-apps/
- **Design (Cure Global):**
  - No third-party analytics on health events.
  - Sharing is opt-in, per category.
  - The data never appears on the hub.
  - It is teen-confidential.
  - Optionally, device-only storage of detailed symptom notes.
- **Adolescent confidentiality:**
  - AAP policy (Pediatrics, Mar 2026) on health IT that protects adolescent confidentiality — reproductive health, mental health and substance use: https://www.aap.org/en/news-room/news-releases/aap/2026/american-academy-of-pediatrics-supports-adolescent-right-to-confidentiality-with-use-of-electronic-health-records
  - SAHM position paper (9 Feb 2026): https://adolescenthealth.org/sahm-news/sahm-position-paper-management-of-adolescent-and-young-adult-sensitive-health-information-within-the-electronic-health-record/

---

## 7. Adults and middle age

### USPSTF screening recommendations
Source unless noted: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation-topics/uspstf-a-and-b-recommendations

| Screen | Who | Interval | Grade (year) |
|---|---|---|---|
| Hypertension | 18+ | — | A (2021) |
| Diabetes / prediabetes | 35–70 with overweight or obesity (Asian Americans: BMI ≥ 23) | Every 3 years "may be reasonable" ([source](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes)) | B (2021) |
| Statins | 40–75, with ≥1 risk factor and 10-year risk ≥ 10 % | — | B (2022) |
| Colorectal cancer | 45–49 (B), 50–75 (A) | By test | 2021 |
| Cervical cancer | 21–29: cytology every 3 years. 30–65: cytology every 3 years, or hrHPV ± cytology every 5 years | — | A (2018) |
| Breast cancer | 40–74 | Every 2 years | B (2024) |
| Lung cancer | 50–80 with ≥ 20 pack-years | Yearly low-dose CT | B (2021) |
| Osteoporosis | Women 65+, and younger postmenopausal women at risk | — | B (2025) |
| Depression | Adults, including pregnant and postpartum | — | B (2023) |

### Hypertension and NCD screening
- **WHO HEARTS 2.0:** diagnose at ≥ 140/90, or ≥ 130/80 if high risk. Use validated automated devices and average 2 readings. https://www.paho.org/sites/default/files/2026/09/hearts-20-clinical-pathwayeng.pdf
- **Sri Lanka NCD protocol (Ministry of Health, 2012):** https://extranet.who.int/ncdccs/Data/LKA_D1_NCD%20Management%20Protocol.pdf
  - Who: adults ≥ 40, and 35–40 with risk factors.
  - Checks: BMI, waist, BP, blood sugar, urine protein, total cholesterol, and the WHO/ISH risk chart.
  - Rescreen by risk: every 2 years below 10 %, yearly at 10–20 %, every 6 months at 20–30 %, every 3 months at ≥ 30 %.
- **Healthy Lifestyle Centres** target adults over 35. https://pmc.ncbi.nlm.nih.gov/articles/PMC10994285

**Cure Global use:** these feed **reminders** ("Your NCD screening is due"), with the ages and intervals stored per country pack. A family never sees a risk score; risk-chart results are entered and seen by the doctor.

---

## 8. Elders

- **Falls (CDC STEADI)** — https://www.cdc.gov/steadi/media/pdfs/steadi-pocketguide-508.pdf
  - Who: adults 65+, screened yearly or after a fall.
  - At risk if any of: fell in the past year, feels unsteady, worries about falling, or scores ≥ 4 on the Stay Independent brochure.
  - Assessments: Timed Up and Go, 30-second chair stand, 4-stage balance test, orthostatic BP, medications, vision, feet, home hazards, vitamin D.
  - Follow up in 30–90 days.
- **USPSTF on falls:** exercise for people 65+ at increased risk of falling (B, 2024).
- **Cognitive screening:** USPSTF says the evidence is insufficient for adults 65+ (I statement, 2020). https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/cognitive-impairment-in-older-adults-screening
- **Polypharmacy:** AGS Beers Criteria, 2023 update. https://healthinaging.org/medications-older-adults/medications-older-adults-should-avoid
- **Intrinsic capacity:** WHO ICOPE, 2nd edition (22 Sept 2025). https://www.who.int/publications/i/item/9789240103726
- **Fall-detection wearables:**
  - Lab averages are sensitivity ≥ 93.1 % and specificity ≥ 86.4 % (BMC Public Health 2021). Real-world evidence is lacking, and false alarms cause alarm fatigue. https://bmcpublichealth.biomedcentral.com/articles/10.1186/s12889-021-12169-7
  - On real-world falls, algorithms averaged 57 % sensitivity, with 3–85 false alarms per day. https://pmc.ncbi.nlm.nih.gov/articles/PMC3353905
- **GPS tracking in dementia:**
  - No coercion; involve the person; decide early, in structured meetings (Landau & Werner 2012). https://www.cambridge.org/core/journals/international-psychogeriatrics/article/abs/ethical-aspects-of-using-gps-for-tracking-people-with-dementia-recommendations-for-practice/07FC3213C03525779593EA1638DE82AC
  - Choose the least restrictive option (UK Mental Capacity Act 2005, s1(6)). https://www.legislation.gov.uk/ukpga/2005/9/section/1

---

## 9. Special needs

### Down syndrome (AAP; Bull et al., Pediatrics 2022)
Schedule from a secondary summary: https://childrenswi.org/-/media/chwlibrary/files/medical-care/down-syndrome-clinic/down_syndrome_english.pdf

| Check | Schedule |
|---|---|
| Thyroid (TSH) | Newborn, 6 months, 12 months, then yearly |
| Hearing | Newborn, 6 months, then every 6 months until normal, then yearly to age 21 |
| Eyes | Ophthalmologist by 6 months; every 2 years from 5 to 12 |
| Heart (echocardiogram) | At birth |
| Blood count | By day 3; iron/anaemia check yearly from 1 year |
| Sleep study | At 3–4 years |
| Coeliac disease | Only if symptoms |
| Neck instability | Symptom checks only |
| Autism screen | 18–24 months |

⚠ Confirm against the primary AAP 2022 text before the catalogue goes live.

### Other conditions
- **Autism (NICE CG170, updated 2021):** a two-week sleep/wake diary. Look at what triggers behaviour: communication, pain or GI problems, light and noise, routine changes, sensory sensitivities. Measure how often and how severe behaviour is, before and after treatment. https://docs.bvsalud.org/biblioref/2022/02/1357583/autism-spectrum-disorder-in-under-19s-support-and-management-p_ujnhqcv.pdf
- **Cerebral palsy (GMFCS-E&R):** levels I–V, assigned by a clinician. **A licence is needed for EHR or commercial integration.** https://canchild.ca/en/resources/42-gmfcs-e-r
- **Epilepsy diary fields (Epilepsy Society):** https://epilepsysociety.org.uk/sites/default/files/2025-12/SeizurediaryA4Sept2025editable.pdf
  - Per seizure: date, time, type, awake or asleep, duration, warning signs, triggers, recovery time, rescue medicine, hospital visit.
  - Also: medicine changes and side effects.

**What a family app can safely record:**
- Time-stamped observations: sleep, behaviour episodes and their triggers, seizures, medicines given.
- Classifications entered by a clinician, with the source recorded.
- Doctor-set targets and check reminders.
- No risk scores, and no unlicensed screening tools.

---

## Licences needed before shipping
| Item | Owner | Status |
|---|---|---|
| WHO growth standard and reference tables (commercial software) | WHO | Request permission |
| M-CHAT-R/F | Diana Robins / mchatscreen.com | Licence |
| GMFCS-E&R | CanChild | Licence |
| EPDS, PHQ-9, GAD-7 | Varies (PHQ and GAD are generally free to use) | ⚠ Verify each |
| CDC milestone checklists | CDC | ⚠ Check reuse terms, or link to the CDC app |
