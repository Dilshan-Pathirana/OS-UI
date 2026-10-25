# ADR-0003: PostgreSQL 17 as the system of record

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
HMS runs MySQL 8 with mixed collations and naive timestamps. Cure Global needs `timestamptz`, JSONB validation, native partitioning for billions of observations, row-level security as a second line of defence, and broad managed hosting.

## Decision
PostgreSQL 17. UUIDv7 keys, monthly partitions for `observation`, `tracker_entry`, `audit_event`. Application-level envelope encryption for sensitive columns.

## Consequences
+ Better fit for time series and JSON; RLS. − HMS code using MySQL-specific SQL must be adapted when ported; the HMS connector bridges the two systems via API, never via shared DB.

## Alternatives considered
MySQL 8 (team familiarity, but weaker JSON/partition/RLS story); TimescaleDB (useful later as an extension if summaries aren't enough).
