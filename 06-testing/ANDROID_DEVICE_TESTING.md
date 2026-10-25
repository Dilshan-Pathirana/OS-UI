# Testing on the dedicated Android phone

*v0.1 · 22 Oct 2026 · The mobile app is an Expo dev-client app (from the patient app: Expo SDK 57, React Native 0.86, new architecture), so Expo Go can't run it. You install a development build once, then load JavaScript from Metro on the PC.*

## 1. Prepare the phone (once)

1. **Start clean:** factory reset the phone. Sign in with a **test Google account**, not a personal one. Update Android and Google Play services.
2. **Turn on developer mode:** Settings → About phone → tap *Build number* 7 times. Then in Developer options:
   - turn on **USB debugging**
   - turn on **Stay awake** while charging
   - optional: turn on *Show taps* for recordings
3. **Health Connect:**
   - Android 14+: it is built in (Settings → Security & privacy → Privacy → Health Connect).
   - Android 9–13: install it from the Play Store.
   - Add test data with Google's **Health Connect Toolbox**, or by writing records from Samsung Health or Google Health.
4. **Bluetooth:**
   - Install **nRF Connect for Mobile**. It inspects real devices, and its *Advertiser* and *GATT server* features can impersonate a scale or a BP cuff when no hardware is around.
   - Keep the OKOK "Yoda1" scale nearby. It broadcasts only.
5. **Battery:** set the app to *Unrestricted* (Settings → Apps → Cure Global → Battery). Background Health Connect sync and location need this.
6. **Location (R2):**
   - Install the **Traccar Client** app to test GPS against the Traccar container.
   - For fixed test routes, pick a mock-location app under Developer options → *Select mock location app*.

## 2. Prepare the PC (once)

- **Android SDK platform tools** (`adb`): install Android Studio (the user folder already has `.android` and `.gradle`), or run `winget install Google.PlatformTools`.
- **JDK 17:** Android Studio's bundled JBR works. Set `JAVA_HOME` if `expo run:android` complains.
- **Check the connection:** connect USB, accept the RSA prompt on the phone, then run `adb devices`. The phone should show as `device`.

## 3. Build and run

```powershell
cd C:\Users\MSI\Documents\GitHub\cure-global\apps\mobile
npm install                                   # the app keeps npm (see MIGRATION_PLAN.md §3)
$env:EXPO_PUBLIC_API_BASE_URL = "http://localhost:8000/api/v1"
adb reverse tcp:8000 tcp:8000                 # phone's localhost:8000 → PC's API
adb reverse tcp:8081 tcp:8081                 # Metro
npx expo run:android                          # first time: builds and installs the dev client (5–15 min)
# later sessions: only JavaScript changes
npx expo start --dev-client
```

**Cleartext HTTP.** Development builds allow plain HTTP to `localhost` and the LAN through `expo-build-properties` (`android.usesCleartextTraffic` for the development profile only). Release builds must use HTTPS.

**No USB cable?** Use the PC's LAN IP instead:
1. Set `EXPO_PUBLIC_API_BASE_URL=http://192.168.x.y:8000/api/v1`.
2. Allow ports 8000 and 8081 in Windows Firewall for Private networks.
3. Start Metro with `npx expo start --dev-client --lan`.

**Builds without a local SDK (EAS):** `eas build --profile development --platform android`. Install the APK from the link, then run `npx expo start --dev-client`.

**Push notifications:**
- Need FCM credentials (`google-services.json` as an EAS file variable, as in the patient app).
- Without them, the app registers no token and notifications show only inside the app.

## 4. What to test on the phone each iteration

| Area | Check |
|---|---|
| Onboarding | OTP arrives (dev: Mailpit / API log); create family; add dependants; invite an adult (a second test account on an emulator works) |
| Member switcher | Header always names the person; data changes with the switch; sensitive modules hidden without rights |
| Readings | Manual entry with implausible values ("? Check this reading"); OKOK scale; Health Connect import (no duplicates on re-import); offline: airplane mode → enter → back online → synced once |
| BLE GATT (R2) | BP / PLX / thermometer / glucose via real devices or nRF Connect's GATT server emulation |
| Modules | Growth chart neutral view; vaccines due; medicines per slot; documents upload (camera + picker) |
| Hub pairing | Scan the hub QR from the PC screen; App Link opens the app |
| Privacy | App lock after background; screenshots blocked; notifications show no health data |
| Performance | Cold start < 3 s on the test phone; scrolling charts smooth; memory steady over 10 min |

## 5. Automated flows (Maestro)

```powershell
# install once: https://maestro.mobile.dev (Windows is supported; WSL also works)
maestro test apps\mobile\.maestro\onboarding.yaml
maestro test apps\mobile\.maestro\
```

Flows live in `apps/mobile/.maestro/` (Phase 2). Each journey in `FEATURES_BY_ENTRY_POINT.md` §5 with mobile steps gets a flow.

## 6. Logs and bug reports

- `adb logcat *:S ReactNative:V ReactNativeJS:V` shows only the JS logs.
- React Native DevTools: press `j` in the Metro terminal.
- To record a bug: `adb shell screenrecord /sdcard/bug.mp4` (stop with Ctrl+C), then `adb pull /sdcard/bug.mp4`.
- Never put real patient data on the test phone. Use the seed family only.
