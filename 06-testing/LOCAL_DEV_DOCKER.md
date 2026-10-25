# Running Cure Global on Windows with Docker Desktop

*v0.1 · 22 Oct 2026*

## 1. One-time setup

| Need | Notes |
|---|---|
| Docker Desktop (WSL 2 backend) | Settings → Resources: give WSL at least 8 GB RAM and 4 CPUs; `.wslconfig` if needed |
| Git for Windows | Includes `git subtree`; set `core.autocrlf=false` for this repo (shell scripts must stay LF; `.gitattributes` enforces it) |
| Python 3.12 + uv | `winget install astral-sh.uv`; `uv` installs Python 3.12 when needed |
| Node 22 LTS + pnpm 9 | `corepack enable` then `corepack prepare pnpm@9.15.0 --activate` |
| Chrome | Hub kiosk window (`scripts/kiosk.ps1`) |
| Android tools | See `ANDROID_DEVICE_TESTING.md` |

## 2. First run

```powershell
cd C:\Users\MSI\Documents\GitHub\cure-global
python scripts\init_env.py                       # every .env from .env.example, shared secrets
docker compose -f infra/compose/docker-compose.yml --profile core up -d --build
docker compose -f infra/compose/docker-compose.yml exec api python -m app.seed      # two demo families, four doctors
```

Open:

