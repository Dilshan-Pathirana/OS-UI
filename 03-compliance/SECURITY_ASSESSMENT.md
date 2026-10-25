# Cure Global — Security assessment (scanners and dispositions)

*v1.0 · 23 Oct 2026 · hardening-p6 (E14-05/06/07 support). What every scanner found on the code at `main` + this wave, what was fixed, and the disposition of everything left: fixed (with the change), accepted (reason, owner, review date), false positive (evidence), or open (owner, deadline). Every HIGH and CRITICAL has a row. Threats behind the findings: [`THREAT_MODELS.md`](THREAT_MODELS.md); requirement mapping: [`ASVS_MASVS_ASSESSMENT.md`](ASVS_MASVS_ASSESSMENT.md); the external test that verifies all of this: [`PEN_TEST_PLAN.md`](PEN_TEST_PLAN.md). Re-run per release; CI runs the static scanners on every PR (`.github/workflows/ci.yml` jobs `api`, `secrets`, `deps-audit`, `sast`, `images`, `hazards`, `workflow-lint`).*

## 1. Summary

| Scanner | Scope | Raw result | HIGH / CRITICAL after this wave | CI gate |
|---|---|---|---|---|
| ruff `S` (flake8-bandit) | every Python service, packages, scripts | 40 findings (API under its own config: 0) | 0 — all false positives or test fixtures (§2.1) | `api` job (API config) |
| pip-audit | 8 `uv.lock` files (api, hub-core, vision, ble-gateway, ble-sim, hms-stub, clinical, module-catalogue) | 0 known vulnerabilities | 0 | `deps-audit` — any finding blocks unless dispositioned in `scripts/security/pip-audit-ignore.txt` |
| pnpm audit `--prod` | pnpm workspace (consoles, hub-ui, packages) | 0 | 0 | `deps-audit` — high/critical block |
| npm audit `--omit=dev` | `apps/mobile` (imported patient app, ported in P2) | 22: 1 critical, 15 high, 6 moderate | 16 — **accepted until P2**, owner mobile wave (§2.3) | `deps-audit` — reported, not blocking until P2 |
| gitleaks | git history (all refs, 22 MB of patches) and the working tree | history 13, tree 124 | 0 — all false positives (§2.4); `.gitleaks.toml` allowlists the 3 reviewed ones by value/path | `secrets` |
| Semgrep `p/ci p/python p/typescript p/react` | 1 285 files | 31 (4 ERROR, 23 WARNING, 4 MEDIUM) | 0 — 4 ERROR are false positives (§2.5) | `sast` — ERROR blocks, the text() rule excluded with reason |
| Trivy (images) | `cure-global/{api,admin-web,doctor-web,hub-ui,hub-core,vision,ble-sim,hms-stub}:dev` | consoles: 2 CRITICAL + 57 HIGH each (all fixable); Python images: 44 HIGH each (none fixable) | consoles **0 after fix** (verified on a rebuilt admin-web); Python images 44 HIGH unfixed upstream — accepted (§2.6) | `images` — fixable HIGH/CRITICAL block (`ignore-unfixed`) |
| OWASP ZAP baseline (passive) | local consoles :5180, :5181 and API :8000 (read-only, nothing non-local) | 0 FAIL; 6 WARN per console, 3 WARN on the API | 0 HIGH; 1 MEDIUM accepted (CSP `style-src 'unsafe-inline'`) (§2.7) | nightly against staging (to add when staging exists) |
| Code review (threat-model pass, this wave) | API, consoles, hub services | 9 issues H/M | 2 HIGH **fixed**; mediums fixed or owned (§3) | — |

## 2. Findings and dispositions

### 2.1 ruff `S` (Bandit rules) across services

Command: `uvx ruff check --isolated --select S --ignore S101 services packages/clinical/python packages/module-catalogue/python scripts`. The API's own config (`services/api/pyproject.toml`, `S` enabled) is clean and runs in CI.

