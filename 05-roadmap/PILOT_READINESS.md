# Cure Global — Pilot readiness and go/no-go

*v0.1 · 23 Oct 2026 · ROADMAP Phase 6 (8 Mar – 16 Apr 2027) exit review before the pilot (26 Apr – 19 Jul 2027). Every row names its evidence, an owner role and a status. Statuses: **software ready** (built and tested in the repository; still needs the named review) · **needs people** (only people can close it: signatures, recruitment, procurement, regulators) · **open** (work not done yet). Fill in the sign-off cells at the go/no-go meeting; a single unsigned **gate** row means **no-go**.*

## 1. Go/no-go gates (ROADMAP Phase 6 exit)

| # | Gate | Evidence | Owner | Status | Sign-off (name, date) |
|---|---|---|---|---|---|
| G1 | **Security findings closed** — no open high/critical from scanners or the external pen test; mediums dispositioned | `docs/03-compliance/SECURITY_ASSESSMENT.md` (scanner results and dispositions), pen-test report (vendor) per `docs/03-compliance/PEN_TEST_PLAN.md`, `.github/workflows/ci.yml` security jobs | Eng lead + external tester | Scans: software ready · pen test: needs people | |
| G2 | **DPIA approved** — DPO opinion recorded, residual risk accepted by management | `docs/03-compliance/DPIA.md`, `docs/03-compliance/ROPA.md` | DPO, Dilshan | needs people | |
| G3 | **CSO sign-off** — clinical safety case v1 signed; catalogue release `active` with CSO approval; safety-net texts and urgent bands approved | `docs/03-compliance/CLINICAL_SAFETY_CASE.md`, `docs/03-compliance/CLINICAL_SAFETY.md` §3–§4, `scripts/hazard_coverage.py` (no hazard without a test, or each gap accepted), admin console release approval | Clinical Safety Officer | needs people | |
| G4 | **Restore drill passed** — RPO ≤ 15 min, RTO ≤ 4 h demonstrated (E20-02), audit chain verifies after restore | `scripts/backup.sh`, `scripts/backup.ps1`, `scripts/restore_drill.ps1`, result recorded in `docs/06-operations/RUNBOOK.md` (restore section); repeat on staging with managed-Postgres PITR | Ops lead | Local drill: software ready · staging drill: open | |

## 2. Phase 6 work items

### 2.1 Security (E14-05, E14-06, E14-07)

| # | Criterion | Evidence | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| S1 | Threat models (STRIDE) per surface — API, admin web, doctor web, hub (local services, MQTT, vision), mobile app, integrations — reviewed this release | `docs/03-compliance/THREAT_MODELS.md` | Eng lead | software ready (review: needs people) | |
| S2 | ASVS 4.0.3 L2 (L3 auth/session/access) and MASVS self-assessment with evidence | `docs/03-compliance/ASVS_MASVS_ASSESSMENT.md` | Eng lead | software ready (review: needs people) | |
| S3 | External penetration test (API, web, app, hub) done; high/critical closed and retested | `docs/03-compliance/PEN_TEST_PLAN.md` (scope, rules of engagement), vendor report | Dilshan (contract), vendor | needs people | |
| S4 | Static and dependency scanning in CI (ruff S, pip-audit, pnpm audit, Semgrep, Trivy, gitleaks); blocking on high/critical | `.github/workflows/ci.yml`, `SECURITY_ASSESSMENT.md` | Eng lead | software ready | |
| S5 | No PHI in logs: structured JSON logs with a scrubber; log-scan test green | `services/api/tests/test_log_scan.py`, TEST_STRATEGY.md §3.7 | Eng lead | software ready | |
| S6 | Vulnerability disclosure policy published | Website / `SECURITY.md` | Eng lead | open | |
| S7 | Staff accounts: MFA enrolled for every doctor and staff member; break-glass reviewers named | Admin console (staff roles), `ACCESS_CONTROL.md` | Ops lead | needs people | |

### 2.2 Privacy (E14-03, E14-04, E14-08)

| # | Criterion | Evidence | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| P1 | DPO appointed (external allowed) and named in the privacy notice | Appointment letter | Dilshan | needs people (due by 1 Jan 2027) | |
| P2 | Records of processing complete | `docs/03-compliance/ROPA.md` | DPO | software ready (review: needs people) | |
| P3 | Breach procedure checked against `PRIVACY_CONSENT_SECURITY.md` §6 and exercised once (table-top) | `docs/03-compliance/BREACH_PROCEDURE.md`, exercise notes | DPO + ops | Procedure: software ready · exercise: needs people | |
| P4 | Processor agreements signed (cloud, SMS, push, email, WhatsApp Business provider) and transfer instrument if hosting outside Sri Lanka (D-4) | Contracts | Dilshan + counsel | needs people | |
| P5 | Consent texts en/si/ta reviewed by counsel and native-speaker clinicians; versions loaded as `consent_policy` rows | `docs/03-compliance/CONSENT_TEXT_REVIEW_CHECKLIST.md` | DPO + counsel + clinicians | needs people | |
| P6 | Retention jobs per `DATA_MODEL.md` §8 with a dry-run report; legal holds respected; retention schedule approved by counsel | `services/api/app/privacy/` (retention), worker job, admin dry-run endpoint, `DATA_MODEL.md` §17 | Eng lead; counsel approves the schedule | Jobs: software ready · schedule approval: needs people | |
| P7 | DSAR handling: export (FHIR + PDF + audit extract, policy-filtered), rectify, erase with legal holds; 1-month SLA tracked | Admin DSAR queue, `services/api/app/privacy/`, `API_DESIGN.md` §12 | DPO | software ready | |
| P8 | Privacy notice (plain language, en/si/ta) published in app and on hub | App/hub screens | DPO | needs people | |

