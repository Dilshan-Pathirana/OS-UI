# Cure Home — Device UI/UX Design Guide

*v0.1 · 2026-10-21 · Generated from the Cure Home design system (the "Cure Home Design System" artifact in Dilshan's Claude account, which Claude Design reads; source files mirrored in `design-system/`). Edit the design system, then regenerate this file with `design-system/gen_guide.py`.*

## Using this with Claude Design and Claude Code
- **Claude Design:** choose the **Cure Home** design system when starting a design. Ask for screens by name from *Screens & flows* (e.g. "Orbit View for Thaththa in Tamil, day theme, a weight reading arriving").
- **Claude Code (`apps/hub-ui`):** export `design-system/project/tokens.json` to CSS variables / Tailwind v4 `@theme`, keeping the token names. Rebuild the components below in React + TypeScript with Motion and anime.js; the design-system bundle is a visual reference, not production code.
- **Canvas:** 1280 × 800 CSS px at device scale 1.5 on the 10.1" panel.

## Foundations


Cure Home is a family health hub: a 10-inch touch screen with a camera that recognises each family member, shows their health readings around their own face, and gets every reading to their Cure doctor. Design for a living room at 6:45 in the morning: calm, legible from a metre away, honest about every number, and private by default. This system is dark-first (`night` theme) because the hub lives on a sideboard all day; `day` is the bright-room variant.

### Principles

1. **Calm by default.** Ambient first, data on approach. Nothing blinks, nothing scolds. One motion moment per screen.
2. **The face is the centre.** On the member screen (Orbit View) the person's own face sits in the middle; everything else orbits it. Never cover the face.
3. **Honest numbers.** Every reading shows its value, unit, age and source ("Just now · Cure Scale"). Never "LIVE", never a fake waveform, never a colour without a word.
4. **Legible glass.** Glass is a material for grouping, not decoration. Text sits on a fill strong enough to pass contrast over the worst backdrop; when in doubt use `glass-fill-strong` or the solid `card-solid`.
5. **Your face, your data.** Only the identified member's data is shown. The camera state is always visible.
6. **Three languages, one layout.** Every screen works in Sinhala, Tamil and English without truncation.

### Device and canvas

- Design on a **1280 × 800 CSS px canvas**: the 10.1" Touch Display 2 (1920 × 1200 landscape) at device scale factor 1.5. One CSS px ≈ 0.17 mm.
- Minimum touch target **64 px (≈ 11 mm)**; primary actions **80 px**. Gaps between targets ≥ `space-3`.
- Viewing distance 0.5–2 m. Body copy never below `body` (20 px); meta text never below `meta` (16 px).
- Landscape only. Safe margin `space-6` (32 px) from every edge; status bar and dock sit inside it.

### Colour

- Paint the screen with `canvas` and let the slow aurora (`aurora-blue`, `aurora-teal`, `aurora-lime`) drift behind everything. Never put text directly on the aurora; put it on glass.
- Glass surfaces: `glass-fill` for cards, `glass-fill-strong` for sheets and anything holding long text, `card-solid` in Clear view. Edge with `glass-edge`; top highlight `glass-specular`.
- Text: `text` for values and headings, `text-2` for supporting copy, `text-3` for meta (age, source). All three pass 4.5:1 on `glass-fill` over `canvas` in both themes.
- Brand: `cure-blue` is the identity colour (logo cross, focus of the brand moments, boot ring end). For filled buttons use `action` with `on-action` text; `cure-blue` itself only passes 3:1 on white, so use it for large text, icons and fills, not small text in `day`.
- `cure-green` and `cure-lime` come from the logo's crescent. Use `cure-green` for confirmations (taken, saved, recognised); `cure-lime` only as a thin accent (boot ring start, orbit marker), never for text in `day`.
- **Vital identity colours** say *which* vital a card is, not how it reads: `vital-weight` violet, `vital-bp` emerald, `vital-sugar` amber, `vital-pulse` red, `vital-spo2` sky, `vital-temp` orange. Use them for the card's icon dot, sparkline and connector line only.
- **Status colours** say how a reading compares to the doctor's target: `status-good`, `status-watch`, `status-attention`, `status-unknown`, each with its `-bg`. Always pair with the symbol and words (● Within your target, ▲ Above your target / ▲ Below your target, ! Talk to your doctor, ? Check this reading). Never show status without a clinician-set target; without one, show the trend only. `! Talk to your doctor` appears only when the clinician configured that level in HMS; it is fixed text and never an alarm.
- Focus: `focus-ring`, 3 px solid, 3 px offset, on every focusable control.

### Type

- `display` (Sora) for the clock, greeting, vital values and titles. Use light weights (200–300) only at 64 px and above; on glass use 500–600.
- `ui` (Manrope) for everything you read: labels, body, buttons, meta. Weight 600–800 on glass.
- `si` (Noto Sans Sinhala) and `ta` (Noto Sans Tamil) are part of every stack; when the member's language is Sinhala or Tamil, use the `si-*` / `ta-*` styles (taller line heights for the scripts' vowel signs).
- `mono` (JetBrains Mono) only for small uppercase eyebrows in marketing and for data tables in clinician views, never for vital values.
- `serif-accent` (Instrument Serif Italic) is for marketing films and print only. Not on the device.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`). Units are set smaller than the value (`unit` style) with a thin space.

### Space, shape, depth

- Spacing steps: `space-1` 4 → `space-9` 96. Vital numbers are never below 48 px (`value`). Card padding `space-4`; between cards `space-4`; sheet padding `space-6`.
- **Concentric corners**: inner radius = outer radius − padding. `radius-panel` 36 → content inside at `space-3` uses `radius-card`… Card 28 with 12 padding → chips and inner tiles at `radius-inner` 16. Pills and avatars use `radius-pill`.
- Depth has three planes, never more: **z0** canvas + face, **z1** orbit cards and dock (`shadow-card`), **z2** sheets and dialogs (`shadow-float`, background dimmed with `scrim` and cards scaled to 0.96). Never stack glass on glass on z2.

### Iconography

- Use **Lucide** (the same family as the Cure patient app: `lucide-react`), 2 px stroke, 24 px in cards, 32 px in buttons and the dock. Icons always have a text label next to them on the device.
- Vital icons: weight `Scale`, blood pressure `Gauge`, glucose `Droplet`, heart rate `HeartPulse`, SpO₂ `Activity`, temperature `Thermometer`, medicines `Pill`, visits `CalendarClock`, family `Users`, reminders `Bell`, weather `CloudSun`, camera `Camera` / `CameraOff`, privacy `ShieldCheck`.
- Do not use emoji anywhere in the device UI.
- The Cure logo (`assets/Logos/cure-logo.png`) appears only on the boot screen, the About screen and marketing. It is a full-colour mark with dark-blue lettering: place it on a white disc (`brand-disc`) on dark grounds, never directly on `canvas`.

### Content and voice

- Speak like a kind nurse: short, plain, second person. "Sit back and relax your arm." not "Ensure correct posture."
- Greet by the name the family uses ("Amma", "Thaththa"), in the member's language: "ආයුබෝවන්, අම්මා" / "வணக்கம், அம்மா" / "Good morning, Amma".
- Status words are fixed: **Within your target**, **Above your target**, **Below your target**, **Check this reading**. Never "high", "abnormal", "danger", "hypertension".
- Every reading line ends with age and source: "Just now · Cure Scale", "Yesterday 8:10 PM · BP cuff", "Fasting · 6:50 AM".
- Counters, not limits: "1 of 2 today". A reading beyond the plan is saved as "Extra reading".
- Emergency copy is fixed and clinician-approved: "If you feel unwell, call 1990 (Suwa Seriya)." Show the number as text.
- Units: kg, mmHg, mg/dL, %, °C, bpm. Times in 12-hour with AM/PM in English; Sinhala and Tamil follow the patient app's formats.

### Motion (summary — full rules in the Motion section)

- Entrances `ease-out-expo` with `dur-slow`–`dur-hero`; cards joining the orbit `ease-out-back`, staggered 90–110 ms; sheets slide 50 px + fade over `dur-sheet`; exits 300 ms `ease-in`. All values are tokens (`duration`, `easing`).
- Motion for React (`motion/react`) drives layout, presence and the face-following springs; anime.js v4 drives choreographed timelines (boot, greeting text, line drawing, number tickers).
- Reduced motion ("Calm motion" setting or `prefers-reduced-motion`): no orbit drift, no parallax, cross-fades only, tickers jump to the final value.

### Glass (summary — full rules in the Glass & depth section)

- Over live video, draw glass in **one WebGL pass** (blurred camera texture + rounded-rect lenses) and keep text in transparent DOM above it. Never put CSS `backdrop-filter` over the video.
- Elsewhere, CSS glass: `glass-fill` + `blur-glass` (≤ 16 px on the Pi) + `glass-edge` + `glass-specular`, at most three blurred surfaces per screen.
- Clear view (accessibility setting) swaps every glass surface for `card-solid` with `glass-edge` borders.

## Orbit View

The member screen and the product's signature: the identified person's face in the centre, their readings gathered around it.

### Geometry (1280 × 800 canvas)

| Element | Spec |
|---|---|
| Face orb | 320 px circle, centre (640, 412). Shows only a circular crop of the face (never the body). Ring: 4 px track in `glass-edge`, progress arc in `cure-blue` while identifying, `cure-green` when recognised. |
| Inner orbit | Ellipse rx 236, ry 214, 1.2 px `orbit-line`. |
| Outer orbit | Ellipse rx 340, ry 280, 1 px `orbit-line`, dashed 2/7. Two or three 6 px orbit markers travel on it (`cure-lime`, `aurora-blue`), 0.8°/s. |
| Slots | Six `VitalCard`s at 260 × 168. Left column: top and bottom cards at x = 72, the middle card 40 px further out at x = 32; right column: x = 948, middle x = 988. Rows at y = 120, 316, 512. Order: left = weight, blood pressure, glucose; right = heart rate, SpO₂, temperature. Members with fewer vitals keep empty slots empty (no stretching). |
| Connectors | Quadratic curve from each card's inner edge to the face rim, 1.4 px dashed 5/5 in the card's `vital-*` colour at 55 % opacity, dash phase flowing −20 px per 1.2 s; a 4 px hotspot dot on the rim. Dim to 35 % when the reading is older than 7 days. |
| Greeting | Centred, top 48: greeting in `greeting` (or `si-greeting` / `ta-greeting`), subtitle in `body` `text-2` ("Good morning, Amma · Wednesday 21 October"). |
| Status bar | Top 32 (`space-6`), inset `space-6`: time left; weather and the camera indicator ("● Camera on device only") right, `meta` style. |
| Dock | Bottom 32 (`space-6`), centred row of `DockPill`s (64 px tall): Medicines, Visit, Family, Reminders, Calendar. Max five. |

### Following the face
- Track the face box in the browser (MediaPipe Face Detector) and smooth it (One-Euro filter).
- The orb and the whole orbit follow the face with a spring (stiffness 120, damping 20), clamped to ±60 px horizontally and ±40 px vertically; ignore moves under 12 px (hysteresis).
- Head-coupled parallax: z1 cards shift 2–8 px opposite to the head offset. Off in Calm motion.
- If the face leaves for > 1.5 s the orb shows the member's avatar; after 60 s the screen returns to Ambient.

### States
| State | What changes |
|---|---|
| Identifying | Orb ring progress arc 0 → 100 % over the match; landmark dots allowed during enrolment only. |
| Recognised | Ring turns `cure-green`, a 44 px check badge pops at 4:30 o'clock, greeting fades in. |
| Reading arrives | The card scales to 1.06 with `ease-out-back`, value ticks to the new number, meta becomes "Just now · <device>", a `ReadingIsland` shows "✓ Saved · 1 of 2 today" for 3 s, sparkline gains its end dot. |
| Focus (sheet open) | Cards fade to 16 % and the orb moves up 150 px at 62 % scale; the sheet takes z2. |
| Discreet mode | Values show "•••" until the member taps the card. |
| Mirror off | The orb shows the avatar instead of the face crop; everything else is the same. |

### Rules
- Never cover the face orb with a card, toast or sheet in Orbit View; sheets start below the orb's lower rim or the orb moves up first.
- Never show another member's data while one member is identified.
- Never rotate the cards around the face continuously; markers drift, cards stay in their slots.

## Glass & depth

Cure Home mixes three ideas: glassmorphism (frosted surfaces), Liquid Glass (lensing, specular light, materialising) and spatial UI (depth planes and dimming). This section turns them into rules that hold up on a Raspberry Pi 5 and for older eyes.

### Materials

| Material | Where | Recipe |
|---|---|---|
| **Lens glass** | Over the live camera (Orbit View, recognition) | One WebGL2 pass: camera texture at 50–66 % resolution → dual-Kawase blur at ¼–⅛ resolution → for each card a rounded-rectangle SDF lens samples the blurred texture, adds edge refraction from the SDF gradient, a rim specular highlight and an adaptive dim. Card text and charts are transparent DOM on top. |
| **Frosted glass** | Screens without video (Ambient, sheets, settings) | `background: linear-gradient(155deg, glass-fill-strong 0%, glass-fill 45%)`, `backdrop-filter: blur(blur-glass) saturate(150%)`, 1 px `glass-edge` border, inset top highlight `glass-specular`, `shadow-card`. Max three per screen. |
| **Solid** | Clear view setting, low-power mode, long text | `card-solid` fill, 1 px `glass-edge` border, `shadow-card`. Same radii and spacing as glass. |

### Liquid Glass behaviours
- **Lensing, not blur alone:** edges bend the background slightly; centres stay readable.
- **Materialise:** surfaces appear by increasing refraction and opacity together (500 ms), not by a plain fade.
- **Specular light:** a soft highlight at the top-left edge (`glass-specular`); it may follow head position by ±4 px (off in Calm motion).
- **Adaptive dimming:** sample the mean luminance behind each card (⅛-resolution read-back) and raise the dim until `text` over it passes 4.5:1. Add `scrim` (35 %) behind sheets when the backdrop is bright.
- **Concentricity:** nested radii share a centre: outer − padding = inner.
- **Never glass on glass** at the same depth; never animate the blur radius (animate opacity and refraction instead).

### Depth planes
| Plane | Contents | Treatment |
|---|---|---|
| z0 | Canvas, aurora, face orb | No shadow; aurora drifts ≤ 0.2 Hz |
| z1 | Orbit cards, dock, ambient cards | `shadow-card`; parallax 2–8 px |
| z2 | Sheets, dialogs, PIN pad, enrolment | `shadow-float`; z1 dims to 16 % and scales to 0.96; scrim behind |

### Pi 5 budgets
≤ 3 CSS `backdrop-filter` surfaces per screen (none on the camera screen), blur ≤ 16 px (`blur-glass`); none over video; ≤ 12 animated layers; one WebGL canvas; 60 fps target, 30 fps floor. `will-change` only while animating.

## Motion

Motion explains what just happened (a reading arrived, someone was recognised). It never decorates.

### Tokens (tokens.json families `duration` and `easing`; also `dur-sheet` 800 ms for sheets)
| Name | Value | Use |
|---|---|---|
| `--dur-instant` | 100 ms | Press feedback |
| `--dur-fast` | 200 ms | Chips, toggles |
| `--dur-base` | 350 ms | Most transitions |
| `--dur-slow` | 600 ms | Scene changes |
| `--dur-hero` | 900 ms | Orbit entrance, greeting |
| `--ease-out-expo` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances |
| `--ease-out-back` | cubic-bezier(0.34, 1.4, 0.64, 1) | Cards joining the orbit, badges |
| `--ease-in` | cubic-bezier(0.5, 0, 0.75, 0) | Exits |
| `--ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | Everything else (same as Cure web) |

