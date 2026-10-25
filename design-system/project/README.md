Cure Home is a family health hub: a 10-inch touch screen with a camera that recognises each family member, shows their health readings around their own face, and gets every reading to their Cure doctor. Design for a living room at 6:45 in the morning: calm, legible from a metre away, honest about every number, and private by default. This system is dark-first (`night` theme) because the hub lives on a sideboard all day; `day` is the bright-room variant.

## Principles

1. **Calm by default.** Ambient first, data on approach. Nothing blinks, nothing scolds. One motion moment per screen.
2. **The face is the centre.** On the member screen (Orbit View) the person's own face sits in the middle; everything else orbits it. Never cover the face.
3. **Honest numbers.** Every reading shows its value, unit, age and source ("Just now · Cure Scale"). Never "LIVE", never a fake waveform, never a colour without a word.
4. **Legible glass.** Glass is a material for grouping, not decoration. Text sits on a fill strong enough to pass contrast over the worst backdrop; when in doubt use `glass-fill-strong` or the solid `card-solid`.
5. **Your face, your data.** Only the identified member's data is shown. The camera state is always visible.
6. **Three languages, one layout.** Every screen works in Sinhala, Tamil and English without truncation.

## Device and canvas

- Design on a **1280 × 800 CSS px canvas**: the 10.1" Touch Display 2 (1920 × 1200 landscape) at device scale factor 1.5. One CSS px ≈ 0.17 mm.
- Minimum touch target **64 px (≈ 11 mm)**; primary actions **80 px**. Gaps between targets ≥ `space-3`.
- Viewing distance 0.5–2 m. Body copy never below `body` (20 px); meta text never below `meta` (16 px).
- Landscape only. Safe margin `space-6` (32 px) from every edge; status bar and dock sit inside it.

## Colour

- Paint the screen with `canvas` and let the slow aurora (`aurora-blue`, `aurora-teal`, `aurora-lime`) drift behind everything. Never put text directly on the aurora; put it on glass.
- Glass surfaces: `glass-fill` for cards, `glass-fill-strong` for sheets and anything holding long text, `card-solid` in Clear view. Edge with `glass-edge`; top highlight `glass-specular`.
- Text: `text` for values and headings, `text-2` for supporting copy, `text-3` for meta (age, source). All three pass 4.5:1 on `glass-fill` over `canvas` in both themes.
- Brand: `cure-blue` is the identity colour (logo cross, focus of the brand moments, boot ring end). For filled buttons use `action` with `on-action` text; `cure-blue` itself only passes 3:1 on white, so use it for large text, icons and fills, not small text in `day`.
- `cure-green` and `cure-lime` come from the logo's crescent. Use `cure-green` for confirmations (taken, saved, recognised); `cure-lime` only as a thin accent (boot ring start, orbit marker), never for text in `day`.
- **Vital identity colours** say *which* vital a card is, not how it reads: `vital-weight` violet, `vital-bp` emerald, `vital-sugar` amber, `vital-pulse` red, `vital-spo2` sky, `vital-temp` orange. Use them for the card's icon dot, sparkline and connector line only.
- **Status colours** say how a reading compares to the doctor's target: `status-good`, `status-watch`, `status-attention`, `status-unknown`, each with its `-bg`. Always pair with the symbol and words (● Within your target, ▲ Above your target / ▲ Below your target, ! Talk to your doctor, ? Check this reading). Never show status without a clinician-set target; without one, show the trend only. `! Talk to your doctor` appears only when the clinician configured that level in HMS; it is fixed text and never an alarm.
- Focus: `focus-ring`, 3 px solid, 3 px offset, on every focusable control.

## Type

