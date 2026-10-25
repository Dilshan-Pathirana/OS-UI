# Cure Global — Backlog (epics and stories)

*v0.1 · 22 Oct 2026 · Story IDs are stable; put them in branch names and PR titles (e.g. `E4-03 grants API`). Rel = MVP / R2 / R3. Copy to GitHub Issues with `scripts/backlog_to_issues.py` (Phase 0 task E1-08).*

## E1 · Foundation and tooling (Phase 0)
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E1-01 | As a developer I can import the hub, packages and patient app with history | `MIGRATION_PLAN.md` §2 done (`scripts/import_sources.ps1`); `git log` shows the Cure Home and patient-app commits merged under the import commits | MVP |
| E1-02 | As a developer I can run the core stack on Docker Desktop with one command | `docker compose -f infra/compose/docker-compose.yml --profile core up -d` healthy; admin-web :5180, doctor-web :5181, api :8000/docs | MVP |
| E1-03 | As a developer I get every `.env` with fresh secrets | `python scripts/init_env.py` creates all `.env` from `.env.example` | MVP |
| E1-04 | CI runs lint/type/tests only for changed paths and validates the catalogue | GitHub Actions green on a PR touching each area | MVP |
| E1-05 | API contexts can't import each other's internals | import-linter contract in CI | MVP |
| E1-06 | Images are built with SBOM and pushed to GHCR from `main` | CycloneDX SBOM attached; cosign signature | MVP |
| E1-07 | PR template has privacy, regulatory and clinical checklists | Template merged | MVP |
| E1-08 | Backlog stories become GitHub issues | Script creates labelled issues idempotently | MVP |

## E2 · Identity and authentication
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E2-01 | As a family member I sign up with my phone (OTP) and a password | OTP 6 digits, 5 attempts, 10 min expiry, HMAC digest; password policy (≥ 10 chars, breached-password check) | MVP |
| E2-02 | As any user I get short-lived tokens and stay signed in safely | EdDSA JWT 15 min; refresh rotation; reuse revokes chain; JWKS endpoint; key rotation documented | MVP |
| E2-03 | As a doctor or staff member I must use MFA | TOTP enrolment + recovery codes; passkey (WebAuthn) optional; login blocked without MFA | MVP |
| E2-04 | As a user I can see and end my sessions | `GET/DELETE /me/sessions`; password change ends all | MVP |
| E2-05 | As a user I can reset my password securely | OTP to the verified phone; rate-limited; all sessions revoked | MVP |
| E2-06 | As a hub I authenticate with my device key | Ported Ed25519 challenge flow; contract tests | MVP |

## E3 · People and families
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E3-01 | As an owner I create a family with country, time zone and language | Family + owner membership; country pack applied | MVP |
| E3-02 | As an owner/admin I add a dependant (child or adult without a phone) | Person without account; guardianship(parent or health_proxy); evidence upload for proxy; resolver runs | MVP |
| E3-03 | As an owner/admin I invite an adult by phone | Invite expires in 7 days; accepted in their own account; consent + grants flow | MVP |
| E3-04 | As a person I can be in two families | Membership many-to-many; switcher shows both | MVP |
| E3-05 | As an owner I transfer ownership | New owner accepts; ≥ 1 admin invariant | MVP |
| E3-06 | As support I detect and merge duplicate people | Candidate list (name + DOB + phone/NIC hash); merge with both families' consent; audit | R2 |
| E3-07 | As a family I record a death | Evidence; all reminders stop; hub removes greetings; record archived | MVP |
| E3-08 | As a person turning 18 I take over my record | Guardianship ends; claim-account invite; grants chosen; parents notified | MVP |
| E3-09 | As an owner/admin I record emergency contacts and external care contacts (clinic, MOH office, PHM midwife) | Name, relationship or place, phone; no login; shown on the emergency card and before 1990 in safety-net texts (`CLINICAL_SAFETY.md` §4.1) | MVP |
| E3-10 | As separated parents we are both guardians of our child | Rules in `ACCESS_CONTROL.md` §5 (family situations); `family_rules.joint_guardian_consent` honoured; withdrawal by either wins; both notified; matrix cases | MVP |
| E3-11 | As a 16–17-year-old mother I am my baby's guardian | `parent` guardianship held by a minor; her own guardians get no access to the baby unless she grants it; matrix cases | R2 |

