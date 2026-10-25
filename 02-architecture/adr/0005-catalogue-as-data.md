# ADR-0005: Module catalogue as versioned data

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Functions differ by life stage, sex, pregnancy, special needs, country and doctor choice, and will keep changing.

## Decision
Modules, metrics, trackers, schedules and country packs are YAML in `packages/module-catalogue`, validated by JSON Schemas in CI, loaded into the database as a release, overridable by the super admin, and resolved per person by a pure resolver (`MODULE_ENGINE.md`).

## Consequences
+ New modules and schedule changes without app releases; one source for API, app, hub and web. − Screens still need code for new kinds of UI; the catalogue only switches and configures them.

## Alternatives considered
Hard-coded member types (wrong within months); a generic form builder (too loose for clinical data).
