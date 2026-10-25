# Motion

Motion explains what just happened (a reading arrived, someone was recognised). It never decorates.

## Tokens (tokens.json families `duration` and `easing`; also `dur-sheet` 800 ms for sheets)
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

## Choreography
| Moment | Sequence |
|---|---|
| Boot | Plymouth last frame = first web frame (black, ring start). anime.js: ring draws (lime → green → blue) 1.7 s → cross scales in `ease-out-back` 0.9 s → wordmark letters stagger 55 ms → dissolve with 10 px blur 0.8 s into Ambient. |
| Wake | Ambient blurs and fades 0.9 s; camera indicator turns on immediately; face orb grows from 55 % with `ease-out-expo` 1.3 s. |
| Recognition | Ring progress 0 → 100 % over the match (≤ 1.5 s); success: ring colour to `cure-green` 0.3 s, check badge pops `ease-out-back` 0.6 s, greeting rises 14 px + fades 0.9 s. |
| Orbit entrance | Orbit lines fade 0.9 s; cards spring in from 120 px outward, scale 0.7 → 1, stagger 110 ms; connectors then hotspots stagger 90 ms; sparklines draw 1.2 s. |
| Reading arrives | Card pulse to 1.06 (0.6 s) → value ticker 1.3–1.6 s `ease-out-cubic` → meta swap → `ReadingIsland` 3 s → card back to 1. A soft chime plays once. |
| Sheet | Slides up 50 px + fades 0.8 s `ease-out-expo`; background cards dim to 16 % in 0.7 s. |
| Return to Ambient | Everything fades 0.6 s; the orb shrinks into the clock's position. |

## Library roles
- **Motion for React** (`motion` package, `motion/react`): `AnimatePresence` for screens and sheets, `layout`/`layoutId` for cards moving between Orbit and detail, `useSpring` for face following. Use `LazyMotion` + `m` on secondary screens.
- **anime.js v4** (`animejs`): `createTimeline` for boot and greeting, `svg.createDrawable` for rings and sparklines, `splitText` + `stagger` for the greeting, object tweens for number tickers. Wrap in `createScope` inside `useEffect` and `revert()` on unmount.
- Number tickers may use NumberFlow (`@number-flow/react`, MIT) instead of anime.js.

## Calm motion (reduced motion)
No orbit-marker drift, no parallax, no specular follow; scene changes become 200 ms cross-fades; tickers jump to the final value; the heartbeat dot is static. Nothing flashes more than three times per second in any mode.
