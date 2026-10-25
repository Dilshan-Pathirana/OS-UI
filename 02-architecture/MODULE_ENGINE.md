# Cure Global — Module engine

*v0.1 · 22 Oct 2026 · How life stages, sex, pregnancy, special needs and doctors' choices turn functions on and off for each person. The catalogue lives in `packages/module-catalogue`; the pure resolver is `packages/module-catalogue/python/cure_catalogue/resolver.py` (vectors in `packages/module-catalogue/vectors/resolver.json`), used by the API through `services/api/app/modules/service.py`.*

## 1. Why an engine

The brief lists eight member types, each with common and unique functions, different for male and female. Hard-coding that would mean every screen asks "is this an infant? a pregnant teen? an autistic adult?". Instead:

- **Life stage** is computed from date of birth (it changes by itself).
- **Overlays** stack on top: pregnancy, postpartum, special needs, chronic programmes, dementia safety.
- **Modules** are the unit of function (e.g. `infant.growth`, `women.cycle`, `elder.safety_gps`). Each module declares *when* it applies, *what* it records, *where* it appears and *how sensitive* it is.
- The **resolver** decides each person's modules; people and doctors can then accept, decline, pause or add modules within the rules.
- The **super admin** manages the catalogue per country without a code release.

## 2. Catalogue layout (`packages/module-catalogue/catalogue/`)

| File | Holds |
|---|---|
| `life_stages.yaml` | Age bands and sub-bands, per country pack override |
| `metrics.yaml` | Metric definitions: LOINC, UCUM unit, plausibility (`plausible`), safety-net band (`urgent`), display |
| `trackers.yaml` | Non-numeric trackers with JSON Schemas (feeds, nappies, sleep, cycle days, seizures, behaviour, falls, check-ins…) |
| `modules/*.yaml` | Module definitions, grouped by family: `core`, `infant`, `child`, `teen`, `women`, `men`, `adult`, `elder`, `pregnancy`, `special_needs`, `programmes`, `utilities` |
| `schedules/immunization.<country>.yaml` | National immunisation schedule as data |
| `schedules/milestones.yaml` | Developmental milestone checkpoints (items pending the content licence) |
| `schedules/anc.<country>.yaml`, `schedules/postnatal.<country>.yaml` | Antenatal and postnatal contact schedules |
| `schedules/ds_health_supervision.yaml` | Down syndrome health-supervision checks |
| `condition_tags.yaml` | Condition tags (with ICD-11 codes) that drive overlays and condition packs |
| `country_packs/<country>.yaml` | Thresholds (ages of majority/consent/confidentiality), family rules (`joint_guardian_consent`), emergency number, languages, units, default schedules |
| `schema/*.schema.json` | JSON Schemas for every file above (CI validates) |

## 3. A module definition

```yaml
# packages/module-catalogue/catalogue/modules/infant.yaml (this block is validated against the schema by
# tests/test_catalogue.py::test_module_engine_doc_example, so it can't drift)
code: infant.growth
version: 1.0.0
name: {en: Growth (baby)}                # si / ta added by translators
kind: life_stage                         # core | life_stage | sex_specific | overlay | condition | programme | utility
summary: Weight, length and head circumference on WHO Child Growth Standards (sex-specific; corrected age for preterm).
eligibility:
  age_between:
    min: {days: 0}
    max: {months: 24}
default_state: auto                      # auto | offer | clinician_only
opt_out: true                            # family may switch it off
metrics: [weight, length, head_circumference, bmi]
trackers: []
schedules: []
surfaces: {hub: true, app: true, doctor: true}
hub_safe: true                           # hub_opt_in: true instead for sensitive modules a person may show (ADR-0011)
sensitivity: normal                      # normal | sensitive | restricted
teen_confidential: false
data_categories: [growth, vitals]
consents_required: [health_data]
display_rules:
  family_view: neutral_reference_curves  # no colour zones or labels unless a clinician enables them (ADR-0012)
  doctor_view: z_scores_and_percentiles
  references: [who_gs]                   # growth reference ids from the country pack
clinical_owner: TBD (paediatrics)        # optional until reviewers are named (D-10)
```

## 4. Eligibility rules

A rule is a tree of `all` / `any` / `not` over predicates. Ages are evaluated in the family's time zone on the evaluation date. Ages use the date-of-birth precision (a year-only DOB is treated as 1 July).

| Predicate | Example | True when |
|---|---|---|
| `always` | `true` | always (core modules) |
| `age_between` | `{min: {months: 12}, max: {years: 10}}` | min ≤ age < max |
| `life_stage_in` | `[infant, child]` | computed stage matches |
| `sex_in` | `[female]` | `sex_for_clinical_use` matches (opt-in/opt-out handled by states, §5) |
| `episode_active` | `pregnancy` | an active episode of that type exists |
| `episode_ended_within` | `{type: pregnancy, days: 42}` | an episode ended within N days |
| `gestational_age_weeks_between` | `{min: 24}` | an active pregnancy is at least/under N weeks (from LMP or EDD) |
| `overlay_active` | `special_needs` | the overlay is active |
| `condition_tag_any` | `[autism, down_syndrome]` | an active condition maps to one of the tags (tags are defined in the catalogue for SNOMED/ICD-11 codes) |
| `programme_enrolled` | `hypertension` | enrolled by a clinician |
| `flag` | `dementia_safety` | a clinician or proxy-set flag is on |
| `country_in` | `[LK]` | family's country pack |
| `not` | `{episode_active: pregnancy}` | the inner rule is false (e.g. cycle tracking pauses in pregnancy) |

