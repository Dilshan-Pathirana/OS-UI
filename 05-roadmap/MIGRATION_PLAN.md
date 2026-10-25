# Cure Global — Migration plan from the three source repos

*v0.1 · 22 Oct 2026 · How code gets from HMS-Dilshan, patient-app and Healthcare-Device into `cure-global`. What is kept or cut, and why: `docs/01-product/SOURCE_REPO_ANALYSIS.md`.*

## 1. Rules

1. **Import with history** wherever a whole folder moves (`git subtree`). Copy by hand only for single files and for HMS code that is being rewritten.
2. **Keep paths identical to Healthcare-Device** for everything that comes from it (`apps/hub-ui`, `services/hub-core`, `packages/clinical`, `design-system`, `os`, …). Its Dockerfiles, generators and compose file then work without edits.
3. **Folders the scaffold must not create** (the import would fail if they existed):
   - `apps/hub-ui`, `apps/mobile`
   - `services/hub-core`, `vision`, `ble-gateway`, `ble-sim`, `hms-stub`
   - `packages/clinical`, `packages/i18n`
   - `design-system`, `os`, `assets/brand`, `infra/compose/mosquitto`
4. **Keep source repos read-only.** The import adds temporary `export/*` branches to your local Healthcare-Device clone and deletes them at the end. Nothing is pushed.
5. **Keep pulling Cure Home** while its pilot runs on HMS: `git subtree pull --prefix=<dir> cure-home export/<dir>` after re-splitting (script `-Update`).

## 2. Step by step (Windows, PowerShell, Git for Windows)

```powershell
cd C:\Users\MSI\Documents\GitHub\cure-global
git add -A; git commit -m "Cure Global docs and starting points"     # the tree must be clean before git subtree
powershell -ExecutionPolicy Bypass -File scripts\import_sources.ps1    # defaults: ..\Healthcare-Device main, ..\patient-app main
pnpm install                                                           # regenerates pnpm-lock.yaml for the whole workspace
python scripts\init_env.py                                             # every .env, shared secrets
docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.hub.yml --profile core --profile dev up -d --build
```

What `scripts/import_sources.ps1` does (the same steps are in `scripts/import_sources.sh` for Git Bash):

