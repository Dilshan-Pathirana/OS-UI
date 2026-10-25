# Cure Global — ISO/IEC 27001 and 27701 readiness (gap assessment)

*v0.1 · 23 Oct 2026 · R3 roadmap item. A self-assessment of the controls that exist in the code and docs today against ISO/IEC
27001:2022 Annex A (the 93 controls of ISO/IEC 27002:2022) and the privacy extension ISO/IEC 27701 (controller and processor
clauses). It is evidence for planning, **not** a certification opinion: certification needs an ISMS run for a period (scope,
risk assessment, Statement of Applicability, internal audit, management review) and an accredited auditor. Related:
`PRIVACY_CONSENT_SECURITY.md` (controls and incident process), `STANDARDS_AND_REGULATIONS.md` (regulatory map),
`CLINICAL_SAFETY.md` (hazard log), `docs/02-architecture/ACCESS_CONTROL.md`.*

> ISO/IEC 27701 was revised in 2025 as a standalone privacy information management system standard (no longer only an
> extension clause-by-clause of 27001). The mapping below uses the controller/processor control families (the 2019 numbering
> 7.x/8.x, carried into the 2025 annexes) because they describe what has to exist; re-map the numbers to the edition the
> certification body audits against. ⚠ Confirm the edition with the auditor before the gap closure plan is fixed.

## 1. Scope proposal and status legend

**Proposed ISMS/PIMS scope:** the Cure Global platform — API and worker, admin and doctor consoles, the mobile app, the Family
Hub software and its device identity, the hosting environment, and the people and suppliers who run them. Cure Home's HMS pilot
is out of scope (separate system); hardware manufacturing is out of scope (bought-in devices).

| Status | Meaning |
|---|---|
| **Implemented** | In the code or a reviewed doc, with an automated test or a repeatable check |
| **Partial** | Designed and partly built; a named gap remains |
| **Planned** | In the roadmap/backlog with an owner phase; nothing operating yet |
| **Organisational** | Needs a policy, a person or a process — software can only support it |

## 2. Management-system clauses (27001 §4–§10)

| Clause | Status | Evidence / gap |
|---|---|---|
| 4 Context, interested parties, scope | Partial | Context and parties: `docs/01-product/VISION_AND_SCOPE.md`, `BUSINESS_MODEL.md`. **Gap:** a signed ISMS scope statement |
| 5 Leadership, policy, roles | Organisational | **Gap:** information security policy signed by management; ISMS owner; DPO appointment (E14-08, by 1 Jan 2027) |
| 6.1 Risk assessment and treatment | Partial | Clinical risk: `CLINICAL_SAFETY.md` hazard log (ISO 14971 style); product risks: `docs/05-roadmap/RISKS_AND_DECISIONS.md`; threat models planned per entry point (E14-05). **Gap:** an information-security risk register with owners, a treatment plan and the Statement of Applicability (§5 below is its draft) |
| 6.2 Objectives | Planned | KPIs exist for product (`BUSINESS_MODEL.md` §6); add security/privacy objectives (MFA coverage, patch latency, DSAR turnaround) |
| 7 Support (competence, awareness, documents) | Partial | Docs are version-controlled in git with review (`.github/pull_request_template.md`). **Gap:** training records, awareness programme |
| 8 Operation | Partial | Change control through PRs + CI (`.github/workflows/ci.yml`); release signing (cosign, SBOM). **Gap:** operating procedures in `docs/07-operations/` (planned, E20-05) |
| 9 Performance evaluation, internal audit, management review | Planned | Audit-chain verification is automated (nightly). **Gap:** internal audit programme, management review minutes |
| 10 Improvement, nonconformity, CAPA | Partial | CAPA step in the incident process (`PRIVACY_CONSENT_SECURITY.md` §6). **Gap:** a CAPA log |

## 3. Annex A — organisational controls (5.1–5.37)

