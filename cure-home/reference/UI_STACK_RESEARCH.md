# Reference: UI stack, Liquid Glass, Pi 5 performance and dev-environment research
> Research compiled 2026-10-21. Performance budgets are engineering targets to validate on a real Pi 5.

*Citations are inline as [n], with the source list at the end. Where I measured something myself, the text says so.*

## TL;DR
- **Libraries that ship in the app:** Motion 14.x (`motion`, imported from `motion/react`) for React state, layout and presence animation; anime.js 4.5 for choreographed sequences such as the boot, SVG line drawing and the greeting text. Framer Motion and Motion are now the same library [7][8].
- **Copy-paste sources (shadcn registries):** Bklit UI for charts (visx + d3 + motion), Cult UI, Aceternity, Componentry, and 21st.dev as a marketplace. Their code becomes part of the repo; nothing is "installed" at runtime.
- **Inspiration and paid assets:** HorizonX, and the three products that share the GetLayers name.
- **AI tools:** UI UX Pro Max (a Claude Code skill), the 21st MCP (formerly Magic), and Manus (a general agent, owned by Meta since December 2025).
- **Glass over live camera video:** do **not** use one CSS `backdrop-filter` per card over the video. Because the backdrop changes every frame, Chromium re-blurs every card on every frame [67]. Instead, render the camera and all glass "lenses" in **one WebGL pass** (blur at reduced resolution, refraction drawn from rounded-rectangle shapes), and keep the card text and charts in transparent DOM above it.
- **Boot:** the shortest path to an animated boot is a custom Plymouth theme whose last frame matches the web app's first paint, with Chromium running under `cage` (or labwc). Then anime.js continues the animation in the browser.
- **Dev on Windows:** run the UI in the **host browser** with `getUserMedia`. Docker Linux containers cannot see the webcam or Bluetooth without a custom WSL kernel plus usbipd [81][82][83][85]. Containers then run only the backend, the Python face-ID service, MQTT and simulators. A native Windows `bleak` bridge publishes real BLE readings to MQTT [89].

---

## 1. Tool audit

| Tool | What it is in 2026 | Type | License / price | React and install |
|---|---|---|---|---|
| **anime.js** (animejs.com) | General JS animation engine | Runtime library | MIT, free [5] | Framework-agnostic; use `createScope` inside `useEffect`. `npm i animejs` (v4.5.0) [6] |
| **Motion** (motion.dev) | React/JS animation library, formerly Framer Motion | Runtime library | MIT; Motion+ is a one-time paid add-on [11] | First-class React. `npm i motion` (v14.5.0) [6] |
| **Bklit UI** (bklit.com; ui.bklit.com redirects there) | Chart components on shadcn | Copy-paste source (needs visx/d3/motion) | Charts MIT; "Studio" is proprietary [12] | `npx shadcn@latest add @bklit/<chart>` [14] |
| **"GetLayers"** (three products share the name) | (a) getlayers.ai: prompt, template and 3D-scene library for AI coding, with MCP and a Figma plugin [16]; (b) getlayers.pro: Chrome extension that inspects a page and copies its CSS/Tailwind/assets, with an MCP [17]; (c) layers.to: design community showcase [18] | Inspiration / AI tool | (a) free layers plus paid plans with a commercial licence; (b) freemium | Not a React library |
| **Componentry** (componentry.fun redirects to componentry.dev) | Animated React components, many in WebGL, by Harsh Jadhav [20] | Copy-paste source | Open source, but the licence is not stated on the site; check the repo before shipping | `npx shadcn add @componentry/<name>` (Tailwind + Framer Motion) [20] |
| **Cult UI** (cult-ui.com) | shadcn-style registry; core components are open source, plus a separate Pro product [22][24] | Copy-paste source | MIT (per the repo) [24] | `pnpm dlx shadcn@latest add @cult-ui/<name>` (installs `motion` and `@base-ui/react`) [22] |
| **Aceternity UI** | More than 200 free components; Pro is $199 lifetime [26] | Copy-paste source | Free plus a paid licence | `npx shadcn@latest add @aceternity/<name>`, after adding the registry to `components.json` [27] |
| **HorizonX** (horizonx.so) | Subscription library: UI kits, templates, Figma files, shaders, browser tools that export code, MCP [29][30] | Inspiration and paid assets | $24.99, $39.99 or $99.99 per month; commercial licence included [29] | Some React/Tailwind |
| **UI UX Pro Max** | Claude Code skill, `nextlevelbuilder/ui-ux-pro-max-skill`. Offline Python search over 79 styles, 192 palettes, 74 font pairings, 25 chart types and 119 UX rules; generates `design-system/MASTER.md` [31] | AI tool (design time) | MIT [31] | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`, then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`; or `npm i -g ui-ux-pro-max-cli`. Avoid the older `uipro-cli` [31] |
| **21st.dev** | Marketplace of 12,000+ components, templates and themes; the 21st MCP (Magic MCP renamed); 21st AI [32][34][35] | Copy-paste source plus AI tool | Free browsing with 2 copies per day; Builder $6/mo; Builder+AI $15/mo; Team $7.50 per seat (all billed yearly) [32][33] | shadcn CLI or `npx @21st-dev/cli@latest init --client claude` [35] |
| **Manus** (manus.im) | General autonomous agent (research, web apps, slides, design). Meta acquired it in December 2025 (reportedly more than $2B) and keeps it as a standalone product [37][38] | AI tool | Credit plans from about $20/mo [39] | Not a library |