| # | Source | Destination | Method |
|---|---|---|---|
| 1 | Healthcare-Device `apps/hub-ui` | `apps/hub-ui` | subtree split + add |
| 2 | `services/hub-core`, `vision`, `ble-gateway`, `ble-sim`, `hms-stub` | same paths | subtree split + add (one per folder) |
| 3 | `packages/clinical`, `packages/i18n` | same paths | subtree split + add |
| 4 | `design-system` | `design-system` | subtree split + add |
| 5 | `os`, `assets/brand` | same paths | subtree split + add |
| 6 | `infra/compose/mosquitto` | same path | subtree split + add |
| 7 | `infra/compose/docker-compose.yml` | `infra/compose/docker-compose.hub.yml` | copy (commit message records the source commit); its `name: cure-home` line is removed so the merged project stays `cure-global` |
| 8 | `infra/compose/docker-compose.hms.yml` | `infra/compose/docker-compose.hub-hms.yml` | copy |
| 9 | `scripts/init_env.py`, `kiosk.ps1`, `fetch_models.py` | `scripts/init_env_hub.py`, `scripts/kiosk.ps1`, `scripts/fetch_models.py` | copy; `scripts/init_env.py` (Cure Global) delegates `--prod` to `init_env_hub.py` |
| 10 | Healthcare-Device `docs/` | `docs/cure-home/` | copy, for reference (Cure Home's own decisions stay valid for the hub) |
| 11 | patient-app (whole repo) | `apps/mobile` | `git subtree add` from its `main` |

History: `git subtree split` rewrites each folder's history to the folder root, so the old commits appear in `git log` under each import merge (path-filtered `git log -- apps/hub-ui` shows the merge, not every old commit; use `git log <import-merge>^2` to browse them).

Not imported:
- `marketing/` and the Ask Cure research. These stay in Healthcare-Device.
- `node_modules`, `.env` files, models and MediaPipe assets. These are not tracked; `scripts/fetch_models.py` and the hub-ui `prebuild` step fetch them.

## 3. After the import (Phase 0 / Phase 3 tasks)

| Area | Change | When |
|---|---|---|
| pnpm workspace | Root `pnpm-workspace.yaml` already lists `apps/hub-ui`, `apps/admin-web`, `apps/doctor-web`, `packages/*`. **`apps/mobile` stays out of the pnpm workspace** (it keeps npm + `package-lock.json` and `legacy-peer-deps`); it uses shared packages through `file:` dependencies and Metro `watchFolders` | Phase 0 |
| Package names | Keep `@cure-home/clinical` and `@cure-home/i18n` until the hub works on Cure Global, then rename to `@cure/clinical` and `@cure/i18n` in one PR | Phase 3 |
| Compose | `docker-compose.hub.yml` keeps `context: ../..`, which still means the repo root. Ports don't clash with the core profile (api 8000, admin 5180, doctor 5181, Postgres 5433, Valkey 6380, MinIO 9100/9101, Mailpit 8025, Traccar 8082). Run both with two `-f` flags | Phase 0 |
| hub-core | Add `HUB_BACKEND=hms\|cure-global`. With `cure-global`, `HMS_BASE_URL=http://api:8000/api/v1` and the new member fields (life stage, modules, proxy rights) | Phase 3 |
| hub-ui | Module-driven Orbit cards, proxy chooser, due today, check-in, SOS, review card | Phase 3 |
| hms-stub | Keep it as the contract twin. Its `tests/test_contract.py` also runs against `api` (fixture switch) | Phase 3 |
| clinical | Add growth z-scores (LMS), corrected age, gestational age, BMI-for-age, new metric ranges; extend the shared vectors (TS + Python) | Phases 1 and 5 |
| i18n | Add the new hub strings (en/si/ta), marked in `REVIEW_KEYS` | Phase 3 |
| design-system | Add `packages/design-tokens/gen_web.py` and `gen_native.py` (they read `design-system/project/tokens.json`); new vital identity colours | Phase 1 |
| mobile | New app id (decision D-5), API base, EAS project, monorepo Metro config, replace HMS-specific services (`appointments` booking, `payments`, `queue`, `medicalRecords`) with Cure Global endpoints, family model, offline queue | Phase 2 |

## 4. Porting from HMS-Dilshan (by hand, into `services/api`)

| HMS file | Into | Notes |
|---|---|---|
| `backend/app/models/home_hub.py` | `app/devices/models.py`, `app/family/models.py`, `app/care/models.py`, `app/notify/models.py` | Rename household → family. Keep hub table names so the contract and data stay compatible |
| `backend/app/api/home_hub.py` | `app/devices/router.py` | Same paths and shapes (ADR-0007); `get_current_hub_device` dependency |
| `backend/app/services/home_hub_service.py` | `app/devices/service.py`, `app/records/service.py` | `vitals:batch` uses the catalogue's metric definitions |
| `backend/app/api/patient_home_hub.py` | `app/family/router.py`, `app/files/router.py`, `app/medication/router.py`, `app/notify/router.py` | Generalise to persons and guardianship |
| `backend/app/core/security.py` | `app/identity/tokens.py`, `passwords.py`, `otp.py` | HS256 → EdDSA; keep `jti`, `tokens_valid_after`, the threadpool bcrypt, the OTP HMAC digests |
| `backend/app/core/vital_ranges.py` | Catalogue `metrics.yaml` + `packages/clinical/python` | Ranges become data |
| `backend/app/core/fhir_export.py` | `app/fhir/export.py` | Extend resources |
| `backend/app/core/face_check.py` | `app/files/face_check.py` | Same YuNet model pin |
| `backend/app/core/private_files.py`, `file_upload.py` | `app/files/storage.py` | S3 API (MinIO in dev) |
| `backend/app/core/audit.py` | `app/audit/` | Hash-chained, partitioned |
| `backend/app/services/push_service.py` | `app/notify/push.py` | Expo push |
| `backend/app/services/sms_service.py` (Textware) | `app/notify/sms_textware.py` | Behind an adapter interface |
| `backend/tests/test_home_hub.py` | `services/api/tests/devices/` | Contract tests |
| Frontend `components/vitals/ClinicalVitalsPanel.tsx`, `VitalsHistoryChart.tsx` | Reference for `apps/doctor-web` | Rebuild on the new tokens |

## 5. What is left behind
Everything listed as cut in `SOURCE_REPO_ANALYSIS.md` §3.3. HMS keeps running for Cure.lk; Cure Global reaches it only through the HMS connector (R3).

## 6. Convergence with Cure Home (after its pilot, mid-2027)
1. Freeze hub development in Healthcare-Device; final `subtree pull`.
2. Move Cure Home households onto Cure Global families (a migration job maps HMS household → family, patient → person, hub_device → hub_device; consents are copied with their original method and date).
3. Point hubs at Cure Global (`HUB_BACKEND=cure-global`) by OTA.
4. Archive Healthcare-Device (read-only) and keep HMS `/api/v1/hub/*` until the last hub moves.
