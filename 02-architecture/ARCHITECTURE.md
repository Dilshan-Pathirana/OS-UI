# Cure Global — Architecture

*v0.1 · 22 Oct 2026 · Target architecture. When code exists, `SYSTEM_DESIGN.md` (as built) will be added next to this file, as in Healthcare-Device.*

Related: `DATA_MODEL.md`, `ACCESS_CONTROL.md`, `MODULE_ENGINE.md`, `API_DESIGN.md`, `INTEGRATIONS.md`, ADRs in `adr/`.

---

## 1. System context

```
                         ┌──────────────────────────── Cure Global cloud (one region per country pack) ─────────────────────────────┐
  Super Admin web ─HTTPS─►                                                                                                           │
  Doctor web ─────HTTPS─►  edge (TLS, WAF, rate limits) ──► api (FastAPI modular monolith) ──► PostgreSQL 17 (system of record)     │
  Mobile app ─────HTTPS─►                                      │  ▲            │                    Valkey (cache, rate limits, jobs)│
  Family Hub ─────HTTPS─►  (device JWT, /api/v1/hub/*)         │  │            └──► object storage (S3 / MinIO in dev, private only) │
                         │                                     ▼  │                                                                │
                         │                                   worker (jobs: reminders, alerts, notifications, life-stage changes,   │
                         │                                           retention, exports, Traccar events)                           │
                         │                                     │                                                                   │
                         │  Traccar (GPS server) ◄─ trackers ──┘ events via webhook                                                │
                         └──────────┬──────────────┬──────────────┬───────────────┬────────────────────────────────────────────────┘
                                    │              │              │               │
                              Expo push / FCM   SMS gateway    email (SMTP)   HMS connector (R3), FHIR clients (R3)

 Household:  BLE scale / BP cuff / oximeter / thermometer / glucometer ─► Family Hub (ble-gateway → hub-core) ─► cloud
             phones: BLE devices + Health Connect (watches) ─► mobile app ─► cloud
             GPS watch / pendant ─► Traccar ─► worker ─► alerts to family
```

**Trust boundaries:** (1) the public internet edge; (2) the API's authorisation layer (every request resolved to an actor, a person and a purpose); (3) the database and object storage (private network only); (4) the hub (a semi-trusted device with its own identity); (5) the BLE and GPS air interfaces (untrusted input); (6) third parties (push, SMS, email: never receive health values).

## 2. Building blocks

| Block | Tech | Responsibility | Never does |
|---|---|---|---|
| **api** | Python 3.12, FastAPI, SQLAlchemy 2 (typed declarative models, async with asyncpg), Pydantic v2, Alembic | All business logic and authorisation; REST `/api/v1`; hub contract `/api/v1/hub/*`; FHIR export; webhooks in | Talk to BLE or trackers directly; render UI |
| **worker** | Same codebase, `arq` on Valkey | Scheduled and queued jobs: reminders, dose slots, alert evaluation, notification fan-out, nightly life-stage transitions, catalogue rollout, retention purges, DSAR exports, Traccar event ingestion | Serve HTTP |
| **PostgreSQL 17** | Native partitioning for observations and audit; `pgcrypto` only for hashing helpers (encryption happens in the app) | System of record | Hold files |
| **Valkey 8** | BSD-licensed Redis-compatible store | Rate limits (shared across workers), job queue, short-lived caches, pub/sub to push live updates to the doctor console | Hold anything that can't be rebuilt |
| **Object storage** | S3 in production, MinIO in dev | Documents, profile photos, exports — private buckets, server-side encryption, short-lived signed reads issued after an authorisation check | Serve public URLs |
| **Traccar** | Traccar 6 (Apache-2.0), own database schema | Speaks the GPS trackers' protocols, geofences, SOS/fall/battery events → webhook to the worker | Hold identities (devices are opaque ids) |
| **admin-web** | React 19, TypeScript, Vite, TanStack Query/Table, React Router, Tailwind v4, Radix primitives | Super-admin and organisation-admin console | Store tokens in `localStorage` (memory + refresh cookie) |
| **doctor-web** | Same stack | Clinician console | Same |
| **mobile** | Expo 57 / React Native 0.86 (from `patient-app`) | Family app, BLE capture, Health Connect, location sharing, offline queue | Show sensitive data in notifications |
| **hub** | From Cure Home: hub-ui (React kiosk), hub-core, vision, ble-gateway, ble-sim, Mosquitto | Household capture and display, face sign-in, proxy measurement | Upload images or face data |
| **packages** | `module-catalogue` (YAML + JSON Schema), `clinical` (TS + Python twins), `i18n`, `design-tokens`, `api-client` (generated) | Shared definitions and logic | — |

