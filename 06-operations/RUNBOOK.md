# Cure Global — Operations runbook

*v0.1 · 23 Oct 2026 · DRAFT for the pilot (ROADMAP.md Phase 6). Needs sign-off by the engineering lead and a walk-through
by the first on-call rota before go-live. On-call, incidents, every alert, alert storms, backup and restore, key rotation,
hub swap-out, deploys and the privacy jobs. Support-facing procedures: [`SUPPORT_PLAYBOOK.md`](SUPPORT_PLAYBOOK.md).
Personal-data breaches: [`../03-compliance/BREACH_PROCEDURE.md`](../03-compliance/BREACH_PROCEDURE.md).*

**The first rule:** the alert path — outbox → alert rules → alerts → escalation → notification delivery — is a
patient-safety path (HZ-04, HZ-09, HZ-11, HZ-18). When it is broken, families and doctors are not told about urgent
readings, missed check-ins or SOS. Restore it before anything else, and tell the Clinical Safety Officer (CSO) when it was
down for more than 15 minutes.

**The second rule:** no PHI in incident channels, tickets, screenshots or post-mortems (CLAUDE.md rule 7). Use opaque
ids (person, family, device, alert ids) and counts. Never paste a log line or `last_error` text into a ticket without
reading it first.

## Contents

