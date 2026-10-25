# Cure Global — Clinical safety case v1 (draft)

*v1.0-draft · 23 Oct 2026 · E14-09 · Status: **DRAFT — not signed**. This draft was assembled by engineering from the hazard log, the code and the tests as built; every risk estimate below is a proposal for the Clinical Safety Officer (CSO) to confirm, change or reject. Nothing here is a clinical judgement until the CSO signs §9.*

Method: ISO 14971:2019 risk management, laid out like a DCB0129 clinical safety case (UK practice, used as good practice — `CLINICAL_SAFETY.md`). Inputs: the hazard log (`CLINICAL_SAFETY.md` §3), the safety-net register (§4.1), the safeguarding pathway (§4.2), the regulatory position (`STANDARDS_AND_REGULATIONS.md` §1) and the hazard → test trace produced by `scripts/hazard_coverage.py`.

`CLINICAL_SAFETY.md` §5 names a folder, `docs/03-compliance/clinical-safety-case/`, for this deliverable. **This file is v1 of the case.** The folder can hold later exports (a signed PDF per release, hazard-log snapshots, CSO statements per release); it isn't created yet.

---

## 1. Scope and intended purpose

**In scope:** the Cure Global platform as built on 23 Oct 2026. That means the API (`services/api`), the worker, the Family Hub on Cure Global (`apps/hub-ui`, `services/hub-core`), the doctor console (`apps/doctor-web`), the Super Admin console (`apps/admin-web`) and the module catalogue (`packages/module-catalogue`). It covers the clinical content these surfaces show: the safety-net texts, the alert templates, the schedules and the growth references.

