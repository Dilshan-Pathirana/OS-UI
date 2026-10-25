# ADR-0001: Monorepo in `cure-global`, importing the hub with history

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Cure Global needs the Family Hub (built in Healthcare-Device), the mobile app (patient-app), new web consoles and a new backend. Keeping five repos in step (contracts, clinical rules, i18n, design tokens) is what made Cure Home's `HMS_AND_APP_CHANGES.md` necessary.

## Decision
One monorepo, `cure-global`, with `apps/`, `services/`, `packages/`, `infra/`, `docs/`. pnpm workspaces for TypeScript and uv for Python. The hub components and the shared packages are imported from Healthcare-Device **with git history** (`git subtree add` per path, see `docs/05-roadmap/MIGRATION_PLAN.md`); the patient app is imported the same way into `apps/mobile`. HMS code is ported by hand (selected modules only).

## Consequences
+ One pull request can change the API, the hub and the app together; shared packages have one version. − The Expo app needs monorepo-aware Metro config; CI must build only what changed (path filters). Healthcare-Device stays the home of the Cure Home pilot until it is absorbed (ADR-0007).

## Alternatives considered
Separate repos with a shared npm/PyPI package (more release overhead); copying files without history (loses blame and context).
