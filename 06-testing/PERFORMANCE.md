# Cure Global — Performance (P6 baseline)

*v1.0 · 23 Oct 2026 · hardening-p6. The first measured baseline against the NFRs (ARCHITECTURE.md §6: p95 < 300 ms for reads, < 500 ms for batch writes of ≤ 50 items) on a synthetic 5-year history, what dominated, what was changed, and what is still open. Tools: `tests/perf/volume.py` (volume generator), `tests/perf/k6/smoke.js` (k6 scenarios). Re-run before the pilot on staging and before each release (TEST_STRATEGY.md §1 "Performance").*

## 1. How the numbers were made

| Item | Setting |
|---|---|
| Machine | The development PC: Windows 11, Docker Desktop (WSL 2). Shared Postgres 17 container, database `cure_test_p6` used for nothing else |
| API | `cure-global/api:dev` image with this branch's `services/api/app` mounted, `APP_ENV=dev` (X-Dev-Actor instead of tokens), on 127.0.0.1:8177; 1 and 3 uvicorn workers. It reaches Postgres through `host.docker.internal`, which adds ~1–3 ms per round trip — more than a VPC (~0.3 ms), so query-count-heavy endpoints look worse here than in staging |
| Load | `grafana/k6` in Docker, 30 s per run, 14 virtual users: 4 × observation batch (10 readings: BP + weight, as the hub sends), 6 × series (70 % the 90-day chart, 30 % the year view; BP or glucose), 4 × family dashboard (as the family's owner) |
| Worklist / panel | Timed on their own with curl (one request takes seconds; see §4) |

**Synthea** (the volume source TEST_STRATEGY.md §2 names) is not runnable here — it needs a Java toolchain, its module downloads and a review of its licence and output mapping (FHIR → persons/observations). `tests/perf/volume.py` writes the shape the demo seed writes instead, server-side (`INSERT … SELECT generate_series`, no rows over the wire):

    cd services/api
    DATABASE_URL=postgresql+asyncpg://…/cure_test_p6 APP_ENV=dev DEV_KEK=… uv run alembic upgrade head
    …                                                         uv run python -m app.seed
    …                                                         uv run python ../../tests/perf/volume.py --families 300 --years 5 --audit 2000000 --out targets.json

It refuses any database whose name doesn't start with `cure_test`/`cure_perf`. The audit rows it writes have random hashes, so that database's chain does not verify (by design — never point the drill at it).

### 1.1 The data set vs the 5-year design point

| | Loaded | Design point (ARCHITECTURE.md §6) |
|---|---|---|
| Families / persons | 300 generated + seed → 1 241 persons | 200 k / 1 M |
| History per person | 5 years: an elder has BP twice daily, weight, glucose and SpO₂ daily (≈ 9 100 readings); adults BP daily + weight every 3 days; children weekly | same depth |
| Observations | **4 366 200** (+ seed) in 77 monthly partitions | ~2 B |
| Daily summary rows | 3 821 549 | — |
| Audit events | **2 000 000** (+ seed) | (7 years of every PHI read) |
| Load time | 133 s (readings 58 s ≈ 75 k rows/s; summary rebuild 24 s; audit 27 s) | — |

Per-request cost depends on one person's (or one family's, one panel's) depth, which matches the design point; total table size is ~1/460 of it, which costs one or two more B-tree levels at 2 B rows and doesn't change the plans (every hot query is `person_id` + metric + time on `ix_observation_person_metric_time` or the summary PK). Not represented: cache/IO pressure of a 2 B-row table, Postgres on its own host, many doctors at once, the hub fleet's heartbeats.

## 2. Results

| Run | Workers | batch p95 (med) | series p95 (med) | dashboard p95 (med) | Requests / 30 s | NFR |
|---|---|---|---|---|---|---|
| A — before (advisory-lock chain, `(at, id)` index present) | 1 | 604 ms (448) | 686 ms (495) | 687 ms (500) | 840 (28/s) | ✗ all three |
| A′ — same, repeat | 1 | 583 ms (431) | 650 ms (488) | 649 ms (492) | 878 | ✗ |
| B — commit-time chaining (§5) | 1 | **265 ms** (144) | **299 ms** (174) | 505 ms (359) | 2 110 (70/s) | batch ✓ · series ✓ (at the limit) · dashboard ✗ |
| B′ — same, repeat | 1 | 247 ms (147) | 286 ms (174) | 485 ms (357) | 2 108 | same |
| C — commit-time chaining | 3 | **146 ms** (71) | **188 ms** (96) | 325 ms (195) | 3 816 (127/s) | batch ✓ · series ✓ · dashboard ✗ (25 ms over) |
| Worklist, design-point panel (332 persons) | 3 | 11.1–11.3 s (3 runs) | | | | ✗ (§4) |
| Panel (`/practitioners/{id}/panel`), same 332 | 3 | 11.5 s | | | | ✗ |
| Worklist, Dr N. Perera's whole demo panel (1 241 persons) | 1 | 115.7 s | | | | ✗ |

Failed requests: 0 in every run. Raw k6 summaries are kept with the run (not committed); `tests/perf/k6/smoke.js` prints the table above.

## 3. What dominated (measured)

Sampling `pg_stat_activity` five times a second during run A: on average **11.5 of the ~14 busy backends were waiting on the audit chain's advisory lock**, 1.7 were "idle in transaction" (Python work between queries), 0.4 were on CPU. Every PHI read is audited (ACCESS_CONTROL.md: every allow), and the old `record()` took a transaction-wide advisory lock at the first audited read, so each request held the platform-wide lock for the rest of its work and its commit: **all requests were serialised**. Inside that lock it read the chain head with `ORDER BY at DESC, id DESC LIMIT 1` over 77 partitions:

| Head lookup at 2 M events, 77 partitions | Planning | Execution |
|---|---|---|
| No `(at, id)` index (schema up to 0006) | 1.2 ms | **167.8 ms** |
| With `ix_audit_event_at_id` (migration 0009) | 1.0 ms (27 ms cold) | 0.9 ms |
| `audit_chain_head` row, `FOR UPDATE` (0009) | 0.02 ms | 0.03 ms |

On the 0006 schema the ceiling is therefore ≈ 6 audited requests per second *for the whole platform* once the audit table has a few million rows — it grows by every read, so production would have hit it within weeks of the pilot.

After the change (run B) the samples show 7.4 backends "idle in transaction" and ~4.5 waiting on the head row: the single API process was at 84 % CPU (one core), so the remaining wait is Python scheduling, and adding workers (run C) scales as expected. The next limits are CPU in the API process (scale out: containers × workers) and the per-person query counts in §4.

## 4. Open: worklist, panel and family dashboard

- **Worklist and panel are N+1 per covered person** (`app/clinical/worklist.py`): for each person an `access_context` (≈ 8 queries: person, family time zone, consents, safeguarding episodes, guardianships, grants, care-team coverage, restrictions) and then ≈ 6 more (family, programmes, open alerts, last review, readings since, targets) — ≈ 14 sequential round trips × 332 persons ≈ 4 600 queries, ~34 ms per person here. In a VPC it would be ~3–4 s for 332 persons, still far over 300 ms.
  **Proposal (story for the doctor-console backend, before the pilot):** a set-based worklist — load each fact once for the whole covered set (`… WHERE person_id = ANY(:ids)` for alerts, last reviews, readings-since counts from `observation_daily_summary`, targets, programmes, families) and evaluate the policy per person in memory from those batched facts (the shape `authorize_many()` already uses), or maintain a `worklist_item` projection from the outbox consumers (alerts, readings, reviews, target changes) so the request is one indexed read; page the result (top N by urgency). Target: p95 < 300 ms for a 333-person panel. The pilot (5–10 doctors, ≤ 100 persons each) would see ~1 s locally, ~0.3–0.5 s in a VPC — usable but not within the NFR.
- **Family dashboard** p95 325 ms with 3 workers (≈ 195 ms median): per member it builds the latest point, a 14-day sparkline and status per metric. Batch the per-member reads (one summary query per family) — small change, same owner.
- **Series** meets the NFR with ≥ 2 workers; the year view reads daily summaries only.
- **Batches** meet the NFR with headroom (10 items, p95 146 ms at 3 workers).

## 5. The audit chain change (implemented, migration 0009)

`app/audit/service.py` now **chains at commit time**: `record()` only stages the event on the session; a `before_commit` hook locks the one-row `audit_chain_head` (`SELECT … FOR UPDATE`, held until COMMIT), stamps `at` strictly after the previous link (so `(at, id)` order equals chain order), computes `prev_hash`/`hash`, inserts the transaction's events and moves the head. The serialised section is one primary-key read, the inserts and the commit. Safety properties kept:

- **Verifiable as before:** `verify_chain_detail()` is unchanged and never trusts the head row; it recomputes every link in `(at, id)` order (the nightly job and `POST /api/v1/admin/audit/chain/verify`). Tampering still fails it (`tests/test_admin_api.py::test_audit_search_chain_and_tamper_detection`).
- **One chain, no forks:** writers serialise on the head row; the bootstrap (no head row yet, e.g. a fresh database) takes the old advisory lock once and builds the row from the newest event. Upgrading fills the row in migration 0009.
- **Atomic with the change:** events are inserted in the same transaction as the data; a rolled-back transaction leaves no event; a savepoint rollback keeps what the outer transaction recorded.
- **Order under concurrency:** `tests/test_audit_chain_commit.py` records in one order and commits in another (plus 12 concurrent writers) and verifies the chain.

Further options if the head row ever dominates (not needed at today's numbers): batch the commit of high-volume read audits through the outbox, or shard into N chains keyed by subject with a daily cross-chain anchor (verification per chain).

## 6. Re-running

    # 1. volume (see §1), then an API on a free port in 8100–8199 pointed at the perf DB
    # 2. k6:
    docker run --rm -v <dir with smoke.js and targets.json>:/perf -e BASE=http://host.docker.internal:<port> \
        -e SCENARIOS=batch,series,dashboard grafana/k6 run /perf/smoke.js
    # 3. worklist on its own (DOCTOR=<practitioner id>, SCENARIOS=worklist) — expect seconds until §4 is fixed

Staging runs replace `X-Dev-Actor` with Bearer tokens (the header is ignored outside dev/test).
