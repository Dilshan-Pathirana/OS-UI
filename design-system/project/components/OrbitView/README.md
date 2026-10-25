# OrbitView

OrbitView is the member screen composition: status bar, greeting in the member's language, face orb, six VitalCards in fixed slots with flowing connectors, optional ReadingIsland and the Dock — laid out on the 1280 × 800 canvas.

**Props** — `greeting`, `script` (`si` | `ta` | `en`), `subtitle`, `time`, `weather`, `state` (FaceOrb state), `vitals` (up to six VitalCard prop objects in slot order: weight, BP, glucose, heart rate, SpO₂, temperature), `island`, `dock` (Dock items).

Geometry and behaviour (face following, parallax, focus state) are in the Orbit View section. **Don't** reflow slots for fewer vitals; empty slots stay empty.
