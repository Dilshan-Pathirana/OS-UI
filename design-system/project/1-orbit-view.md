# Orbit View

The member screen and the product's signature: the identified person's face in the centre, their readings gathered around it.

## Geometry (1280 × 800 canvas)

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

## Following the face
- Track the face box in the browser (MediaPipe Face Detector) and smooth it (One-Euro filter).
- The orb and the whole orbit follow the face with a spring (stiffness 120, damping 20), clamped to ±60 px horizontally and ±40 px vertically; ignore moves under 12 px (hysteresis).
- Head-coupled parallax: z1 cards shift 2–8 px opposite to the head offset. Off in Calm motion.
- If the face leaves for > 1.5 s the orb shows the member's avatar; after 60 s the screen returns to Ambient.

## States
| State | What changes |
|---|---|
| Identifying | Orb ring progress arc 0 → 100 % over the match; landmark dots allowed during enrolment only. |
| Recognised | Ring turns `cure-green`, a 44 px check badge pops at 4:30 o'clock, greeting fades in. |
| Reading arrives | The card scales to 1.06 with `ease-out-back`, value ticks to the new number, meta becomes "Just now · <device>", a `ReadingIsland` shows "✓ Saved · 1 of 2 today" for 3 s, sparkline gains its end dot. |
| Focus (sheet open) | Cards fade to 16 % and the orb moves up 150 px at 62 % scale; the sheet takes z2. |
| Discreet mode | Values show "•••" until the member taps the card. |
| Mirror off | The orb shows the avatar instead of the face crop; everything else is the same. |

## Rules
- Never cover the face orb with a card, toast or sheet in Orbit View; sheets start below the orb's lower rim or the orb moves up first.
- Never show another member's data while one member is identified.
- Never rotate the cards around the face continuously; markers drift, cards stay in their slots.