Two more module fields shape the result: `default_state_overrides` (e.g. `women.bone_health` is clinician-only from 50 and automatic from 65; `elder.daily_checkin` becomes automatic with the `living_alone` flag) and `requires_modules` (e.g. `prog.diabetes` stays *offered* while `core.glucose` is declined).

## 5. Module states and who can change them

| State | Meaning | Set by |
|---|---|---|
| `active` | Visible and in use | resolver (auto), self/guardian (accept offer), clinician |
| `offered` | Suggested; one tap to activate | resolver (`default_state: offer`) |
| `clinician_available` | Eligible, but only a care-team clinician can turn it on | resolver (`default_state: clinician_only`) |
| `declined` | Person said no; not offered again until a new major version or a clinician recommends it | self/guardian |
| `paused` | Temporarily off (e.g. reminders paused during illness) | self/guardian/clinician |
| `ended` | No longer eligible (aged out, pregnancy over) or stopped; data stays viewable as history | resolver, clinician |

Rules:
1. `clinician_only` modules can be activated only by a care-team clinician (e.g. development screening, cognitive check-ins, questionnaires, postpartum mood). The Down syndrome checklist (`sn.down_syndrome`) is *offered* to the family once the condition tag is recorded; the doctor chooses the chart set.
2. A clinician-activated module is not ended by the resolver unless its eligibility hard-fails (e.g. pregnancy over); it then asks the clinician.
3. Sex-specific **tracking** modules are *offered*, never forced: `women.cycle` is offered to female members from 9 years (the catalogue's earliest age); anyone (or their guardian) can add a sex-specific module from the catalogue if it applies to them (`sex_specific` modules ignore `sex_in` when self-added). Screening **reminders** (cervical, breast) are on by default in their age windows and can be switched off (`opt_out: true`).
4. A person cannot decline `core.profile` or `core.emergency`.

## 6. Resolver

```
resolve(person, on_date):
  stage    = life_stage(person.dob, on_date, country_pack)        # e.g. child / sub: preschool
  overlays = active episodes + condition tags + programmes + flags
  for module in catalogue.active_modules(country_pack, org overrides):
      if eligible(module.eligibility, person, stage, overlays, on_date):
          proposed = module.default_state  (auto→active, offer→offered, clinician_only→clinician_available)
      else:
          proposed = ended (if currently active/offered by rule) | none
  merge(proposed, person_module rows):
      declined/paused/clinician states win over rule states (see §5)
  return {life_stage, sub_stage, overlays, modules[], changes[]}
```

The resolver is pure (no I/O) and runs in the API (on demand and nightly), in tests, and — for display hints only — on the hub and app from the catalogue they cache.

## 7. Life-stage transitions with their own flows

| Event | Flow |
|---|---|
| Birth recorded (from a pregnancy or direct "Add newborn") | Create person (DOB, sex, birth weight/length/HC, gestational age at birth), guardianship(parent) for the mother (and the other parent if added), family membership as dependant, immunisation schedule computed, `infant.*` modules active, postpartum episode for the mother |
| Pregnancy ends with loss | Immediately end all pregnancy modules, stop reminders and hub pregnancy display, remove scheduled notifications, offer a gentle follow-up (clinician-approved text) and postpartum care if appropriate; no "baby" content anywhere |
| `teen_login_age` reached | Guardian invited to create the teen's login (optional) |
| `teen_confidentiality_age` reached | Teen-confidential modules switch to private-to-teen (guardians see no trace of them); guardians are told only that "some of {name}'s health information is now private to them"; the **re-consent task** asks the teen to confirm or change the consents and grants their guardians gave (`ACCESS_CONTROL.md` §5 rule 4) |
| `age_of_majority` reached | Parent guardianship ends; record locked to the person + care team; claim-account invitation; grants chosen by the person |
| Condition with a special-needs tag added | `sn.care_profile` and `sn.care_team` turned on (auto); condition-specific modules offered (e.g. `sn.epilepsy`, the seizure diary, for epilepsy) |
| Dementia safety flag set by a clinician or proxy (API: BACKLOG E6-08) | `elder.safety_gps`, `elder.daily_checkin` offered; location consent or best-interest decision (E4-13) required before activation |
| Death recorded | All modules ended; reminders stopped; hub removes the member from greetings; record archived |

## 8. Versioning and rollout

- The catalogue has a semantic version. A **patch** changes text or plausibility bounds; a **minor** adds modules, metrics or optional fields; a **major** changes meaning (e.g. a new immunisation schedule) and triggers re-evaluation plus clinician review where needed.
- Releases go `staged → active` in the admin console after the clinical safety officer approves (`CLINICAL_SAFETY.md`).
- The API serves `GET /api/v1/catalogue?since=<version>`; the app and hub cache it and show only what the API says is active for each person (the API is authoritative).
- Module codes are permanent; a retired module keeps its code so old data still renders.

## 9. Super-admin controls

- Enable/disable a module per country pack or organisation.
- Change default state (auto ↔ offer ↔ clinician_only), age bands, reminder timings, schedule versions.
- Edit content (with clinical approval), translations and display rules.
- Simulate: enter a date of birth, sex, overlays and see the resolved modules (the "Life-stage simulator" page in `apps/admin-web`).
