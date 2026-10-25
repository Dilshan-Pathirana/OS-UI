# ADR-0010: Align with FHIR R4; don't use a FHIR server as the system of record

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Interoperability is required (export, IPS, sharing with other doctors, HMS connector) but the product needs its own domain rules (consent, modules, attribution).

## Decision
Internal tables map 1:1 or 1:n to FHIR R4 resources (Patient, RelatedPerson, CareTeam, Consent, Observation, Immunization, Condition, AllergyIntolerance, MedicationStatement, DocumentReference, Questionnaire/Response, Goal, Flag). LOINC/UCUM for observations; ICD-11 for conditions by default (free; Sri Lanka is not a SNOMED International member, so SNOMED CT needs an affiliate licence there), SNOMED CT where licensed (e.g. EU/UK markets). Sri Lanka's national EHR (FHIR-based, Personal Health Number, OpenHIM) is a future integration target. Export bundles in the MVP; IPS and a read-only FHIR API with SMART scopes in R3. Mappings are tested with the official FHIR validator.

## Consequences
+ Clean domain model with standard output. − Mapping code to maintain; R5/R6 adoption later is a mapping change, not a migration.

## Alternatives considered
HAPI FHIR as the database (fights our consent/module rules); no FHIR (fails global-standard goals).
