# ADR-0013: Valkey instead of Redis

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Redis changed its licence in 2024; the platform needs a Redis-protocol cache and queue without licence ambiguity for a commercial SaaS.

## Decision
Use Valkey 8 (BSD-3-Clause, Linux Foundation). Clients use the Redis protocol, so switching back is a config change.

## Consequences
+ Clear licence. − None material.

## Alternatives considered
Redis (licence review needed per version); RabbitMQ (extra system just for jobs).