1. [Environments and access](#1-environments-and-access)
2. [On-call](#2-on-call)
3. [Incident process](#3-incident-process)
4. [Alerts — one section each](#4-alerts)
5. [Alert storms](#5-alert-storms)
6. [Backup and restore](#6-backup-and-restore)
7. [Key and secret rotation](#7-key-and-secret-rotation)
8. [Hub swap-out](#8-hub-swap-out)
9. [Deploy, migrations and rollback](#9-deploy-migrations-and-rollback)
10. [Privacy jobs: retention and DSARs](#10-privacy-jobs-retention-and-dsars)
11. [Reference: worker schedule, useful queries](#11-reference)

## 1. Environments and access

| Environment | Where | Data | How on-call reaches it |
|---|---|---|---|
| Local | Docker Desktop, `infra/compose` (`docs/06-testing/LOCAL_DEV_DOCKER.md`) | Synthetic | `docker compose -f infra/compose/docker-compose.yml …` |
| Staging | `infra/tofu/envs/staging` (ECS Fargate, RDS, ElastiCache, S3) | Synthetic only | SSO read-only role; deploy role through CI |
| Production | `infra/tofu/envs/production` | Real (only after the Phase 6 go/no-go) | SSO read-only role; **break-glass** admin role (two-person, ticket reference, CloudTrail-audited) |

Dashboards: Grafana folder "Cure Global" (`api`, `worker-jobs`, `notifications-alerts`, `hub-fleet`, `privacy-ops`;
`infra/observability`). Alarms: SNS topic `<prefix>-oncall` (CloudWatch) and Amazon Managed Prometheus Alertmanager
(`infra/observability/prometheus/alerts.yml`). Logs: CloudWatch `/cure/<prefix>/{api,worker,migrate,admin-web,doctor-web}`
(30 days, structured JSON, no PHI). Admin console: `admin.<domain>` with your staff account (password + TOTP).

On-call never reads health records. Everything in this runbook works with ids, counts and timestamps. Looking at a
person's record needs a **break-glass session** (`POST /api/v1/admin/break-glass`, written reason, ≤ 60 min, second
approver or emergency mode, family notified — build brief §2) and is reviewed by the DPO within 2 working days.

Useful commands (production names; staging is `cure-staging`):

```bash
aws ecs describe-services --cluster cure-production --services api worker admin-web doctor-web \
  --query 'services[].{name:serviceName,running:runningCount,desired:desiredCount,taskDef:taskDefinition}'
aws logs tail /cure/cure-production/api --since 15m --follow
aws logs tail /cure/cure-production/worker --since 1h --filter-pattern '"level": "ERROR"'
# Local
docker compose -f infra/compose/docker-compose.yml logs --since 15m api worker
```

## 2. On-call

### 2.1 Rota

- **Primary** and **secondary** on-call, weekly, handover Monday 09:00 Asia/Colombo with this checklist: open incidents,
  silences in place, open tickets from `ticket` alerts, upcoming releases, the last synthetic alert test and restore drill.
- During the pilot (50–100 families): two engineers alternate primary/secondary; the engineering lead is the escalation;
  the product owner (Dilshan) for decisions with business or family impact.
- The CSO and the DPO are not on the rota but have named deputies and phone numbers in the on-call contact sheet (kept in
  the password manager, not in git).

### 2.2 Severities

| Sev | Meaning | Examples | Acknowledge | Update cadence |
|---|---|---|---|---|
| **SEV1** | Patient-safety path down, or data exposed | `WorkerDown`, `CriticalJobFailing`, `SyntheticAlertTestFailed`, `AuditChainBroken`, data shown to the wrong person | 15 min, 24/7 | 30 min |
| **SEV2** | Platform down or badly degraded, safety path intact | `ApiDown`, `ApiHigh5xxRatio`, `DbLowStorage` | 30 min, 24/7 | 1 h |
| **SEV3** | Degraded, workaround exists | `ApiSlowReadsP95`, `NotificationFailures`, `HubsStale` | Next working day | Daily |
| **SEV4** | Hygiene | `JobFailing` for a non-critical job, `RetentionPurgeNotRun` once | Within the week | — |

`severity=page` alerts are SEV1/SEV2 and page 24/7; `severity=ticket` alerts open a ticket for the next working day. A
ticket that stays red for 24 h is raised to SEV3 by the primary.

### 2.3 Paging and escalation

1. The page goes to the primary (SNS → paging tool, SMS fallback).
2. No acknowledgement in 15 min → secondary. 30 min → engineering lead.
3. SEV1 involving the alert path → tell the **CSO** (clinical impact: were urgent alerts delayed? which ids?).
   Possible personal-data breach → tell the **DPO** at once and follow `BREACH_PROCEDURE.md` (the 24-hour impact clock
   starts at detection).
4. Family- or doctor-visible impact > 30 min → support posts the prepared status text (SUPPORT_PLAYBOOK.md §9) on the
   WhatsApp line. The platform is **not an emergency service**: the hub and app always show 1990 / 119, offline too
   (HZ-17).

## 3. Incident process

1. **Declare** in the incident channel: severity, one-line symptom, incident commander (IC = primary until handed over).
   Open the incident record (time-stamped timeline; ids and counts only).
2. **Stabilise** using the alert's section below. Prefer reversible steps (roll back, scale, fail over) to clever fixes.
3. **Decide within 1 hour** whether personal data could be affected (confidentiality, integrity *or* availability of
   health data). If yes or unsure → DPO + `BREACH_PROCEDURE.md` (evidence first: snapshot, logs, audit export).
4. **Clinical check** for anything touching alerts, targets, display logic or attribution: CSO decides whether families
   or doctors need to be told and whether the hazard log (CLINICAL_SAFETY.md §3) needs an entry.
5. **Resolve**, then confirm with the synthetic alert test (`POST /api/v1/admin/alerts/synthetic`) and the dashboards.
6. **Review** within 10 working days: timeline, root cause, what detected it, CAPA items with owners (PRIVACY_CONSENT_SECURITY.md §6).
   Blameless. New alerts or runbook sections are part of the CAPA.

## 4. Alerts

Every Prometheus alert in `infra/observability/prometheus/alerts.yml` and every CloudWatch alarm in
`infra/tofu/modules/monitoring` has a section here with the same name. Shape: **what it means → impact → check → act → escalate**.

### ApiDown

*Prometheus `ApiDown` (no successful scrape for 2 min) and CloudWatch `<prefix>-ApiDown` (no healthy target for 3 min). Page, SEV2.*

- **Impact:** app, consoles and hubs can't reach the API. Hubs and the app keep working offline and queue writes with
  client ids (CLAUDE.md rule 9); nothing is lost while the outage is shorter than their queues. Server-side alert
  evaluation continues only if the worker and the database are up.
- **Check:** `aws ecs describe-services … --services api` (running vs desired, recent events); the API log for the start-up
  error (catalogue failed to load, database unreachable, missing secret); `GET /api/v1/health` from inside the VPC
  (`db: ok|down`, catalogue version); RDS status.
- **Act:** a failed deploy → let the circuit breaker roll back, or roll back by hand (§9.3). A missing/empty secret → set it
  (ECS can't start a task whose secret has no value). Database down → [DbHighCpu](#dbhighcpu) / RDS events; failover is
  automatic with Multi-AZ. Out of memory → raise the task memory in `envs/production` (reviewed change) and redeploy.
- **Escalate:** > 30 min → engineering lead; tell support to post the status text.

### ApiHigh5xxRatio

*More than 2 % of API responses are 5xx for 10 minutes (Prometheus, needs > 0.1 req/s; CloudWatch on the target group). Page, SEV2.*

- **Check:** dashboard `api` → "Routes with 5xx (1 h)" (which route templates); API log `"level": "ERROR"` for the exception
  type (the JSON log has the route, request id and exception class — no bodies). Did a deploy or a migration just happen?
- **Act:** one route after a deploy → roll back (§9.3). All routes → database or Valkey (connections, CPU, failover in
  progress). `/api/v1/hub/*` only → check the hub contract change list (ADR-0007) and the hms-stub contract tests of the
  release.
- **Escalate:** errors on export, share-link, FHIR or `/hub/members` routes → also check that the access policy did not
  fail *open* (a 5xx is fine, a 200 with the wrong data is a breach). Unsure → DPO.

### ApiSlowReadsP95

*GET p95 > 300 ms for 15 minutes (events stream and exports excluded). Ticket, SEV3. NFR: ARCHITECTURE.md §6.*

- **Check:** dashboard `api` → "Slowest routes by p95"; RDS Performance Insights (top SQL by wait; pg_stat_statements is
  normalised, no values); `cure_http_requests_in_flight`. Series reads should hit `observation_daily_summary` for ranges
  longer than the raw window (DATA_MODEL.md §11).
- **Act:** a missing partition or index after a migration → check `ensure_partitions` ran (writes landing in the DEFAULT
  partition slow everything); a nightly rebuild overlapping peak → move it (worker cron, reviewed change). Compare with the
  k6 baseline in `docs/06-testing/PERFORMANCE.md`.

### ApiSlowBatchWritesP95

*`POST …:batch` p95 > 500 ms for 15 minutes. Ticket, SEV3.*

- **Check:** batch sizes (hub queue flushes after an outage arrive large — `cure_hub_queue_len_max` on `hub-fleet`); the
  audit-chain advisory lock (every audited write serialises on it — see PERFORMANCE.md for the measured effect); DB locks.
- **Act:** after a hub fleet reconnect this clears by itself as queues drain; otherwise investigate lock waits.

### WorkerDown

*Prometheus `WorkerDown` (no `/metrics` scrape for 5 min). Page, SEV1.*

- **Impact:** no outbox dispatch (no alert-rule evaluation), no escalation steps, no notifications, no missed check-in
  detection, no synthetic test. **Patient-safety path down.**
- **Check:** `aws ecs describe-services … --services worker` and the worker log; Valkey reachable (arq needs it); the
  database; a crash loop on start (bad secret, catalogue error).
- **Act:** fix the cause and get exactly **one** worker running (`desired=1`: arq cron jobs run in every worker). After
  recovery the jobs catch up by themselves: the outbox is at-least-once, escalation runs every due step, delivery picks up
  queued notifications, `missed_checkins` records missed days. Then run the synthetic test.
- **Escalate:** > 15 min → CSO (which open alerts were delayed: `GET /api/v1/admin/notifications/stats` and the alert ids
  from `alert.next_escalation_at < now()`).

### WorkerNotRunning

*CloudWatch `<prefix>-WorkerNotRunning` (ECS running task count < 1 for 3 min). Page, SEV1.* Same as [WorkerDown](#workerdown);
this one fires even when Prometheus itself is broken.

### CriticalJobFailing

*`escalate_alerts`, `deliver_notifications` or `dispatch_outbox` raised an error in the last 15 min. Page, SEV1.*

- **Check:** worker log for the job's exception (job name is in the log record); `worker-jobs` dashboard → failures by job.
  For the outbox: which topic fails (`SELECT topic, count(*), max(attempts) FROM outbox_event WHERE dispatched_at IS NULL GROUP BY topic;`).
- **Act:** a provider outage (SMS/push/email) shows as delivery failures, not job errors — see
  [NotificationFailuresSevere](#notificationfailuressevere). A job error is a bug or an infrastructure fault: roll back a
  recent release; a poison event in the outbox fails only itself (each batch is its own transaction; `attempts` and
  `last_error` are recorded) — do **not** delete it; fix forward and let it retry.
- **Escalate:** CSO when alerts were not escalated or delivered for > 15 min.

### JobFailing

*Any other worker job raised an error in the last hour. Ticket, SEV4 (SEV3 if it repeats nightly).*

| Job | If it keeps failing |
|---|---|
| `nightly_resolve` | Life-stage transitions (e.g. infant → child modules) are late; no safety impact for a day |
| `nightly_age_transitions` | Teen re-consent at 16 / handover at 18 tasks are late (ACCESS_CONTROL.md §5) — fix within days |
| `verify_audit_chain` | See [AuditChainCheckNotRun](#auditchainchecknotrun) |
| `ensure_partitions` | **Urgent within the month**: without next month's partitions writes go to DEFAULT and partition creation then fails |
| `rebuild_summaries` | Charts can drift; the per-write upkeep still runs |
| `missed_checkins` | **Treat as critical** (HZ-09): missed elder check-ins are not detected |
| `prune_devices` | Heartbeat table grows; no user impact |
| `scheduled_rules` | Missed-readings and inactivity alerts are not raised — tell the CSO |
| `care_reminders` | Antenatal and screening reminders are late |
| `synthetic_alert_test` | See [SyntheticAlertTestFailed](#syntheticalerttestfailed) |
| `retention_purge` | See [RetentionPurgeNotRun](#retentionpurgenotrun) |
| `dsar_exports` | DSAR bundles are not produced; check [DsarOverdue](#dsaroverdue) deadlines |

### OutboxDispatchStalled

*`dispatch_outbox` has not succeeded for > 5 min (or never since the worker started). Page, SEV1.*

- **Impact:** new readings, check-ins and SOS don't reach the alert rules.
- **Check:** is the worker up ([WorkerDown](#workerdown))? Is arq's queue stuck (Valkey memory, [CacheHighMemory](#cachehighmemory))?
  The job is `unique` — a hung previous run blocks the next one: look for a long-running dispatch in the log.
- **Act:** restart the worker task (`aws ecs update-service --cluster … --service worker --force-new-deployment`); the
  outbox is durable in PostgreSQL, nothing is lost.

### AlertDeliveryJobsStalled

*`escalate_alerts` or `deliver_notifications` has not succeeded for > 5 min. Page, SEV1.* As
[OutboxDispatchStalled](#outboxdispatchstalled), for escalation steps and notification delivery.

### OutboxLagHigh

*Oldest undispatched outbox event > 120 s for 5 min. Page, SEV1.*

- **Check:** `worker-jobs` → backlog; a burst (hub fleet reconnecting after an outage flushes queues) vs. a slow consumer
  (DB). `dispatch_all` drains up to 20 batches per run, twice a minute.
- **Act:** a burst clears on its own — watch the age fall. A slow consumer → DB (locks, CPU). Never mark events as
  dispatched by hand: consumers are idempotent, skipping them skips alert evaluation.

### OutboxEventsFailing

*Events with ≥ 3 failed attempts for 15 min. Page, SEV1 — an alert rule may not have been evaluated for a real reading.*

- **Check:** `SELECT id, topic, attempts, created_at FROM outbox_event WHERE dispatched_at IS NULL AND attempts >= 3 ORDER BY created_at;`
  `last_error` may quote data from the event's subject — read it on the database host, don't copy it out.
- **Act:** fix the consumer bug and deploy; the events retry. For each affected event that was an `observation.created`
  or a check-in/SOS, tell the CSO the ids and the delay so the care team can be informed.

### SyntheticAlertTestFailed

*The daily synthetic alert test (E13-05) failed. Page, SEV1 — HZ-09.*

- **What it tests:** a synthetic alert walks the real escalation chain and the real delivery adapters to ops' own test
  addresses (`SYNTHETIC_PUSH_TOKEN`, `SYNTHETIC_SMS_TO`, `SYNTHETIC_EMAIL_TO`).
- **Check:** `GET /api/v1/admin/alerts/synthetic` (latest runs: `ok`, steps, duration, error code). An unset synthetic
  address outside dev makes the run fail on purpose ("not configured").
- **Act:** fix the failing step (provider credentials, adapter, escalation job). Re-run with `POST /api/v1/admin/alerts/synthetic`
  until it passes. Two consecutive failures → CSO decides whether families get a "notifications may be delayed" notice.

### SyntheticAlertTestNotRun

*No synthetic test for > 26 h. Page, SEV2.* The worker's 21:30 UTC (03:00 Asia/Colombo) cron did not run — worker down at
that time, or the job errored before recording a run. Run it now by hand, then find out why the cron missed.

### NotificationFailures

*> 5 % of deliveries in the last hour failed (≥ 3 failures). Ticket, SEV3.*

- **Check:** `GET /api/v1/admin/notifications/stats?days=1` (per channel per day: sent, delivered, failed, skipped; recent
  failures with error codes — no recipients, no texts). `skipped` = no address for that channel, not a failure.
- **Act:** expired push tokens (Expo `DeviceNotRegistered`) are normal churn; an SMS provider error code spike → provider
  status page and ticket. Delivery retries three times with 1/5/15-minute backoff, then marks the notification `failed`;
  escalation moves on to the next carer and channel either way.

### NotificationFailuresSevere

*One channel has > 20 % failures (≥ 5) in the last hour. Page, SEV2 (SEV1 if push and SMS both fail). Risk R-14.*

- **Act:** confirm the provider outage; nothing to switch in the platform — the escalation chain already falls through
  push → next carer → SMS → emergency contact (HZ-09). If **all** external channels fail, the CSO decides on a status
  notice through support. Don't requeue failed notifications by SQL: stale alerts delivered hours later confuse families.

### NotificationBacklog

*> 500 notifications pending for 15 min. Ticket, SEV3.* `deliver_notifications` sends up to 200 per minute
(`skip_locked`, so a slow provider call doesn't block others). A backlog that grows → delivery job slow (provider
latency) or stalled ([AlertDeliveryJobsStalled](#alertdeliveryjobsstalled)); a burst that shrinks → fine.

### AuditChainBroken

*The audit hash chain failed verification (E14-01). Page, SEV1 — treat as possible tampering until shown otherwise.*

- **Do not "repair" the chain.** It is evidence.
- **Check:** `GET /api/v1/admin/audit/chain` (latest and latest-ok check, events checked, `first_bad_event_id`). Run
  `POST /api/v1/admin/audit/chain/verify` once to rule out a transient read problem.
- **Act:** snapshot the database (manual RDS snapshot) before anything else; open a security incident; tell the DPO;
  follow `BREACH_PROCEDURE.md` (evidence preservation §5). Compare the events around `first_bad_event_id` with the last
  backup that verified clean. The app role has no UPDATE/DELETE on `audit_event` — a break means someone used a privileged
  role or the database was restored inconsistently: check CloudTrail and RDS events for that window.

### AuditChainCheckNotRun

*No chain verification for > 26 h. Ticket, SEV3.* `verify_audit_chain` runs at 20:30 UTC. Run it by hand
(`POST /api/v1/admin/audit/chain/verify`) and check its duration: verification reads every event, so a very large chain
can outgrow the job's time budget — see PERFORMANCE.md for the measured rate.

### RetentionPurgeNotRun

*The retention purge has not run for > 26 h. Ticket, SEV4.* See [§10.1](#101-retention). One missed night is harmless;
repeated misses break the retention schedule promised in the DPIA and the privacy notice.

### DsarOverdue

*At least one data-subject request is past its due date for an hour. Ticket, SEV3 (a legal deadline).* See [§10.2](#102-data-subject-requests-dsars).
Tell the DPO the same day.

### HubsStale

*> 10 % of active hubs have had no heartbeat for over an hour, for an hour. Ticket, SEV3 (SEV2 if most of the fleet).*

- **Check:** `hub-fleet` dashboard — is it everybody (our side: hub contract errors, `/api/v1/hub/heartbeat` 5xx, TLS
  certificate, DNS) or a cluster (an ISP or area power cut)? `GET /api/v1/admin/hubs?online=false` lists them (audited).
- **Act:** our side → as [ApiHigh5xxRatio](#apihigh5xxratio) on `/api/v1/hub/*`. Their side → support contacts families
  only when one hub stays offline for > 24 h (SUPPORT_PLAYBOOK.md §5). Hubs are offline-first: readings queue locally and
  sync with client ids when they return.

### HubSyncLagHigh

*Some hub reports a sync lag > 6 h for 30 min. Ticket, SEV3.* Usually a hub that is online but whose batches are
rejected. Find it with `GET /api/v1/admin/hubs?online=true` (sort by sync lag) and `GET /api/v1/admin/hubs/{device_id}`
(heartbeat history, queue length). Rejected items come back with `rejected(reason)` per item — check the hub-core log on
the device (support session) for the reason; a contract mismatch after a release is SEV2.

### DbHighCpu

*RDS CPU > 80 % for 15 min. Page via CloudWatch, SEV2 (SEV3 if latency is fine).* Performance Insights → top SQL. Usual
suspects: a nightly job at peak, a missing index on a new query, `verify_audit_chain` on a big chain. Scale the instance
class only as a reviewed change; don't kill autovacuum.

### DbLowStorage

*Free storage < 20 % of the allocation. SEV2.* Storage autoscaling raises the allocation up to `max_allocated_storage_gb`;
this alarm means it is near the ceiling or growing unusually. Check the largest relations (observation and audit partitions
are expected to grow — DATA_MODEL.md §9), a runaway table (`hub_heartbeat` if `prune_devices` stopped), and whether
`retention_purge` is running. Raise the ceiling by a reviewed change.

### DbManyConnections

*More than 150 connections for 10 min. SEV3.* Each API/worker task keeps a SQLAlchemy pool; count = tasks × pool size.
A sudden rise without more tasks = a leak (look for requests that don't return) or a stuck job.

### CacheHighCpu

*Valkey engine CPU > 80 % for 15 min. SEV3.* Rate-limit keys and arq queues are small; high CPU usually means a hot loop
(a client retrying in a tight loop and being rate-limited). Check the 429 rate on the `api` dashboard.

### CacheHighMemory

*Valkey memory > 80 %. SEV2.* An arq backlog (worker down → see [WorkerDown](#workerdown)) or rate-limit keys without TTL.
Valkey holds no PHI and no source of truth: in the worst case a flush loses queued job runs (cron jobs re-run on schedule)
and resets rate limits — a last resort, with the engineering lead's agreement.

## 5. Alert storms

Two different storms:

**Monitoring storm (many of our alerts at once).** Usually one root cause: database down → API 5xx → worker errors →
outbox lag → notification backlog. Work in that order: **database → Valkey → API → worker → outbox → notifications →
hubs**. Alertmanager groups by `alertname` and `severity` and a firing page inhibits the ticket of the same name; silence
the downstream alerts for the incident's expected length (AMP Alertmanager silences API / `amtool` against it) and say so
in the incident channel. Never silence `SyntheticAlertTestFailed`, `AuditChainBroken` or `WorkerDown` for more than the
incident's length.

**Family alert storm (many alerts to families/doctors).** Causes: a device sending bad values, a misconfigured doctor
threshold, a hub replaying a queue, a bug in a rule.

- The engine is idempotent: every alert has a `dedupe_key` (per reading, entry, check-in or day), so replays and outbox
  retries don't duplicate alerts; missed-readings alerts coalesce per person and metric.
- Delivery is paced: `deliver_notifications` takes 200 per minute; escalation steps run once a minute and stop on
  acknowledgement; both are `unique` cron jobs, so runs never overlap.
- **There is no global mute** on purpose. To stop a bad rule: a doctor's own rule → the doctor (or CSO) retires it
  (`DELETE /api/v1/alert-rules/{rule_id}`); a catalogue rule → CSO-approved catalogue fix and release; a device sending
  garbage → revoke the hub (§8) or ask the family to unplug the peripheral. Every such step needs the CSO's agreement,
  recorded in the incident.
- Don't delete alerts or notifications: they are part of the clinical and audit record. Resolve them with a reason
  through the normal endpoints if the CSO agrees.

## 6. Backup and restore

Targets (E20-02, ARCHITECTURE.md §6): **RPO ≤ 15 min, RTO ≤ 4 h**, restore drill every quarter and before go-live.

### 6.1 What is backed up

| What | How | Where | Kept |
|---|---|---|---|
| PostgreSQL (production) | RDS automated backups + WAL → point-in-time recovery (5-minute granularity) | RDS, KMS-encrypted | 14 days (staging 7) |
| PostgreSQL (logical) | `scripts/backup.sh` / `scripts/backup.ps1`: `pg_dump -Fc`, encrypted before it leaves the host | backups bucket (SSE-KMS, versioned, object lock in production) | 35 days |
| Object storage (documents, photos) | S3 versioning (deleted/replaced objects kept as noncurrent versions for 30 days) + the backup script's bucket mirror | documents bucket; mirror in the backups bucket | 30 / 35 days |
| Valkey | Not backed up — no source of truth (jobs re-run, rate limits reset) | — | — |
| Hub data | Hubs are clients: they re-download members and modules. Face templates are hub-only by design (CLAUDE.md rule 8) and are never backed up | — | — |
| Secrets and keys | Secrets Manager (recovery window 30 days); KMS keys (deletion window 30 days) | AWS | — |

### 6.2 Restore drill (quarterly; the go/no-go needs one passed)

`scripts/restore_drill.ps1 -BackupDir <dir>` takes a backup made by `scripts/backup.ps1` / `backup.sh` and restores it
into a **throwaway compose project** (`-p cure-drill`, `infra/compose/docker-compose.drill.yml`, Postgres on :8155 and
MinIO on :8156 — never the running `cure-global` project). It checks every file's HMAC before decrypting, `pg_restore`s
the dump (plaintext only in a pipe) and checks its SHA-256, mirrors the objects back into a bucket and counts them, then
runs `services/api/scripts/restore_verify.py`: exact row counts of every table against the backup manifest and a full
recompute of the audit hash chain. It writes `drill-report.json` next to the backup — **RTO** (wall clock from start to
verified), the backup's age at restore (the RPO evidence; the RPO itself is the backup method's: nightly dump ≤ 24 h,
production PITR ≤ 15 min) and the per-step times — and tears the project down (`-Keep` leaves it up for inspection).

Record every drill:

| Date | Who | Source | Rows matched | Audit chain | RPO | RTO | Result / CAPA |
|---|---|---|---|---|---|---|---|
| 23 Oct 2026 | hardening-p6 (engineering, local Docker Desktop) | `cure_test_p6b` (synthetic seed + test data; 84 tables, 31 959 rows, 1.7 MB encrypted dump) + 3 synthetic objects in a throwaway source MinIO | 84/84 tables, 0 mismatches; 3/3 objects | 950 events verified, ok | backup age 9 s at restore (method RPO: dump = time since the last dump; PITR not exercised locally) | **9 s** (HMAC 0 s, project up 3 s, DB restore 3.1 s, objects 2.1 s, verify 0.7 s) | **Passed.** CAPA: repeat on staging with a production-sized dump and an RDS PITR restore before go-live (RTO target 4 h) |
| 23 Oct 2026 (re-run on the final 0009 schema) | hardening-p6 | same source after the full test run; 85 tables incl. `audit_chain_head` | 85/85 tables, 31 989 rows, 0 mismatches; 3/3 objects | 966 events, ok | backup age ≈ 12 s | **11.5 s** | **Passed** |

### 6.3 Restoring production (real incident)

1. Declare SEV1/SEV2, stop writes if data is corrupt (scale `api` and `worker` to 0 — hubs and apps queue offline).
2. Choose the restore point (just before the corruption; CloudTrail/RDS events/audit log for the time).
3. Restore to a **new** instance: `aws rds restore-db-instance-to-point-in-time --source-db-instance-identifier cure-production-pg --target-db-instance-identifier cure-production-pg-r<yyyymmdd> --restore-time <UTC> --db-subnet-group-name cure-production-pg --vpc-security-group-ids <db sg> --db-parameter-group-name cure-production-pg17 --multi-az`
   (or from the logical dump, as in the drill, when PITR is not usable).
4. Verify on the new instance: row counts vs. expectations, `POST /api/v1/admin/audit/chain/verify` against a staging API
   pointed at it, `alembic current` = expected head.
5. Point `DATABASE_URL` (Secrets Manager) at the new instance; redeploy `api` and `worker` (`--force-new-deployment`); bring
   them back up; import the instance into the OpenTofu state (or rename it) in a reviewed follow-up.
6. **Re-apply erasures.** Restoring resurrects anything erased after the restore point. Re-run every DSAR erasure (and
   retention purge) completed after that time — the DSAR queue (`GET /api/v1/admin/dsar?status=completed`) and the audit
   log are the list. Tell the DPO.
7. **Tell people about lost writes.** Writes acknowledged between the restore point and the failure are gone (hubs and
   apps dropped them after the server's `created`). Support informs affected families (ids from the audit log) — the
   CSO decides whether clinicians must be told about lost readings.
8. Run the synthetic alert test, check the dashboards, close with a review.

Documents: restore a deleted or overwritten object from its previous version (`aws s3api list-object-versions` → copy the
version back), or from the mirror in the backups bucket.

## 7. Key and secret rotation

| Secret | Rotate | Blast radius of a mistake |
|---|---|---|
| KEK (`DEV_KEK`; KMS `alias/<prefix>-kek` once the code uses KMS) | Yearly, on staff departure with access, on incident | All encrypted columns unreadable if the old key is dropped too early |
| `JWT_PRIVATE_KEY` | Yearly, on incident | Everyone signed out (15-minute access tokens) |
| `LOOKUP_HASH_KEY` | **Only on compromise** | Sign-in by phone/email, invites, duplicate checks and admin search break until re-hashed |
| Hub device keys | Per hub, on loss/compromise | One hub |
| `METRICS_TOKEN` | Freely (quarterly) | Scrapes fail until Prometheus has the new token |
| `TRACCAR_WEBHOOK_SECRET` | Yearly | GPS events rejected until both sides match |
| DB master / app role passwords | RDS-managed rotation (master); app role yearly | API can't connect |
| `EXPO_ACCESS_TOKEN`, SMS/email provider keys | Per provider policy | Push/SMS/email fail → synthetic test catches it |

### 7.1 KEK (envelope encryption, E14-02)

Values are stored as `ev1.<kid>.…`; the kid says which KEK wrapped them, so old and new keys work side by side.

1. Generate a new secret; put the **old** one into `DEV_KEK_PREVIOUS` (comma-separated list) and the new one into
   `DEV_KEK`; redeploy `api` and `worker` (new writes use the new key, old values still decrypt).
2. From an admin task (same image, same secrets): `python scripts/rotate_kek.py --dry-run`, then `python scripts/rotate_kek.py`.
   It re-wraps in batches, one transaction per table, and prints counts only.
3. Remove the old secret from `DEV_KEK_PREVIOUS` **only** when every encrypted column is on the new key.

> **Known gap (23 Oct 2026):** `services/api/scripts/rotate_kek.py` re-wraps the identity columns (phone, email, TOTP,
> licence, person identifiers, contacts, invites) but not the columns added later — `clinical_note.body_enc`,
> `message.body_enc`, `message_thread.subject_enc`, `review.message_enc`, `questionnaire_response.answers_enc`,
> `questionnaire_assignment.note_enc`, `safety_restriction.reason_enc`, `capacity_decision.reason_enc`,
> `push_token.token_enc`. Until the script covers them, **never remove a key from `DEV_KEK_PREVIOUS`**.

With KMS: the CMK's automatic yearly rotation is transparent (KMS keeps the old key material). An incident rotation means a
new CMK plus the re-wrap above.

### 7.2 JWT signing key

1. Generate a new Ed25519 key (PEM). Append the **current public key** to `JWT_PREVIOUS_PUBLIC_KEYS` (PEMs joined with `|`)
   and set the new private key in `JWT_PRIVATE_KEY`; redeploy `api`. The JWKS (`GET /api/v1/auth/jwks`) now lists both
   kids, so tokens signed in the last 15 minutes still verify.
2. After at least 15 minutes (the access-token lifetime) plus a margin, remove the old public key and redeploy.
3. On compromise, also end the sessions: refresh tokens are server-side rows; per account use the support action
   `end_sessions` (`POST /api/v1/admin/families/{family_id}/support-actions`); for everyone, a break-glass DBA statement
   revoking all `auth_session` rows (ticket reference, two people) — everyone signs in again.

### 7.3 LOOKUP_HASH_KEY

Every `*_hash` lookup column (user phone and email, practitioner licence, person identifiers such as NIC, invite phone)
is an HMAC under this key. Change it and the platform can no longer find anyone by phone or email. Rotate only on
suspected compromise, as planned maintenance: set the new key, run `python scripts/rotate_kek.py --rehash` (recomputes the
hash columns it knows from the decrypted values), and accept that in-flight OTP challenges (10 minutes) fail. Never let
it default to a derivation of `DEV_KEK` in staging/production — a KEK rotation would then change every lookup hash.

### 7.4 Hub device keys

Each hub has an Ed25519 key; a factory key provisioned with the serial is pinned (`key_pinned`). Lost, stolen or suspected
compromised hub → revoke at once: `POST /api/v1/admin/hubs/{device_id}/revoke` with `{"reason": "lost"}` (or the family
owner/admin: `DELETE /api/v1/hubs/{device_id}`). Revocation ends the device's refresh chain and pending pairing codes; the
hub stops syncing within its token lifetime. A pinned key that leaked can't be "re-keyed" — provision a new serial (§8).

### 7.5 METRICS_TOKEN and the rest

`METRICS_TOKEN`: set the new value in Secrets Manager and force a new deployment of `api`, `worker` and
`prometheus-agent` (all read it at start); expect one or two failed scrapes. Locally: `services/api/.env` and
`infra/observability/secrets/metrics_token`. `TRACCAR_WEBHOOK_SECRET`: Traccar's forward header and the API together.
Database app role: `ALTER ROLE cure PASSWORD …` then `DATABASE_URL` and redeploy.

## 8. Hub swap-out

When a hub is broken, lost, or being replaced. Support handles the family side (SUPPORT_PLAYBOOK.md §5); ops does this.

1. **Identify** the hub: `GET /api/v1/admin/hubs?query=<serial or family name>` → `device_id`, status, last heartbeat,
   queue length. `GET /api/v1/admin/hubs/{device_id}` for the heartbeat history.
2. **Lost or stolen → revoke first** (`POST /api/v1/admin/hubs/{device_id}/revoke`, reason `lost`). Its local data
   partition is encrypted; face templates never left it.
3. **Still working → let it sync first.** If the old hub still powers on, wait until its queue length is 0 in the admin
   detail, so readings recorded offline aren't lost.
4. **Provision the replacement** (if the serial isn't on the allow-list from the factory import):
   `POST /api/v1/admin/hubs` with `{"serial": "...", "public_key": "<factory key, base64>", "display_name": "Family Hub"}`
   (a key given here is pinned).
5. **Ship it** (courier, signature on delivery — SUPPORT_PLAYBOOK.md §5.4). The family connects it to Wi-Fi; the hub calls
   `POST /api/v1/hub/pairing/start` and shows a 6-character code / QR, valid 10 minutes.
6. **The family owner or an admin claims it** in the app (`POST /api/v1/hub/pairing/claim` with the code) — only they can.
7. **Revoke the old hub** (`POST /api/v1/admin/hubs/{device_id}/revoke`, reason `replaced`) once the new one is active.
8. **What carries over automatically:** members, hub profiles (display name, avatar colour, language, vital kinds),
   modules, targets, medicines, history — all live in the API; the new hub downloads them (`GET /api/v1/hub/members`).
   **What does not:** face enrolment (face data never leaves a hub — members re-enrol; infants are never enrolled),
   BLE peripheral pairings (re-pair the scale, BP monitor, …), and readings still queued on a dead hub.
9. **Returned hub:** wipe the encrypted data partition before refurbishing (Cure Home device procedure); the revocation is
   already in `device_event_log`.
10. **Verify:** the new hub's heartbeat and members version in the admin detail; a test reading by the family shows in the app.

## 9. Deploy, migrations and rollback

### 9.1 Release path

CI builds every image on `main`, signs it with cosign and attests a CycloneDX SBOM (GHCR, tag = git SHA). Deploy the
**same SHA** to staging, then production:

1. Read the release notes: migrations? hub-contract changes (must be additive — ADR-0007; the hms-stub contract tests
   passed)? clinical display logic (needs the CSO's release sign-off — CLINICAL_SAFETY.md §2 step 5)? catalogue release
   (staged → approved by the CSO → active, in the admin console)?
2. Run the migration task: `aws ecs run-task --cluster cure-<env> --task-definition cure-<env>-migrate --launch-type FARGATE --network-configuration '…app subnets, app sg…'`
   and wait for exit code 0 (`aws logs tail /cure/cure-<env>/migrate`).
3. Update the services to the new image (`tofu apply` with the new `image_tag`, reviewed) — ECS rolls tasks, the circuit
   breaker rolls back on failed health checks.
4. Smoke: `GET /api/v1/health` (version, `db: ok`, catalogue checksum), a staff sign-in, `POST /api/v1/admin/alerts/synthetic`,
   the dashboards for 15 minutes.
5. Production needs two people (one approves the plan). Avoid **19:00–22:00 UTC** (00:30–03:30 Asia/Colombo), when the
   nightly jobs and the synthetic test run.

### 9.2 Migrations: expand → migrate → contract

- **Expand** (release N): add tables/columns (nullable or with server defaults), new code writes both shapes.
- **Migrate**: backfill in batches (worker job or script), never in the migration's transaction for big tables; partitioned
  tables (`observation`, `tracker_entry`, `audit_event`) are reviewed by hand (DATA_MODEL.md).
- **Contract** (release N+1 or later): drop the old shape only when no running code reads it.
- Downgrades are tested in CI but production rolls **forward**; a contract step is not rolled back by `alembic downgrade`
  on production data — restore (§6.3) is the last resort.

### 9.3 Rollback

- Automatic: the deployment circuit breaker returns to the last healthy task definition.
- Manual: `aws ecs update-service --cluster cure-<env> --service api --task-definition cure-<env>-api:<previous revision>`
  (same for `worker`, consoles). Safe after an expand-only migration. Then set `image_tag` back in the tfvars so state and
  reality agree.

## 10. Privacy jobs: retention and DSARs

### 10.1 Retention

The `retention_purge` worker job applies the schedule in DATA_MODEL.md §8 (notifications 90 days; invites, pairing codes
and nonces after expiry + 30 days; heartbeats 30 days; outbox and device events; …) and skips everything under an active
**legal hold**. Its dry-run report and the legal-hold endpoints are in API_DESIGN.md §12 (P6).

- Before enabling a new rule, or after a schema change: run the **dry-run** and check the counts with the DPO.
- `privacy-ops` dashboard: last run time, rows purged per target, active legal holds. A purge count far above the usual →
  look before the next night (is a rule wrong?). If in doubt, pause the job (reviewed config change) rather than let it run.
- A legal hold (litigation, regulator, safeguarding — CLINICAL_SAFETY.md §4.2) is set by the DPO, never by on-call.
- After a database restore, re-run the purges that happened after the restore point (§6.3 step 6).

### 10.2 Data-subject requests (DSARs)

PDPA: answer within one month, extendable once (two more months, up to three in total). Queue:
`GET /api/v1/admin/dsar` (`overdue` flag per row); handle with `PATCH /api/v1/admin/dsar/{dsar_id}`
(`status`, `note` — handling notes only, never health data — and `extend`). Roles: `dpo_auditor` or `super_admin`.

- **Intake:** the person (or their guardian, for a child) asks in the app (`POST /api/v1/persons/{person_id}/dsar`) or
  through support, who verifies identity first (SUPPORT_PLAYBOOK.md §8).
- **Export:** `POST /api/v1/admin/dsar/{dsar_id}/export` builds the zip (FHIR bundle of the whole history + 12-month PDF
  summary + access-log extract, filtered by the access policy *as the requester* — a teen's confidential data only to the
  teen) and notifies the requester; they mint a one-time 10-minute link in the app
  (`POST /api/v1/persons/{person_id}/dsar/{dsar_id}/export-link`). Staff never see the file or a link — never email or
  WhatsApp a bundle. The hourly `dsar_exports` job deletes export files after 7 days.
- **Rectify / erase:** `POST /api/v1/admin/dsar/{dsar_id}/rectify` (identity fields) and `…/erase` — always a dry run
  first (`{"dry_run": true}` returns exact counts), then `{"dry_run": false, "confirm_person_id": "<id>"}` with MFA.
  Erasure is refused while a legal hold covers the person (`/api/v1/admin/legal-holds`), for a family owner with other
  members, and for clinician/staff accounts; it keeps the audit tombstone (DATA_MODEL.md §17). SLA view:
  `GET /api/v1/admin/dsar-sla`. All endpoints: API_DESIGN.md §12.
- `DsarOverdue` fires one hour after a deadline passes; the DPO is told the same day. Extend *before* the deadline when
  a request is complex — never after.

## 11. Reference

### 11.1 Worker schedule (`services/api/app/worker.py`)

| Job | When (UTC) | Asia/Colombo | Notes |
|---|---|---|---|
| `dispatch_outbox` | :00 and :30 every minute | — | unique; drains ≤ 20 batches |
| `escalate_alerts` | :15 every minute | — | unique |
| `deliver_notifications` | :45 every minute | — | unique; 200 per run |
| `housekeeping` | every 5 min | — | break-glass expiry, invite expiry |
| `missed_checkins` | every 5 min (+2) | — | HZ-09 |
| `scheduled_rules` | hourly at :10 | — | missed readings, inactivity |
| `prune_devices` | hourly at :17 | — | heartbeats, nonces |
| `care_reminders` | 03:00 | 08:30 | ANC and screening reminders |
| `nightly_resolve` | 19:00 | 00:30 | life-stage transitions |
| `nightly_age_transitions` | 19:20 | 00:50 | teen re-consent, handover |
| `ensure_partitions` | 20:00 | 01:30 | 4 months ahead |
| `verify_audit_chain` | 20:30 | 02:00 | E14-01 |
| `rebuild_summaries` | 20:45 | 02:15 | daily summaries |
| `synthetic_alert_test` | 21:30 | 03:00 | E13-05 |
| `retention_purge`, `dsar_exports` | see `app/worker.py` | | P6 |

### 11.2 Read-only queries (ids and counts only)

```sql
-- outbox backlog by topic
SELECT topic, count(*), min(created_at) AS oldest, max(attempts) AS max_attempts
FROM outbox_event WHERE dispatched_at IS NULL GROUP BY topic ORDER BY oldest;

-- notifications waiting, by channel and status
SELECT channel, status, count(*) FROM notification
WHERE created_at > now() - interval '1 day' GROUP BY channel, status;

-- open alerts by template and age (no values)
SELECT template_code, severity, count(*), min(opened_at) FROM alert
WHERE status = 'open' GROUP BY template_code, severity;

-- hubs with the oldest heartbeats
SELECT serial, status, last_heartbeat_at, last_sync_at FROM hub_device
WHERE status = 'active' ORDER BY last_heartbeat_at NULLS FIRST LIMIT 20;
```

Run them with the read-only role from an admin task, never from a laptop against production.