| Control | Status | Evidence in this repository / gap |
|---|---|---|
| 5.1 Policies for information security | Organisational | Rules exist as engineering rules (`CLAUDE.md`, non-negotiables 1–15) — **gap:** management-approved policy set |
| 5.2 Roles and responsibilities | Partial | Platform roles in code (`app/core/actor.py STAFF_ROLES`, `PLATFORM_ROLES`); CSO approval of catalogue releases (`app/modules/catalogue.py`); DPO role for break-glass review. **Gap:** named people |
| 5.3 Segregation of duties | Implemented | Catalogue: content manager stages, CSO approves, super admin activates (seed + API); break-glass needs a second approver (`app/api/break_glass.py`); org admins can't open PHI or break-glass (R3, `tests/test_policy_r3.py`) |
| 5.4 Management responsibilities | Organisational | — |
| 5.5–5.6 Contact with authorities / special-interest groups | Organisational | Regulators listed in `STANDARDS_AND_REGULATIONS.md` (PDPA DPA, NMRA, TRCSL) — **gap:** contact register |
| 5.7 Threat intelligence | Planned | Dependency and image scanning in CI; **gap:** a feed review routine |
| 5.8 Information security in project management | Implemented | Every PR: tests, migration, docs, privacy/regulatory/clinical checklist (`docs/05-roadmap/ROADMAP.md` "Working rhythm") |
| 5.9 Inventory of information and assets | Partial | Data inventory `PRIVACY_CONSENT_SECURITY.md` §1, data model `DATA_MODEL.md`, hub fleet (`/admin/hubs`). **Gap:** asset register incl. cloud resources and laptops |
| 5.10 Acceptable use | Organisational | — |
| 5.11 Return of assets | Organisational | Hub revocation and replacement exist (`POST /admin/hubs/{id}/revoke`) |
| 5.12 Classification | Implemented | Data categories and module sensitivity (normal / sensitive / restricted, teen-confidential) in the catalogue; enforced by `app/consent/policy.py` |
| 5.13 Labelling | Implemented | Every record carries its `module_code`; exports tag it (`urn:cure-global:module`) so receivers keep the rules |
| 5.14 Information transfer | Implemented / Partial | FHIR export, IPS and the SMART read API pass the policy per record and are audited as exports (`app/exports`, `app/api/fhir_api.py`); share links (R2). **Gap:** transfer agreements with receiving organisations |
| 5.15 Access control | Implemented | One policy, deny by default (`app/consent/policy.py`), access matrix tests (`tests/test_policy*.py`, `tests/test_access_api.py`); every route declares its protection (`tests/test_routes.py`) |
| 5.16 Identity management | Implemented | Person ≠ account ≠ family (ADR-0004); practitioner verification (E5-02); org practitioner invites bound to the invited email (R3) |
| 5.17 Authentication information | Implemented | Argon2 password hashes, HMAC-bound OTPs, TOTP secrets envelope-encrypted, recovery codes hashed (`app/identity`) |
| 5.18 Access rights (provision, review, removal) | Partial | Staff roles granted/revoked by super admin with audit; suspended practitioners lose coverage at once; org admins deactivate practitioners (R3). **Gap:** periodic access review report |
| 5.19–5.22 Supplier relationships and monitoring | Organisational | Suppliers known: cloud, SMS (Textware), Expo push, email, payment gateways (PayHere/Stripe adapters, R3), HMS. **Gap:** DPAs and security questionnaires for each |
| 5.23 Cloud services | Planned | Hosting decision open (`RISKS_AND_DECISIONS.md`); IaC skeleton planned (E20-01) |
| 5.24–5.28 Incident management and evidence | Partial | Incident process `PRIVACY_CONSENT_SECURITY.md` §6; tamper-evident audit chain (`app/audit/service.py`, nightly verify); **gap:** runbooks, on-call, evidence handling procedure |
| 5.29–5.30 Continuity and ICT readiness | Planned | RPO 15 min / RTO 4 h targets (`ARCHITECTURE.md` §6); hub and app work offline; restore drill planned (E20-02) |
| 5.31 Legal, statutory, regulatory, contractual | Partial | `STANDARDS_AND_REGULATIONS.md`; licence gates (WHO growth tables placeholder, licensed instruments not shipped — CLAUDE.md rule 14) |
| 5.32 Intellectual property | Implemented | Placeholder growth reference until licence (D-9); catalogue marks unlicensed content |
| 5.33 Protection of records | Implemented | Append-only audit partitions, soft-state history (revisions, superseded notes, retired targets), retention schedule `DATA_MODEL.md` §8 |
| 5.34 Privacy and protection of PII | Implemented / Partial | See §6 (27701). **Gap:** DPIA v1 signed before the pilot (E14-08) |
| 5.35 Independent review | Planned | Pen test before pilot (E14-07); ISO certification audit later |
| 5.36 Compliance with policies | Partial | CI gates (ruff with bandit rules `S`, import contracts, tests, OpenAPI contract, secret scan) |
| 5.37 Documented operating procedures | Planned | `docs/06-testing/LOCAL_DEV_DOCKER.md` exists for dev; production runbooks planned |

## 4. Annex A — people (6.1–6.8), physical (7.1–7.14), technological (8.1–8.34)

