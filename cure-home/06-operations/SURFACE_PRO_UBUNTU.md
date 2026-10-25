# Cure Home on a Microsoft Surface Pro (Ubuntu) — production test hub

The Surface Pro stands in for the Raspberry Pi 5 hub during testing. It runs the same
containers as the Pi (the `device` profile: mosquitto, hub-core, vision, hub-ui, ble-gateway —
no simulators), talks to the real Cure HMS at `https://cure.lk/api/v1`, and shows the hub UI
full screen in Google Chrome inside `cage` on tty1. Everything is installed by
`os/ubuntu/install.sh`.

| | |
|---|---|
| OS | Ubuntu 24.04 LTS, amd64 (Desktop or Server). Intel Surface Pro 4 – 9. ARM models (Pro X, Pro 9 5G, Pro 11) are not supported. |
| Kernel | linux-surface (installed automatically on a Surface): touch screen, pen and cameras need it. |
| Browser | Google Chrome (amd64 `.deb`) — owns the camera, as on the Pi. |
| Camera | A USB (UVC) webcam is the reliable choice. Built-in Surface cameras need linux-surface + libcamera + PipeWire and work on some models only (see Camera). |
| Bluetooth | Built-in Bluetooth through BlueZ; the `ble-gateway` container reads it over the host D-Bus. |
| Display | The UI's 1280 × 800 canvas is scaled to the panel (2736 × 1824 → ×2.1375; 2880 × 1920 → ×2.25), letterboxed slightly on the 3:2 screen. |

## 1. Install Ubuntu

1. In the Surface UEFI (hold **Volume up** while pressing **Power**): leave Secure Boot **on**
   (the installer enrols the linux-surface key; you confirm it once on the next boot) and set
   USB as the first boot device.
2. Install Ubuntu 24.04 LTS from a USB stick. Choose **Encrypt the new Ubuntu installation**
   (LUKS) — the hub keeps encrypted face codes and an encrypted reading store, and full-disk
   encryption protects the keys in the `.env` files too.
3. Connect to Wi-Fi and make the connection available to all users
   (Settings → Wi-Fi → the network → Security: store the password **for all users**), so it
   still connects when the kiosk replaces the desktop.

## 2. Install the hub

The repository is private. Create a **fine-grained personal access token** on GitHub
(Settings → Developer settings → Fine-grained tokens: repository *Healthcare-Device* only,
permission *Contents: Read-only*) and use it as the password when git asks. Git keeps it for
`update.sh` (`credential.helper store`, readable by root only).

```bash
sudo apt-get install -y git
sudo git config --global credential.helper store
sudo git clone https://github.com/Dilshan-Pathirana/Healthcare-Device /opt/cure-home   # user: your GitHub name, password: the token
sudo /opt/cure-home/os/ubuntu/install.sh --place Kandy --lat 7.2906 --lon 80.6337
sudo reboot
```

The installer (safe to run again — secrets, serial and data are kept):

- first checks that the Surface reaches the Cure hub API over https (`$HMS_URL/hub/auth/challenge`
  answers 405) and stops if not — a production hub must pair and sync with the real server.
  hub-core also refuses to start with `HUB_ENV=prod` unless `HMS_BASE_URL` is an `https://` Cure
  HMS (never the `hms-stub`);
- installs Docker Engine, Google Chrome, `cage`, BlueZ, Noto fonts (Sinhala, Tamil) and, on a
  Surface, the linux-surface kernel (`--no-surface-kernel` skips it);
- writes every `.env` with fresh secrets and production values (`scripts/init_env.py --prod`):
  `HUB_ENV=prod`, `HMS_BASE_URL=https://cure.lk/api/v1`, `PUBLIC_APP_URL=https://cure.lk`, a
  hub serial derived from the machine (`CH-…`, printed at the end), BLE allow-list on;
- builds the images on the Surface (first build ≈ 15 – 25 min) — or pulls the CI images with
  `--images ghcr` (see Updates);
- installs `cure-stack.service` (the containers) and `cure-kiosk.service` (cage + Chrome on
  tty1, user `cure-kiosk`, Chrome policy `/etc/opt/chrome/policies/managed/cure.json`:
  localhost only, camera allowed for the hub only), replaces the GNOME login screen with the
  kiosk, never sleeps, ignores the Type Cover "lid", sets `Asia/Colombo`, and turns on `ufw`
  (deny inbound; SSH kept if it is running).