## E4 · Consent, sharing and access control
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E4-01 | As the platform I store consent policies with versions and texts per language | Admin CRUD; effective dates; re-consent trigger | MVP |
| E4-02 | As a person/guardian I give and withdraw consent per purpose | Records with method/actor; withdrawal revokes dependent grants in the same transaction | MVP |
| E4-03 | As an adult I choose what the family can see | Presets (Everything / Essentials / Nothing) + custom categories; immediate effect | MVP |
| E4-04 | As the system I decide every request with one policy function | `decide()` implemented; every route declares a policy; CI fails on unprotected routes | MVP |
| E4-05 | As QA I have an automated access matrix | `ACCESS_CONTROL.md` §8 encoded as parametrised tests (≥ 150 cases) incl. export, FHIR, notifications paths | MVP |
| E4-06 | As a person I can see who viewed my record | Access log from audit (actor name, role, purpose, time); guardians never see events about a teen's confidential modules | R2 |
| E4-07 | As a teen (16+) my confidential modules are private | Guardians see **no trace**: module list, timeline, readings/visits/vaccines tagged with the module, reminders, calendar, notifications, access log, exports, hub; every path in the matrix. MVP because the pilot includes 16–17-year-olds | MVP |
| E4-08 | As support I can use break-glass with approval | Reason, second approver, 60 min, DPO + family notified | R2 |
| E4-09 | As a person in danger I can hide my data and location from named family members fast | Safety-concern flow via support; immediate grant removal | R2 |
| E4-10 | As a 13–15-year-old I ask for a module to be confidential and my doctor approves | `teen_confidential_opt_in` API; doctor's approval recorded and audited; matrix cases | R2 |
| E4-11 | As a teen turning 16 I review the consents my guardians gave | Worker task on the birthday; app flow; earlier consents stay in force until answered (`ACCESS_CONTROL.md` §5 rule 4) | MVP |
| E4-12 | As a person I choose to show a sensitive module on the hub | `hub_display` consent per module (`hub_opt_in` modules only); only the person's own consent for teen-confidential data; withdrawal purges the hub cache within 60 s (ADR-0011) | R2 |
| E4-13 | As a clinician or health proxy I record a capacity assessment or best-interest decision | Assessor, date, scope, review date (≤ 6 months for location); used as consent method `best_interest` | R2 |

## E5 · Care teams and doctor verification
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E5-01 | As a doctor I apply with my licence | Licence number, authority, specialties, evidence; MFA set | MVP |
| E5-02 | As an admin I verify, reject or suspend doctors | Checklist (register lookup), notes, audit; suspended doctors lose access at once | MVP |
| E5-03 | As a family I request a verified doctor; as a doctor I invite a family | Double opt-in; codes expire; audit | MVP |
| E5-04 | As a guardian/adult I choose what each care-team member sees | Role defaults; category edits; sensitive categories opt-in | MVP |
| E5-05 | As a doctor I leave a care team; as a family I end a link | Access ends at once; notes keep authorship | MVP |
| E5-06 | As an org admin I manage my clinic's practitioners | Org roles | R3 |