### Notes per tool

**anime.js v4.** v4 dropped the default `anime()` object and uses **named ES imports** [1]:

```ts
import { animate, createTimeline, stagger, svg, splitText, createScope, spring } from 'animejs';
animate('.dot', { y: [-8, 0], delay: stagger(60, { from: 'center' }), ease: 'outExpo' });
animate(svg.createDrawable('#cure-logo path'), { draw: ['0 0', '0 1'], duration: 1600, ease: 'inOutQuad' });
const tl = createTimeline({ defaults: { ease: 'outQuad', duration: 250 } });
```

Other v4 renames [1]:
- The animation target is the first argument, not a `targets` key.
- `easing: 'easeOutQuad'` becomes `ease: 'outQuad'`.
- `direction` becomes `reversed` / `alternate`.
- `endDelay` becomes `loopDelay`.
- `loop: 1` now means one repeat.
- `value` becomes `to`.
- Callbacks are `onBegin`, `onUpdate`, `onLoop`, `onRender` and `onComplete`.
- `.then()` returns a promise.

`svg.createDrawable` handles line drawing; `morphTo` and `createMotionPath` live in the same `svg` module [3]. Since 4.3 the library has added `createLayout` (layout transitions), `scrambleText`, auto-grid/3D stagger and a Three.js adapter (`animejs/adapters/three`). Version 4.4 changed transform order, and the third argument of function-based values changed from `total` to `targets` [4].

The package also exports subpaths such as `animejs/animation`, `/timeline`, `/svg`, `/text`, `/waapi` and `/layout` (read from `package.json`). Sizes I measured with esbuild (min+gzip): about 41 KB for every export, about 16 KB for `animate` + `createTimeline` + `stagger` + `svg`, and about 12 KB for `animate` alone. In React, wrap all anime.js work in `createScope({ root })` inside `useEffect` and return `scope.revert()` for cleanup [2].

**Motion = Framer Motion.** Framer Motion became the independent "Motion" in November 2024 [7]. To migrate, uninstall `framer-motion`, install `motion`, and import from `motion/react`. v12 brought no React breaking changes, and v13/v14 are minor [8]. `framer-motion@14.5.0` is still published at the same version as `motion@14.5.0` [6], so the two are interchangeable, but write `motion` going forward.

What you get: `layout` / `layoutId`, `AnimatePresence`, springs, gestures, and motion values (`useSpring`, `useTransform`). Sizes per the docs [9]:
- The full `motion` component is about 34 KB (my esbuild measurement with `AnimatePresence`: about 46 KB gzip).
- `m` + `LazyMotion` is about 5 KB initial.
- `domAnimation` adds about 15 KB and `domMax` about 25 KB.
- The mini `useAnimate` is about 2.3 KB.

`AnimateNumber`, `Ticker`, `Typewriter` and `ScrambleText` are **Motion+ (paid)** [10][11].

**Bklit UI.** Confirmed as a charts library (about 1.8k stars). It includes Area, Bar, Candlestick, Choropleth, Composed, Funnel, **Gauge**, Heatmap, Line, Profit/Loss Line, **Live Line**, Pie, Radar, **Ring**, Scatter and Sankey charts [12][13]. Live Line streams `{time, value}` data with smooth interpolation. Its dependencies are `@visx/*`, `d3-array` and `motion` [15], which makes it a good fit for heart-rate and SpO₂ traces. There is no sparkline component; strip a Line or Area chart down instead.

**Cult UI** components that suit this project [23][25]:
- **Dynamic Island**: an expanding pill for notifications, timers and status.
- **Rolling Number**
- **Onboarding** and **Wizard Expandable**
- **Halo Toast** and **Halo Notification**
- **Expandable**, **Family Drawer** and **Side Panel**
- **Texture Card**
- **Distorted Glass** and **Fluted Glass**
- **Timer**
- **Direction Aware Tabs**

**Aceternity** components that suit this project [28]:
- **Liquid Glass**
- **Multi Step Loader**
- **Text Generate Effect**, **Flip Words** and **Typewriter**
- **Card Spotlight** and **Glowing Effect**
- **Expandable Cards** and **Animated Modal**
- **Stateful Button**, **Signup Form** and **Timeline**
- **Webcam Pixel Grid**

Most background components (Aurora, Vortex, Sparkles, shaders) are too heavy for a Pi running continuously. Use them only during boot or on an idle screen.

**Componentry.** Relevant pieces are **Liquid Glass Carousel** (a WebGL lens), **Lens Clock**, **Magnetic Dock** and **Silk Aurora** [20][21]. These are WebGL-heavy, so treat them as idle-screen or boot candidates and profile each on the Pi.

**21st.dev.** Search it for patterns such as "Glass Calendar" (one of 266 components tagged glass), but audit each component's licence and cost [36]. The old Magic `/ui` trigger is now just natural language through the 21st MCP [35].

**Manus in a design workflow.** Use it outside the codebase: competitive research on smart-health hubs, mood boards and slides, and throwaway clickable prototypes to test flows with older adults. Do not use it to produce production code, because its output is not tied to your design system.

**Supplements not on the owner's list (all MIT):**
- **NumberFlow** (`@number-flow/react`, about 6 KB gzip measured), a free replacement for `AnimateNumber`.
- **Magic UI "Orbiting Circles"** as a reference for orbit geometry [108].
- **sonner** for toasts.
- **react-day-picker 10** (the base of the shadcn calendar).

