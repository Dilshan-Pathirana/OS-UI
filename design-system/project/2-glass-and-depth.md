# Glass & depth

Cure Home mixes three ideas: glassmorphism (frosted surfaces), Liquid Glass (lensing, specular light, materialising) and spatial UI (depth planes and dimming). This section turns them into rules that hold up on a Raspberry Pi 5 and for older eyes.

## Materials

| Material | Where | Recipe |
|---|---|---|
| **Lens glass** | Over the live camera (Orbit View, recognition) | One WebGL2 pass: camera texture at 50–66 % resolution → dual-Kawase blur at ¼–⅛ resolution → for each card a rounded-rectangle SDF lens samples the blurred texture, adds edge refraction from the SDF gradient, a rim specular highlight and an adaptive dim. Card text and charts are transparent DOM on top. |
| **Frosted glass** | Screens without video (Ambient, sheets, settings) | `background: linear-gradient(155deg, glass-fill-strong 0%, glass-fill 45%)`, `backdrop-filter: blur(blur-glass) saturate(150%)`, 1 px `glass-edge` border, inset top highlight `glass-specular`, `shadow-card`. Max three per screen. |
| **Solid** | Clear view setting, low-power mode, long text | `card-solid` fill, 1 px `glass-edge` border, `shadow-card`. Same radii and spacing as glass. |

## Liquid Glass behaviours
- **Lensing, not blur alone:** edges bend the background slightly; centres stay readable.
- **Materialise:** surfaces appear by increasing refraction and opacity together (500 ms), not by a plain fade.
- **Specular light:** a soft highlight at the top-left edge (`glass-specular`); it may follow head position by ±4 px (off in Calm motion).
- **Adaptive dimming:** sample the mean luminance behind each card (⅛-resolution read-back) and raise the dim until `text` over it passes 4.5:1. Add `scrim` (35 %) behind sheets when the backdrop is bright.
- **Concentricity:** nested radii share a centre: outer − padding = inner.
- **Never glass on glass** at the same depth; never animate the blur radius (animate opacity and refraction instead).

## Depth planes
| Plane | Contents | Treatment |
|---|---|---|
| z0 | Canvas, aurora, face orb | No shadow; aurora drifts ≤ 0.2 Hz |
| z1 | Orbit cards, dock, ambient cards | `shadow-card`; parallax 2–8 px |
| z2 | Sheets, dialogs, PIN pad, enrolment | `shadow-float`; z1 dims to 16 % and scales to 0.96; scrim behind |

## Pi 5 budgets
≤ 3 CSS `backdrop-filter` surfaces per screen (none on the camera screen), blur ≤ 16 px (`blur-glass`); none over video; ≤ 12 animated layers; one WebGL canvas; 60 fps target, 30 fps floor. `will-change` only while animating.