## E6 · Catalogue and module engine
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E6-01 | As the platform I load a catalogue release from `packages/module-catalogue` | Schema-validated; checksum; staged → active | MVP |
| E6-02 | As the system I resolve each person's modules | Pure resolver; vectors for every life stage, sex and overlay; nightly job | MVP |
| E6-03 | As a person/guardian I accept, decline or pause offered modules | States per `MODULE_ENGINE.md` §5 | MVP |
| E6-04 | As a clinician I activate clinician-only modules and programmes | Permission check; audit | MVP |
| E6-05 | As an admin I simulate a person's modules | Simulator page + `POST /catalogue/resolve` | MVP |
| E6-06 | As an admin I override modules per country/org | Overrides table; preview impact; CSO approval for clinical changes | R2 |
| E6-07 | As the app/hub I fetch the catalogue incrementally | `GET /catalogue?since=`; ETag | MVP |
| E6-08 | As a guardian, person or clinician I set the flags and programme enrolments the resolver uses | `PUT /persons/{id}/flags` (dementia_safety, living_alone, wants_location_safety…; who may set which flag is in the API), `POST /persons/{id}/programmes` (clinician only); audit; resolver re-runs | MVP |

## E7 · Records
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E7-01 | As any capturing surface I upload observations in batches idempotently | ≤ 50 items; per-item results; reasons as in `API_DESIGN.md` §3 | MVP |
| E7-02 | As a viewer I get chart-ready series with targets | ≤ 200 points; daily summaries for long ranges; averages | MVP |
| E7-03 | As a person I log trackers (feeds, symptoms, falls…) validated by schema | Schema errors returned per field | MVP |
| E7-04 | As a person I upload documents privately | Virus scan, type check, EXIF strip, signed reads, audit | MVP |
| E7-05 | As a doctor I amend or mark a reading entered-in-error with a reason | History kept | MVP |
| E7-06 | As the system I flag cross-source duplicates | Same person/metric/value within 2 min from different sources → `duplicate_of_id` | MVP |
| E7-07 | As the system I partition and summarise observations | Monthly partitions created ahead; daily summary table | MVP |

## E8 · Child health
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E8-01 | As a parent I record a newborn's birth data | Birth record module; resolver activates infant modules | MVP |
| E8-02 | As a parent I see growth on neutral WHO curves; as a doctor I see z-scores | Sex-specific references; corrected age for preterm; vectors vs WHO anthro | MVP |
| E8-03 | As a parent I see vaccines due and record doses | Sri Lanka schedule data; due/overdue; unverified until verified | MVP |
| E8-04 | As a doctor I verify immunisations | Verify individual or bulk with card photo | MVP |
| E8-05 | As a parent I complete milestone checklists | Content licensed or linked; answers visible to doctor | MVP |
| E8-06 | As a paediatrician I assign developmental screening questionnaires | Licensed instruments only | R2 |
| E8-07 | As a doctor I choose Down syndrome growth charts for a child | Chart set per child | R2 |

## E9 · Maternity (R2)
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E9-01 | As a mother I start a pregnancy (LMP or scan) and see my timeline | EDD, gestational week, trimester; content per week | R2 |
| E9-02 | As an obstetrician I set BP/glucose targets and attention levels | Required or explicitly declined; validated pregnancy cuffs only | R2 |
| E9-03 | As a mother I report reduced movements | Fixed text; worklist event | R2 |
| E9-04 | As a mother I record the birth and my baby's record appears | Newborn created, linked; postpartum starts | R2 |
| E9-05 | As a mother who lost a pregnancy, all pregnancy content stops | Immediate; gentle follow-up | R2 |
| E9-06 | ANC schedule reminders per country pack | Sri Lanka and WHO packs | R2 |
| E9-07 | As a mother without an obstetrician on the platform I still have a safety net | Default pregnancy BP safety net and texts (HZ-04, `CLINICAL_SAFETY.md` §4.1); prompt to add the clinic/PHM as an external contact (E3-09) | R2 |
| E9-08 | As a clinician I record a pregnancy for a girl under 16 | Care-team clinicians only; starts the safeguarding pathway (`CLINICAL_SAFETY.md` §4.2, HZ-19) | R2 |
| E9-09 | As a pregnant teen (16–17) my pregnancy is private from my guardians | All pregnancy modules teen-confidential; records tagged with their module; matrix cases (H1 of the 22 Oct review) | R2 |