### Choreography
| Moment | Sequence |
|---|---|
| Boot | Plymouth last frame = first web frame (black, ring start). anime.js: ring draws (lime → green → blue) 1.7 s → cross scales in `ease-out-back` 0.9 s → wordmark letters stagger 55 ms → dissolve with 10 px blur 0.8 s into Ambient. |
| Wake | Ambient blurs and fades 0.9 s; camera indicator turns on immediately; face orb grows from 55 % with `ease-out-expo` 1.3 s. |
| Recognition | Ring progress 0 → 100 % over the match (≤ 1.5 s); success: ring colour to `cure-green` 0.3 s, check badge pops `ease-out-back` 0.6 s, greeting rises 14 px + fades 0.9 s. |
| Orbit entrance | Orbit lines fade 0.9 s; cards spring in from 120 px outward, scale 0.7 → 1, stagger 110 ms; connectors then hotspots stagger 90 ms; sparklines draw 1.2 s. |
| Reading arrives | Card pulse to 1.06 (0.6 s) → value ticker 1.3–1.6 s `ease-out-cubic` → meta swap → `ReadingIsland` 3 s → card back to 1. A soft chime plays once. |
| Sheet | Slides up 50 px + fades 0.8 s `ease-out-expo`; background cards dim to 16 % in 0.7 s. |
| Return to Ambient | Everything fades 0.6 s; the orb shrinks into the clock's position. |

