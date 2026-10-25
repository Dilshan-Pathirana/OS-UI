# ADR-0002: Modular monolith API with a separate worker

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
A small team, one relational database and strong consistency needs (consent ↔ access ↔ data in one transaction).

## Decision
One FastAPI service (`services/api`) split into bounded contexts (`ARCHITECTURE.md` §2.2), each with its own models, router, service and tests, talking to others only through service interfaces. Background work runs in a `worker` process from the same codebase (arq on Valkey) fed by a transactional outbox.

## Consequences
+ Simple deploys, one migration stream, easy local runs. − Discipline needed to keep boundaries (import-linter rules in CI). Splitting a context later is possible because it owns its tables.

## Alternatives considered
Microservices from day one (operational cost far above team size); extending HMS (inherits its scope and debt).