## E10 · Women's and teen health (R2)
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E10-01 | As a woman/teen I track my cycle privately | Never on hub; no third-party analytics; Health Connect import with consent | R2 |
| E10-02 | As a teen I message my doctor confidentially | Guardian cannot read; audit | R2 |
| E10-03 | As a woman I track menopause symptoms | Private; share with doctor | R2 |
| E10-04 | Screening reminders per country pack (cervical, breast) | Ages/intervals as data | R2 |

## E11 · Elder care and safety
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E11-01 | As an elder I check in daily with an explicit "I'm OK" | Tap on hub or app, or the hub's voice prompt; a face seen in passing never counts (HZ-09); due time per person; missed → alert chain | MVP |
| E11-02 | As a carer I log falls; as a doctor I assign a falls questionnaire | Fall tracker; questionnaire (R2) | MVP / R2 |
| E11-03 | As a carer I set up a GPS tracker and geofences | Traccar device + geofence via API; opaque names; consent or proxy decision required | R2 |
| E11-04 | As a carer I get exit/SOS/low-battery alerts and acknowledge them | Escalation; acknowledgement stops escalation | R2 |
| E11-05 | As a carer I share a wandering plan in one tap | PDF/link with photo, places, contacts; audit | R2 |
| E11-06 | As a doctor I review a polypharmacy list with flags | Beers flags doctor-only | R2 |
| E11-07 | As a family I set inactivity watch from hub presence | Rule + alert | MVP |

## E12 · Special needs (R2)
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E12-01 | As a carer I complete a care profile and communication passport | Shareable summary | R2 |
| E12-02 | As a carer I log behaviour (ABC) and sleep | Schemas; weekly patterns for clinicians | R2 |
| E12-03 | As a carer I build a visual schedule that shows on the hub | Editor in app; hub view with timers | R2 |
| E12-04 | As a carer I time and log seizures from the hub | One-tap timer; doctor's threshold alert | R2 |
| E12-05 | As a parent of a child with Down syndrome I get the health-supervision checklist | CSO-approved schedule | R2 |
| E12-06 | As a therapist I set goals and see home practice | Therapist role scope | R2 |

## E13 · Alerts and notifications
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E13-01 | As a doctor I set target-based alert rules | Rule templates; transparent firing data | R2 (targets MVP) |
| E13-02 | As the system I evaluate rules on new data and schedules | Outbox → worker; idempotent | MVP |
| E13-03 | As a family I configure the carer escalation order | Order, delays, channels, quiet hours exceptions for urgent | MVP |
| E13-04 | As the platform I deliver push/SMS/email without health data | Templates checked by tests for banned content | MVP |
| E13-05 | As ops I monitor delivery and run synthetic alert tests daily | Dashboard + alarm | MVP |

## E14 · Compliance and security
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E14-01 | Audit chain with nightly verification | Tamper test fails verification | MVP |
| E14-02 | Envelope encryption for sensitive columns | Keys from KMS/dev key; rotation script | MVP |
| E14-03 | Retention jobs | Per `DATA_MODEL.md` §8; dry-run report | MVP |
| E14-04 | DSAR handling in admin | Export (FHIR+PDF), rectify, erase with legal holds; 1-month SLA tracking | MVP |
| E14-05 | Threat models per surface | Documented, reviewed per release | MVP |
| E14-06 | ASVS/MASVS self-assessment | Mapping sheet with evidence | MVP |
| E14-07 | Penetration test before pilot | Report; high/critical closed | MVP |
| E14-08 | DPO and PDPA baseline by 1 Jan 2027; DPIA v1 before real data | DPO appointed (external allowed), records of processing, breach procedure, processor agreements live by 1 Jan 2027 (Phase 1); DPIA v1 signed before the pilot (Phase 6) | MVP |
| E14-09 | Clinical safety case v1 | CSO signed | MVP |
| E14-10 | NMRA categorisation letter request | Submitted | MVP |