## 2. Component picks per screen element

| Element | Pick | Notes |
|---|---|---|
| Boot animation | anime.js `svg.createDrawable` line draw of the logo, then `createTimeline` + `stagger` to reveal the orbit cards; Aceternity Multi Step Loader for service warm-up ("Camera ✓ Sensors ✓") | The first frame must match the Plymouth splash (§7) |
| Face-centred orbit | Custom component: face box (MediaPipe) → Motion `useSpring` x/y values per card. Use Magic UI Orbiting Circles only for the geometry | Do not spin the orbit continuously (reduced motion). Fixed angular slots with a gentle float |
| Glass cards | Custom WebGL glass layer (§6) with DOM content. Off-camera screens use the CSS recipe [48]. Aceternity Liquid Glass, liquid-glass-react, and Cult UI Distorted/Fluted Glass are references only | `liquid-glass-react` works only in Chromium (displacement is invisible in Safari and Firefox) [47]. Acceptable in a kiosk, but expensive |
| Gauges and rings | Bklit Gauge (BP, glucose ranges), Bklit Ring (goals, SpO₂) | Colour bands must be backed by text labels |
| Sparklines and area charts | Bklit Line/Area with axes hidden; Bklit Live Line for HR/SpO₂ | Pause Live Line when it is off-screen; keep at most about 500 points [15] |
| Number tickers | NumberFlow, or Cult UI Rolling Number; Motion+ AnimateNumber if you buy Motion+ | Animate the change only, not continuously |
| Greeting text | anime.js `splitText` + `stagger`; Aceternity Text Generate / Flip Words | Avoid scramble/encrypted effects for older adults because they hurt legibility |
| Weather card | Cult UI Texture Card or Aceternity Card Spotlight as the shell; icons animated with anime.js | Static glass is fine here |
| Calendar | shadcn Calendar (react-day-picker) restyled; 21st "Glass Calendar" as reference [36] | Large day cells (§5) |
| Reminders | Motion `AnimatePresence` + `layoutId`; Cult UI Expandable / Family Drawer; Aceternity Expandable Cards | One reminder expanded at a time |
| Toasts and alerts | Cult UI Dynamic Island (medication due, device connecting) plus Halo Toast, or sonner | Keep critical alerts on screen until dismissed; no auto-dismiss |
| Onboarding and registration | Cult UI Onboarding + Wizard Expandable; Aceternity Stateful Button; a Bklit Ring as the face-enrolment progress indicator | One question per screen, plain language |

## 3. Apple Liquid Glass and how it is recreated on the web

**Principles.** Apple announced Liquid Glass on 9 June 2025. It is translucent, "reflects and refracts its surroundings," and adapts between light and dark; it draws on visionOS depth [40]. The "Meet Liquid Glass" session [41] lists these properties:
- **Lensing.** It bends and concentrates light rather than scattering it like a blur.
- **Materialization.** Objects appear and disappear by modulating the lensing, not by fading.
- **Fluidity.** It morphs between controls with a gel-like flex.
- **Specular highlights.** Highlights respond to geometry and to device motion.
- **Adaptive shadows.** Shadows get darker over text and lighter over light backgrounds.
- **Adaptivity.** Small elements flip between light and dark; large ones do not.
- **Variants.** *Regular* (adaptive) and *clear* (more transparent, needs dimming). Never mix them, never put glass on glass, and use it only for the **navigation layer**.

The HIG adds two practical rules [43]:
- Use clear glass only over rich media.
- **Add a dark dimming layer of about 35% opacity when the content underneath is bright.**

**Concentricity** means radii and margins share a centre. Shapes are fixed, capsule (radius = half the height) or concentric (inner radius = parent radius minus padding) [42].

A live camera feed is exactly the kind of "media-rich background" the clear variant is designed for. So the camera screen should use clear glass with an adaptive dimming layer.

**Web techniques**, from cheapest to most expensive:
1. **Frosted glass.** `backdrop-filter: blur(12–30px) saturate(140–200%)`, a 1px border at about 0.28 alpha, and an inset top highlight [48].
2. **Feathered or graded blur.** Mask stacked layers; every layer is another composited pass [45].
3. **SVG refraction through backdrop-filter.** `backdrop-filter: url(#lens)` with `feDisplacementMap` (an `feImage` map plus a specular `feImage`) [44].
   - **Only Chromium renders it.** Safari and Firefox render nothing, and `@supports` gives false positives, so you need user-agent detection [45][48].
   - kube.io's demo showed judder even on fast Macs [46].
4. **WebGL shader refraction.** True lensing, with a real GPU cost. Cap it at 30fps and pause it off-screen [45].

`liquid-glass-react` exposes `displacementScale`, `blurAmount`, `saturation`, `aberrationIntensity`, `elasticity` and modes `standard`, `polar`, `prominent` and `shader` [47].

Rules of thumb from these sources:
- Never animate the blur radius; animate opacity instead [48][66].
- Have at most 3–4 glass layers per viewport [48].
- Reserve refraction for a single hero element [36].

## 4. visionOS / spatial principles translated to a 2D touch display