| URL | What |
|---|---|
| http://localhost:8000/docs | API (OpenAPI, dev only) |
| http://localhost:8000/api/v1/health | Health |
| http://localhost:5180 | Admin web (production build served by nginx, `/api` proxied to the API; use `pnpm dev` for hot reload) |
| http://localhost:5181 | Doctor web (same) |
| http://localhost:8025 | Mailpit (emails and the dev OTP sink) |
| http://localhost:9101 | MinIO console (dev credentials in `infra/compose/.env`) |
| localhost:5433 | Postgres (user/db `cure`, password in `infra/compose/.env`; an empty `cure_test` database exists for the API's DB tests) |

## 3. Profiles

| Profile | Services | Use |
|---|---|---|
| `core` | postgres, valkey, minio (+ bucket init), mailpit, api, worker, admin-web, doctor-web | Platform, consoles, mobile backend |
| `gps` | traccar (web :8082, OsmAnd :5055, GT06 :5023, Watch :5093), gps-sim | Elder safety (R2) |
| `dev` (from `docker-compose.hub.yml` after the import) | mosquitto, hub-core, vision, hub-ui (:8080), hms-stub (:8800), ble-sim | Family Hub on the PC |
| `dev` / `hub2` (from `docker-compose.hub-cg.yml`) | the same hub pointed at Cure Global, plus hub 2: mosquitto-2, hub-core-2, vision-2, hub-ui-2 (:8091), ble-sim-2 | Two families' hubs on Cure Global |

Run several:
```powershell
docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.hub.yml --profile core --profile gps --profile dev up -d --build
```

The hub points at `hms-stub` by default (`HUB_BACKEND=hms`, Cure Home's behaviour).

### Two Family Hubs on Cure Global (Phase 3)

`docker-compose.hub-cg.yml` (an overlay; `docker-compose.hub.yml` itself is re-copied from Cure Home by the import
script) points the hub at the Cure Global API and adds a second hub stack:

| Hub | Family | Serial | UI | hub-core | vision | MQTT |
|---|---|---|---|---|---|---|
| 1 (`hub-core`, `vision`, `hub-ui`, `mosquitto`, `ble-sim`) | Perera (Colombo) | `CH-DEV-0001` | `HUB_UI_PORT` | `HUB_CORE_PORT` | `HUB_VISION_PORT` | `HUB_MQTT_PORT` |
| 2 (`hub-core-2`, `vision-2`, `hub-ui-2`, `mosquitto-2`, `ble-sim-2`) | Fernando (Kandy) | `CH-DEV-0002` | `HUB2_UI_PORT` (8091) | `HUB2_CORE_PORT` (8611) | `HUB2_VISION_PORT` (8711) | `HUB2_MQTT_PORT` / `HUB2_MQTT_WS_PORT` (1885 / 9012) |

```powershell
docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.hub.yml `
  -f infra/compose/docker-compose.hub-cg.yml --profile core --profile dev up -d --build
docker compose -f infra/compose/docker-compose.yml exec api python -m app.seed --reset     # provisions CH-DEV-0001/0002
```

- Both hub-cores run with `HUB_BACKEND=cure-global` and `HUB_DEV_AUTOPAIR=true`: as soon as a pairing code appears,
  the hub asks the API (`POST /api/v1/auth/dev/hub-owner`, APP_ENV=dev only) for the owner of the family its serial is
  provisioned for and claims the code — the Cure app's job in real life. The dev panel's "Pair" button does the same.
- Hub 2 has its own broker because hub-core's MQTT topics and client id are fixed; sharing one would mix the two
  homes' devices. It reuses hub 1's `.env` files (same dev secrets) with its own volumes.
- After `app.seed --reset` the hubs' old device identities are gone; with Cure Global, hub-core notices (401/409 on
  its device key) and pairs again by itself. With HMS, use the dev panel's "Restart pairing".
- The admin console's hub fleet (`GET /api/v1/admin/hubs`) also lists the generated families' simulated hubs, with 30
  days of heartbeats (some offline, varied firmware and sync lag).

## 4. Everyday commands

```powershell
docker compose -f infra/compose/docker-compose.yml ps
docker compose -f infra/compose/docker-compose.yml logs -f api worker
docker compose -f infra/compose/docker-compose.yml exec api alembic upgrade head
docker compose -f infra/compose/docker-compose.yml exec api pytest -q
docker compose -f infra/compose/docker-compose.yml down            # keep data
docker compose -f infra/compose/docker-compose.yml down -v         # wipe data (Postgres, MinIO, Traccar)
```

Fast inner loop without containers for the code you're editing:
```powershell
cd services\api; uv sync; uv run uvicorn app.main:app --reload --port 8000     # DB still in Docker (localhost:5433)
pnpm install                                                                    # once, from the repo root
pnpm --dir apps\admin-web dev                                                  # http://localhost:5280 (Vite, proxies /api to :8000)
pnpm --dir apps\doctor-web dev                                                 # http://localhost:5281
pnpm --dir apps\hub-ui dev                                                     # http://localhost:5173 (after import)
.\scripts\kiosk.ps1 -Dev                                                       # hub in a 1280×800 Chrome app window
```

## 5. Simulators

| Need | How |
|---|---|
| BLE readings for the hub | `docker compose ... exec ble-sim python -m ble_sim scenario normal_day --speed 20` (Cure Home scenarios). New scenarios (infant weighing, elder morning, pregnancy BP) arrive in Phase 3 |
| Real BLE on Windows | Cure Home's native Bluetooth bridge (`os/windows/ble-bridge.ps1`) |
| GPS | `gps-sim` replays a walk that leaves the "home" geofence and presses SOS (`docker compose ... --profile gps run --rm gps-sim --scenario wander`) |
| Phone as tracker | Traccar Client app on the Android phone → `http://localhost:5055` through `adb reverse tcp:5055 tcp:5055` |
| SMS / OTP | Dev SMS adapter writes to the API log and Mailpit (`SMS_PROVIDER=console`) |
| Push | Expo push in dev client builds (needs FCM credentials); otherwise check the notification table in the DB |

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Port already in use | Change the host port in `infra/compose/.env` (`API_PORT`, `PG_PORT`, …). A Cure Home stack on the same PC holds the hub's ports: set `HUB_UI_PORT`, `HUB_CORE_PORT`, `HUB_VISION_PORT`, `HUB_MQTT_PORT`, `HUB_MQTT_WS_PORT` (and open the hub on `HUB_UI_PORT`; `kiosk.ps1` assumes 8080) |
| `exec format error` / `\r` errors in entrypoints | Scripts got CRLF line endings: `git config core.autocrlf false` then re-checkout; `.gitattributes` forces LF for `*.sh` |
| Containers slow or OOM | Raise WSL memory; stop the `dev` (hub) profile when not needed (vision uses ~1.5 GB) |
| The phone can't reach the API | `adb reverse tcp:8000 tcp:8000`, or use the PC's LAN IP and allow port 8000 in Windows Firewall for Private networks |
| Postgres schema out of date | `docker compose ... exec api alembic upgrade head` |