### Library roles
- **Motion for React** (`motion` package, `motion/react`): `AnimatePresence` for screens and sheets, `layout`/`layoutId` for cards moving between Orbit and detail, `useSpring` for face following. Use `LazyMotion` + `m` on secondary screens.
- **anime.js v4** (`animejs`): `createTimeline` for boot and greeting, `svg.createDrawable` for rings and sparklines, `splitText` + `stagger` for the greeting, object tweens for number tickers. Wrap in `createScope` inside `useEffect` and `revert()` on unmount.
- Number tickers may use NumberFlow (`@number-flow/react`, MIT) instead of anime.js.

### Calm motion (reduced motion)
No orbit-marker drift, no parallax, no specular follow; scene changes become 200 ms cross-fades; tickers jump to the final value; the heartbeat dot is static. Nothing flashes more than three times per second in any mode.

## Screens & flows

Every screen below exists in Sinhala, Tamil and English, in `night` and `day`, and in Clear view.

| # | Screen | Purpose | Key components | Exit |
|---|---|---|---|---|
| 1 | **Boot** | Silent boot → brand moment while services start | Boot ring, Cure cross, "CURE HOME" wordmark | Ambient |
| 2 | **Ambient** | The resting state; useful from across the room | `AmbientClock`, `WeatherCard`, next-up card (`MedicineCard` compact), hint "Step closer to see your health" | Approach on presence |
| 3 | **Approach / Identifying** | Camera on, find and match a face | `FaceOrb` (scanning), camera indicator | Orbit View, Guest, "Who's measuring?" |
| 4 | **Who's measuring?** | Two similar faces, or face match uncertain | `FamilyAvatar` row, "Use my PIN" | Orbit View / PIN |
| 5 | **Orbit View** | Member home: face + readings + next actions | `FaceOrb`, six `VitalCard`s, `Dock`, status bar | Detail, measure flows, Ambient |
| 6 | **Vital detail** | One vital: 7 / 30 / 90-day trend, averages, target, history | Trend chart (Bklit Area/Line with target band), `StatusChip`, `FreshnessChip` | Orbit View |
| 7 | **Guided BP check** | Rest timer, posture checklist, 2 readings averaged | `RingProgress` (breathing), checklist, `ReadingIsland` | Orbit View |
| 8 | **Weight / SpO₂ / temperature** | Prompt + live "waiting for device" + result | Device prompt card, `ReadingIsland` | Orbit View |
| 9 | **Glucose context** | Ask fasting / before meal / after meal / bedtime | Four large choice buttons | Orbit View |
| 10 | **Who was this?** (inbox) | Unassigned readings | List of readings with `FamilyAvatar` choices, "Not us" | Back |
| 11 | **Medicines** | Today's doses, mark taken | `MedicineCard` list, `Button` success | Back |
| 12 | **Visit** | Next appointment, live queue, leave-now nudge | `VisitCard` | Back |
| 13 | **Family** | Members, who measured today, family board notes | `FamilyAvatar` grid, notes list | Back |
| 14 | **Calendar & reminders** | Household calendar, timers, reminders | Month grid (react-day-picker restyled), reminder list | Back |
| 15 | **Guest** | Unknown face: clock, weather, measure without saving, claim by QR | `WeatherCard`, `Button`, QR panel | Ambient |
| 16 | **PIN** | Fallback sign-in and sensitive actions | `PinPad` | Previous |
| 17 | **Add family member** | Consent → guardian → guided capture → test | Consent text, `RingProgress` capture ring, `FaceOrb` | Family |
| 18 | **Pairing (first run)** | Language → Wi-Fi → QR pairing → members → devices → first measurement | Stepper, QR panel | Ambient |
| 19 | **Settings** (PIN) | Language, text size, Clear view, Calm motion, Mirror off, Discreet mode, camera, devices, Wi-Fi, About | Rows with `Button`/toggles | Back |
| 20 | **Notices** | Offline, sync waiting, low battery, escalation text | `Banner` | Inline |