| visionOS principle | Cure Home translation |
|---|---|
| Glass windows over passthrough; avoid opaque windows [50][43] | The camera feed *is* the passthrough. Cards are glass, with no solid panels on the home screen |
| Centre the most important content; wide rather than tall [50] | The face sits in the centre and vitals go on a horizontal ellipse around it. Mount the display in landscape |
| Depth expresses hierarchy; "prefer subtle depth"; keep text flat [49] | Three z-levels at most, expressed with scale (1.0, 0.96, 0.92), shadow strength and dimming. No 3D-tilted text |
| Ornaments float slightly in front and overlap the window edge by about 20pt [50] | A bottom action dock (Measure, Reminders, Call family) that overlaps the bottom card row |
| Hover/gaze highlights show what is interactive; about 4pt gaps so highlights don't merge [50] | Touch: pressed state (scale 0.97, brighten) plus a persistent affordance (border or icon). Optional "attention": a card brightens subtly when the user leans toward it (face size grows). Never required |
| Dimming for focus; modals push the parent back and dim it [49][50] | A measurement or detail sheet dims the camera (about 35% [43]), scales the other cards to 0.96 and fades them |
| 60pt minimum targets [50] | Matches older-adult guidance (§5) |
| Concentric corners: outer = inner + padding [50][42] | Use design tokens: card radius 28, inner chip 28 − 12 = 16 |
| Heavier type on glass (Regular → Medium, Semibold → Bold); white vibrant text [50] | Use weight 500–700 on glass; never light weights |

A bonus that fits the brand: use the face position for **head-coupled parallax**. Shift each card layer by 2–8px based on its depth, a 2D stand-in for spatial depth. Turn it off under reduced motion.

## 5. Accessibility and older adults

**Contrast.** WCAG 2.2 requires 4.5:1 for body text and 3:1 for large text and UI parts. Axess Lab warns against blur of 20px or more and against relying on blur alone; use semi-opaque fills behind text [51]. Translucent surfaces have no fixed contrast ratio, so test against the worst-case backdrop; early Liquid Glass screens measured about 1.5:1 [48].

A camera backdrop is uncontrolled: picture a bright window behind the user. Sample the mean luminance of the blurred camera texture under each card (cheap at ⅛ resolution) and raise the tint and dim until the text passes. This is Apple's "adaptivity," done by hand.

**Reduced transparency and motion.**
- `prefers-reduced-transparency` works in Chromium 118/119 and later, but not in Safari or Firefox [52][53].
- A kiosk has no OS setting to honour, so add an in-app **"Clear view"** setting that switches to solid cards, plus a "Calm motion" setting. Default to the solid card and layer glass on top [48].
- Respect `prefers-reduced-motion` [51].

**Targets.**
- WCAG 2.5.8 (AA) requires at least 24×24 CSS px [54]; Android uses 48dp, about 9mm, with 8dp spacing [55]; visionOS uses 60pt [50].
- Leitão & Silva derived separate target-size and spacing patterns for older adults' taps and swipes [58].
- **Think in millimetres, not CSS pixels.** The Pi Touch Display 2 is 720×1280 at 5" and 7", and 1200×1920 at 10" [70]. A 7" panel is about 210 ppi, so at a device scale factor of 1, 48px is only about 5.8mm. Two fixes:
  - On 7", run Chromium with `--force-device-scale-factor=1.5`. 60 CSS px then becomes about 11mm.
  - Prefer the 10" panel at a device scale factor of about 2 (960×600 CSS px).
- Primary actions should be 11–14mm or larger.

**Type and language.**
- 18pt was preferred on tablets, 14pt is not a safe minimum, and very large type also slows reading [57]. In practice: body text 20–24 CSS px (at the scale factor above), vital numbers 48–72px, and units 18px or larger.
- NN/g: older users make more errors and blame themselves; let them control font size, put errors where they will be seen in plain language, and accept several input formats [56].

## 6. Performance on Raspberry Pi 5

**Hardware and stack:**
- VideoCore VII (V3D 7.1), about 800 MHz, conformant OpenGL ES 3.1 [59][60][61].
- Raspberry Pi OS Trixie (2 October 2025) ships Mesa 25.0.7 with Vulkan 1.3 [62][63].
- labwc has been the Wayland default on all models since October 2024 [64].
- Chromium and Google Chrome (now available for Arm Linux) have the same GPU features on the Pi. WebGL Aquarium ran at **30 fps with 5,000 fish** [65].
- There is no H.264 hardware video block; only HEVC decode [65].

**Why per-card blur over video is a trap:**
- Blur is a convolution whose cost grows with area and radius. A promoted, blurred layer is re-blurred every frame [66].
- In Chromium, any damage under a pixel-moving backdrop filter invalidates the whole blurred surface. Cached reuse happens only when the backdrop is unchanged [67].
- A 30fps camera behind N glass cards therefore costs N full backdrop blurs per frame.

Mobile-GPU practice is to **downsample, then use a separable or dual-filter blur**. Dual filtering gave up to a 14× speed-up at 1080p in ARM's example [68].

**Recommended architecture for the signature screen:**
1. Draw the `<video>` into **one WebGL2 canvas** at 50–66% of the backing resolution, upscaled with CSS.
2. Each frame, downsample the camera to ¼–⅛ resolution and run a dual-Kawase blur. The cost barely depends on the blur radius.
3. In the same pass, draw every card's "lens" as a rounded-rectangle SDF (signed distance field) that samples the blurred texture. Add an edge refraction offset from the SDF gradient, a rim specular highlight and an adaptive dim. Pass card rectangles in as uniforms; 12 or fewer is plenty. To "materialize" a card, animate the refraction strength [41].
4. Keep the cards themselves as **transparent DOM** (text and Bklit charts) moved only with `transform` and `opacity` through Motion.

