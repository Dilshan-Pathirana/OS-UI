# ADR-0009: Traccar for GPS trackers

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Elder safety needs GPS watches/pendants; they speak dozens of vendor protocols.

## Decision
Run Traccar (Apache-2.0) as a separate service with its own database schema. Cure Global registers trackers and geofences in Traccar through its API and receives events (geofence enter/exit, SOS/alarm, fall, low battery, offline) by webhook. Raw positions stay in Traccar with a ≤ 30-day retention; Cure Global stores only events.

## Consequences
+ Wide device support, mature geofencing, phone client available. − Another service to run and patch; identities must never be stored in Traccar (opaque device names only).

## Alternatives considered
Writing protocol decoders ourselves; a commercial tracking SaaS (data leaves our control).
