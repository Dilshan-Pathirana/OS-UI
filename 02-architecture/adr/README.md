# Architecture decision records

| ADR | Decision | Status |
|---|---|---|
| [ADR-0001](0001-monorepo-and-source-import.md) | Monorepo in `cure-global`, importing the hub with history | proposed |
| [ADR-0002](0002-modular-monolith.md) | Modular monolith API with a separate worker | proposed |
| [ADR-0003](0003-postgresql.md) | PostgreSQL 17 as the system of record | proposed |
| [ADR-0004](0004-person-user-family.md) | Person, user account and family are separate | proposed |
| [ADR-0005](0005-catalogue-as-data.md) | Module catalogue as versioned data | proposed |
| [ADR-0006](0006-consent-based-abac.md) | Consent-based attribute access control with materialised grants | proposed |
| [ADR-0007](0007-hub-contract-compatibility.md) | Keep the Cure Home hub contract compatible with HMS | proposed |
| [ADR-0008](0008-identity.md) | In-house identity with asymmetric tokens, MFA and passkeys | proposed |
| [ADR-0009](0009-traccar-for-gps.md) | Traccar for GPS trackers | proposed |
| [ADR-0010](0010-fhir-r4-alignment.md) | Align with FHIR R4; don't use a FHIR server as the system of record | proposed |
| [ADR-0011](0011-sensitive-modules-off-hub.md) | Sensitive modules never render on the shared hub, unless the person opts in | proposed |
| [ADR-0012](0012-no-interpretation-on-family-surfaces.md) | Family surfaces never interpret readings | proposed |
| [ADR-0013](0013-valkey.md) | Valkey instead of Redis | proposed |

New ADRs: copy the format, next number, one decision per file. Change status to *accepted* when Dilshan approves, *superseded by ADR-xxxx* when replaced.
