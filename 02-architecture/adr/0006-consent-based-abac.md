# ADR-0006: Consent-based attribute access control with materialised grants

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Roles alone can't express "admin sees an adult's vitals only if that adult agreed", teen confidentiality, guardianship or care-team scopes.

## Decision
One policy function (`ACCESS_CONTROL.md` §7) decides every request from relationships, consents, grants and module sensitivity. Derived grants (guardianship, care teams) are materialised in `access_grant` so "who can see this person" is one query. The access matrix is an automated test.

## Consequences
+ Explainable decisions ("you can see this because…"), auditable. − Every new endpoint must call the policy (enforced by a router dependency and a test that fails on unprotected routes).

## Alternatives considered
Pure RBAC (over-shares); an external policy engine such as OPA (another moving part; possible later).
