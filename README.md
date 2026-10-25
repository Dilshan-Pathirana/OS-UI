# Cure Global documentation

Suggested reading order for a newcomer:
1. `01-product/VISION_AND_SCOPE.md` — what we are building and why it differs from the original brief.
2. `01-product/MEMBER_MODULES.md` — every function, by member type.
3. `02-architecture/ARCHITECTURE.md`, then `ACCESS_CONTROL.md` and `MODULE_ENGINE.md` — how the system works and stays safe.
4. `05-roadmap/ROADMAP.md`, then `RISKS_AND_DECISIONS.md` — what happens next and what needs a decision.

| Folder | Contents |
|---|---|
| `01-product/` | Vision and scope, source repo analysis, gap analysis, member modules, features by entry point, business model |
| `02-architecture/` | Architecture, data model, access control, module engine, API design, integrations, `adr/` |
| `03-compliance/` | Standards and regulations, privacy/consent/security, clinical safety |
| `04-design/` | Design system across hub, app, doctor web and admin web |
| `05-roadmap/` | Roadmap, backlog (epics E1–E21), migration plan, risks and decisions |
| `06-testing/` | Test strategy, local Docker Desktop setup, Android phone testing |
| `reference/` | Research with sources (22 Oct 2026): clinical content, standards and regulations, devices and wearables |
| `cure-home/` | Cure Home (Healthcare-Device) docs, copied by `scripts/import_sources.ps1` |

Conventions:
- Dates are absolute (e.g. "22 Oct 2026").
- Every research claim cites a source; ⚠ or [U] marks what still needs verifying.
- Decisions live in ADRs.
- Story ids (E4-03) link docs, branches and PRs.