The result is one blur for the whole screen regardless of card count, with true Liquid Glass lensing on WebGL that the Pi GPU supports.

**Budgets.** These are my engineering targets; validate them on the device.

| Item | Budget |
|---|---|
| Camera | 640×480 or 1280×720 at 30fps |
| WebGL canvas | One, at 30–60fps |
| CSS `backdrop-filter` | 3 or fewer elements, 16px or less, and **never over live video** |
| SVG displacement filters | None on the camera screen |
| Animated layers | About 12 or fewer; `will-change` only while animating (Motion manages this) |
| Chart data | Updated at 1 Hz or less; SVG charts with 200 or fewer points |
| `--enable-low-end-device-mode` | Avoid; it is suspected of reducing colour depth and causing banding on a Pi 5 [69] |

Check `chrome://gpu` (compositing, rasterization and WebGL2 should all be hardware-accelerated) and profile remotely with `--remote-debugging-port`.

## 7. Boot and kiosk on the Pi

**Silence the boot.**
- `/boot/firmware/config.txt`: `disable_splash=1` removes the rainbow screen [72].
- `/boot/firmware/cmdline.txt`, all on one line: change `console=tty1` to `console=tty3` and add `quiet splash loglevel=0 logo.nologo vt.global_cursor_default=0 plymouth.ignore-serial-consoles consoleblank=0` [74].
- Bootloader EEPROM (`rpi-eeprom-config --edit`): `DISABLE_HDMI=1` turns off the HDMI boot-diagnostics screen [73].
- Use a solid power supply. Rainbow or diagnostic screens can return after brown-outs [69].

**Animated splash, fastest path:**
1. Build a Plymouth *script* theme that cycles PNG frames of the logo. Install it with `sudo plymouth-set-default-theme -R cure` (`-R` rebuilds the initramfs). A static image alone is just a swap of `/usr/share/plymouth/themes/pix/splash.png` [74][75].
2. End on a frame identical to the web app's first paint: same background colour and logo position.
3. anime.js then picks up the animation (line draw, then orbit reveal) while the camera and MediaPipe warm up.
4. For speed, boot from NVMe and trim services found with `systemd-analyze blame`.

**Launching the kiosk.** Two options:
- **labwc**, the official Raspberry Pi tutorial: `~/.config/labwc/autostart` runs `chromium <url> --kiosk --noerrdialogs --disable-infobars --no-first-run --enable-features=OverlayScrollbar &` [71]. Add `--autoplay-policy=no-user-gesture-required` and `--force-device-scale-factor`, and grant the camera through the Chromium managed policy `VideoCaptureAllowedUrls`.
- **cage**, a wlroots Wayland kiosk that runs one maximised app, MIT-licensed, direct on KMS/DRM [76]. Run `cage -- chromium …` from a systemd unit on tty1. It has less desktop overhead and no stray UI, so prefer it for production.

**Alternative runtimes:**

| Runtime | Pros | Cons |
|---|---|---|
| **Chromium kiosk (recommended)** | Best CSS/WebGL support, including SVG backdrop filters | About 300–500 MB of RAM |
| **Electron** | Same engine, plus Node APIs (BLE/serial) and a pinned Chromium | Heavier; no rendering advantage |
| **Tauri** | Small | Uses WebKitGTK on Linux. DMABUF/compositing workarounds disable fast paths, WebGL can silently fall to a slow path [77], and SVG-in-backdrop refraction does not render in WebKit [45]. **Not suited to this UI** |
| **flutter-pi** | KMS without a compositor; 50–60 fps on a Pi 4 | Full rewrite; Pi 5 is not listed as supported [78] |
| **Qt/QML (eglfs)** | Mature, strong shaders | Licensing and skills mismatch |
| **Slint** | Very light | The royalty-free licence excludes embedded; that needs GPLv3 or a commercial licence [79]. Fewer effects |

## 8. Simulating the Pi on Windows with Docker Desktop

**arm64 images.** Docker Desktop runs and builds multi-platform images under QEMU by default (`docker buildx build --platform linux/amd64,linux/arm64`; the containerd store is the default). This is "much slower," especially for compute-heavy work, so cross-compile where possible [80]. Use QEMU to confirm images start and work, not to judge performance. There is no GPU in emulation. QEMU 9.0 added a Pi 4B board model [90]; full-system emulation does not help for UI performance.

**Webcam access from containers:**
- Containers live in Docker Desktop's VM and cannot see the host camera [82].
- The workaround is usbipd-win (`usbipd bind` / `attach --wsl`) [83], plus a **custom WSL kernel with `uvcvideo`** (community guides exist [84]), plus `--device /dev/video0`. It is fragile.
- Docker's own USB/IP feature requires the **Hyper-V backend** on Windows and does not promise webcam support [81].

**Practical alternatives for the camera:**
- **(a)** Run the UI in host Chrome with `getUserMedia`. `localhost` counts as a secure context.
- **(b)** Stream the host webcam into containers: `ffmpeg -f dshow -i video="<cam>" … -f rtsp` into MediaMTX [87]. MediaMTX serves RTSP, WebRTC and HLS (MIT licence) [86]. On the Pi, MediaMTX can use `source: rpiCamera` directly [88].

