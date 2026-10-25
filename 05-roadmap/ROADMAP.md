# Cure Global — Roadmap

*v0.1 · 22 Oct 2026 · Phases, dates, exit criteria. Stories and acceptance criteria: `BACKLOG.md`. Porting steps: `MIGRATION_PLAN.md`. Risks and open decisions: `RISKS_AND_DECISIONS.md`.*

**Assumptions:**
- Team: Dilshan plus Claude Code sessions, with one or two more developers from Phase 2.
- Clinical reviewers are available part-time.
- Development and testing run on Windows with Docker Desktop and a dedicated Android phone. The hub runs on the PC (Chrome kiosk + webcam + simulated BLE) until a Surface Pro or Pi hub is free.
- The Cure Home pilot on HMS (Healthcare-Device `ROADMAP_SURFACE.md`, from Feb 2027) carries on in parallel. Cure Global pulls hub updates from Healthcare-Device with `git subtree pull` until the two converge after that pilot.

Dates are week-starting Mondays. With a smaller team, stretch each phase; keep the order.

```
2026  Nov            Dec            2027 Jan       Feb            Mar            Apr        May–Jul        Aug–Oct        Nov–Mar 2028
      ├ P0 ┤
      ├────── P1 Core platform ──────┤
                     ├────── P2 Mobile app ───────┤
                                    ├────── P3 Hub ─────────┤
                                           ├───── P4 Doctor console ─────┤
                                                  ├───── P5 Child, elder, alerts ─────┤
                                                                      ├─ P6 Hardening ─┤
                                                                                       ├── Pilot (MVP) ──┤
                                                                                              ├────── R2 ──────────┤
                                                                                                                   ├─── R3 ───┤
```

---

## Phase 0 — Foundation (26 Oct – 6 Nov 2026)

**Goal:** a monorepo that builds, runs in Docker Desktop and holds the source code it inherits.

- Approve or amend the ADRs and decisions D-1 to D-6 (`RISKS_AND_DECISIONS.md` §2).
- Run the source import (`MIGRATION_PLAN.md` §2): hub components, packages, design system and the patient app, all with git history.
- Tooling:
  - pnpm workspace and uv projects.
  - Lint and format: ruff, eslint, prettier.
  - Type checks: mypy (strict for new code), tsc.
  - `import-linter` contracts between API contexts.
- Compose `core` profile runs on Docker Desktop: postgres, valkey, minio, mailpit, api, worker, admin-web, doctor-web. `gps` profile: traccar, gps-sim.
- CI (GitHub Actions):
  - lint, type checks and tests per changed path
  - catalogue schema validation
  - image builds with SBOM
  - secret scanning
- Catalogue v0.1 (this commit), the resolver with tests, and the API skeleton (this commit) running against Postgres.
- Docs: this set; PR template with privacy, regulatory and clinical checklists.

**Exit:**
- `docker compose --profile core up` is green.
- `pnpm -r test` and `uv run pytest` are green.
- The hub stack starts from the imported code with `-f infra/compose/docker-compose.hub.yml --profile dev` against hms-stub.

## Phase 1 — Core platform (9 Nov – 18 Dec 2026)

**Goal:** the platform's data and access model, working end to end through the API and the admin console.

- **Identity:** phone OTP (SMS adapter + dev console sink), password, EdDSA tokens + JWKS, rotating refresh, TOTP and passkeys for staff and doctors, sessions.
- **People and families:** persons, families, memberships, dependants, invites, guardianship (with evidence upload), ownership transfer.
- **Consent and sharing:** policies and versions, consent records, grants, the policy function, the **access-matrix test suite**, audit events with hash chain.
- **Catalogue and modules:** release loading, person modules, resolver on demand and nightly, life-stage transitions (birthdays).
- **Records:**
  - observations batch and series, with plausibility from the catalogue (`packages/clinical` twins extended)
  - trackers with schema validation
  - documents (private storage, signed reads)
  - conditions, allergies
