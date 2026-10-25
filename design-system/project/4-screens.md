# Screens & flows

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

## Flow rules
- Any screen returns to Ambient after inactivity (60 s member, 20 s guest) or when the member taps **Done**.
- Back is always a visible button (top-left, 64 px), never a gesture only.
- One primary action per screen; destructive actions need a second, explicit confirmation step built into the screen (no system dialogs).
- Measurement screens never block: "Waiting for your scale…" shows a cancel button and times out after 2 minutes with a helpful message.