With Secure Boot on, the first reboot shows a blue **MOK management** screen: choose
**Enroll MOK → Continue → Yes**, type the password `surface`, then **Reboot**.

## 3. Pair it with a Cure account

1. After the reboot the hub shows the Cure boot ring, then **Pair this hub** with a QR code
   and a 6-character code.
2. The household owner scans the QR with the **Cure app** (Profile → Cure Home → Pair a Cure
   Home), or opens the link on their phone and signs in on **cure.lk**, or types the code
   there. The hub finishes pairing by itself within a few seconds.
3. Add family members and their photos (Profile → Family; Profile → Profile photo, with
   **Use on Cure Home** on). New photos reach the hub within 15 minutes; the hub then asks each
   person to confirm on the screen before it recognises them.

## 4. Bluetooth devices

The gateway only accepts the kit's own devices. Edit
`/opt/cure-home/services/ble-gateway/devices.json` (copied from `devices.example.json`) with
each device's Bluetooth address, then `sudo systemctl restart cure-stack`. To find addresses:
`bluetoothctl scan le` while the device is measuring. For a bench test with a single scale,
`install.sh --any-scale` accepts any OKOK scale nearby (not for real homes: a neighbour's scale
would be heard too).

## 5. Camera

- **USB webcam (recommended):** plug it in, mount it at the top centre of the screen at eye
  height. Chrome uses it directly; nothing to configure.
- **Built-in camera:** Surface cameras are MIPI sensors behind an Intel IPU. With
  linux-surface, Pro 4 – 7 (IPU3) can work through libcamera + PipeWire; Pro 8/9 (IPU6) support
  is partial. To try: `sudo apt-get install -y libcamera-tools pipewire-libcamera`, check
  `cam --list` shows the front camera, set `CURE_PIPEWIRE_CAMERA=1` in
  `/etc/cure-home/kiosk.env`, then `sudo systemctl restart cure-kiosk`. If the hub shows no
  camera, set it back to `0` and use a USB webcam.

Frames never leave the Surface: the browser tracks faces locally and sends crops only to the
`vision` container on `127.0.0.1` (CLAUDE.md rule 1).

## 6. Day-to-day

| Task | Command |
|---|---|
| Status | `systemctl status cure-stack cure-kiosk` · `sudo docker compose -f /opt/cure-home/infra/compose/docker-compose.yml --profile device ps` |
| Logs (no PHI is logged) | `sudo docker compose -f /opt/cure-home/infra/compose/docker-compose.yml --profile device logs -f hub-core` · `journalctl -u cure-kiosk -f` |
| Restart | `sudo systemctl restart cure-stack cure-kiosk` |
| Update | `sudo /opt/cure-home/os/ubuntu/update.sh` (git pull, rebuild or pull images, restart; secrets and pairing kept) |
| Text console | **Ctrl + Alt + F2** (sign in as the admin user); **Ctrl + Alt + F1** back to the hub |
| Screen scale / rotation | `/etc/cure-home/kiosk.env` (`CURE_SCALE`, `CURE_CAGE_ARGS="-d -s -r"`) → `sudo systemctl restart cure-kiosk` |
| Back to the normal desktop | `sudo systemctl disable --now cure-kiosk && sudo systemctl enable --now gdm3` |
| Unpair | Cure app → Profile → Cure Home → Remove this hub (or Cure staff in HMS → Cure Home Devices). The hub forgets its tokens and face codes and shows the pairing screen again. |

**Updates from CI images instead of building on the Surface:** pushes to `main` publish
`ghcr.io/dilshan-pathirana/cure-home/<service>:latest` and `:<commit>`. Run
`install.sh --images ghcr` (or `--tag <commit>`). If the packages are private, first
`sudo docker login ghcr.io -u <github user>` with a personal access token that has
`read:packages`, or make the packages public in GitHub → Packages.

## 7. Before a real home

The test hub is production software on test hardware. Before it goes into a patient's home:
the Pi image (read-only root, A/B updates, TPM-sealed keys — ARCHITECTURE §12), a clinician
review of the Sinhala/Tamil medical wording, and the BLE devices listed by address.