### 2.3 Clinical safety (E14-09, IEC 62366-1)

| # | Criterion | Evidence | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| C1 | Clinical safety case v1 signed | `CLINICAL_SAFETY_CASE.md` | CSO | needs people | |
| C2 | Every hazard has a verifying test or an accepted gap | `scripts/hazard_coverage.py` in CI | Eng lead + CSO | software ready | |
| C3 | Summative usability with elders, parents (incl. pregnant women) and doctors: critical tasks without use errors | `docs/06-testing/USABILITY_SUMMATIVE_PLAN.md`, session reports | Product + CSO | needs people | |
| C4 | Safety-net texts and urgent bands approved; si/ta translations by native-speaker clinicians | `CLINICAL_SAFETY.md` §4.1, `metrics.yaml` | CSO + reviewers | needs people | |
| C5 | Daily synthetic alert test green for 14 consecutive days on staging | `synthetic_alert_run` rows, observability dashboard | Ops | open (staging) | |

### 2.4 Operations (E20-01 … E20-05)

| # | Criterion | Evidence | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| O1 | Staging and production as code (OpenTofu), reviewed; region per D-4 | `infra/tofu/` (`tofu fmt`/`validate` clean) | Ops lead | Skeleton: software ready · apply + region: needs people | |
| O2 | Backups encrypted, second location, restore drill (G4) | `scripts/backup.*`, `scripts/restore_drill.ps1` | Ops lead | see G4 | |
| O3 | Observability: metrics without ids/PHI, dashboards, alert rules routed to on-call | `infra/observability/` (Grafana dashboards, Prometheus rules), API and worker `/metrics` | Ops lead | software ready (on-call routing: needs people) | |
| O4 | Hub fleet dashboard: heartbeat, firmware, sync lag, batteries | Admin console Devices page, `infra/observability/` fleet panels | Ops lead | software ready | |
| O5 | On-call runbook (incidents, alert storms, restore, key rotation, hub swap-out) | `docs/06-operations/RUNBOOK.md` | Ops lead | software ready (rota: needs people) | |
| O6 | Support playbook (WhatsApp line, onboarding help, swap-out within 48 h) | `docs/06-operations/SUPPORT_PLAYBOOK.md` | Support lead | software ready (staffing: needs people) | |
| O7 | Performance at the 5-year design point: p95 < 300 ms reads, < 500 ms batch writes | `docs/06-testing/PERFORMANCE.md`, `tests/perf/` | Eng lead | software ready (repeat on staging: open) | |

### 2.5 Regulatory (E14-10)

| # | Criterion | Evidence | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| R1 | NMRA Product Categorisation Letter requested (describing the real features); alerting separable by feature flag | `docs/03-compliance/NMRA_CATEGORISATION_REQUEST.md` (draft + tracking table) | Regulatory lead + counsel + CSO | Draft: software ready · alert flag gate: open · submission: needs people | |
| R2 | Peripheral catalogue with NMRA status per model; only `approved` models in kits | `packages/module-catalogue/catalogue/peripherals.yaml` (validated in CI; nothing approved yet — every NMRA status `unknown`) | Procurement + CSO | Data: software ready · status checks: needs people | |
| R3 | TRCSL position for the hub; vendor licence; labelling | `docs/03-compliance/TRCSL_HUB_POSITION.md` | Regulatory lead | needs people | |
| R4 | Marketing and store copy consistent with the intended purpose (no diagnosis/accuracy/NMRA-approval claims) | `STANDARDS_AND_REGULATIONS.md` §1, `docs/cure-home/05-marketing/VIDEO_PRODUCTION_GUIDE.md` | Product + compliance | needs people | |
| R5 | Medical council position on remote consultation confirmed (messaging is not teleconsultation) | `STANDARDS_AND_REGULATIONS.md` §4 | Counsel | needs people | |

## 3. Pilot logistics

