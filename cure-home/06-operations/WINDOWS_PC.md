# Cure Home in production on a Windows PC

A Windows PC with a USB webcam can run the hub in **production mode**, the same way the Surface Pro
does: `HUB_ENV=prod`, the real Cure HMS (`https://cure.lk/api/v1`), an encrypted store, the
Bluetooth allow-list, no simulators and no developer panel. `os/windows/run-hub.ps1` does
everything.

| Part | On Windows |
|---|---|
| mosquitto, hub-core, vision, hub-ui | Docker Desktop, compose project `cure-home-prod`, images `cure-home/<service>:prod` (apart from a development stack's `cure-home` / `:dev`) |
| Bluetooth | `ble-gateway` runs natively (`os/windows/ble-bridge.ps1`, bleak on WinRT): Docker Desktop has no Bluetooth. Log: `%LOCALAPPDATA%\CureHome\ble-bridge.log` (no readings, no addresses) |
| Camera + screen | Google Chrome in kiosk mode with its own profile (`%LOCALAPPDATA%\CureHome\kiosk-profile`), camera pre-allowed for `http://localhost:8080` only; the USB webcam is the camera. The 1280 × 800 canvas is scaled to the screen |

## Run it

Use a separate clone, not a development checkout (the script writes production values into the
`.env` files):

```powershell
git clone https://github.com/Dilshan-Pathirana/Healthcare-Device C:\CureHome
cd C:\CureHome
powershell -ExecutionPolicy Bypass -File .\os\windows\run-hub.ps1
```

It checks that the Cure hub API is reachable, starts Docker Desktop if needed, writes the `.env`
files (fresh secrets the first time; serial derived from this PC), stops a running development
stack (same ports — its data is kept), builds the images (first time 10–20 min), starts the
services, the Bluetooth bridge and the kiosk. Then pair: scan the QR on the hub in the Cure app
(Profile → Cure Home → Pair a Cure Home) or open it on cure.lk.

| Task | Command |
|---|---|
| A window instead of full screen | `.\os\windows\run-hub.ps1 -NoBuild -Window` |
| Restart without rebuilding | `.\os\windows\run-hub.ps1 -NoBuild` |
| Update | `git pull` then `.\os\windows\run-hub.ps1` |
| Stop (data, secrets, pairing kept) | `.\os\windows\run-hub.ps1 -Stop` |
| Start at every sign-in | `.\os\windows\run-hub.ps1 -NoBuild -InstallStartup` |
| Logs | `docker compose -p cure-home-prod logs -f hub-core` |
| Close the kiosk | Alt + F4 |
| Back to development | `.\os\windows\run-hub.ps1 -Stop`, then in the development checkout `docker compose -f infra/compose/docker-compose.yml --profile dev up -d` |

Plug the USB webcam in before starting (or reload the kiosk with Ctrl + R after plugging it in).
If the PC also has a built-in camera, choose the USB one once in the kiosk window: Chrome's
camera icon in the address bar is hidden in kiosk mode, so run with `-Window`, pick it under
Site settings → Camera, then restart without `-Window`.
