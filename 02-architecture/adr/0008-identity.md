# ADR-0008: In-house identity with asymmetric tokens, MFA and passkeys

*Status: proposed · Date: 2026-10-22 · Deciders: Dilshan Pathirana*

## Context
Families sign in with phone OTP + password (Sri Lankan norm); doctors and staff need strong MFA; hubs use device keys. HMS uses HS256 shared-secret JWTs and no MFA.

## Decision
Identity lives in the `identity` context: EdDSA-signed JWTs with key rotation and a JWKS endpoint; rotating refresh tokens with reuse detection; TOTP and WebAuthn passkeys (mandatory for clinicians and staff); OTP via the SMS adapter; Ed25519 device auth for hubs (ported). Token claims follow OIDC naming so an OIDC provider can be introduced later.

## Consequences
+ Fits phone-OTP families and device auth without plugins. − We own security-critical code: it gets ASVS L3 review and a dedicated penetration test. Re-evaluate Keycloak or Zitadel when third-party SMART on FHIR apps are needed (R3).

## Alternatives considered
Keycloak/Zitadel now (phone-OTP and device flows need custom extensions); a SaaS IdP (data residency and cost).