**Bluetooth.** It is not available in containers on Windows unless you also rebuild the WSL kernel with Bluetooth and the HCI USB driver and pass a USB dongle through [85]. Instead, run a **native Windows `bleak` bridge** (bleak supports Windows 11 and Linux BlueZ 5.55+) that publishes over MQTT [89], or a simulator that publishes the same topics. Model those topics on the standard GATT services: Heart Rate 0x180D, Blood Pressure 0x1810, Health Thermometer 0x1809, Glucose 0x1808, Weight Scale 0x181D, Pulse Oximeter 0x1822.

**Pi camera note.** CSI camera modules use libcamera and do not appear as USB/V4L2 webcams [91]. Either buy a UVC USB camera so `getUserMedia` works directly, or use MediaMTX `rpiCamera` and stream WebRTC to the page.

## 9. Face detection and recognition

| Option | Status | Fit |
|---|---|---|
| **MediaPipe Tasks Vision** (`@mediapipe/tasks-vision` 1.1.1, Apache-2.0, published October 2026) [6] | Actively maintained. **Face Detector** (BlazeFace short-range, 128×128 input, 6 keypoints; about 2.9 ms on a Pixel 6 CPU) [93]. **Face Landmarker** (478 landmarks, 52 blendshapes, transformation matrix; `detectForVideo`) [92] | **Use in the browser for 30 Hz positioning.** Self-host the WASM (about 13.5 MB, measured) and the models for offline use |
| **@vladmandic/human** 3.3.6 | Last published August 2025 [95]; WebGL/WASM/WebGPU backends; includes a face embedding (FaceRes) [94] | Possible all-in-browser recognition; check maintenance status before depending on it |
| **face-api.js** 0.22.2 | Last published March 2020 [6] | Avoid |
| **OpenCV YuNet + SFace** (Python) | On a Pi 4B: YuNet about 6.2 ms at 160×120, SFace about 69 ms at 150×150 [96]. A Pi 5 should be faster | **Use for identity** in a local service |
| **InsightFace** | Code is MIT, but **models are non-commercial**; contact them for a commercial licence [97] | Avoid for a commercial device unless licensed |

**Recommendation: a hybrid.**
- The browser owns the camera. It runs the MediaPipe Face Detector every frame or every other frame and smooths the box with a One-Euro filter. The box drives Motion springs that place the orbit; add hysteresis so the cards only move on real shifts. Use the Landmarker only if you need head pose for parallax.
- When identification is needed (wake-up or login), the browser sends a **cropped face** over WebSocket to a Python YuNet+SFace service. That service compares it against encrypted local embeddings.
- No frames leave the device; enrolment needs explicit consent.
- The design is identical on Windows (container) and on the Pi, and it never needs container webcam access.

## 10. Promo video tooling

- **Remotion** (`remotion` 4.0.x) renders **your real React components** (glass cards, Bklit charts) with deterministic mock data.
  - Licence: free for individuals, teams of 3 or fewer, and non-profits. Larger companies need a Company License: $25 per developer per month ("Creators"), or $0.01 per render ("Automators") with a $100/month minimum [98].
  - Rendering needs the GPU, enabled with `--gl`, for blur and WebGL [99].
- **HyperFrames** (HeyGen, Apache-2.0) renders HTML/CSS to MP4 through headless Chrome and FFmpeg. It is HTML-first and agent-friendly, has no render fees, needs Node 22+, and can port Remotion projects [101]. anime.js timelines can be seeked, so they should work with it; verify.
- **Motion Canvas** is a MIT-style generator-based TypeScript tool plus editor, aimed at vector explainers synced to voice-over [100]. Good for "how it works" segments.
- **Playwright** can record flows, but video defaults to the viewport scaled to fit 800×800; set `size` explicitly [102]. For hero footage, capture the real Pi screen (for example `wf-recorder` on cage or labwc) or render with Remotion.
- **AI b-roll**, as of July 2026 [103]:
  - Veo 3.1: 4–8s clips, native audio, SynthID watermark.
  - Kling 3.0: commercial use only on paid plans.
  - Runway Gen-4.5: its terms allow training on your inputs and outputs; C2PA labels.
  - Sora's app was discontinued in April 2026.
  - Higgsfield aggregates Kling, Veo, Seedance and others; paid tiers allow commercial use [104]. It is already connected to this workspace as an MCP.
- **Healthcare caveats:**
  - Do not present AI "patients," "doctors" or readings as real.
  - The EU AI Act Article 50 deepfake labelling has applied since 2 August 2026 to content reaching the EU, with a human-visible label; health claims raise the bar [105].
  - Show real UI captures for any functional claim.
  - Avoid implying diagnostic accuracy or regulatory clearance. Sri Lanka's NMRA regulates medical devices [107], and the US FTC requires competent and reliable evidence for health claims [106].
  - Run scripts through the `cure-compliance-auditor` skill.

---

## Recommended stack for Cure Home UI

- **Core:** React 19 + TypeScript + Vite, Tailwind v4, and shadcn (registry-based, so all borrowed source lives in the repo).
- **Motion roles:**
  - **Motion** (`motion/react`): layout, presence, springs, and face-following motion values. Use `LazyMotion` with `m` on secondary screens.
  - **anime.js v4**: the boot timeline, SVG logo drawing, greeting `splitText`, and staggered reveals.
- **Glass:**
  - Camera screen: a custom WebGL2 "camera + lens" renderer (one blur, SDF refraction, adaptive dim) under transparent DOM cards.
  - Other screens: the CSS frosted recipe.
  - `liquid-glass-react` or SVG displacement only for a single static hero element.