- `display` (Sora) for the clock, greeting, vital values and titles. Use light weights (200–300) only at 64 px and above; on glass use 500–600.
- `ui` (Manrope) for everything you read: labels, body, buttons, meta. Weight 600–800 on glass.
- `si` (Noto Sans Sinhala) and `ta` (Noto Sans Tamil) are part of every stack; when the member's language is Sinhala or Tamil, use the `si-*` / `ta-*` styles (taller line heights for the scripts' vowel signs).
- `mono` (JetBrains Mono) only for small uppercase eyebrows in marketing and for data tables in clinician views, never for vital values.
- `serif-accent` (Instrument Serif Italic) is for marketing films and print only. Not on the device.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`). Units are set smaller than the value (`unit` style) with a thin space.

## Space, shape, depth

- Spacing steps: `space-1` 4 → `space-9` 96. Vital numbers are never below 48 px (`value`). Card padding `space-4`; between cards `space-4`; sheet padding `space-6`.
- **Concentric corners**: inner radius = outer radius − padding. `radius-panel` 36 → content inside at `space-3` uses `radius-card`… Card 28 with 12 padding → chips and inner tiles at `radius-inner` 16. Pills and avatars use `radius-pill`.
- Depth has three planes, never more: **z0** canvas + face, **z1** orbit cards and dock (`shadow-card`), **z2** sheets and dialogs (`shadow-float`, background dimmed with `scrim` and cards scaled to 0.96). Never stack glass on glass on z2.

## Iconography

- Use **Lucide** (the same family as the Cure patient app: `lucide-react`), 2 px stroke, 24 px in cards, 32 px in buttons and the dock. Icons always have a text label next to them on the device.
- Vital icons: weight `Scale`, blood pressure `Gauge`, glucose `Droplet`, heart rate `HeartPulse`, SpO₂ `Activity`, temperature `Thermometer`, medicines `Pill`, visits `CalendarClock`, family `Users`, reminders `Bell`, weather `CloudSun`, camera `Camera` / `CameraOff`, privacy `ShieldCheck`.
- Do not use emoji anywhere in the device UI.
- The Cure logo (`assets/Logos/cure-logo.png`) appears only on the boot screen, the About screen and marketing. It is a full-colour mark with dark-blue lettering: place it on a white disc (`brand-disc`) on dark grounds, never directly on `canvas`.

## Content and voice

- Speak like a kind nurse: short, plain, second person. "Sit back and relax your arm." not "Ensure correct posture."
- Greet by the name the family uses ("Amma", "Thaththa"), in the member's language: "ආයුබෝවන්, අම්මා" / "வணக்கம், அம்மா" / "Good morning, Amma".
- Status words are fixed: **Within your target**, **Above your target**, **Below your target**, **Check this reading**. Never "high", "abnormal", "danger", "hypertension".
- Every reading line ends with age and source: "Just now · Cure Scale", "Yesterday 8:10 PM · BP cuff", "Fasting · 6:50 AM".
- Counters, not limits: "1 of 2 today". A reading beyond the plan is saved as "Extra reading".
- Emergency copy is fixed and clinician-approved: "If you feel unwell, call 1990 (Suwa Seriya)." Show the number as text.
- Units: kg, mmHg, mg/dL, %, °C, bpm. Times in 12-hour with AM/PM in English; Sinhala and Tamil follow the patient app's formats.

## Motion (summary — full rules in the Motion section)

- Entrances `ease-out-expo` with `dur-slow`–`dur-hero`; cards joining the orbit `ease-out-back`, staggered 90–110 ms; sheets slide 50 px + fade over `dur-sheet`; exits 300 ms `ease-in`. All values are tokens (`duration`, `easing`).
- Motion for React (`motion/react`) drives layout, presence and the face-following springs; anime.js v4 drives choreographed timelines (boot, greeting text, line drawing, number tickers).
- Reduced motion ("Calm motion" setting or `prefers-reduced-motion`): no orbit drift, no parallax, cross-fades only, tickers jump to the final value.

## Glass (summary — full rules in the Glass & depth section)

- Over live video, draw glass in **one WebGL pass** (blurred camera texture + rounded-rect lenses) and keep text in transparent DOM above it. Never put CSS `backdrop-filter` over the video.
- Elsewhere, CSS glass: `glass-fill` + `blur-glass` (≤ 16 px on the Pi) + `glass-edge` + `glass-specular`, at most three blurred surfaces per screen.
- Clear view (accessibility setting) swaps every glass surface for `card-solid` with `glass-edge` borders.