| Control | Status | Evidence / gap |
|---|---|---|
| 6.1–6.6 Screening, terms, awareness, discipline, after employment, confidentiality | Organisational | **Gap:** HR procedures and NDAs; clinicians' confidentiality via licence + platform terms |
| 6.7 Remote working | Organisational | — |
| 6.8 Event reporting | Partial | Break-glass reported to the DPO automatically; incident reporting channel to define |
| 7.x Physical security | N/A for the cloud provider / Organisational for offices | Hub: read-only root, encrypted data, kiosk lockdown, SSH off in production (Cure Home plan) |
| 8.1 User endpoint devices | Partial | App lock on the mobile app; hub device identity (Ed25519) and revocation (`app/devices`) |
| 8.2 Privileged access | Implemented | Staff and doctors need TOTP (`actor_for_account` refuses single-factor); break-glass time-boxed ≤ 60 min, approved, family notified, DPO reviews |
| 8.3 Information access restriction | Implemented | Policy per record and module; teen confidentiality on every path (HZ-12/HZ-15 tests); coordinator summary-only scope and SMART app scopes (R3) |
| 8.4 Access to source code | Partial | GitHub repository permissions — **gap:** branch protection and CODEOWNERS evidence |
| 8.5 Secure authentication | Implemented | EdDSA JWTs 15 min, rotating refresh with reuse detection, lockout with backoff, rate limits (`app/platform/ratelimit.py`); SMART tokens 5 min, PKCE S256 only (R3) |
| 8.6 Capacity management | Planned | Partitioning and summary tables (`DATA_MODEL.md` §9); load tests planned |
| 8.7 Protection against malware | Implemented | Upload scanning (`app/platform/scan.py`, clamd fails closed in production), content sniffing, image metadata stripped |
| 8.8 Technical vulnerabilities | Partial | Dependency/image scanning and SBOM in CI; **gap:** patch SLA and vulnerability disclosure policy |
| 8.9 Configuration management | Partial | Settings in code with safe defaults (`app/config.py`); fake gateways and dev actors refuse to run outside dev/test. **Gap:** hardened baselines for hosts |
| 8.10 Information deletion | Partial | Retention jobs planned (E14-03); hub prunes; DSAR erase workflow (E14-04) |
| 8.11 Data masking | Implemented | Phones/emails masked in logs and HMS OTP destinations; analytics k ≥ 5 suppression; org admin counts suppressed under 5 (R3) |
| 8.12 Data leakage prevention | Implemented | No PHI in logs, topics, notifications (`app/notifications/templates.py` banned-content tests); outbox payloads ids only; billing texts carry no amounts |
| 8.13 Backup | Planned | Encrypted backups, quarterly restore (E20-02) |
| 8.14 Redundancy | Planned | Two app nodes, managed Postgres HA (`ARCHITECTURE.md` §5) |
| 8.15 Logging | Implemented | Hash-chained `audit_event` for every PHI read/write with basis and purpose; app exports and imports (`export`, `import` actions, R3) |
| 8.16 Monitoring activities | Partial | Notification delivery stats, hub fleet dashboard, HMS connector health (`/admin/integrations/hms`, R3). **Gap:** SIEM alerting on security events |
| 8.17 Clock synchronisation | Implemented | UTC `timestamptz` everywhere; hub time sync; webhook signature 5-minute tolerance (R3) |
| 8.18 Privileged utility programs | Organisational | — |
| 8.19 Software on operational systems | Partial | Signed images (cosign); hub signed A/B OTA (plan) |
| 8.20–8.22 Network security, services, segregation | Planned | Private networking for DB/Valkey/storage; `/internal/*` webhooks not exposed at the edge |
| 8.23 Web filtering | N/A | — |
| 8.24 Use of cryptography | Implemented | Envelope encryption with key rotation (`app/platform/crypto.py`, `scripts/rotate_kek.py`); keyed lookup hashes; Ed25519 signing; HMAC-SHA256 webhooks (R3). **Gap:** KMS in production |
| 8.25 Secure development life cycle | Implemented | IEC 81001-5-1-style practices: reviews, tests per story, hazard ids in tests, threat models planned |
| 8.26 Application security requirements | Implemented | ASVS L2/L3 baseline (`PRIVACY_CONSENT_SECURITY.md` §5.3); problem+json errors that never reveal what exists |
| 8.27 Secure architecture | Implemented | Modular monolith with import contracts (`pyproject.toml` import-linter), trust boundaries `ARCHITECTURE.md` §1 |
| 8.28 Secure coding | Implemented | Ruff with bandit rules, Pydantic validation, `# SECURITY:` tags on security-relevant code |
| 8.29 Security testing | Partial | Access-matrix and abuse-path tests; **gap:** DAST and the external pen test |
| 8.30 Outsourced development | Organisational | — |
| 8.31 Separation of environments | Implemented | `APP_ENV` dev/test/staging/production; dev-only routes 404 elsewhere; fake HMS, fake payment gateway, fake wearable refuse outside dev/test |
| 8.32 Change management | Implemented | PRs + CI + reviewed migrations (expand → migrate → contract) |
| 8.33 Test information | Implemented | Synthetic seed data only (`app/seed*.py`), never real patients |
| 8.34 Protection during audit testing | Organisational | Break-glass is the only staff path to PHI, and it is audited |

