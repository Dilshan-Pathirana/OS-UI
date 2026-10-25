# ADR-0004: Person, user account and family are separate

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
In HMS one phone = one user = one patient. Families have dependants without logins, people in several families, and adults acting for others.

## Decision
`person` is the health subject; `user_account` is a login (optional for a person); `family` is a grouping; `family_membership` is many-to-many; `guardianship` is the legal basis to act for someone. All health data references `person_id`.

## Consequences
+ Matches real families and data-subject rights. − Every endpoint must resolve "which person" explicitly; the app needs a member switcher.

## Alternatives considered
Family-owned records (break on separation, adulthood); user = patient (no dependants).