- **Data visualisation:** Bklit (Gauge, Ring, Area/Line, Live Line) and NumberFlow (or Cult UI Rolling Number).
- **Components:**
  - Cult UI: Dynamic Island, Onboarding, Wizard Expandable, Halo Toast, Expandable, Texture Card.
  - Aceternity: Multi Step Loader, Text Generate, Flip Words, Stateful Button, Card Spotlight.
  - shadcn: Calendar, Dialog, Sheet.
- **Vision:** MediaPipe Tasks Vision in the browser; Python YuNet+SFace for identity.
- **Messaging:** MQTT (Mosquitto with WebSockets) for sensor data, and a FastAPI or Node API.
- **Design tooling:** UI UX Pro Max to generate and enforce `design-system/MASTER.md` (tokens: concentric radii, mm-based targets, contrast rules); 21st MCP for component discovery; HorizonX and getlayers.ai for inspiration only.
- **Device:** Raspberry Pi OS Trixie, Chromium under **cage**, a Plymouth script splash, the 10" Touch Display 2 at a device scale factor of about 2, and a UVC USB camera (or MediaMTX `rpiCamera`).
- **Accessibility built in:** in-app Clear view (solid cards) and Calm motion settings, adaptive scrim, at least 11–14mm targets, body text 20–24px, and weights 500–700 on glass.

## Recommended dev environment on Windows + Docker Desktop

1. **UI runs on the host.** Run Vite natively (or in WSL2 with the repo on the Linux filesystem for fast hot reload) and open it in Chrome at `--app=http://localhost:5173 --window-size=1280,800` (or the CSS size of your target panel). The real webcam comes through `getUserMedia`. Use DevTools CPU throttling (4–6×) and the Rendering tools (FPS meter, paint flashing, layer borders) as a rough proxy for the Pi, knowing the GPU cannot be emulated.
2. **`docker compose` holds everything else:**
   - `api`
   - `face-id` (Python + OpenCV YuNet/SFace; receives face crops over WebSocket)
   - `mqtt` (Mosquitto with WebSockets)
   - `vitals-sim` (publishes realistic BP, SpO₂, HR, temperature, glucose and weight streams on the GATT-modelled topics)
   - optional `mediamtx`, fed by a host-side `ffmpeg -f dshow` if a server-side vision experiment needs frames
3. **BLE:** run `ble-bridge` (Python + bleak) natively on Windows, publishing to the same MQTT topics as the simulator. On the Pi the same code runs in a container with `/run/dbus` mounted and host networking.
4. **Parity:** build images with `buildx` for `linux/amd64,linux/arm64` and smoke-test arm64 under QEMU. Then deploy the same compose file to a **real Pi 5 early and weekly** for performance work: `chrome://gpu` checks, remote DevTools over an SSH tunnel, and FPS measured on the actual panel.

---