## E15 · Family Hub
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E15-01 | Port `/api/v1/hub/*` to the `devices` context | hms-stub contract tests pass against api | MVP |
| E15-02 | Members with life stage, hub-safe modules, metrics, proxy rights | Contract extended, backward compatible | MVP |
| E15-03 | Proxy measurement chooser | Guardian/permitted carer only; audit `entered_by` | MVP |
| E15-04 | Infant weighing flow | Difference stored and labelled | MVP |
| E15-05 | Due today, daily check-in, SOS, review acknowledgement | Screens + endpoints | MVP |
| E15-06 | Module-driven Orbit cards | Infant and elder variants (MVP); pregnancy variant only with `hub_display` opt-in (R2, E4-12); Playwright screenshots | MVP / R2 |
| E15-07 | Quick logs and visual schedule | Feed, nappy, seizure timer, fall | R2 |
| E15-08 | Simple mode | Layout variant; usability test with elders | R2 |

## E16 · Mobile app
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E16-01 | Rebrand and repoint the patient app | New app id (D-5), API base, EAS project | MVP |
| E16-02 | Onboarding with OTP, family, dependants, invites, consents, grants | Journey 1 passes | MVP |
| E16-03 | Member switcher and member home from `/summary` | Correct person header always visible | MVP |
| E16-04 | Offline queue for writes | Airplane-mode test: entries sync later, no duplicates | MVP |
| E16-05 | Health Connect expanded import | Vitals, weight, sleep, steps; idempotent | MVP |
| E16-06 | Module screens (growth, vaccines, medicines, documents, symptoms) | Maestro flows | MVP |
| E16-07 | GATT BLE devices | BP, PLX, thermometer, glucose with decoders shared with hub vectors | R2 |
| E16-08 | Location sharing and safety screens | Play background-location disclosure | R2 |

## E17 · Doctor web
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E17-01 | Worklist ordered by urgency | Alerts → due review → new data | MVP |
| E17-02 | Member chart with vitals, growth, immunisations, documents, notes | Provenance markers; targets band | MVP |
| E17-03 | Targets editor | Validation as HMS H-07; audit | MVP |
| E17-04 | Mark reviewed with message | Shown on app and hub | MVP |
| E17-05 | PDF report | Period selection; respects confidentiality | MVP |
| E17-06 | Live updates | SSE per practitioner | MVP |
| E17-07 | Messages, questionnaires, pregnancy/women/elder/special-needs tabs | | R2 |

## E18 · Admin web
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E18-01 | Families and people administration without PHI | Support actions audited | MVP |
| E18-02 | Doctor verification queue | E5-02 | MVP |
| E18-03 | Catalogue browser and life-stage simulator | E6-05 | MVP |
| E18-04 | Hubs and peripheral catalogue | Provision, revoke, models with validation/regulatory status | MVP |
| E18-05 | Audit search and DSAR queue | E14-01/E14-04 | MVP |
| E18-06 | Content and translations with clinical approval | Workflow | R2 |

## E19 · Interoperability
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E19-01 | FHIR R4 export | HL7 validator passes in CI | MVP |
| E19-02 | Share link / QR | Time-limited, read-only, audited, revocable | R2 |
| E19-03 | IPS | IG 2.0.1 | R3 |
| E19-04 | FHIR read API + SMART 2.2 | Scopes; consent-aware | R3 |
| E19-05 | HMS connector | Link by display id + OTP; import visits, prescriptions, appointments | R3 |

## E20 · Operations
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E20-01 | Staging and production as code | OpenTofu; reviewed changes | MVP |
| E20-02 | Backups and restore drill | RPO 15 min / RTO 4 h demonstrated | MVP |
| E20-03 | Observability | Traces, metrics, logs without PHI; dashboards | MVP |
| E20-04 | Hub fleet dashboard | Heartbeat, firmware, sync lag, batteries | MVP |
| E20-05 | Support playbook | WhatsApp line, swap-out, onboarding help | MVP |

## E21 · Billing (R3)
| ID | Story | Acceptance | Rel |
|---|---|---|---|
| E21-01 | Plans and entitlements | Feature gating by plan | R3 |
| E21-02 | Payments (local gateway + international cards for diaspora) | Webhooks; idempotent | R3 |
| E21-03 | Lapse to read-only | Export always available | R3 |
