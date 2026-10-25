# ADR-0007: Keep the Cure Home hub contract compatible with HMS

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Cure Home's hub already runs against HMS `/api/v1/hub/*` (implemented 22 Oct 2026) and has a pilot plan. Cure Global reuses the same hub.

## Decision
Cure Global's `devices` context implements the same paths and shapes, adding fields and endpoints only in backward-compatible ways (`ARCHITECTURE.md` §4). `hub-core` gets `HUB_BACKEND=hms|cure-global` for the few behaviours that differ (e.g. module-driven cards). Contract tests from `hms-stub` run against both.

## Consequences
+ One hub build for both products; the Cure Home pilot is not disrupted. − New hub features must degrade gracefully when the backend is HMS.

## Alternatives considered
Fork the hub (two codebases to maintain); move Cure Home onto Cure Global before its pilot (delays the pilot).