## Sources
1. https://github.com/juliangarnier/anime/wiki/Migrating-from-v3-to-v4
2. https://animejs.com/documentation/getting-started/using-with-react
3. https://animejs.com/documentation/svg/createdrawable
4. https://github.com/juliangarnier/anime/releases
5. https://github.com/juliangarnier/anime
6. npm registry metadata, queried 2026-10-21: https://registry.npmjs.org/ (animejs, motion, framer-motion, @mediapipe/tasks-vision, @vladmandic/human, face-api.js, liquid-glass-react, remotion, @number-flow/react)
7. https://motion.dev/blog/framer-motion-is-now-independent-introducing-motion
8. https://motion.dev/docs/migration
9. https://motion.dev/docs/react-reduce-bundle-size
10. https://motion.dev/docs/react-animate-number
11. https://motion.dev/plus
12. https://github.com/bklit/bklit-ui
13. https://bklit.com/
14. https://bklit.com/docs/installation
15. https://bklit.com/docs/components/live-line-chart
16. https://getlayers.ai
17. https://chromewebstore.google.com/detail/heogcmhcpalnnkjhdjdiognbhhepfoac
18. https://postmake.io/tools/layers
19. https://moge.ai/product/getlayers
20. https://componentry.dev/ and https://componentry.dev/docs
21. https://21st.dev/@componentry/library/componentry.md
22. https://cult-ui.com/docs
23. https://www.cult-ui.com/llms.txt
24. https://github.com/nolly-studio/cult-ui
25. https://www.cult-ui.com/docs/components/dynamic-island
26. https://ui.aceternity.com/brand-facts
27. https://ui.aceternity.com/docs/cli
28. https://ui.aceternity.com/components
29. https://horizonx.so
30. https://www.producthunt.com/products/horizonx-2
31. https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
32. https://21st.dev
33. https://21st.dev/pricing
34. https://21st.dev/mcp
35. https://github.com/21st-dev/magic-mcp
36. https://21st.dev/blog/liquid-glass-react-components
37. https://www.techradar.com/pro/meta-buys-manus-for-usd2-billion-to-power-high-stakes-ai-agent-race
38. https://manus.im/
39. https://www.manus.im/blog/best-ai-app-builders
40. https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
41. https://developer.apple.com/videos/play/wwdc2025/219/
42. https://developer.apple.com/videos/play/wwdc2025/356/
43. https://developer.apple.com/design/human-interface-guidelines/materials
44. https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/
45. https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07
46. https://kube.io/blog/liquid-glass-css-svg/ (discussion: https://hn.svelte.dev/item/45174297)
47. https://github.com/rdev/liquid-glass-react
48. https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026
49. https://developer.apple.com/videos/play/wwdc2023/10072/
50. https://developer.apple.com/videos/play/wwdc2023/10076/
51. https://axesslab.com/?p=5111
52. https://caniuse.com/wf-prefers-reduced-transparency
53. https://developer.chrome.com/blog/css-prefers-reduced-transparency
54. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
55. https://support.google.com/accessibility/android/answer/7101858
56. https://www.nngroup.com/articles/usability-for-senior-citizens/
57. https://www.frontiersin.org/articles/10.3389/fpsyg.2022.931646/full
58. https://shura.shu.ac.uk/7446
59. https://www.igalia.com/2023/09/28/Raspberry-Pi-5-Announced.html
60. https://www.cnx-software.com/2023/09/28/raspberry-pi-5-sbc-broadcom-bcm2712-quad-core-cortex-a76-soc/
61. https://docs.mesa3d.org/drivers/v3d.html
62. https://fosdem.org/schedule/event/BMFQSE-raspberry-pi-gpu-drivers-from-bookworm-to-trixie
63. https://www.raspberrypi.com/news/trixie-the-new-version-of-raspberry-pi-os/
64. https://itsfoss.com/raspberry-pi-os-wayland/
65. https://www.cnx-software.com/2026/08/17/google-chrome-is-now-available-for-arm-linux-we-tested-it-on-a-raspberry-pi-5/
66. https://developer.chrome.com/blog/animated-blur/
67. https://grida.co/docs/wg/research/chromium/effect-optimizations
68. https://developer.arm.com/community/arm-community-blogs/b/mobile-graphics-and-gaming-blog/posts/post-processing-effects-on-mobile-optimization-and-alternatives
69. https://dietpi.com/forum/t/raspberry-pi-5-banding-dithering-on-images-in-chromium-kiosk/20012 and https://dietpi.com/forum/t/raspberry-pi-5-boot-splash-screen-pink-white-returns-after-abrupt-power-cycles-despite-disable-splash-1/25298
70. https://www.raspberrypi.com/documentation/accessories/touch-display-2.html
71. https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/
72. https://www.raspberrypi.com/documentation/computers/config_txt.html
73. https://github.com/raspberrypi/documentation/pull/3913
74. https://scribles.net/customizing-boot-up-screen-on-raspberry-pi/
75. https://www.tomshardware.com/uk/how-to/custom-raspberry-pi-splash-screen
76. https://github.com/cage-kiosk/cage
77. https://v2.tauri.app/develop/debug/linux-graphics/
78. https://github.com/ardera/flutter-pi
79. https://github.com/slint-ui/slint
80. https://docs.docker.com/build/building/multi-platform/
81. https://docs.docker.com/desktop/features/usbip/
82. https://forums.docker.com/t/videocapture-doesn-t-work-in-docker-container/140817
83. https://learn.microsoft.com/en-us/windows/wsl/connect-usb
84. https://github.com/randomwons/WSL2-USB-Camera
85. https://docs.espressif.com/projects/esp-matter/en/latest/esp32/using_chip_tool.html
86. https://github.com/bluenviron/mediamtx
87. https://mediamtx.org/docs/publish/generic-webcams
88. https://mediamtx.org/docs/static-sources/raspberry-pi-cameras
89. https://github.com/hbldh/bleak
90. https://alternativeto.net/news/2024/4/qemu-9-0-release-with-loongarch-kvm-acceleration-and-raspberry-pi-4-support
91. https://community.hailo.ai/t/standard-camera-module-3-problem-no-available-usb-cameras-found-but-libcamera-hello-is-working-raspberry-pi-5/8659
92. https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
93. https://developers.google.com/edge/mediapipe/solutions/vision/face_detector
94. https://github.com/vladmandic/human
95. https://cdn.jsdelivr.net/npm/@vladmandic/human@3.3.6/CHANGELOG.md
96. https://github.com/opencv/opencv_zoo/blob/main/benchmark/README.md
97. https://github.com/deepinsight/insightface
98. https://www.remotion.dev/docs/license-pricing-compliance/faq
99. https://www.remotion.dev/docs/gpu
100. https://motioncanvas.io/docs
101. https://themenonlab.blog/blog/heygen-hyperframes-video-as-code
102. https://playwright.dev/docs/videos
103. https://provimedia.de/en/blog/ai-video-tools-2026
104. https://pasqualepillitteri.it/en/news/677/higgsfield-ai-video-guide
105. https://www.lewissilkin.com/insights/2026/07/31/the-new-ai-labelling-rules-for-deployers-in-the-advertising-supply-chain
106. https://www.cov.com/en/news-and-insights/insights/2023/01/ftc-issues-new-guidance-on-health-related-claims-to-replace-the-dietary-supplements-advertising-guide
107. https://nmra.gov.lk/pages/medical-devices
108. https://magicui.design/docs/components/orbiting-circles

**Things still to verify:**
- Componentry's licence.
- Prices for Cult UI Pro and GetLayers.
- Whether flutter-pi supports the Pi 5.
- Human's maintenance status.
- On-device Pi 5 FPS for MediaPipe and the WebGL glass pass.

The performance budgets in §6 are engineering targets, not published benchmarks. The bundle sizes marked "measured" come from my own esbuild run on 2026-10-21.