### 2.1 Why a modular monolith

One deployable `api` with strict internal boundaries (ADR-0002). A small team, one database, transactional consistency between consent, access and data, and simpler operations. Each bounded context owns its tables, router, service and tests, and talks to others only through their service interface. Contexts can be split out later (the worker already is) if load or team size demands it.

### 2.2 Bounded contexts inside `api`

| Context | Owns | Key rules |
|---|---|---|
| `identity` | user accounts, credentials, MFA, sessions, tokens, devices' auth | EdDSA JWTs; MFA for staff/doctors; rotating refresh with reuse detection |
| `people` | persons, demographics, identifiers, duplicates/merge | Person ≠ user; NIC/PHN encrypted + hashed for matching |
| `family` | families, memberships, invites, guardianship, ownership transfer | ≥ 1 admin per family; guardianship needs a basis |
| `consent` | consent policies (versions, texts), consent records, access grants | Withdrawal wins; every grant has a basis |
| `care` | organisations, practitioners, verification, care teams, care requests | Doctors must be verified to join a care team |
| `catalogue` | life stages, metric definitions, tracker schemas, modules, schedules, content items, country packs | Versioned; loaded from `packages/module-catalogue`; admin overrides stored as data |
| `modules` | per-person module states, resolver, transitions | Re-evaluated on birthday, episode change, condition change, catalogue change |
| `records` | observations, tracker entries, conditions, allergies, documents metadata, notes | Idempotent by `client_reading_id`; source + validation status on every value |
| `child` | growth calculations, milestones | References as data; neutral display rules |
| `immunization` | doses, schedule evaluation, verification | Parent-entered doses are unverified until checked |
| `maternity` | pregnancy and postpartum episodes, ANC schedule, newborn hand-off | Loss flow stops pregnancy content at once |
| `medication` | medication statements, schedules, dose events | One dose event per (medication, date, slot) |
| `scheduling` | appointments, reminders, family calendar | Times in UTC; family time zone for display |
| `alerts` | targets, alert rules, alert instances, escalation | Rules set by clinicians (or family for safety events); evaluated server-side only |
| `safety` | trackers, geofences, location events, SOS, falls, daily check-ins | Location consent or documented proxy decision; raw positions ≤ 30 days |
| `messaging` | threads, messages between family and care team | Not for emergencies (banner); retention per policy |
| `devices` | hubs (pairing, auth, heartbeat), peripherals catalogue and bindings, guest claims | Same `/api/v1/hub/*` contract as HMS |
| `notify` | push tokens, notification preferences, outbound channels | No health values or names of conditions in push/SMS |
| `files` | uploads, face check, private storage, signed reads | Virus scan + type check; EXIF stripped |
| `audit` | audit events (hash chain), access log views | Every PHI read/write with purpose |
| `admin` | support tooling, break-glass, DSAR tickets, feature flags | Break-glass time-boxed, notified |
| `fhir` | FHIR R4 export, IPS, (R3) read API | Mapping tables tested against the FHIR validator |
| `billing` (R3) | plans, subscriptions, entitlements | Lapse → read-only, never deletion |

## 3. Key flows