| # | Item | Target (`BUSINESS_MODEL.md` §4) | Owner | Status | Sign-off |
|---|---|---|---|---|---|
| L1 | Families recruited and consented | 50–100 families: ≥ 20 infants/children, ≥ 20 elders, ≥ 10 pregnancies, ≥ 5 special-needs members | Pilot coordinator | needs people | |
| L2 | Doctors recruited, licences verified, MFA enrolled, care teams set up | 5–10 (family physicians, a paediatrician, an obstetrician); each with response time and availability text | Pilot coordinator | needs people | |
| L3 | Hubs prepared (D-12 mix: Surface/Pi for ~10 homes, Lite for the rest), provisioned in the admin console, firmware pinned, kiosk lockdown, disk encryption | 20–30 hubs + 10 % spares for swap-out | Ops | needs people | |
| L4 | Device kits: validated, NMRA-registered cuffs (pregnancy-validated cuffs for the maternity kit), scales, oximeters, thermometers, glucometers + strips; pre-paired at the branch | One kit per hub family, programme-specific add-ons | Procurement | needs people | |
| L5 | Training delivered (families, doctors, support) | `docs/06-operations/TRAINING_OUTLINES.md` | Training lead | needs people | |
| L6 | Support line staffed: WhatsApp Business number live, hours published, escalation contacts listed | `SUPPORT_PLAYBOOK.md` | Support lead | needs people | |
| L7 | Escalation contacts per family (carers in order, external care contacts — MOH clinic/PHM for pregnancies) entered and tested with a test alert | App/admin, synthetic test per family | Pilot coordinator | needs people | |
| L8 | Consent forms and information sheets printed in si/ta/en for assisted consent; ethics position (service evaluation vs research) confirmed | Consent texts (P5) | DPO + Dilshan | needs people | |
| L9 | Production environment live with real-data controls (KMS keys, backups, monitoring, no dev flags: `APP_ENV=production`, no `X-Dev-Actor`, no dev sign-in, no demo seed) | `infra/tofu/`, runbook pre-flight | Ops lead | open | |
| L10 | Data: no copy of production data anywhere else; staging synthetic only | TEST_STRATEGY.md §2 | Ops lead | needs people | |

## 4. KPIs to review weekly (`VISION_AND_SCOPE.md` §7)

| Area | Measure | Pilot target (hypothesis) | Where it comes from |
|---|---|---|---|
| Engagement | Families with ≥ 3 active members using the hub weekly | ≥ 70 % at week 12 | Admin analytics (k ≥ 5 suppression) |
| Clinical loop | Members on a care team whose doctor reviewed their data in the last 30 days | ≥ 80 % | `review` rows; doctor worklist |
| Data quality | Hub readings attributed to the right person (audited sample) | ≥ 98 % | Weekly attribution audit (HZ-01) |
| Child health | Children with up-to-date vaccine records entered | ≥ 90 % | Immunisation analytics |
| Safety | Elder check-in misses that reached a caregiver within 15 min | 100 % (synthetic tests) | Alert events, synthetic runs |
| Trust | Members keeping face sign-in on after 30 days | ≥ 85 % | Hub consent records |
| Privacy | PHI reads with a recorded purpose | 100 % | Audit events |
| Reliability | Readings synced within 24 h | ≥ 99 % | Hub sync lag (fleet dashboard) |

Also weekly: support tickets by category, alert acknowledgement times, notification delivery failures, break-glass sessions (each reviewed by the DPO within 2 working days), DSARs open/overdue.

## 5. Stop criteria (pause the pilot and convene the CSO, DPO and Dilshan within 24 h)

Any one of these pauses enrolment and, where it applies, the affected function (feature flag) until the root cause is fixed and the hazard log updated:

1. **Any teen-confidential disclosure** to a guardian on any path (app, hub, PDF, FHIR, notification, share link) — HZ-12. Also any disclosure of reproductive-health or mental-wellbeing data outside the person's grants.
2. **A missed urgent alert:** an urgent-band reading, SOS or missed check-in whose escalation did not reach anyone, or the daily synthetic alert test failing two days running — HZ-09, HZ-18.
3. **Attribution error rate > 2 %** in the weekly audited sample (target ≥ 98 % correct) — HZ-01.
4. **A personal-data breach** meeting the notification threshold (`BREACH_PROCEDURE.md`), or audit-chain verification failing.
5. **"? Check this reading" shown for a possible-but-dangerous value**, or a population threshold / "abnormal" label shown on a family surface — HZ-18, HZ-03.
6. **A serious incident or near miss** reported by a family or doctor that the CSO judges attributable to the platform.
7. **A safety-concern (family abuse) report** where the fast path failed to hide the person's data or location in time — HZ-13.
8. A regulator (NMRA, TRCSL, Data Protection Authority) asks us to stop a function.

## 6. Go/no-go meeting

- **When:** end of Phase 6 (by 16 Apr 2027). **Who:** Dilshan (decision), CSO, DPO, engineering lead, ops lead, pilot coordinator.
- **Decision rule:** all gates G1–G4 signed; every other row either signed or explicitly accepted with a date and owner; stop criteria understood by everyone on the on-call rota.

| Decision | Date | Conditions | Signed |
|---|---|---|---|
| Go / No-go | | | |