### Flow rules
- Any screen returns to Ambient after inactivity (60 s member, 20 s guest) or when the member taps **Done**.
- Back is always a visible button (top-left, 64 px), never a gesture only.
- One primary action per screen; destructive actions need a second, explicit confirmation step built into the screen (no system dialogs).
- Measurement screens never block: "Waiting for your scale…" shows a cancel button and times out after 2 minutes with a helpful message.

## Accessibility & privacy

### Accessibility
- Contrast: `text`, `text-2` and `text-3` pass 4.5:1 on `glass-fill` over `canvas` in both themes; status and vital colours pass 4.5:1 as text on glass in their theme. Check over the worst-case camera frame (a bright window behind the user) with adaptive dimming on.
- Targets ≥ 64 px (≈ 11 mm) with ≥ 12 px gaps; primary actions 80 px.
- Text size setting: Standard, Large (+20 %), Extra large (+40 %, Orbit View drops to four slots and scrolls the rest).
- **Clear view**: solid `card-solid` surfaces, no blur, no aurora behind text.
- **Calm motion**: see Motion.
- Status never by colour alone: symbol + word on every chip.
- Every control has an accessible name in the member's language; focus order follows the visual order (cards clockwise from top-left).
- Sound cues accompany key events (recognised, reading saved, reminder) so members who don't read the screen still know something happened; volume and quiet hours in Settings.
- Language per member; switching language never changes layout positions.

### Privacy patterns
- **Camera indicator** always visible while the camera is on: "● Camera on device only" in the status bar, plus the hardware LED.
- **Shutter closed** → the camera icon shows `CameraOff`, Orbit View uses avatars, PIN sign-in is offered.
- **Only the identified member's data.** A second enrolled member with no measurement running → "Who's measuring?" chooser (never a silent switch). A measurement running, or an unknown face → keep the session and show "Someone else is here — tap to hide your readings".
- **Discreet mode** hides values until tapped; good for weight.
- **Guest mode** stores nothing unless the guest scans the QR to claim the reading.
- **Forget me** (Settings → Family → member, PIN) deletes the face template on the hub and records consent withdrawal.
- **Sensitive actions** (sharing settings, deleting, pairing a phone, viewing history older than 90 days) ask for a PIN.
- Never show raw camera frames anywhere except the live face crop in the orb; never show the body.

## Build stack & sources