### 3.1 Family onboarding (app)
```
owner signs up (phone OTP + password) → accepts platform terms (policy version)
→ creates family (name, country pack, time zone, language)
→ adds members:   adult  → invite by phone → they accept, give health_data consent and choose grants (what the admins may see)
                  child  → owner creates dependant person + guardianship(parent) + guardian consent
                  elder who can't use a phone → dependant + guardianship(health_proxy) with evidence, or assisted consent by staff
→ module engine resolves each person's modules (life stage, sex, overlays) → app shows each member's home
→ (optional) pair the Family Hub: hub shows QR → owner scans → hub gets device credentials and the members who consented to hub use
→ (optional) add a doctor: search verified doctors / enter doctor code → doctor accepts → care team active for the members whose consent covers it
```

### 3.2 A hub reading
Unchanged from Cure Home (`Healthcare-Device/docs/02-architecture/SYSTEM_DESIGN.md` §4): BLE → normalise → dedupe → store pending with UUIDv7 → attribution (face session, running guided measurement, device user slot, or **proxy target** chosen by a guardian) → policy → sync `POST /api/v1/hub/members/{person_id}/vitals:batch` → api validates against the metric definition, the member's active modules and the hub's household scope → stored with `source=hub` → alert rules evaluated by the worker → doctor console updated live.

### 3.3 A phone reading
App BLE (OKOK scale or GATT device) or manual entry → saved to the app's offline queue with `client_reading_id` → `POST /api/v1/persons/{id}/observations:batch` → same validation and alerting. Health Connect import runs on app open and in a periodic background task; each record carries the Health Connect record id as `client_reading_id` and its data origin as `source_app`.

### 3.4 A GPS event
Tracker → Traccar (geofence exit / SOS / fall / low battery) → webhook to `api /internal/traccar/events` (shared secret + IP allow-list) → worker maps Traccar device → person → `location_event` → alert rule "notify family carers" → push + SMS to the person's carers in order until one acknowledges → hub of that family shows a banner.

### 3.5 Doctor review
Doctor opens worklist (alerts first, then "due for review") → member chart (trends vs targets, growth z-scores, adherence) → may change targets / alert rules / modules / questionnaires → "Mark reviewed" with an optional message to the family → family sees "Reviewed by Dr Perera on Monday" on the app and hub.

### 3.6 Life-stage transition (nightly)
Worker job at 00:30 family-local time: persons whose age crosses a band boundary, episodes past their expected end, and catalogue updates → resolver recomputes module states → new modules are offered or activated, ended modules are archived (data kept) → transitions that change access (18th birthday, teen confidentiality age) run their own flows (`MODULE_ENGINE.md` §7).

### 3.7 Consent withdrawal
Withdrawal recorded → access grants derived from it revoked in the same transaction → hub receives the change on its next member refresh (≤ 15 min, or push via heartbeat response) and deletes face data if `biometric_face` was withdrawn → care-team access that relied on it ends → audit event; family and affected doctors notified without health details.

## 4. Hub integration

- The hub keeps the Cure Home contract `/api/v1/hub/*` (ADR-0007). Cure Global's `devices` context implements it with these additions, all backward compatible:
  - `GET /hub/members` returns, per member, `life_stage`, `active_modules` (hub-safe, plus `hub_opt_in` modules with an active `hub_display` consent), `metrics` (codes, units, display), `proxy_for` (dependants this member may measure for) and `face_enrollable` (false for infants).
  - `vitals:batch` items may carry `measured_for` = a dependant's id and `entered_by` = the guardian's id.
  - New endpoints for hub modules: `GET /hub/members/{id}/due` (vaccines, checks, visits), `POST /hub/members/{id}/checkins`, `POST /hub/members/{id}/trackers:batch` (e.g. feeds, seizures recorded on the hub), `POST /hub/sos`.
- "Household" in Cure Home's contract maps to "family" in Cure Global (field aliases kept).
- The same hub build can point at HMS (Cure Home pilot) or at Cure Global (`HUB_BACKEND=hms|cure-global`).

## 5. Deployment

