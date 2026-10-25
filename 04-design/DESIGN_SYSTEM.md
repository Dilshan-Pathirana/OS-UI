# Cure Global — Design system across four surfaces

*v0.1 · 22 Oct 2026 · One brand, four surfaces. The source of truth is the Cure Home design system, imported unchanged to `design-system/` (same path as in Healthcare-Device, so its generators keep working — see `MIGRATION_PLAN.md`). Edit the tokens; generators write code.*

## 1. One token source, generated outputs

```
design-system/project/tokens.json          (from Cure Home: colour night/day, type, space, radius, shadow, blur, motion, sizes)
   ├─ design-system/gen_tokens.py      → apps/hub-ui/src/styles/tokens.generated.css   (existing generator, unchanged)
   ├─ packages/design-tokens/gen_web.py    → packages/design-tokens/src/base.css       (CSS variables --cg-* for admin-web and doctor-web; day default, night optional) — exists
   └─ packages/design-tokens/gen_native.py → packages/design-tokens/dist/native.ts     (typed theme for React Native: colours, type scale, spacing, radii) — Phase 2
src/base.css is committed; until the import brings design-system/ in, it is the copy gen_web.py produced from Cure Home's tokens.json.
CI runs gen_web.py --check and fails on drift (Cure Home rule).
```

## 2. Shared foundations

- **Brand:** Cure blue `#1089e3` (identity), Cure green `#2fb15a` (confirmations; `#15803d` on light), lime `#a6ce39` (thin accent only). Filled buttons use the `action` token (contrast-safe), not raw Cure blue, on light backgrounds.
- **Vital identity colours** (say *which* metric, not how it reads): weight violet, BP emerald, glucose amber, pulse red, SpO₂ sky, temperature orange. New metrics get identity colours in `tokens.json` (e.g. head circumference teal, growth indigo, cycle rose — to be added and contrast-checked).
- **Status words and symbols** everywhere: ● Within your target · ▲ Above / Below your target · ! Talk to your doctor (clinician-configured) · ? Check this reading (impossible values and unit mix-ups only). Never colour alone.
- **Safety-net text** (`CLINICAL_SAFETY.md` §4.1): a fixed, full-width notice under a value in a metric's `urgent` band — the value as measured, then what to do (measure again, call 1990 or the person's clinic). It is never styled as an error and never replaces the value.
- **Provenance line** on every value: "Just now · Cure Scale", "Yesterday 8:10 PM · BP cuff (validated)", "Estimated · Galaxy Watch".
- **Type:** Sora (display, values), Manrope (UI text), Noto Sans Sinhala / Tamil in every stack, JetBrains Mono for clinician data tables only.
- **Icons:** Lucide (`lucide-react`, `lucide-react-native`), labelled on hub and app.
- **Charts:** one charting grammar across surfaces — time on x, value on y, doctor's target as a shaded band (only when set), sources as marker shapes (filled = measured, hollow = estimated), ≤ 200 points (server summaries beyond that). Growth charts: WHO/CDC reference curves as neutral grey lines **without labels** on family surfaces; percentile labels or z-score bands appear for a family only when that child's clinician switches them on (ADR-0012 exception 1), and always in the doctor console.
- **Motion:** Motion for React + anime.js v4 on web/hub, Reanimated on mobile; tokens for durations/easings; reduced-motion respected everywhere.
- **Accessibility:** WCAG 2.2 AA; focus rings; 44 × 44 px minimum targets on web, 48 dp on mobile, 64 px on hub; text resizing to 200 % on web without loss.

## 3. Per-surface guidance

| | Family Hub | Mobile app | Doctor web | Admin web |
|---|---|---|---|---|
| Theme | Night-first (Cure Home), day variant | Light + dark (patient-app palette mapped to tokens) | Day default, dark optional | Day default |
| Density | Calm, one task per screen, values 48–72 px | Comfortable; member switcher always visible | **Dense**: tables, split panes, keyboard shortcuts | Dense; forms and tables |
| Glass | WebGL glass over camera; ≤ 3 CSS blurs elsewhere; Clear view option | Off by default (performance on low-end Android) | None | None |
| Signature | Orbit View | Member home with vitals hero (from the patient app), module tiles | Worklist + member chart | Families, doctors, catalogue, audit |
| Languages | en / si / ta | en / si / ta (new screens may start English-only with fallback) | English first | English |
| Privacy pattern | Data only for the identified member; sensitive modules never; discreet mode | "You are viewing Kamala" header; screen-capture guard; app lock | Purpose banner on break-glass; "care-team only" note badges | No PHI; break-glass banner with countdown |

## 4. Screen inventory

### 4.1 Admin web
Sign-in + MFA · Dashboard · Families list → Family (members, roles, invites, devices, consents metadata, support actions) · People (duplicates, merge, deceased, guardianship evidence) · Doctors (verification queue → doctor detail) · Care links · Catalogue (releases, modules, metrics, trackers, schedules, overrides) · **Life-stage simulator** · Content & translations · Consent policies · Hubs & peripherals · Trackers · Audit search · Break-glass · DSAR queue · Feature flags · Staff roles · Settings.

### 4.2 Doctor web
Sign-in + MFA · Onboarding/verification status · Worklist · Panel · Care requests · Family view · Member chart (Overview, Vitals, Growth, Immunisations, Pregnancy, Women's health, Elder, Special needs, Medicines, Documents, Notes, Messages, Activity log) · Targets editor · Alert rules editor · Questionnaires · Review dialog · Reports · Settings (availability text, response time, notification preferences).

### 4.3 Mobile app (new or changed vs the patient app)
Onboarding (OTP, terms, create/join family) · Family home · Member switcher · Member home · Add dependant · Invite adult · Consent & "What can the family see?" · Doctors (find, request, care team, categories) · Module screens: Growth, Vaccines, Milestones, Medicines (per slot), Documents, Symptoms, Pregnancy (timeline, BP, movements, birth), Cycle, Menopause, Wellbeing, Elder safety (map, geofences, check-ins, falls), Special needs (care profile, behaviour log, sleep diary, visual schedule editor, seizure diary) · Messages · Hub (pair, manage) · Privacy (consents, grants, access log, export, delete) · Settings.

### 4.4 Family Hub (new vs Cure Home)
Measuring-for chooser (proxy) · Infant weighing flow · Due today (Ambient counts; member details after sign-in) · Daily check-in · SOS (two-step) · Doctor review acknowledgement card · Quick logs (feed, nappy, seizure timer, fall, symptom) · Visual schedule · Growth card (neutral) · Simple mode variants.

## 5. Web component kit (`packages/ui-web`, Phase 1)
Built on Radix primitives + Tailwind v4 with the generated CSS variables: AppShell (sidebar, top bar, purpose banner), DataTable (TanStack Table, keyboard nav, column presets), FilterBar, DetailDrawer, Tabs, Form fields (react-hook-form + zod), StatusChip (● ▲ ! ?), ProvenanceLine, MetricCard, TrendChart (target band, source markers), GrowthChart (reference curves, z-score bands in doctor mode), Timeline, ConsentBadge, AuditTrail, EmptyState, ConfirmWithReason (break-glass, deletions), MFAPrompt.

## 6. Design workflow
1. Change tokens or a reference component in `packages/design-tokens` (and its Claude Design artifact if used).
2. Run the generators; commit generated outputs.
3. Screens are designed per surface in the screen inventories above, then built; Playwright screenshots (web, hub) and Maestro screenshots (mobile) are reviewed in PRs.
