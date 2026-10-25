# Build stack & sources

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
