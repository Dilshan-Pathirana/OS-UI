# Cure Global — Test strategy

*v0.1 · 22 Oct 2026 · What is tested, where, and what "done" means. Environments: Docker Desktop on Windows (`LOCAL_DEV_DOCKER.md`) and the dedicated Android phone (`ANDROID_DEVICE_TESTING.md`).*

## 1. Test layers

| Layer | Tools | What | Runs |
|---|---|---|---|
| Unit | pytest (API, hub services), vitest (web, hub-ui, packages), jest (mobile) | Pure logic: resolver, policy function, plausibility, growth z-scores, schedules, attribution, decoders | Every PR |
| **Clinical vectors** | Shared JSON vectors run by TS and Python twins (Cure Home pattern) | Units, plausibility, target status, growth (checked against WHO `anthro` outputs), gestational age, corrected age, vaccine due dates per country pack | Every PR |
| **Catalogue** | JSON Schema validation + resolver vectors (`packages/module-catalogue/vectors/*.json`) | Every module resolves as expected for each life stage, sex and overlay | Every PR touching the catalogue |
| **Access matrix** | Parametrised pytest over `ACCESS_CONTROL.md` §8 | Actor × subject × category × action × path (REST, export, FHIR, PDF, notifications, hub) | Every PR |
| API integration | pytest + httpx against Postgres (testcontainers or the compose DB) | Endpoints, transactions, outbox, migrations up/down | Every PR |
| Contract | `hms-stub` contract tests against `api` (hub); Schemathesis against the OpenAPI schema | Hub compatibility (ADR-0007); no 5xx on fuzzed inputs | Every PR (hub), nightly (fuzz) |
| Web E2E | Playwright + axe-core | Admin and doctor journeys; accessibility (WCAG 2.2 AA rules); screenshots | Every PR (smoke), nightly (full) |
| Hub E2E | Playwright walk-throughs (from Cure Home) + ble-sim scenarios | 20 Cure Home screens + new screens; proxy measurement; check-in; SOS | Every PR touching hub |
| Mobile E2E | Maestro flows on the Android phone (and an emulator in CI later) | Onboarding, member switch, readings, vaccines, medicines, pairing | Before each iteration demo |
| FHIR | HL7 FHIR validator (Java CLI) on exported bundles | Profiles (vital signs), terminology bindings | Nightly + release |
| Security | Semgrep, Bandit, ruff security rules, ESLint security, pip-audit, pnpm audit, Trivy (images), gitleaks, OWASP ZAP baseline against staging | Known-vuln and code patterns | Every PR (static), nightly (dynamic) |
| Performance | k6 (or Locust) | Batch writes, series reads, worklist under the 5-year design point (seeded) | Before pilot and each release |
| Resilience | Synthetic alert escalation in staging and production (daily), worker kill tests, DB failover drill | Alerts still reach carers | Daily / quarterly |
| Usability | IEC 62366-1 formative sessions (elders, parents, pregnant women, doctors), summative before pilot | Critical tasks without use errors | Per phase |

## 2. Test data

- **Seed:** `services/api/app/seed.py` creates two demo families — the Pereras from `FEATURES_BY_ENTRY_POINT.md` §0 (Nimal, Dilini pregnant, Sahan, Kamala, Thilini 16) and the Fernandos (Ruvini postpartum, Kasun, Kavindu with autism, baby Amaya) — and four doctors (Dr N. Perera, Dr S. Fernando, Dr R. Jayawardena verified; Dr A. Silva pending), with care teams, consents and grants. `--reset` (dev only) wipes and reseeds; without it a second run reports `exists` and changes nothing.
- **Volume:** Synthea (Apache-2.0) generates FHIR patients that an importer maps into persons and observations for performance tests. Until that importer exists (Synthea isn't runnable in the dev environment), `tests/perf/volume.py` loads N families × 5 years of seed-shaped readings server-side; results in `PERFORMANCE.md`.
- **Never** real patient data in dev or staging. Staging uses synthetic data only. Production data is never copied down.

## 3. Definition of done (every story)

1. Acceptance criteria met, and covered by automated tests at the right layer.
2. If the change touches access: the access-matrix cases are added.
3. If it touches clinical logic or content: vectors added, hazard log reviewed, CSO informed.
4. If it touches the schema: Alembic migration (upgrade and downgrade tested) and `DATA_MODEL.md` updated.
5. If it touches an API: OpenAPI updated, client regenerated, `API_DESIGN.md` updated if the map changed.
6. Docs updated (`SYSTEM_DESIGN.md` as built once it exists).
7. No PHI in logs (log-scan test). No new third-party SDK without review.
8. Demoed on Docker Desktop (and on the phone for mobile stories).

## 4. Traceability
Each hazard in `CLINICAL_SAFETY.md` references the tests that verify its controls. Each test file that verifies a hazard control names the hazard id in a docstring (`HZ-01`). A CI script lists hazards without tests.