| Rule | Count | Where | Disposition |
|---|---|---|---|
| S311 pseudo-random | 17 | `services/api/app/seed_histories.py` (16), `services/hms-stub/hms_stub/fixtures.py` | False positive: deterministic demo data (fixed seeds), not security. Already per-file-ignored in the API config |
| S608 SQL built from strings | 9 | `services/hub-core/hub_core/{repo,sync,views}.py`, `engine/pipeline.py`, `services/hms-stub/hms_stub/admin.py` | False positive: every fragment is a module constant (`COUNTED`, optional `AND id = ?`), values are bound `?` parameters; the hms-stub hit is an HTML template with `esc()` |
| S105 / S106 hard-coded secret | 9 | tests in api, hub-core, vision | Test fixtures (dummy tokens), not deployed |
| S104 bind all interfaces | 2 | `services/hub-core/hub_core/main.py`, `services/vision/vision/main.py` | Accepted: they listen inside their containers; compose publishes them on 127.0.0.1 only. On a real hub the kiosk network must stay host-local (THREAT_MODELS §8 #9, hub hardware) |
| S603 subprocess | 1 | `scripts/init_env.py` | False positive: constant argument list, developer tool |
| S310 URL open | 1 | `scripts/fetch_models.py` | False positive: fixed https URLs with SHA-256 verification |
| S110 try/except/pass | 1 | `services/ble-gateway/ble_gateway/main.py:135` | Accepted (low): best-effort BLE cleanup on shutdown |

### 2.2 pip-audit

`scripts/security/pip_audit_all.sh` (CI job `deps-audit`): `uv export --frozen --all-extras` per lockfile, local packages skipped, `pip-audit --no-deps --disable-pip`. **No known vulnerabilities in any of the 8 projects** (269 pinned packages). pip-audit has no reliable severity field, so the gate blocks on any finding; an accepted one goes in `scripts/security/pip-audit-ignore.txt` with reason, owner and review date (empty today).

### 2.3 npm / pnpm audit

- `pnpm audit --prod`: no known vulnerabilities in the workspace (admin-web, doctor-web, hub-ui, packages).
- `apps/mobile` (`npm audit --omit=dev`, the imported Cure patient app still pointing at HMS until P2):

| Package | Severity | Advisory | Path | Fix | Disposition |
|---|---|---|---|---|---|
| shell-quote 1.8.4–1.10.0 | **critical** | GHSA-pqg4-j6r4-53mv (command injection via a line terminator) | React Native / Expo CLI toolchain | `npm audit fix` (non-breaking) | **Accepted until P2** — build-time CLI only, never in the shipped bundle; the mobile wave runs `npm audit fix` first (owner: mobile; deadline: before the first P2 build) |
| follow-redirects 1.16.0 | high | GHSA-q3jh-wrc6-jgq8, GHSA-8r9p-f939-6h3c (credential headers on cross-origin redirects) | axios (runtime) | `npm audit fix` | **Accepted until P2** — the app's API is replaced in P2 (E16-01); fix with the first P2 change |
| braces, micromatch, node-forge, metro*, @expo/cli, expo (13 more) | high | e.g. GHSA-vfj7-8cjw-p6xm, GHSA-86w9-cpqp-85rv | Metro bundler / Expo CLI / code signing (build tools) | needs an Expo SDK upgrade (breaking) | **Accepted until P2** — build-time only; the P2 rebrand moves to a current Expo SDK (D-5) |
| decode-uri-component, query-string (+4) | moderate | GHSA-vcc3-ghjq-m6fr … | expo-router | breaking upgrade | Same |

The CI step reports these without failing (`continue-on-error`) and must be switched to blocking in the mobile wave.

### 2.4 Secrets (gitleaks)

- **History** (every ref, `git log -p --all` through `gitleaks stdin`): 13 findings — 12 × `HMS_STUB_JWT_SECRET` dummy values set by `services/hms-stub/tests/*` and `services/hub-core/tests/*` (`test-secret-0123…`, `stub-secret-0123…`), 1 × a table cell in `docs/02-architecture/ARCHITECTURE.md`. All false positives.
- **Tree**: 124 findings — 117 inside `services/api/.venv` (third-party botocore examples, PyJWT docs; never committed), 6 test fixtures, 1 doc. All false positives.
- Fix: `.gitleaks.toml` extends the default rules with an allowlist of exactly those two dummy values, the doc path and the local tool directories; the CI job passes it (`GITLEAKS_CONFIG`). No real secret was found in history or tree.

### 2.5 Semgrep

| Rule | Severity | Count | Disposition |
|---|---|---|---|
| `python.sqlalchemy.security.audit.avoid-sqlalchemy-text` | ERROR | 4 (`app/records/service.py` 3, `app/seed.py` 1) | False positive: SQL from module constants with bound parameters (`:p`, `:days`); table names in `_reset` come from our own metadata. Excluded in CI by rule id; ruff `S608` with reviewed `noqa` comments guards new string-built SQL |
| `yaml.github.security.audit.github-actions-mutable-action-tag` | WARNING | 23 | **Open (ops, before GA):** pin third-party actions by commit SHA and let Dependabot bump them (THREAT_MODELS §8 #18) |
| pnpm `minimumReleaseAge`, `trustPolicy`, block exotic sub-dependencies; npm minimum release age | MEDIUM | 4 | **Open (eng, R2):** needs pnpm ≥ 10.16 (the repo pins 9.15); revisit with the pnpm upgrade |
| Parse errors | — | 5 (Dockerfile `ENV` continuation, two TSX generic arrows) | Tool limitation; the files were otherwise scanned |

### 2.6 Container images (Trivy, HIGH/CRITICAL)

| Image(s) | Base | Before | Fix | After | Disposition of the rest |
|---|---|---|---|---|---|
| admin-web, doctor-web, hub-ui | `nginx:1.27-alpine` | 2 CRITICAL (libcrypto3/libssl3 3.3.3 → 3.3.7), 57 HIGH (OpenSSL, curl, c-ares, libexpat, libxml2 …), **all with fixed versions** | `RUN apk upgrade --no-cache` in each runtime stage (`apps/*/Dockerfile`) | **0 HIGH / 0 CRITICAL** (admin-web rebuilt from this tree as `cure-global-p6/admin-web:scan` and re-scanned; the other two use the same base and step) | — |
| api (+ worker), hub-core, vision, ble-sim, hms-stub | `python:3.12-slim` (Debian 13) | 44 HIGH each, 0 CRITICAL, **none with a fixed version** (util-linux libs, ncurses, systemd libs, `login`, …) | — | 44 HIGH unfixed | **Accepted (review monthly):** no patched package exists; the affected binaries aren't used by the services (no login, no setuid tools in use, non-root user 10001). Rebuild weekly so fixes land when Debian ships them; consider distroless/Chainguard Python before GA. CI blocks any *fixable* HIGH/CRITICAL (`ignore-unfixed: true`) |

The orchestrator's next rebuild of the live images picks up the console fix.

### 2.7 OWASP ZAP baseline (passive, local only)

`zap-baseline.py -t http://host.docker.internal:{5180,5181}` and `…:8000/api/v1/health`, `-I`, spider 1–2 min, GETs only.

| Alert | Risk | Where | Disposition |
|---|---|---|---|
| CSP: `style-src 'unsafe-inline'` | Medium | both consoles | **Accepted (review R2):** React components set inline styles (charts, kit); scripts are `'self'` only, `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'self'`. Action: move inline styles to classes or hashes, then drop `unsafe-inline` |
| Server leaks version (`Server: nginx/1.27.x`) | Low | both consoles | **Fixed:** `server_tokens off` (verified: `Server: nginx`) |
| Cross-Origin-Opener-Policy / Cross-Origin-Resource-Policy missing | Low | both consoles | **Fixed:** `COOP: same-origin`, `CORP: same-origin` on pages and assets |
| Cross-Origin-Embedder-Policy missing | Low | both consoles | Accepted: no cross-origin isolation needed (no SharedArrayBuffer); revisit with the CSP work |
| Permissions-Policy missing on `/assets/` | Low | both consoles | **Fixed:** repeated in the assets location |
| X-Content-Type-Options missing; CORP missing; storable content | Low / info | API | **Fixed:** the API adds `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cross-Origin-Resource-Policy: same-site` to every response unless a route sets its own (`app/platform/http_obs.py`; test `tests/test_observability_unit.py::test_api_responses_carry_security_headers_and_a_request_id`) |
| Modern web application, non-storable content | Info | consoles | — |

## 3. Code-review findings (this wave) and other fixes

| # | Finding | Severity | Status | Change / owner |
|---|---|---|---|---|
| C1 | `APP_ENV` defaulted to `dev` with `DEV_ANONYMOUS_ADMIN=true`: a deployment that forgot `APP_ENV` would accept `X-Dev-Actor`, dev sign-in and anonymous super-admin | **High** | **Fixed** | Default is now `production` (`app/config.py`); `.env.example`, compose and tests set `dev`/`test` explicitly. **Local servers without a .env must set `APP_ENV=dev`** |
| C2 | Console nginx access logs carried query strings (admin search `?query=<phone>`, stream `?token=`) | **High** | **Fixed** | `log_format cure_noargs` (path without args) in both console templates; verified on the rebuilt image |
| C3 | uvicorn's access log printed full URLs with query strings | High (same class as C2) | **Fixed** | uvicorn access logger disabled; the API's own access line has the route template only (`app/platform/http_obs.py`) |
| C4 | Dev SMS adapter logged the OTP text in every environment | Medium | **Fixed** | Text logged only with `APP_ENV=dev` (and only past the scrubber by explicit flag); `production` refuses the dev SMS backend (`app/platform/messaging.py`) |
| C5 | SQLAlchemy would log statements *with bound parameters* if the root logger were set to DEBUG | Medium | **Fixed** | `sqlalchemy*`, `asyncpg`, `httpx`, `httpcore` pinned to WARNING in `configure_logging` (test `test_sqlalchemy_parameter_logging_stays_off_even_at_debug`) |
| C6 | No PHI scrubbing safety net in logs; hub-core's filter sat on the `hub_core` logger only (child loggers bypassed it) | Medium | **Fixed** | JSON logs through `app/platform/logs.py` scrubber (API + worker); `services/hub-core/hub_core/logscrub.py` on every handler; log-scan tests (`services/api/tests/test_log_scan.py`, `services/hub-core/tests/test_log_scrub.py`) |
| C7 | `python -m app.seed` could create demo accounts with a known password on a production database | Medium | **Fixed** | Refuses with `APP_ENV=production` (`app/seed.py`) |
| C8 | Vision service fails open without `HUB_UI_TOKEN` / `VISION_HUB_SECRET` | Medium | **Fixed** (service) / Open (kiosk) | `services/vision/vision/config.py` refuses to start outside dev without them; kiosk nginx on loopback — hub eng, before pilot hubs ship |
| C9 | `scripts/rotate_kek.py` skipped 10 encrypted columns (notes, messages, questionnaire answers, reviews, safety/capacity reasons, push tokens …), so an old KEK could never be retired | Medium | **Fixed** | All envelope-encrypted columns listed (+ `legal_hold.reason`); empty placeholders skipped |
| C10 | `ServerSideEncryption=AES256` on every upload overrides a bucket's SSE-KMS default | Low | **Fixed** | `S3_SSE` = `AES256` (default) · `aws:kms` · `bucket`; infra/tofu sets `bucket` |
| C11 | Audit chain: global advisory lock held from the first audited read to COMMIT, plus an unindexed head scan (168 ms at 2 M events) — at load 11.5 of 14 backends waited on it | Availability (High at scale) | **Fixed** | Commit-time chaining with a one-row `audit_chain_head` locked FOR UPDATE; `(at, id)` index (migration 0009). Throughput 2.4×; tests `tests/test_audit_chain_commit.py` (PERFORMANCE.md §5) |
| C12 | No least-privilege DB role (app owns `audit_event`; PRIVACY_CONSENT_SECURITY §5.4 promises INSERT/SELECT only) | Medium | **Open** — ops, before pilot | Create `cure_app` (DML on app tables, `INSERT, SELECT` on `audit_event`/`audit_chain_head`… plus `UPDATE` on the head row only) and run migrations as the owner role; anchor the chain head daily to object-locked storage |
| C13 | uvicorn `--proxy-headers` without `--forwarded-allow-ips`: per-IP limits see the proxy | Medium | **Open** — ops | Set `FORWARDED_ALLOW_IPS` to the edge's addresses (infra/tofu container_service passes it for the ALB) |
| C14 | TOTP codes replayable within their window; no notice on password/MFA/recovery-code changes | Medium | **Open** — identity owner (backend-r2b is adding step-up re-auth) | Store the last accepted time-step per account; notification templates for credential changes |
| C15 | Staff/clinician sessions 12 h idle / 7 d absolute vs ASVS L3 3.3.2 | Medium | **Decision needed** (product owner) | Proposal: 30 min idle, 12 h absolute for staff and clinicians |
| C16 | KEK still derived from an environment secret (KMS wiring E14-02 pending) | Medium | **Open** — eng + ops | infra/tofu provisions the CMK and grants; code reads `KMS_KEK_KEY_ARN` next |
| C17 | `break_glass_session.reason` stored in clear text (may hold clinical detail) | Low | **Open** — eng | Envelope-encrypt like `legal_hold.reason` |
| C18 | No "end every session" admin action for breach containment | Low | **Open** — eng | BREACH_PROCEDURE.md §6.1 gives the SQL meanwhile |
| C19 | Live-update streams outlive a revoked session by up to 30 min | Low | Open — eng | Re-check the session on each heartbeat |
| C20 | Worklist/panel are N+1 per covered person: 11 s for a 332-person panel | Availability | **Open** — doctor-console backend, before pilot | PERFORMANCE.md §4 |

Mobile-specific items (backup flag, lock-screen medicine names, payment WebView, custom scheme) are MASVS gaps for the P2 mobile wave (`ASVS_MASVS_ASSESSMENT.md`).

## 4. How to re-run

| Scanner | Command (repo root, Git Bash; Docker Desktop) |
|---|---|
| ruff S | `uvx ruff check --isolated --select S --ignore S101 services packages/clinical/python packages/module-catalogue/python scripts` |
| pip-audit | `bash scripts/security/pip_audit_all.sh` |
| pnpm / npm | `pnpm audit --prod` · `cd apps/mobile && npm audit --omit=dev` |
| gitleaks | `git log -p --all > h.patch; docker run --rm -i -v "$PWD:/repo" zricethezav/gitleaks:latest stdin --config /repo/.gitleaks.toml < h.patch` |
| Semgrep | `docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep semgrep scan --config p/ci --config p/python --config p/typescript --config p/react --metrics off` |
| Trivy | `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL cure-global/api:dev` |
| ZAP baseline | `docker run --rm -v "$PWD/zap:/zap/wrk" zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:5180 -r admin.html -I` — local or staging only, never production or anything you don't own |

## 5. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Engineering lead | | | Dispositions accepted / changes requested |
| DPO (privacy-relevant rows C2–C6, C12, C17, C18) | | | |
| Product owner (C15 decision; accepted mobile findings until P2) | | | |