- **Care:** practitioners, verification workflow, care teams, care requests.
- **Teens:** teen login from 13; teen confidentiality enforced on every path from 16 (E4-07, access-matrix cases); the re-consent task at 16 (E4-11). The pilot includes 16–17-year-olds, so this is MVP even though the private teen modules themselves arrive in R2.
- **Flags, programmes, contacts:** person flags and programme enrolment API (E6-08); emergency and external care contacts (E3-09); separated-parent rules (E3-10).
- **Privacy (by 1 Jan 2027):** DPO appointed (external allowed); records of processing, privacy notice, breach procedure and processor agreements live. Synthetic data only until then.
- **Admin web v0:** sign-in with MFA, dashboard, families, doctors' verification queue, catalogue browser, life-stage simulator, consent policies, audit search, DSAR queue (manual handling).
- **Doctor web v0:** sign-in with MFA, onboarding, panel list (no chart yet).

**Exit:**
- An admin verifies a doctor.
- A family with 6 members across life stages is created through the API with consents and grants.
- The doctor links to the family.
- Access-matrix tests are green.
- Audit chain verifies.

## Phase 2 — Mobile app (7 Dec 2026 – 15 Jan 2027)

**Goal:** the patient app becomes the Cure Global family app on the dedicated Android phone.

- `apps/mobile` from the imported patient app.
- Config:
  - API base URL via `EXPO_PUBLIC_API_BASE_URL`
  - Metro configured for the monorepo
  - New application id (decision D-5)
  - New EAS project
- **Onboarding:** OTP sign-up, terms, create/join family, add dependants, invite adults, consents, and "What can the family see?".
- Member switcher, family home, member home driven by `/persons/{id}/summary`.
- **Readings:**
  - Manual entry and the OKOK scale (existing).
  - Health Connect import: vitals, weight, sleep, steps.
  - Offline queue with client ids.
- **Modules:** medicines with per-slot doses, vaccines (record + due), documents, symptoms, growth chart (neutral, using the reference data once licensed — placeholder curves until then).
- Push tokens and notifications; app lock and screen-capture guard kept.
- Hub pairing screens kept, pointed at Cure Global.

**Exit:**
- Journeys 1 and 3 (app parts) from `FEATURES_BY_ENTRY_POINT.md` §5 pass on the dedicated phone against Docker Desktop.
- Maestro smoke flows are green.

## Phase 3 — Family Hub on Cure Global (4 Jan – 12 Feb 2027)

**Goal:** the Cure Home hub runs against the Cure Global API with module-driven content.

- `devices` context: port of the HMS `/api/v1/hub/*` routes and tables. Contract tests from `hms-stub` run against `api`.
- hub-core:
  - `HUB_BACKEND=cure-global`
  - members carry life stage, hub-safe modules and metrics
  - `measured_for` / `entered_by` on readings
  - new endpoints: due, check-ins, SOS, trackers, catalogue
- hub-ui:
  - Orbit cards from modules
  - **proxy measurement** chooser
  - infant weighing flow
  - "Due today"
  - daily check-in
  - SOS
  - review acknowledgement card
- Face sign-in from the person's Cure Global profile photo (same consent model as Cure Home). Infants are excluded.
- ble-sim gains scenarios: infant weighing, elder morning, proxy measurement, pregnancy BP.

**Exit:**
- Journeys 3, 4 and 10 pass on the PC hub with simulated BLE and the webcam.
- The same hub build still passes its HMS contract tests.

## Phase 4 — Doctor console MVP (18 Jan – 26 Feb 2027)

- Worklist.
- Member chart: overview, vitals with targets and provenance, growth (z-scores), immunisations (verify), documents, notes.
- Family view.
- Targets editor.
- "Mark reviewed" with a message.
- PDF report.
- Care requests.
- Live updates (SSE).

**Exit:** journey 6 passes; a usability session with 3 doctors.

## Phase 5 — Child, elder and alerts MVP (1 Feb – 12 Mar 2027)

- **Child content:**
  - Growth references, loaded after WHO permission (decision D-9).
  - Sri Lanka immunisation schedule as data, signed by the CSO.
  - Milestones (checklist content licensed or linked).
  - Child illness log.
