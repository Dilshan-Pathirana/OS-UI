# Sparkline

Sparkline draws the last 7–12 readings as a smooth line that never overshoots a real reading (control points at the x-midpoint, as in the Cure patient app), with a dot on the newest value.

**Props** — `values` (numbers, oldest first), `color` (the card's `vital-*` token), `width`, `height`, `endDot`.

**Use** inside VitalCard; for BP pass systolic values. Fewer than two readings draws a faint dashed baseline.
**Don't** add axes or labels here (use the Vital detail chart) or animate it continuously; it draws once (1.2 s) when data changes.
