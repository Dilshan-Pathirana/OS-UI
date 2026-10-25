# FreshnessChip

FreshnessChip says how old the data on screen is, so nothing ever looks "live".

**Props** — `state`: `fresh` (< 24 h, `cure-green` dot), `recent` (< 7 days, grey dot), `stale` (> 7 days, neutral `status-unknown` colours so it never looks like an out-of-target reading; the card's connector dims), `error` (sync or device problem). `children`: the words ("Updated 6 min ago").

**Use** in detail views, the clinician-facing summaries and next to synced data such as medicines and visits.
**Don't** use the word "live" anywhere.
