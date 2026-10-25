# StatusChip

StatusChip states how a reading compares to the target the member's doctor set — always as symbol plus words.

**Props** — `tone`: `good` (● Within your target), `watch` (▲ Above/Below your target), `attention` (! Talk to your doctor — only when the clinician configured that level in HMS; fixed text, no sound, not an alarm), `unknown` (? Check this reading). `children`: the words.

**Use** only when a clinician target exists in HMS; without one, show the trend and no chip. Words are fixed (see Voice). Colours come from `status-*`, `status-*-text`, `status-*-bg`.
**Don't** write "high", "abnormal", "danger" or a diagnosis; never use colour alone.
