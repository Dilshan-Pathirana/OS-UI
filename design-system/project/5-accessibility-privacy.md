# Accessibility & privacy

## Accessibility
- Contrast: `text`, `text-2` and `text-3` pass 4.5:1 on `glass-fill` over `canvas` in both themes; status and vital colours pass 4.5:1 as text on glass in their theme. Check over the worst-case camera frame (a bright window behind the user) with adaptive dimming on.
- Targets ≥ 64 px (≈ 11 mm) with ≥ 12 px gaps; primary actions 80 px.
- Text size setting: Standard, Large (+20 %), Extra large (+40 %, Orbit View drops to four slots and scrolls the rest).
- **Clear view**: solid `card-solid` surfaces, no blur, no aurora behind text.
- **Calm motion**: see Motion.
- Status never by colour alone: symbol + word on every chip.
- Every control has an accessible name in the member's language; focus order follows the visual order (cards clockwise from top-left).
- Sound cues accompany key events (recognised, reading saved, reminder) so members who don't read the screen still know something happened; volume and quiet hours in Settings.
- Language per member; switching language never changes layout positions.

## Privacy patterns
- **Camera indicator** always visible while the camera is on: "● Camera on device only" in the status bar, plus the hardware LED.
- **Shutter closed** → the camera icon shows `CameraOff`, Orbit View uses avatars, PIN sign-in is offered.
- **Only the identified member's data.** A second enrolled member with no measurement running → "Who's measuring?" chooser (never a silent switch). A measurement running, or an unknown face → keep the session and show "Someone else is here — tap to hide your readings".
- **Discreet mode** hides values until tapped; good for weight.
- **Guest mode** stores nothing unless the guest scans the QR to claim the reading.
- **Forget me** (Settings → Family → member, PIN) deletes the face template on the hub and records consent withdrawal.
- **Sensitive actions** (sharing settings, deleting, pairing a phone, viewing history older than 90 days) ask for a PIN.
- Never show raw camera frames anywhere except the live face crop in the orb; never show the body.