**Out of scope for v1** (each needs its own case update before release):
- the Android app (`apps/mobile`, wave 6 — not yet rebuilt on Cure Global);
- GPS / Traccar location features (R2, being built);
- programmes, the HMS connector and the FHIR read API (R3);
- bundled BLE peripherals as devices in their own right (manufacturer's responsibility; peripheral catalogue tracks NMRA status).

**Intended purpose (draft, from `STANDARDS_AND_REGULATIONS.md` §1):**

> Cure Global lets families record, store, view and share personal health information. It lets the doctors they choose view that information, set personal targets and alert rules, and send messages. Family-facing parts (app, Family Hub) store and display information, compare readings with targets the person's own doctor set, deliver alerts defined by that doctor or by the family's safety settings, and show a small set of fixed safety-net texts. They do not diagnose, triage or recommend treatment.

**Intended users:**
- families, including elders with low literacy and speakers of Sinhala or Tamil, parents, pregnant and postpartum women, teens from 13, and carers abroad;
- doctors and allied professionals on a care team;
- platform staff (no clinical use).

**Use environments:** the home with a shared Family Hub, the person's phone, and the clinic (doctor console).

**Not intended for:**
- emergency response or continuous monitoring ("not monitored 24/7" disclosure, `safety.not_monitored_24_7`);
- diagnosis, triage, dosing or treatment advice on family surfaces (ADR-0012).

**Regulatory note:** the target comparison (● ▲ !) and the physiological alerts are treated as potentially regulated functions (EU MDCG 2019-11 puts alarms for vital parameters at IIb). The decision is **D-13**: Sri Lanka first, with an NMRA categorisation letter that describes the real features. The case is therefore written to a device-grade standard for those functions.

## 2. System description (as built)

| Part | What it does that matters clinically | Docs |
|---|---|---|
| Module catalogue | Life stages, 114 modules with `teen_confidential` / `hub_safe` / `hub_opt_in` flags, metrics with LOINC/UCUM, `plausible` and `urgent` bands, schedules per country pack. Releases go staged → approved (CSO only) → active (`services/api/app/modules/catalogue.py` `approve_release`/`activate_release`; `services/api/app/api/admin.py` `approve` requires `clinical_safety_officer`) | `MODULE_ENGINE.md`, ADR-0005 |
| Records | Readings in canonical UCUM, attribution (`identified_by`, `entered_by`, `measured_for`), plausibility, urgent bands, estimated tier, target status, daily summaries (`services/api/app/records/`) | `DATA_MODEL.md` §5, §11 |
| Access policy | One policy function for every path, including teen confidentiality, the hub rules, the safeguarding hold and the safety-concern restriction (`services/api/app/consent/policy.py`, `service.py`) | `ACCESS_CONTROL.md`, ADR-0006, ADR-0011 |
| Alerts | Server-side rules (urgent band, doctor thresholds, pregnancy BP + CSO default, seizure duration, missed check-in, missed readings, inactivity, reduced movements, SOS), the escalation chain, notifications with fixed texts, and the daily synthetic test (`services/api/app/alerts/`, `services/api/app/notifications/`) | `API_DESIGN.md` §8 |
| Maternity, child, elder | The pregnancy safety net and safeguarding hold (`services/api/app/maternity/`); growth with corrected age, immunisations, milestones (`services/api/app/child/`); daily check-in and SOS (`services/api/app/safety/`) | `MEMBER_MODULES.md` |
| Family Hub | The proxy chooser, check-in by explicit tap, SOS with an honest offline outcome, neutral charts (`apps/hub-ui`), the attribution engine and the offline outbox (`services/hub-core`) | `docs/cure-home/*` |
| Doctor console | Worklist ordered by urgency, member chart with targets band and attention line, targets editor, immunisation verification (`apps/doctor-web`) | `FEATURES_BY_ENTRY_POINT.md` |
| Shared chart logic | Status words from the person's own targets; `check` only for impossible values (`packages/charts-core/src/status.ts`); plausibility/target/unit twins in TS and Python with shared vectors (`packages/clinical`) | DESIGN_SYSTEM §2 |

## 3. Clinical risk management process

The process follows `CLINICAL_SAFETY.md` §2:
1. Identify hazards per module, metric, schedule, alert template and screen.
2. Estimate risk before and after controls (§4 matrix).
3. Apply controls in priority order: design → protective measures → information.
4. Verify every control with a test that names the hazard id (TEST_STRATEGY.md §4).
5. CSO sign-off per release; catalogue releases cannot go `active` without CSO approval (enforced in code, §2).
6. Post-market surveillance through incident reports, alert-acknowledgement metrics, attribution audits and a monthly hazard-log review.

**Traceability tooling (new in v1):**
- `scripts/hazard_coverage.py` lists hazard → test files.
- CI runs `python scripts/hazard_coverage.py --baseline scripts/hazard_coverage_baseline.txt`. It fails on a hazard that is neither tested nor in the baseline. It also fails on a baseline line that is now covered.
- The baseline lists the accepted gaps with reasons. Each line is an open item in §7.

**Limit of the tooling:** the script checks that a test *names* a hazard id, not that the test is right. A wrong label counts as coverage. Three such mislabels were found (§7, item G-3). CSO review of the verification column below is still needed.

## 4. Risk acceptability matrix (proposal — CSO to confirm)

The matrix is adapted from DCB0129. **Severity:**
1. Minor
2. Significant
3. Considerable
4. Major
5. Catastrophic

**Likelihood:**
1. Very low
2. Low
3. Medium
4. High
5. Very high

| Likelihood ↓ / Severity → | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 5 Very high | 3 | 4 | 4 | 5 | 5 |
| 4 High | 2 | 3 | 3 | 4 | 5 |
| 3 Medium | 2 | 2 | 3 | 3 | 4 |
| 2 Low | 1 | 2 | 2 | 3 | 4 |
| 1 Very low | 1 | 1 | 2 | 2 | 3 |

**Risk rating:**
- **1–2:** acceptable.
- **3:** undesirable. Acceptable only with a documented CSO justification that the risk is as low as reasonably practicable.
- **4–5:** unacceptable. The function must not be released.

## 5. Hazard log summary

Columns:
- **Initial** is the rating without controls.
- **Residual** is the rating with the controls **as built today**.
- **Tests** is the number of test files that name the hazard (from `scripts/hazard_coverage.py`, 23 Oct 2026).
- **Status** is one of:
  - *Controlled (pending CSO):* controls built and verified by tests.
  - *Partially controlled:* some controls or their verification are missing.
  - *Open:* a control the hazard log requires is not built.

| ID | Hazard | Initial (S/L → R) | Residual (S/L → R) | Tests | Status |
|---|---|---|---|---|---|
| HZ-01 | Reading attributed to the wrong person | 4/4 → 4 | 4/2 → 3 | 1 | Partially controlled — pilot attribution audit outstanding |
| HZ-02 | Reassured by an outdated target | 3/3 → 3 | 3/2 → 2 | 2 | Controlled (pending CSO) |
| HZ-03 | Alarmed or misled by population thresholds | 3/4 → 3 | 3/1 → 2 | 4 | Controlled (pending CSO; design review outstanding) |
| HZ-04 | Missed urgent pregnancy BP | 5/3 → 4 | 5/1 → 3 | 3 | Partially controlled — CSO to confirm the 160/110 default; usability with pregnant women outstanding |
| HZ-05 | Reduced fetal movements not acted on | 5/3 → 4 | 5/1 → 3 | 1 | Partially controlled — content review (text is a placeholder) |
| HZ-06 | Wrong vaccine due date | 3/3 → 3 | 3/2 → 2 | 2 | Partially controlled — DOB precision not used in due dates; no schedule vectors |
| HZ-07 | Growth chart misread | 3/3 → 3 | 3/2 → 2 | 7 | **Open** — the shipped growth reference is a labelled placeholder (D-9) |
| HZ-08 | False reassurance from wearable readings | 4/3 → 3 | 4/1 → 2 | 5 | Controlled (pending CSO) |
| HZ-09 | Missed check-in / fall not escalated; passive check-in | 5/3 → 4 | 5/1 → 3 | 8 | Controlled (pending CSO; production synthetic test and delivery alerting to be switched on) |
| HZ-10 | Medication schedule error | 4/3 → 3 | 4/1 → 2 | 0 | Partially controlled — controls built, no labelled verification (baseline) |
| HZ-11 | Seizure duration alert delayed | 5/3 → 4 | 5/1 → 3 | 2 | Partially controlled — doctor-set rescue-plan text not built |
| HZ-12 | Teen-confidential data disclosed to a guardian | 4/3 → 3 | 4/1 → 2 | 9 | Controlled (pending CSO) |
| HZ-13 | Location data enables abuse | 5/2 → 4 | 5/1 → 3 | 2 | **Open** — GPS/location features in build (R2); safety-concern flow built |
| HZ-14 | Implausible value accepted | 3/4 → 3 | 3/1 → 2 | 4 | Controlled (pending CSO) |
| HZ-15 | Clinical content outdated | 3/3 → 3 | 3/3 → 3 | 0 (baseline; mislabels fixed 23 Oct) | **Open** — no content items with review dates or reminders |
| HZ-16 | Doctor acts outside competence | 3/2 → 2 | 3/1 → 2 | 0 | Partially controlled — controls built, no labelled verification (baseline) |
| HZ-17 | Platform downtime during an emergency | 5/2 → 4 | 5/1 → 3 | 2 | Partially controlled — chaos tests and the app's offline path outstanding |
| HZ-18 | Real dangerous value dismissed as device error | 5/3 → 4 | 5/1 → 3 | 4 | Partially controlled — API and doctor side built; safety-net text rendering on the hub not found; texts need CSO approval |
| HZ-19 | Pregnancy in a child handled as routine | 5/2 → 4 | 5/1 → 3 | 2 | Controlled in software (pending CSO); safeguarding lead and national procedure numbers to confirm |

No residual rating is 4 or 5 *on the assumptions stated per hazard in §6*. **Every residual 3 needs a CSO justification**:
- HZ-01
- HZ-04
- HZ-05
- HZ-09
- HZ-11
- HZ-13
- HZ-15
- HZ-17
- HZ-18
- HZ-19

Where a control is still open, the residual figure assumes it is completed before the pilot. If it isn't, the CSO should treat the initial rating as the residual one.

## 6. Hazards: controls as built and verification

Code pointers are repository paths. "Tests" are the files `scripts/hazard_coverage.py` finds. "Also exercised by" lists tests that cover the control without naming the hazard id; they should be labelled.

### HZ-01 Reading attributed to the wrong person
- **Controls as built:**
  - Hub attribution engine and inbox for uncertain readings (`services/hub-core/hub_core/engine/attribution.py`, `pipeline.py`).
  - Proxy chooser with picture and name, and a "measuring for" banner (`apps/hub-ui/src/lib/proxy.ts`, `apps/hub-ui/src/features/proxy/ProxyChooser.tsx`, `apps/hub-ui/src/components/ProxyBanner.tsx`).
  - The chooser resets after each measurement (`apps/hub-ui/src/features/orbit/OrbitScreen.tsx`).
  - `proxy_for` is decided by the server policy.
  - Attribution (`identified_by`, `entered_by`, `measured_for`) is stored on every reading and shown to the doctor (`services/api/app/records/service.py`).
  - Being recognised never counts as a check-in (shared with HZ-09).
- **Tests:** `apps/hub-ui/src/lib/pass2.test.ts`.
- **Also exercised by:** `services/hub-core/tests/test_attribution.py` (table-driven attribution scenarios; not labelled HZ-01), `services/api/tests/test_hub_contract.py`.
- **Open:**
  - The pilot audit of attribution (≥ 98 % correct on an audited sample) needs pilot data and people.
  - The plausibility check against the person's own history isn't in the hub path yet; verify.
- **Residual:** 4/2 → 3 until the pilot audit result is in.

### HZ-02 Reassured by "Within your target" when the target is outdated
- **Controls as built:**
  - Every target carries `set_by` and `set_at`, which the chart shows ("set by Dr X on date") (`services/api/app/records/targets.py`; series `target` shape, build brief §5.3).
  - Targets older than 12 months are a worklist item for the doctor (`services/api/app/clinical/worklist.py`, `apps/doctor-web/src/pages/WorklistPage.tsx`).
  - The doctor's own attention level drives "! Talk to your doctor".
- **Tests:** `apps/doctor-web/test/clinical.test.tsx`, `services/api/tests/test_alerts_api.py`.
- **Residual:** 3/2 → 2.

### HZ-03 Family alarmed or misled by population thresholds
- **Controls as built:**
  - No population thresholds on family surfaces (ADR-0012).
  - Status words come only from the person's own targets; without a target the status is `none` and the chart shows a trend only (`packages/charts-core/src/status.ts`, `services/api/app/records/metrics.py`).
  - Growth curves are neutral and unlabelled (`packages/ui-web/src/charts/GrowthChart.tsx`, `apps/hub-ui/src/features/orbit/TrendChart.tsx`, `apps/hub-ui/src/features/growth/GrowthCard.tsx`).
  - Interpretation on a family surface needs the clinician's per-child switch (`growth_setting.family_interpretation`, `services/api/app/child/growth.py`).
  - The safety-net register (§4.1) is the only exception.
- **Tests:** `packages/charts-core/test/status.test.ts`, `packages/ui-web/test/health.test.tsx`, `packages/ui-web/test/kit2.test.tsx`, `apps/hub-ui/src/features/orbit/TrendChart.test.tsx`.
- **Open:** the design review of every family screen against ADR-0012 (a person, not a test).
- **Residual:** 3/1 → 2.

### HZ-04 Missed urgent pregnancy BP
- **Controls as built:**
  - Pregnancy BP rule: the obstetrician's attention level, or the CSO default safety net of systolic ≥ 160 or diastolic ≥ 110 when no level is set (`services/api/app/alerts/engine.py` §2, `services/api/app/alerts/templates.py`, marked "⚠ CSO to confirm").
  - The default applies from the start and for at most 7 days while the team decides (`TARGET_DEADLINE`, `services/api/app/maternity/service.py`).
  - Readings stored under any module count.
  - The rule notifies the family admins she chose and her care team.
  - The external-contact prompt asks her to add her clinic or PHM midwife.
  - Fixed warning-symptom text is always shown (`pregnancy.warning_symptoms`), as is the not-monitored disclosure (`services/api/app/maternity/content.py`).
  - No wrist or cuffless BP in pregnancy (HZ-08).
- **Tests:** `services/api/tests/test_r2a_maternity.py`, `services/api/tests/test_alerts_api.py`, `apps/doctor-web/test/member.test.tsx`.
- **Open:**
  - The CSO confirms the 160/110 default and the `safety.pregnancy_bp` text. All maternity texts are placeholders (`cso_status = placeholder_needs_cso`).
  - Summative usability with pregnant women (`docs/06-testing/USABILITY_SUMMATIVE_PLAN.md`).
  - The hub opt-in display path.
- **Residual:** 5/1 → 3. The MOH clinic and PHM pathway stay primary; the platform is a second net.

### HZ-05 Reduced fetal movements not acted on
- **Controls as built:**
  - No kick-count targets (the API returns `kick_counts: false`).
  - The "My baby's movements feel reduced" report shows the fixed contact-now text, with her own maternity contact first.
  - Every report is an urgent worklist item for the care team covering her pregnancy, never the family doctor (`services/api/app/maternity/service.py` §reduced movements, `services/api/app/api/maternity.py`, `services/api/app/alerts/engine.py`, `templates.py`).
- **Tests:** `services/api/tests/test_r2a_maternity.py`.
- **Open:**
  - `safety.reduced_movements` text review by the CSO and native-speaker clinicians.
  - The no-care-team path (who acts when no obstetrician is on the team) needs CSO review.
- **Residual:** 5/1 → 3.

### HZ-06 Wrong vaccine due date
- **Controls as built:**
  - Due dates come from the versioned LK schedule in the catalogue; schedules are released through the CSO approval gate.
  - Parent-entered doses stay `unverified` until a clinician checks them, singly or in bulk against the card photo (`services/api/app/child/immunizations.py`, `apps/doctor-web/src/pages/member/ImmunisationsTab.tsx`).
  - The response names the schedule code and version.
- **Tests:** `services/api/tests/test_child_api.py`, `apps/doctor-web/test/clinical.test.tsx`.
- **Open:**
  - `person.dob_precision` (day / month / year) is stored but not used when due dates are computed. A month- or year-precision DOB should mark due dates as approximate or ask for the exact date.
  - Due-date vectors per country pack (the hazard log's verification) aren't in `packages/module-catalogue/vectors` yet; only resolver vectors are there.
- **Residual:** 3/2 → 2 once both are closed.

### HZ-07 Growth chart misread
- **Controls as built:**
  - Corrected age until 2 years for babies born before 37 weeks (`services/api/app/child/growth.py`, `services/api/app/child/models.py` birth record).
  - Sex and reference are shown on the chart.
  - The API reference is the same as the charts' (`services/api/app/child/growth_ref.py`, twin of `packages/charts-core`).
  - Units are fixed in storage.
  - Families see neutral curves only (HZ-03).
- **Tests:**
  - `services/api/tests/test_child_api.py`
  - `services/api/tests/test_growth_reference.py`
  - `apps/hub-ui/src/lib/pass2.test.ts`
  - `apps/hub-ui/src/features/orbit/TrendChart.test.tsx`
  - Three further files are mislabelled (see G-3): `services/api/tests/test_access_api.py`, `services/api/tests/test_policy.py`, `services/api/tests/test_consent_api.py`.
- **Open — release blocker for growth:**
  - The shipped reference is a clearly labelled **placeholder**, because WHO growth tables aren't licensed for commercial use (CLAUDE.md rule 14, decision D-9).
  - Growth vectors "vs WHO anthro outputs" can't be run until the licensed tables are in.
  - Special charts (Down syndrome, preterm beyond 2 years) aren't built; the doctor selects the reference.
- **Residual:** 3/2 → 2 *after* the licensed reference and vectors. Until then growth must not be presented to doctors as clinical-grade.

### HZ-08 False reassurance from wearable readings
- **Controls as built:**
  - Cuffless, wrist and wearable methods are an `estimated` tier: hollow markers, never compared with targets, kept out of status (`services/api/app/records/metrics.py`).
  - Clinical alert rules use measured readings only (`services/api/app/alerts/engine.py`).
  - Pregnancy blocks wrist and cuffless BP and needs a pregnancy-validated upper-arm cuff (`services/api/app/records/service.py`).
- **Tests:**
  - `services/api/tests/test_records_unit.py`
  - `services/api/tests/test_alerts_api.py`
  - `services/api/tests/test_r2a_maternity.py`
  - `apps/hub-ui/src/features/orbit/TrendChart.test.tsx`
  - `apps/hub-ui/src/lib/pass2.test.ts`
- **Residual:** 4/1 → 2.

### HZ-09 Missed elder check-in or fall not escalated; false reassurance from a passive check-in
- **Controls as built:**
  - A check-in needs an explicit "I'm OK": hub tap, hub voice, app or watch button only. Presence or recognition is rejected at the schema, the service and the hub (`services/api/app/safety/service.py`, `services/api/app/api/hub.py`, `services/api/app/devices/ingest.py`, `services/hub-core/hub_core/api/family.py`, `apps/hub-ui/src/lib/checkin.ts`, `CheckinSheet.tsx`).
  - Missed check-ins are detected every 5 minutes (`services/api/app/worker.py` `missed_checkins`).
  - The escalation chain runs push → next carer → SMS → emergency contact, with acknowledgement stopping it (`services/api/app/alerts/escalation.py`).
  - Notification deliveries are recorded per channel (`notification_delivery`).
  - The daily synthetic alert test covers every template, a simulated chain, the dispatcher and each channel adapter (`services/api/app/alerts/synthetic.py`, cron 21:30 UTC).
- **Tests:**
  - `services/api/tests/test_alerts_api.py`
  - `services/api/tests/test_care_data_api.py`
  - `services/api/tests/test_hub_contract.py`
  - `services/api/tests/test_r2a_alerts.py`
  - `services/hub-core/tests/test_cure_global.py`
  - `apps/hub-ui/src/features/checkin/CheckinSheet.test.tsx`
  - `apps/hub-ui/src/lib/pass2.test.ts`
  - `apps/hub-ui/e2e/cure-global.spec.ts`
- **Open:**
  - The synthetic test must run in **production** with real ops addresses (`SYNTHETIC_*` settings), and a failure must page on-call (observability work in Phase 6).
  - Delivery-failure alerting.
  - Falls: logging is built, but detection is the device maker's claim.
- **Residual:** 5/1 → 3.

### HZ-10 Medication schedule error
- **Controls as built:**
  - Structured times of day and days of week only; no free-text frequencies.
  - A change retires the schedule row, so past adherence keeps the schedule in force that day (`services/api/app/medication/models.py`, `service.py`, `services/api/app/api/medication.py`).
  - The platform never calculates or suggests doses, and uses "as prescribed" wording (`medication/models.py` docstring, CLINICAL_SAFETY.md §4).
  - The doctor console shows schedules (`apps/doctor-web/src/pages/member/MedicinesTab.tsx`).
- **Tests:** none name HZ-10 (baseline).
- **Also exercised by:** `services/api/tests/test_care_data_api.py` (`test_add_medicine_and_change_its_schedule`, `test_dose_set_is_idempotent_and_adherence_is_charted`, `test_medicines_with_schedule_and_hub_contract_fields`).
- **Open:**
  - Label these tests HZ-10.
  - Add an assertion that no family-facing text or field carries a dose calculation.
  - Add "confirmed by the person/doctor" evidence on schedule creation.
- **Residual:** 4/1 → 2 once verified.

### HZ-11 Seizure duration alert delayed
- **Controls as built:**
  - A one-tap hub timer runs on the hub clock, within the catalogue cap (`apps/hub-ui/src/features/care/CareScreen.tsx`).
  - The `seizure_duration` alert rule uses the doctor's threshold (default 5 minutes) and is enabled for any logged seizure (`services/api/app/alerts/rules.py`, `templates.py`).
  - The urgent alert goes to the carers and to the relevant clinician, not the therapist.
- **Tests:** `services/api/tests/test_alerts_api.py`, `apps/hub-ui/src/lib/pass2.test.ts`.
- **Open:**
  - The doctor-set rescue-plan text shown during the timer isn't built (only fixed "stay with them" text, `qlog.seizure.stay`).
  - The rule fires on the logged duration, so a timer left running alerts only when it is stopped. CSO to decide whether a live-timer alert at the threshold is required.
- **Residual:** 5/1 → 3.

### HZ-12 Teen-confidential data disclosed to a guardian
- **Controls as built:**
  - One policy function (`services/api/app/consent/policy.py` `teen_private`) applies the module's `teen_confidential` flag whatever the category, so a pregnancy BP reading is confidential too.
  - The window runs from the country pack's `teen_confidentiality_age` (LK 16) to `age_of_majority`, plus the 13–15 opt-in approved by a doctor (`services/api/app/consent/teen.py`).
  - Every path calls the policy: REST, exports (`services/api/app/api/exports.py`, `services/api/app/exports/`), SSE, notifications, the access log ("no trace"), messaging and the hub (own `hub_display` consent only).
- **Tests:**
  - `services/api/tests/test_alerts_api.py`
  - `services/api/tests/test_clinical_api.py`
  - `services/api/tests/test_events_api.py`
  - `services/api/tests/test_exports_api.py`
  - `services/api/tests/test_policy_notes.py`
  - `services/api/tests/test_policy_r2a.py`
  - `services/api/tests/test_r2a_consent.py`
  - `services/api/tests/test_r2a_maternity.py`
  - `services/api/tests/test_r2a_messaging.py`
  - `services/api/tests/test_policy.py` and `services/api/tests/test_access_api.py` test it under the wrong id (G-3).
- **Open:** the DSAR export path (being built in Phase 6) must be added to the matrix: a teen's confidential data goes only to the teen.
- **Residual:** 4/1 → 2.

### HZ-13 Location data enables abuse
- **Controls as built:**
  - Support's confidential safety-concern flow hides a person's data and location from named family members immediately, and they never hear of the person's SOS (`services/api/app/consent/safety_concern.py`, `services/api/app/consent/policy.py`, `services/api/app/safety/service.py`, `services/api/app/api/consent_r2.py`).
  - Location consent purpose `location_tracking` is in the consent model.
- **Tests:** `services/api/tests/test_policy_r2a.py`, `services/api/tests/test_r2a_consent.py`.
- **Open:**
  - GPS and Traccar features (geofence events, last-known location with audit and notice) are being built in R2. The Traccar webhook is still a TODO in `services/api/app/api/internal.py`.
  - The DPIA must cover coercive control.
  - The case must be updated when location ships.
- **Residual:** 5/1 → 3, conditional on the R2 controls.

### HZ-14 Implausible value accepted
- **Controls as built:**
  - `plausible` ranges per metric from `packages/module-catalogue/catalogue/metrics.yaml`.
  - Twin TS/Python plausibility with shared vectors (`packages/clinical/src`, `packages/clinical/python/cure_clinical/ranges.py`, `packages/clinical/vectors/clinical.json`).
  - "? Check this reading" with a unit hint (e.g. `[degF]`) for impossible values and unit mix-ups only (`services/api/app/records/metrics.py`, `packages/charts-core/src/status.ts`).
  - Implausible readings never count towards averages or lowest/highest on the hub (`apps/hub-ui/src/lib/series.ts`).
- **Tests:**
  - `services/api/tests/test_records_unit.py`
  - `services/api/tests/test_records_api.py`
  - `packages/charts-core/test/status.test.ts`
  - `apps/hub-ui/src/lib/series.test.ts`
- **Also exercised by:** `packages/clinical/python/tests/test_vectors.py`, `packages/clinical/test/vectors.test.ts` (shared vectors; not labelled).
- **Residual:** 3/1 → 2.

### HZ-15 Clinical content outdated
- **Controls as built:**
  - Catalogue and country-pack versioning with CSO approval before a release goes active (`services/api/app/modules/catalogue.py`).
  - Maternity content keys report `placeholder: true` and `cso_status` (`services/api/app/maternity/content.py`).
- **Not built:**
  - `content_item` with review dates and citations (DATA_MODEL.md §7).
  - The yearly review reminder in the admin console.
  - E18-06 content and translation workflow (R2, backend-r2b in progress).
- **Tests:** none. The tests that used to name HZ-15 meant teen confidentiality and were relabelled HZ-12 on 23 Oct 2026; HZ-15 is in `scripts/hazard_coverage_baseline.txt` until content review dates are built.
- **Residual:** 3/3 → 3 — open.

### HZ-16 Doctor acts on data outside their competence
- **Controls as built:**
  - Care-team role defaults for categories (`ROLE_DEFAULTS` in `services/api/app/care/service.py`: the therapist gets behaviour support, documents and messages only; family teams never get sensitive categories).
  - Categories can be changed per member.
  - The policy enforces care-team category scopes (`services/api/app/consent/policy.py`).
- **Tests:** none name HZ-16 (baseline).
- **Also exercised by:** `services/api/tests/test_care_api.py`, `services/api/tests/test_care_data_api.py` (`test_dr_perera_sees_medicines_but_not_checkins`), `services/api/tests/test_alerts_api.py` (the seizure alert goes to the paediatrician, not the speech therapist).
- **Open:**
  - Access-matrix rows per care-team role labelled HZ-16.
  - Clinical review of `ROLE_DEFAULTS` by the CSO.
- **Residual:** 3/1 → 2.

### HZ-17 Platform downtime during an emergency
- **Controls as built:**
  - The hub SOS works offline: it is saved on the hub and raised when the network returns, and the screen never claims the family was told when they weren't (`apps/hub-ui/src/lib/sos.ts`, `apps/hub-ui/src/features/sos/SosDialog.tsx`).
  - The national number (1990, Suwa Seriya) is shown as text in every state (`packages/i18n/src/*.ts` `sos.emergency`).
  - Hub writes go through the hub-core outbox first (offline first).
  - The not-monitored disclosure key exists (`safety.not_monitored_24_7`, placeholder text).
- **Tests:** `apps/hub-ui/src/features/sos/SosDialog.test.tsx`, `apps/hub-ui/src/lib/pass2.test.ts`.
- **Open:**
  - Chaos tests (API down, worker killed, Valkey down) per the hazard log.
  - The app's offline SOS and national-number path (wave 6).
  - Local alarm and SMS-on-return on the hub to verify against hardware.
  - Availability monitoring and on-call (Phase 6 ops).
- **Residual:** 5/1 → 3.

### HZ-18 A real, dangerous value is dismissed as a device error
- **Controls as built:**
  - `urgent` bands per metric in `metrics.yaml`: SpO₂ < 85 %, glucose < 50 or > 400 mg/dL, and others.
  - A possible-but-dangerous value is *plausible*: it is stored and shown as measured, never "? Check this reading" (`services/api/app/records/metrics.py`, `packages/charts-core/src/status.ts`).
  - The reading carries the safety-net text id `safety.urgent_reading.<metric>` (`services/api/app/records/service.py`).
  - The urgent-band alert is always on and not configurable, with an urgent worklist item and a push to the care team (`services/api/app/alerts/engine.py`, `rules.py`).
- **Tests:**
  - `services/api/tests/test_records_unit.py`
  - `services/api/tests/test_alerts_api.py`
  - `packages/charts-core/test/status.test.ts`
  - `apps/doctor-web/test/clinical.test.tsx`
- **Open:**
  - No rendering of the `safety_net` text id was found in `apps/hub-ui/src` or `packages/i18n/src`, so the family-facing half of the control isn't built on the hub. The app (wave 6) is the same.
  - The urgent bands and the texts (en/si/ta) need CSO and native-speaker clinician approval.
  - "e2e on hub and app" per the hazard log.
- **Residual:** 5/1 → 3 once the hub and app show the text.

### HZ-19 Pregnancy in a child is handled as a routine record
- **Controls as built:**
  - Under the digital-consent age, only a clinician on her care team can record a pregnancy episode. Self-entry and a guardian's entry are refused (`services/api/app/maternity/service.py`, `services/api/app/api/maternity.py`).
  - Recording starts the safeguarding hold: the pregnancy and postpartum modules are restricted to the recording clinician, and guardians and grants are suspended (`services/api/app/consent/policy.py`, `services/api/app/consent/service.py`).
  - Reminders are suppressed during the hold (`services/api/app/maternity/reminders.py`).
  - Only the clinician's documented, audited decision reopens access.
  - Open reviews are listed for the safeguarding lead.
- **Tests:** `services/api/tests/test_policy_r2a.py`, `services/api/tests/test_r2a_maternity.py`.
- **Open:**
  - The CSO designates the safeguarding lead role.
  - Confirm the NCPA hotline (1929 ⚠ verify) and the police number in the texts.
  - A training item for clinicians.
- **Residual:** 5/1 → 3.

## 7. Outstanding risks, gaps and actions before the pilot

Gaps G-1 to G-7 are **verification gaps**: the control exists, but the evidence the hazard log requires does not.

| # | Gap | Hazards | Owner | Needed for pilot? |
|---|---|---|---|---|
| G-1 | Medication schedule tests not labelled, and no "no dose arithmetic" assertion | HZ-10 | Engineering | Yes |
| G-2 | No access-matrix rows per care-team role labelled HZ-16 | HZ-16 | Engineering | Yes |
| G-3 | **Done 23 Oct 2026 (hardening-p6): relabelled to HZ-12 / ADR-0011 and HZ-15 added to the baseline.** Was: mislabelled hazard ids in tests: `services/api/tests/test_access_api.py:3`, `services/api/tests/test_policy.py:9,95,147` and `services/api/tests/test_consent_api.py:81` use HZ-15 for teen confidentiality (that's HZ-12) and HZ-07 for sensitive data on the hub (ADR-0011; not a hazard-log id). Fix: relabel to HZ-12 / ADR-0011, then add `HZ-15  # no content review-date controls built yet` to `scripts/hazard_coverage_baseline.txt` in the same change (CI otherwise flags HZ-15 as a new gap) | HZ-12, HZ-15, HZ-07 | Engineering | Yes |
| G-4 | Attribution tests (`services/hub-core/tests/test_attribution.py`) and the shared plausibility vectors (`packages/clinical`) are not labelled | HZ-01, HZ-14 | Engineering | No (hygiene) |
| G-5 | Immunisation due-date vectors per country pack; DOB precision ignored in due dates | HZ-06 | Engineering + paediatric reviewer | Yes |
| G-6 | Growth vectors vs WHO anthro outputs (needs the licensed tables) | HZ-07 | Product (D-9) | For growth features |
| G-7 | Chaos and resilience tests (API, worker, Valkey down; hub offline) | HZ-17, HZ-09 | Engineering / ops | Yes |

Gaps G-8 to G-17 are **controls not yet built**, or **work that needs people**:

| # | Gap | Hazards | Owner | Needed for pilot? |
|---|---|---|---|---|
| G-8 | Safety-net text display on the hub (and app): render `safety_net` ids; en/si/ta texts | HZ-18, HZ-04 | hub-ui / mobile + CSO | **Yes — blocker** |
| G-9 | Content items with review dates, citations and yearly reminders (E18-06) | HZ-15 | Backend (R2) + CSO | Yes |
| G-10 | Seizure rescue-plan text; live-timer alert decision | HZ-11 | CSO → engineering | If epilepsy modules are in the pilot |
| G-11 | Licensed growth reference (WHO) replacing the placeholder | HZ-07 | Product (D-9) | For growth features |
| G-12 | GPS/location controls (R2) and their case update | HZ-13 | Backend (R2) | Only if location is in the pilot |
| G-13 | Alerting behind a feature flag, so family-facing physiological alerts can be switched off per market (D-13). `feature_flag` exists, but the alert engine doesn't read it | HZ-04, HZ-09, HZ-18 | Engineering | Before any non-LK market |
| G-14 | Pilot attribution audit (≥ 98 %) | HZ-01 | Pilot team | During the pilot (exit criterion) |
| G-15 | Summative usability with elders, parents, pregnant women, teens, carers and doctors | HZ-01, 04, 05, 07, 09, 10, 12, 14, 17, 18 | Human-factors lead + CSO | **Yes** (`docs/06-testing/USABILITY_SUMMATIVE_PLAN.md`) |
| G-16 | CSO approval of every safety-net text, urgent band, alert template and the 160/110 default; native-speaker clinician review of si/ta | HZ-04, 05, 18, 19 | CSO + reviewers | **Yes** |
| G-17 | Safeguarding lead designated; national numbers verified | HZ-19 | CSO | Yes |

**Post-market surveillance plan for the pilot:**
- Weekly: alert-acknowledgement times, synthetic-test results, attribution audit samples, incident reports and complaints.
- Monthly: hazard-log review chaired by the CSO.
- Any new hazard goes into `CLINICAL_SAFETY.md` §3 and gets a test or a baseline line with a reason.

## 8. Risk acceptability statement (draft for the CSO)

> On the evidence in this case, and provided the actions marked "Yes" in §7 are closed, the residual clinical risks of the functions in scope (§1) are proposed as **acceptable or as low as reasonably practicable** for a supervised pilot of 50–100 families and 5–10 doctors in Sri Lanka.
>
> This assessment assumes the platform is presented and used as a record-keeping and communication tool that is not monitored 24/7, alongside — never instead of — the MOH clinic, the PHM midwife and the family's own doctors.
>
> The hazards with a residual rating of 3 (§5) are accepted only with the CSO's written justification per hazard. Any hazard whose open control is not closed before the pilot keeps its **initial** rating, and the function it belongs to must be switched off for the pilot.

## 9. Release statement and CSO sign-off

The release this case applies to is:
- Release: Cure Global pilot release (version and catalogue release id to be filled in)
- Catalogue release: `_____________` (status `approved` by the CSO before `active`)
- Scope exclusions: §1

| Role | Name | Decision (approve / approve with conditions / reject) | Conditions | Signature | Date |
|---|---|---|---|---|---|
| Clinical Safety Officer | | | | | |
| Engineering lead (traceability) | | | | | |
| Product owner | | | | | |
| DPO (for HZ-12, HZ-13 privacy-related controls) | | | | | |

*To be completed by a human. Nothing in this repository signs on anyone's behalf.*

## 10. How to regenerate the evidence

```text
python scripts/hazard_coverage.py                                                     # table: hazard → test files
python scripts/hazard_coverage.py --json > hazard-coverage.json                       # attach to the release record
python scripts/hazard_coverage.py --baseline scripts/hazard_coverage_baseline.txt     # the CI gate
uvx pytest scripts/tests -q                                                           # the script's own tests
```

The coverage as of this draft is 17 / 19 hazards named by at least one test file. HZ-10 and HZ-16 are in the baseline. Counting only correctly labelled tests, it is 16 / 19, because HZ-15's two references are mislabels (G-3).

## 11. Change log

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0-draft | 23 Oct 2026 | Engineering (hardening-p6) | First draft: hazards HZ-01…HZ-19 with controls as built, test trace from `scripts/hazard_coverage.py`, proposed risk ratings, gaps G-1…G-17, sign-off block. Awaiting CSO review |
