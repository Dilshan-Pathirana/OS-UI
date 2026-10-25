# VitalCard

VitalCard shows one reading in the orbit: label, value with unit, a sparkline, the reading's age and source, and — only when the doctor set a target — a StatusChip.

**Props** — `kind`: `weight` | `bp` | `sugar` | `pulse` | `spo2` | `temp` (sets the `vital-*` identity colour and default label); `label`; `value` (string, already formatted: "124/78", "62.4"); `unit`; `meta` ("Just now · Cure Scale"); `series` (numbers for the sparkline); `status` ({`tone`, `text`}); `highlight` (scales to 1.06 while a new reading lands); `stale`; `discreet` (shows ••• until tapped).

**Size** `card-width` × `card-height` (260 × 168). Value in `value` (48 px), unit in `unit`, meta in `meta` with `text-3`.
**Do** always fill `meta`. **Don't** put two readings in one card, or show a status without a target.