- **Elder content:** daily check-in rules, falls log, inactivity watch (hub-based), medication-safety view for doctors.
- **Alerts engine v1:**
  - rules: check-in missed, SOS, doctor thresholds, missed readings
  - escalation chain and acknowledgements
  - notifications over push, SMS and email
  - delivery monitoring
- FHIR R4 export, validated with the HL7 validator in CI.

**Exit:**
- Journeys 2, 4 and 6 pass.
- Synthetic escalation tests pass.
- FHIR bundles validate.

## Phase 6 — Hardening and pilot readiness (8 Mar – 16 Apr 2027)

- **Security:**
  - ASVS L2/L3 and MASVS self-assessment
  - threat models
  - external penetration test (API, web, app, hub)
  - fixes
- **Privacy:**
  - DPIA v1, reviewed by the DPO
  - consent texts in en/si/ta reviewed by counsel and clinicians
  - retention jobs
  - records of processing
- **Clinical safety:** case v1 signed; summative usability with elders, parents and doctors.
- **Ops:**
  - staging environment
  - production infrastructure as code
  - backups and a restore drill
  - observability dashboards
  - on-call runbook
  - support playbook (WhatsApp line)
- **Regulatory:** NMRA categorisation letter requested; peripheral catalogue with NMRA status; TRCSL position for the hub.
- **Pilot logistics:** families and doctors recruited, hubs prepared (Surface/Pi or tablet Lite), device kits, training material.

**Exit:** go/no-go review — security findings closed, DPIA approved, CSO sign-off, restore drill passed.

## Pilot (MVP) — 26 Apr – 19 Jul 2027 (12 weeks)

- 50–100 families and 5–10 doctors, with the life-stage mix in `BUSINESS_MODEL.md` §4.
- Weekly reviews of KPIs (`VISION_AND_SCOPE.md` §7), attribution audits, alert metrics and support tickets.
- Release every 2 weeks, with feature flags for R2 items as they become ready.

## R2 — May – Oct 2027 (built alongside the pilot, released behind flags)

- Pregnancy and postpartum, including the no-obstetrician safety net (E9-07), the under-16 safeguarding path (E9-08) and the hub opt-in (E4-12).
- Women's health (cycle, contraception, menopause).
- Teen tools: the 13–15 confidentiality opt-in (E4-10), cycle, wellbeing check-ins, confidential messages. (Confidentiality enforcement and teen login are MVP, Phase 1.)
- Special needs v1: care profile, behaviour log, sleep diary, seizure diary, visual schedule on the hub, Down syndrome checklist and charts.
- GPS and safety: Traccar, geofences, SOS, falls, location sharing from the phone.
- Alert rules editor for doctors (the MVP alerts engine already handles check-ins, SOS, doctor targets and missed readings).
- Messaging.
- Questionnaires (licensed instruments only).
- GATT devices in the app.
- Simple mode.
- Break-glass approvals UI.
- Catalogue overrides and the approval workflow in admin.

## R3 — Nov 2027 – Mar 2028

- Chronic-care programmes (hypertension, diabetes, heart failure, asthma, CKD).
- Organisations as tenants with programme management.
- Billing and subscriptions.
- HMS connector.
- IPS and the FHIR read API with SMART App Launch 2.2.
- Huawei Health Kit evaluation.
- Dexcom (if a programme needs it).
- GHS devices.
- ISO 27001/27701 readiness assessment.
- iOS app (if decided).

## Later (not scheduled)

- Teleconsultation on hub and app, Ask Cure assistant, pill dispensers, mmWave fall radar, research data platform (separate consent), other countries (`VISION_AND_SCOPE.md` §6.1).

## Working rhythm

- **Two-week iterations:** each ends with a demo on Docker Desktop and the Android phone, and an updated `SYSTEM_DESIGN.md` (as built).
- **Every PR:** tests, a migration if the schema changed, the doc changes, and the privacy/regulatory/clinical checklist.
- **Claude Code sessions:** one roadmap item per session, starting from `CLAUDE.md` and the relevant doc, and ending with tests green and docs updated.