## 5. Statement of Applicability (draft summary)

All 93 Annex A controls are applicable except 7.x for office space the company does not run (cloud data centres inherit the
provider's certification — collect the provider's ISO 27001 certificate and SOC 2 report) and 8.23 (no corporate web proxy).
The technical controls are mostly Implemented or Partial; most open items are Organisational (policies, people, suppliers)
and operational (backups, runbooks, monitoring). The SoA must list each of the 93 controls with its justification, status,
owner and evidence link — the tables above are its first draft.

## 6. ISO/IEC 27701 — PII controller and processor controls

Cure Global is a **PII controller** for families' and doctors' data, and acts as a **processor** where a clinic or organisation
directs processing (org-paid programmes, R3). HMS is a separate controller (the connector imports with the person's consent).

| Control family (27701:2019 numbering) | Status | Evidence / gap |
|---|---|---|
| 7.2.1 Purpose identified and documented | Implemented | Consent purposes are explicit and versioned (`consent_policy`; `app/consent/sharing.py PURPOSES`, R3 adds `hms_connector`, `smart_app`) |
| 7.2.2 Lawful basis | Partial | `PRIVACY_CONSENT_SECURITY.md` §1 table. **Gap:** counsel sign-off per purpose (PDPA No. 9 of 2022) |
| 7.2.3–7.2.4 When and how to obtain consent; records of consent | Implemented | Method recorded (self / guardian / assisted / best-interest proxy), co-signature for joint guardians, never deleted (withdrawal is a state) |
| 7.2.5 Privacy impact assessment | Planned | DPIA plan `PRIVACY_CONSENT_SECURITY.md` §4; DPIA v1 before real data (E14-08) |
| 7.2.6 Contracts with processors | Organisational | **Gap:** DPAs (cloud, SMS, push, email, PayHere, Stripe) |
| 7.2.7 Joint controller | Organisational | Define with clinics (organisations as tenants) and HMS |
| 7.2.8 Records of processing | Partial | Data inventory exists; **gap:** formal RoPA |
| 7.3.1–7.3.4 Obligations to PII principals, notices | Partial | Consent texts per locale (placeholders until counsel), "who viewed my record" (R2 access log) |
| 7.3.4 Withdrawal of consent | Implemented | Withdrawal revokes dependent grants in the same transaction; SMART apps and HMS syncs stop on the next request (R3 tests) |
| 7.3.5 Objection | Partial | Opt-outs per module (decline/pause); **gap:** objection workflow in DSAR |
| 7.3.6–7.3.9 Access, correction, erasure; informing third parties | Partial | DSAR queue (E14-04), FHIR/PDF/IPS exports always available (never locked by billing, R3), observation amendment history (E7-05) |
| 7.3.10 Automated decision making | Implemented | No automated decisions about individuals; alerts are clinician-configured rules, families see only fixed status words (ADR-0012) |
| 7.4.1–7.4.4 Limit collection and processing; accuracy | Implemented | Per-surface minimisation (hub-safe modules only, notifications without health data); plausibility and unit checks; provenance on every value |
| 7.4.5–7.4.8 De-identification, temporary files, retention, disposal | Partial | k ≥ 5 analytics; retention schedule; **gap:** retention jobs (E14-03) and verified disposal |
| 7.4.9 Transmission controls | Implemented | TLS; signed webhooks; patient-bound app tokens; export auditing |
| 7.5.1–7.5.4 Transfers between jurisdictions; disclosures | Partial | Hosting region decision pending; payment gateways for diaspora cards (Stripe) imply a transfer of billing data only (no health data) — record it |
| 8.x Processor obligations (organisation-directed processing) | Planned | Org admins see no PHI (R3); define the clinic agreement: instructions, sub-processors, return/deletion at contract end |

## 7. Gap-closure plan (proposal)

1. **Now (R3):** appoint the ISMS owner and DPO; write the scope and the information-security policy; turn §3–§6 into the SoA and the
   risk register; collect supplier DPAs (cloud, messaging, payment gateways).
2. **Before the pilot:** DPIA v1 signed; pen test; backup and restore drill; runbooks and on-call; access-review report (staff roles,
   org admins, practitioner roles) from the admin console.
3. **Pilot (operate the ISMS):** internal audit, management review, CAPA log, awareness training; evidence from CI, audit chain
   checks and break-glass reviews.
4. **Certification:** stage 1 and 2 audits for 27001 with 27701 in scope, once three months of ISMS records exist.