| Environment | How | Data |
|---|---|---|
| **Local (Windows + Docker Desktop)** | `infra/compose/docker-compose.yml` profiles: `core` (postgres, valkey, minio, mailpit, api, worker, admin-web, doctor-web), `gps` (traccar, gps-sim), plus Cure Home's `docker-compose.hub.yml` with profile `dev` (mosquitto, hub-core, vision, hub-ui, ble-sim, hms-stub — after the import in `MIGRATION_PLAN.md`); an `obs` profile (Prometheus + Grafana) in `infra/observability/docker-compose.obs.yml` (P6), and the restore drill's throwaway project in `infra/compose/docker-compose.drill.yml`. Android phone over USB (`adb reverse`) or LAN. | Synthetic only (seed + Synthea) |
| **Staging** | Same images, one VM or a small managed Kubernetes cluster; managed Postgres with PITR; separate secrets | Synthetic + pilot rehearsal |
| **Production (pilot)** | Region chosen per hosting decision (Sri Lanka or regional cloud with transfer instrument). Two app nodes behind a load balancer, managed Postgres (HA, PITR, encrypted), Valkey, S3-compatible storage, Traccar on its own node. Infrastructure as code (OpenTofu). | Real data |
| **Production (scale)** | Kubernetes, horizontal API/worker autoscaling, read replica for doctor analytics, one deployment ("cell") per region/country pack | Data residency by cell |

Release: GitHub Actions → images to GHCR (signed with cosign, SBOM attached) → staging → production with database migrations run as a separate, reviewed step (expand → migrate → contract) and automatic rollback on failed health checks (the HMS deploy pattern).

## 6. Non-functional requirements

| Area | Target |
|---|---|
| Availability | 99.5 % pilot, 99.9 % GA (monthly) for the API; the hub and app keep working offline |
| Latency | p95 < 300 ms for reads, < 500 ms for batch writes (≤ 50 items) |
| Scale (5-year design point) | 200 k families, 1 M persons, 3 k doctors, 50 k hubs, ~2 B observations; observations partitioned monthly |
| Recovery | RPO ≤ 15 min, RTO ≤ 4 h; quarterly restore drill |
| Security | OWASP ASVS 5.0 Level 2 (Level 3 for authentication, session and access control); MASVS L2 for the app |
| Privacy | Every PHI access audited with purpose; data minimisation per surface; retention schedule enforced by jobs |
| Accessibility | WCAG 2.2 AA (web, app); hub rules from the Cure Home design guide |
| Localisation | en / si / ta on hub and app; consoles English first; all text in dictionaries |
| Time | `timestamptz` in UTC; family and viewer time zones for display; calendar dates (`date`) only for date-only facts |
| Units | Stored in canonical UCUM units; display conversions per user preference |

## 7. Observability
OpenTelemetry traces and metrics from api, worker and hub-core (hub: aggregate only); structured JSON logs with request id, actor id and person id as opaque ids — never values or names; dashboards for API health, job queues, sync lag, hub fleet (heartbeat, firmware, queue length, peripheral batteries), notification delivery, Traccar event lag. Crash reporting with PHI scrubbing on by default.

## 8. Technology versions (pin at Phase 0)

| Area | Choice | Reason |
|---|---|---|
| Python | 3.12 | Same as HMS and the hub services |
| Web framework | FastAPI + Pydantic v2 | Same as HMS and hub-core; OpenAPI 3.1 out of the box |
| ORM / migrations | SQLAlchemy 2 typed declarative models (async) + Alembic | HMS and hub-core use SQLModel; plain SQLAlchemy 2 handles partitioned tables, JSONB and arrays without workarounds. Ported HMS models are converted |
| Database | PostgreSQL 17 | Partitioning, JSONB, `timestamptz`, mature managed offerings |
| Cache / jobs | Valkey 8 + arq | BSD licence; Redis protocol |
| Node / TS | Node 22 LTS, TypeScript 5.9+, pnpm 9 | As Cure Home |
| Web | React 19, Vite 7, TanStack Query 5, React Router 7, Tailwind 4 | React 19 + Vite as Cure Home's hub-ui |
| Mobile | Expo SDK 57, React Native 0.86 | As the patient app |
| GPS | Traccar 6.x | Apache-2.0, broad tracker protocol support |
| Object storage (dev) | MinIO (pin a release) or any S3-compatible server | Swap freely; code uses the S3 API only |
