# Button

Button is a pill-shaped action at least 64 px tall (80 px for the one primary action on a screen).

**Props** — `variant`: `primary` (`action` / `on-action`), `confirm` (`confirm` / `on-confirm`: Mark as taken, Save), `secondary` (glass), `ghost` (outline), `danger` (`danger-action`, only after an in-screen confirmation step). `size`: `md` (64 px) or `lg` (80 px). Any `button` attribute (`onClick`, `disabled`, `aria-*`).

**Do** write the label as the result ("Mark as taken", "Start check", "Use my PIN"); one primary per screen; keep the 3 px `focus-ring`.
**Don't** use icons without a label, red for anything but destructive actions, or system dialogs for confirmation.