How each requested tool is used. Runtime libraries ship in the hub; component registries are copied into the repo as source; the rest are design-time aids.

| Tool | Role in Cure Home | Use it for |
|---|---|---|
| **Motion** (motion.dev; formerly Framer Motion) | Runtime | Presence, layout, springs, face-following. `npm i motion`, import from `motion/react`. |
| **anime.js v4** | Runtime | Boot timeline, SVG line drawing (rings, sparklines, logo), greeting `splitText`, tickers. Named imports; `createScope` in React. |
| **Bklit UI** | Copy-paste source (shadcn registry, visx + d3 + motion) | Line/Area (trends with the doctor's target band, sparklines), Ring (goals, enrolment). Gauge only when a doctor's target exists (neutral scale otherwise). No Live Line: the hub stores spot-check readings and never shows live traces. |
| **Cult UI** | Copy-paste source | Dynamic Island → `ReadingIsland`, Onboarding + Wizard Expandable (first run, add member), Halo Toast, Expandable/Family Drawer, Texture Card. |
| **Aceternity UI** | Copy-paste source | Multi Step Loader (boot service checks), Text Generate / Flip Words (greeting), Stateful Button, Card Spotlight. Background effects only on boot/idle. |
| **Componentry** | Copy-paste source (WebGL) | Liquid Glass Carousel and Lens Clock as references for the lens shader; Magnetic Dock idea for the dock. Profile on the Pi; check licence. |
| **21st.dev** | Marketplace + MCP | Find patterns (glass calendar, PIN pad) and pull them through the 21st MCP; audit licence per component. |
| **UI UX Pro Max** | Design-time Claude Code skill | Generate and check palettes, type pairs and UX rules against this system; keep this system as the source of truth. |
| **HorizonX, GetLayers** | Inspiration / paid assets | Mood and shader references only. |
| **Manus** | AI agent | Research, mood boards, throwaway prototypes for older-adult testing; not production code. |
| **MediaPipe Tasks Vision** | Runtime | Face box and landmarks at 30 Hz for layout (identity runs in the local vision service). |
| **NumberFlow** | Runtime (MIT) | Animated numbers if not using anime.js tickers. |
| **Lucide** | Runtime | Icons (same family as the Cure patient app). |

Fonts: Sora, Manrope, JetBrains Mono, Instrument Serif, Noto Sans Sinhala, Noto Sans Tamil — all SIL Open Font License; self-host the woff2 files on the device (no network fonts).

Tokens in code: export `tokens.json` to CSS variables (Tailwind v4 `@theme`) in `apps/hub-ui`; the names here are the names in code.

## Tokens

### Colour (night / day)

| Token | Night | Day | Usage |
|---|---|---|---|
| `canvas` | `#04080f` | `#eef3f9` | Page/screen ground behind the aurora. Never put text directly on it; use glass. |
| `screen` | `#08111f` | `#f6f9fc` | Inner screen ground of the device, under the aurora and face orb. |
| `surface-raised` | `#0d1a2e` | `#e3ecf6` | Aurora core and large quiet areas (Ambient background). |
| `aurora-blue` | `rgba(16,137,227,0.30)` | `rgba(16,137,227,0.18)` | Largest aurora blob (radial gradient, drifts ≤0.2 Hz). Decorative only. |
| `aurora-teal` | `rgba(20,184,166,0.20)` | `rgba(20,184,166,0.14)` | Second aurora blob. Decorative only. |
| `aurora-lime` | `rgba(166,206,57,0.10)` | `rgba(166,206,57,0.12)` | Faint third aurora blob near the bottom edge. Decorative only. |
| `glass-fill` | `rgba(255,255,255,0.09)` | `rgba(255,255,255,0.62)` | Card glass fill (VitalCard, dock pills, ambient cards). `text`, `text-2`, `text-3` pass 4.5:1 on it over `canvas`. |
| `glass-fill-strong` | `rgba(255,255,255,0.15)` | `rgba(255,255,255,0.80)` | Sheets, dialogs, any glass holding long text; top stop of the card gradient. |
| `glass-edge` | `rgba(255,255,255,0.16)` | `rgba(15,23,42,0.10)` | 1px border on every glass or solid surface; orb ring track. |
| `glass-specular` | `rgba(255,255,255,0.28)` | `rgba(255,255,255,0.95)` | Inset top highlight and the specular sheen at a surface's top-left. |
| `card-solid` | `#121d31` | `#ffffff` | Clear view (accessibility) and low-power surfaces instead of glass. |
| `scrim` | `rgba(2,6,12,0.35)` | `rgba(240,245,250,0.55)` | Dim layer behind z2 sheets and over bright camera backdrops. |
| `orbit-line` | `rgba(159,210,255,0.16)` | `rgba(3,105,193,0.16)` | Orbit ellipses and chart grid lines. |
| `text` | `#eef3fb` | `#0f172a` | Values, headings, button labels on glass and solid surfaces (≥12:1 on glass). |
| `text-2` | `#b8c5d9` | `#334155` | Supporting copy and greeting subtitle on glass and solid surfaces (≥8:1). |
| `text-3` | `#a3b1c6` | `#526079` | Meta lines (reading age, source) on glass and solid surfaces (≥5.5:1). Never smaller than the `meta` style. |
| `cure-blue` | `#1089e3` | `#1089e3` | Brand identity colour (logo cross, boot ring end, recognition arc). Only 3.7:1 on white: large text, icons and fills only in `day`. |
| `cure-green` | `#2fb15a` | `#15803d` | Confirmation: recognised ring, taken/saved ticks, camera-on dot. Text-safe on glass in both themes. |
| `cure-lime` | `#a6ce39` | `#7ea51f` | Thin accent only: boot ring start, orbit marker. Never text in `day` (2.7:1). |
| `action` | `#4aa8f0` | `#0369c1` | Primary button fill and links. |
| `on-action` | `#04121f` | `#ffffff` | Label on `action` fills (≥5.5:1). |
| `confirm` | `#22c55e` | `#15803d` | 'Mark as taken', 'Save' and other positive confirmation buttons. |
| `on-confirm` | `#04210f` | `#ffffff` | Label on `confirm` (≥5:1). |
| `danger-action` | `#f87171` | `#b91c1c` | Destructive buttons (Forget me, Remove device) after a confirmation step. |
| `on-danger` | `#1f0505` | `#ffffff` | Label on `danger-action`. |
| `vital-weight` | `#a78bfa` | `#6d28d9` | Weight card: icon dot, sparkline, connector. Identity, not status. |
| `vital-bp` | `#34d399` | `#047857` | Blood-pressure card identity colour. |
| `vital-sugar` | `#fbbf24` | `#b45309` | Glucose card identity colour. |
| `vital-pulse` | `#f87171` | `#be123c` | Heart-rate card identity colour; heartbeat dot. |
| `vital-spo2` | `#38bdf8` | `#0369a1` | SpO₂ card identity colour. |
| `vital-temp` | `#fb923c` | `#c2410c` | Temperature card identity colour. |
| `status-good` | `#34d399` | `#047857` | Within the doctor's target: chip border/dot. Always with ● and words. |
| `status-good-text` | `#a7f3d0` | `#065f46` | Text on `status-good-bg` (≥7:1). |
| `status-good-bg` | `rgba(52,211,153,0.14)` | `#ecfdf5` | Chip fill for within-target. |
| `status-watch` | `#fbbf24` | `#b45309` | Above or below the doctor's target: chip border/dot. Always with ▲ and words. |
| `status-watch-text` | `#fde68a` | `#92400e` | Text on `status-watch-bg` (≥6.8:1). |
| `status-watch-bg` | `rgba(251,191,36,0.14)` | `#fffbeb` | Chip fill for outside-target. |
| `status-attention` | `#f87171` | `#b91c1c` | Clinician-defined 'talk to your doctor' level only. Always with ! and the fixed escalation text. |
| `status-attention-text` | `#fecaca` | `#991b1b` | Text on `status-attention-bg`. |
| `status-attention-bg` | `rgba(248,113,113,0.16)` | `#fef2f2` | Chip and banner fill for attention. |
| `status-unknown` | `#cbd5e1` | `#475569` | Implausible or unverified reading ('? Check this reading'). |
| `status-unknown-text` | `#e2e8f0` | `#334155` | Text on `status-unknown-bg`. |
| `status-unknown-bg` | `rgba(203,213,225,0.12)` | `#f1f5f9` | Chip fill for check-this-reading. |
| `focus-ring` | `#9fd2ff` | `#0369c1` | 3px solid focus ring with 3px offset on every focusable control (≥3:1 on all surfaces). |
| `brand-disc` | `#ffffff` | `#ffffff` | White disc behind the full-colour Cure logo on dark grounds. |

### Type

| Style | Family | Size / line / weight | Usage |
|---|---|---|---|
| `clock` | display | 200px / 1 / 200 / -8px | Ambient clock only. |
| `greeting` | display | 44px / 1.15 / 600 / -0.5px | Orbit View greeting in English. |
| `value-xl` | display | 72px / 1 / 400 / -2px | Vital detail hero number and measurement results. |
| `value` | display | 48px / 1 / 500 / -1px | VitalCard value (48 px minimum for vital numbers). |
| `title` | display | 28px / 1.2 / 500 / -0.4px | Sheet and screen titles. |
| `body-lg` | ui | 22px / 1.45 / 600 | Instructions in measurement flows. |
| `body` | ui | 20px / 1.45 / 600 | Default reading text; the minimum for sentences. |
| `button` | ui | 20px / 1 / 800 | Button and dock labels. |
| `meta` | ui | 16px / 1.3 / 600 | Reading age and source; status bar. |
| `unit` | ui | 16px / 1 / 600 | Units after a value. |
| `label` | ui | 14px / 1.2 / 800 / 1.4px | Card labels, set in uppercase (English only; never uppercase Sinhala/Tamil). |
| `chip` | ui | 14px / 1 / 800 / 0.3px | StatusChip, FreshnessChip, ReadingIsland. |
| `si-greeting` | si | 40px / 1.35 / 600 | Greeting when the member's language is Sinhala. |
| `si-body` | si | 20px / 1.65 / 400 | Sinhala body text. |
| `ta-greeting` | ta | 36px / 1.4 / 600 | Greeting when the member's language is Tamil. |
| `ta-body` | ta | 19px / 1.65 / 400 | Tamil body text. |
| `serif-accent` | accent | 58px / 1.08 / 400 | Second half of film captions and print headlines. Not on the device. |
| `eyebrow` | mono | 16px / 1.2 / 500 / 3px | Film and web eyebrows, clinician data tables. |

Families: `display` = "Sora", "Noto Sans Sinhala", "Noto Sans Tamil", system-ui, sans-serif; `ui` = "Manrope", "Noto Sans Sinhala", "Noto Sans Tamil", system-ui, sans-serif; `si` = "Noto Sans Sinhala", "Manrope", system-ui, sans-serif; `ta` = "Noto Sans Tamil", "Manrope", system-ui, sans-serif; `mono` = "JetBrains Mono", ui-monospace, monospace; `accent` = "Instrument Serif", Georgia, serif

### Spacing

| Token | Value | Usage |
|---|---|---|
| `space-1` | `4px` | Icon-to-text gap inside chips. |
| `space-2` | `8px` | Label row gaps. |
| `space-3` | `12px` | Minimum gap between touch targets; concentric inset (card 28 → inner 16). |
| `space-4` | `16px` | Card padding; gap between cards. |
| `space-5` | `24px` | Status bar and dock inset from the screen edge; sheet section gaps. |
| `space-6` | `32px` | Safe margin from every screen edge; sheet padding. |
| `space-7` | `48px` | Between major regions on Ambient. |
| `space-8` | `64px` | Minimum touch target size. |
| `space-9` | `96px` | Ambient clock offset from the left edge. |

### Radius

| Token | Value | Usage |
|---|---|---|
| `radius-inner` | `16px` | Chips' containers, icon tiles and inner panels inside a card (card 28 − 12 padding). |
| `radius-screen` | `24px` | Device screen corners (bezel). |
| `radius-card` | `28px` | VitalCard, MedicineCard, VisitCard, WeatherCard. |
| `radius-panel` | `36px` | Sheets and dialogs (z2). |
| `radius-pill` | `999px` | Dock pills, buttons, chips, avatars, face orb. |

### Shadow

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 18px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.28)` · day `0 12px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.95)` | z1 surfaces: cards, dock pills. |
| `shadow-float` | `0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)` · day `0 24px 60px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.95)` | z2 sheets and dialogs. |
| `shadow-orb` | `0 0 0 1px rgba(255,255,255,0.25), 0 0 0 10px rgba(255,255,255,0.04), 0 30px 80px rgba(0,0,0,0.5), 0 0 90px rgba(74,168,240,0.25)` · day `0 0 0 1px rgba(15,23,42,0.12), 0 0 0 10px rgba(255,255,255,0.6), 0 24px 60px rgba(15,23,42,0.18)` | Face orb halo. |

### Blur

| Token | Value | Usage |
|---|---|---|
| `blur-glass` | `16px` | Frosted cards, dock pills and sheets (screens without video). |

### Opacity

| Token | Value | Usage |
|---|---|---|
| `opacity-dimmed` | `0.16` | Orbit cards behind an open sheet. |
| `opacity-stale` | `0.35` | Connectors and hotspots for readings older than 7 days. |

### Sizes

| Token | Value | Usage |
|---|---|---|
| `target-min` | `64px` | Minimum touch target (≈11 mm on the 10.1-inch panel at 1.5×). |
| `target-primary` | `80px` | Primary action height. |
| `orb-size` | `320px` | Face orb diameter in Orbit View. |
| `card-width` | `260px` | VitalCard width. |
| `card-height` | `168px` | VitalCard height. |

## Components

Live previews of each component are in the design system artifact (and `design-system/project/components/<Name>/preview.html`).

### AmbientClock

AmbientClock is the large clock and date on the Ambient screen, readable from across the room.

**Props** — `time`, `ampm`, `date`.

Set in `clock` (200 px Sora 200) with the date in `body-lg` `text-2`, 96 px from the left edge. **Don't** add seconds or animate the digits.

### Banner

Banner is an inline notice for offline mode, readings waiting to sync, low device batteries, and the fixed escalation message.

**Props** — `tone`: `info`, `offline`, `attention`; `title`; `children` (one line); `action` (button label).

**Attention** uses only clinician-approved text: "This reading is higher than your doctor's target. If you feel unwell, call 1990 (Suwa Seriya)." **Don't** use it for marketing or tips.

### Button

Button is a pill-shaped action at least 64 px tall (80 px for the one primary action on a screen).

**Props** — `variant`: `primary` (`action` / `on-action`), `confirm` (`confirm` / `on-confirm`: Mark as taken, Save), `secondary` (glass), `ghost` (outline), `danger` (`danger-action`, only after an in-screen confirmation step). `size`: `md` (64 px) or `lg` (80 px). Any `button` attribute (`onClick`, `disabled`, `aria-*`).

**Do** write the label as the result ("Mark as taken", "Start check", "Use my PIN"); one primary per screen; keep the 3 px `focus-ring`.
**Don't** use icons without a label, red for anything but destructive actions, or system dialogs for confirmation.

### Dock

Dock is the row of up to five glass pills at the bottom of Orbit View: Medicines, Visit, Family, Reminders, Calendar.

**Props** — `items`: [{`label`, `detail`?, `badge`?}]. Each pill is 64 px tall with `space-3` gaps.

**Do** show what's waiting as a short detail ("4:30 PM · #12") or a badge count. **Don't** add a sixth item or hide the labels.

### FaceOrb

FaceOrb is the centre of Orbit View: a 320 px circular crop of the member's own face from the camera, with the recognition ring around it.

**Props** — `state`: `scanning` (blue arc grows with `progress`), `recognized` (full `cure-green` ring + check badge), `unknown` (grey ring; guest mode), `idle`; `progress` (0–1); `size`. With no Cure photo (or Mirror off, shutter closed, the PIN path) the centre shows the default avatar: a plain grey person on white — no initials.

**In the product** the face comes from the live camera texture drawn in the WebGL layer; this preview shows the privacy silhouette.
**Do** crop to the face only. **Don't** show the body, store the frame, or cover the orb with other UI.

### FamilyAvatar

FamilyAvatar shows a household member with a ring for "done today" and a two-line note; also used in "Who's measuring?" and the reading inbox.

**Props** — `name` (the name the family uses), `note`, `progress` (0–1 of today's plan), `tone` (`good` or `watch`), `add` (dashed "Add member" tile), `size`.

**Do** use the family's own words ("Amma", "Thaththa"). **Don't** show readings here — tapping opens that member's view only after they are identified or enter their PIN.

Without a Cure photo the circle shows the default avatar (a plain grey person on white), never initials.

### FreshnessChip

FreshnessChip says how old the data on screen is, so nothing ever looks "live".

**Props** — `state`: `fresh` (< 24 h, `cure-green` dot), `recent` (< 7 days, grey dot), `stale` (> 7 days, neutral `status-unknown` colours so it never looks like an out-of-target reading; the card's connector dims), `error` (sync or device problem). `children`: the words ("Updated 6 min ago").

**Use** in detail views, the clinician-facing summaries and next to synced data such as medicines and visits.
**Don't** use the word "live" anywhere.

### GlassPanel

GlassPanel is the surface every Cure Home card, sheet and dialog is built on: frosted glass over the aurora, or a solid card in Clear view.

**Props** — `material`: `glass` (cards; `glass-fill` gradient + `blur-glass`), `strong` (sheets and long text; `glass-fill-strong`), `solid` (Clear view; `card-solid`). `radius`: `card` (28), `panel` (36, sheets), `inner` (16). `padding`, `style`, `children`.

**Use** glass for z1 cards, strong for z2 sheets, solid whenever the member turns on Clear view or the screen sits over a bright, busy backdrop.

**Do** keep at most three blurred panels per screen on the Pi; nest content with concentric radii (panel 36 → inner 16 at 20 px padding is wrong; card 28 → inner 16 at 12 px is right).
**Don't** place a GlassPanel over the live camera with CSS blur — over video the lens glass is drawn in WebGL and this component only holds the text.

### MedicineCard

MedicineCard lists one dose from the member's Cure prescription with a one-tap check-off.

**Props** — `name` ("Metformin 500 mg"), `detail` ("1 tablet · after breakfast · Dr N. Perera"), `taken`, `takenAt`, `onTake`.

**Data** comes from HMS prescriptions and the dose log (`/hub/members/{id}/medications`, `doses/toggle`). **Do** show the prescribing doctor. **Don't** show dosage advice beyond what the prescription says.

### OrbitView

OrbitView is the member screen composition: status bar, greeting in the member's language, face orb, six VitalCards in fixed slots with flowing connectors, optional ReadingIsland and the Dock — laid out on the 1280 × 800 canvas.

**Props** — `greeting`, `script` (`si` | `ta` | `en`), `subtitle`, `time`, `weather`, `state` (FaceOrb state), `vitals` (up to six VitalCard prop objects in slot order: weight, BP, glucose, heart rate, SpO₂, temperature), `island`, `dock` (Dock items).

Geometry and behaviour (face following, parallax, focus state) are in the Orbit View section. **Don't** reflow slots for fewer vitals; empty slots stay empty.

### PinPad

PinPad is the fallback sign-in and the gate for sensitive actions (sharing settings, deleting, pairing a phone, history older than 90 days).

**Props** — `length` (4 or 6), `filled`, `title`.

Keys are 88 px circles with `space-3` gaps; digits never show, only dots. **Don't** use it as the default sign-in when face recognition is on, or ask for the PIN to see today's readings.

### ReadingIsland

ReadingIsland is the short-lived pill that confirms a reading was saved, with the day's counter ("✓ Blood pressure saved · 1 of 2 today", "✓ Weight saved for today"); based on Cult UI's Dynamic Island idea.

**Props** — `children`: the sentence.

**Use** for 3 s after a reading lands, centred under the face orb; pair with one soft chime. For readings over the plan say "Saved as an extra reading".
**Don't** stack more than one; never use it for errors (use Banner).

### RingProgress

RingProgress is a circular progress ring for the face-enrolment capture, the BP breathing timer and each family member's "done today" ring.

**Props** — `value` (0–1), `size`, `stroke`, `color` (default `cure-blue`; `cure-green` when complete), `children` (centre content), `aria-label`.

**Do** pair it with words in the centre or beside it ("3 of 6 angles", "0:45 rest").
**Don't** spin it indefinitely; if progress is unknown, show a sentence instead.

### Sparkline

Sparkline draws the last 7–12 readings as a smooth line that never overshoots a real reading (control points at the x-midpoint, as in the Cure patient app), with a dot on the newest value.

**Props** — `values` (numbers, oldest first), `color` (the card's `vital-*` token), `width`, `height`, `endDot`.

**Use** inside VitalCard; for BP pass systolic values. Fewer than two readings draws a faint dashed baseline.
**Don't** add axes or labels here (use the Vital detail chart) or animate it continuously; it draws once (1.2 s) when data changes.

### StatusChip

StatusChip states how a reading compares to the target the member's doctor set — always as symbol plus words.

**Props** — `tone`: `good` (● Within your target), `watch` (▲ Above/Below your target), `attention` (! Talk to your doctor — only when the clinician configured that level in HMS; fixed text, no sound, not an alarm), `unknown` (? Check this reading). `children`: the words.

**Use** only when a clinician target exists in HMS; without one, show the trend and no chip. Words are fixed (see Voice). Colours come from `status-*`, `status-*-text`, `status-*-bg`.
**Don't** write "high", "abnormal", "danger" or a diagnosis; never use colour alone.

### VisitCard

VisitCard shows the next Cure appointment and, on the day, the live queue: your token, now serving, and how many are ahead.

**Props** — `doctor`, `specialty`, `when`, `place`, `token`, `nowServing`.

**Data** from HMS appointments and the session queue (refresh every 30 s on visit day). Patients ahead = token − now serving − 1. **Do** add a "Leave now" nudge 45 minutes before the estimated turn. **Don't** promise exact times.

### VitalCard

VitalCard shows one reading in the orbit: label, value with unit, a sparkline, the reading's age and source, and — only when the doctor set a target — a StatusChip.

**Props** — `kind`: `weight` | `bp` | `sugar` | `pulse` | `spo2` | `temp` (sets the `vital-*` identity colour and default label); `label`; `value` (string, already formatted: "124/78", "62.4"); `unit`; `meta` ("Just now · Cure Scale"); `series` (numbers for the sparkline); `status` ({`tone`, `text`}); `highlight` (scales to 1.06 while a new reading lands); `stale`; `discreet` (shows ••• until tapped).

**Size** `card-width` × `card-height` (260 × 168). Value in `value` (48 px), unit in `unit`, meta in `meta` with `text-3`.
**Do** always fill `meta`. **Don't** put two readings in one card, or show a status without a target.

### WeatherCard

WeatherCard is the Ambient screen's weather: place, temperature, plain-language summary and one practical line (rain, heat).

**Props** — `place`, `temp`, `summary`, `detail`.

**Data** from Open-Meteo through hub-core (cached; shows the cache age when offline). **Do** lead with what matters today ("Light rain after 3 PM"). **Don't** show more than one day.
