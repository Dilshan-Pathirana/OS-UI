# GlassPanel

GlassPanel is the surface every Cure Home card, sheet and dialog is built on: frosted glass over the aurora, or a solid card in Clear view.

**Props** — `material`: `glass` (cards; `glass-fill` gradient + `blur-glass`), `strong` (sheets and long text; `glass-fill-strong`), `solid` (Clear view; `card-solid`). `radius`: `card` (28), `panel` (36, sheets), `inner` (16). `padding`, `style`, `children`.

**Use** glass for z1 cards, strong for z2 sheets, solid whenever the member turns on Clear view or the screen sits over a bright, busy backdrop.

**Do** keep at most three blurred panels per screen on the Pi; nest content with concentric radii (panel 36 → inner 16 at 20 px padding is wrong; card 28 → inner 16 at 12 px is right).
**Don't** place a GlassPanel over the live camera with CSS blur — over video the lens glass is drawn in WebGL and this component only holds the text.
