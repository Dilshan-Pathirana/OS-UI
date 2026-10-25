# Cure Global — Privacy, consent and security

*v0.1 · 22 Oct 2026 · Privacy by design, the consent model, the security controls and the incident process. Access rules: `docs/02-architecture/ACCESS_CONTROL.md`.*

## 1. Data inventory (summary for the records of processing)

| Category | Examples | Special category? | Lawful basis (PDPA/GDPR terms) | Where |
|---|---|---|---|---|
| Identity & contact | Name, DOB, phone, email, address, NIC/PHN | Children's data: yes (PDPA) | Contract + consent | API DB (encrypted fields) |
| Health | Readings, conditions, medicines, vaccines, documents, notes | Yes | Explicit consent; health care by the care team | API DB, object storage |
| Reproductive & mental health | Cycle, pregnancy, wellbeing | Yes (sensitive within health) | Explicit, separate consent | API DB; never on hub |
| Biometric | Face embeddings, profile-photo thumbnail on the hub | Yes | Explicit consent (`biometric_face`, `profile_photo`) | **Hub only** (encrypted); photo in private storage |
| Location | Geofence events; raw positions in Traccar | Treated as sensitive | Consent or documented best-interest decision by a proxy | Traccar (≤ 30 days), API DB (events) |
| Device & usage | Hub heartbeat, app versions, crash data | No | Legitimate interest / contract | Telemetry (no PHI) |
| Audit | Who accessed what | No (but may reveal health context) | Legal obligation / legitimate interest | Audit partitions |

## 2. Consent model

- **Purposes** (each versioned, per language): `platform_terms`, `health_data`, `share_with_family` (via grants), `share_with_care_team`, `biometric_face`, `profile_photo`, `location_tracking`, `hub_display` (show one `hub_opt_in` module on the shared hub — ADR-0011; for teen-confidential data only the person's own consent), `teen_confidentiality` (acknowledgement), `research` (separate; off by default; not used in the MVP), `marketing` (separate; off by default).
- **Who gives it:** the person; a guardian for a child under 16 (PDPA); a health proxy for an adult who lacks capacity (best-interest decision recorded with who decided, when, why); assisted consent (staff or family helping, attested and notified to the person).
- **Granularity:** purpose × person × (for sharing) grantee × categories.
- **Withdrawal wins:** a withdrawal on any surface takes effect everywhere: grants revoked in the same transaction, the hub refreshes within 15 minutes or sooner, face data deleted on the hub, care-team access that depended on it ends.
- **Re-consent:** when a policy version changes materially, affected people are asked again at next sign-in; processing that depends on it pauses if refused.
- **At 16 and 18:** the person re-confirms consents given by guardians (`ACCESS_CONTROL.md` §5 rules 4 and 5; BACKLOG E4-11 and E3-08). Until they answer, earlier consents stay in force.
- **Evidence:** every consent row stores method, actor, policy version, device, timestamp; never deleted (withdrawal is a state).

## 3. Privacy by design rules

1. **Data minimisation per surface:** the hub gets hub-safe modules only, plus `hub_opt_in` modules the person switched on; notifications carry no health data; telemetry carries no PHI; support staff see administrative data only.
2. **No third-party analytics or advertising SDKs** in the app, hub or web. Product analytics, if any, are first-party, aggregated and exclude health events.
3. **Sensitive categories never leave by accident:** exports, share links, FHIR API and doctor PDFs respect teen confidentiality and category grants (tested in the access matrix).
4. **Location minimisation:** geofence events, not tracks; last-known location on request with audit and notice.
5. **Face data stays on the hub** (Cure Home rule 1): templates and thumbnails encrypted with a hardware-sealed key; nothing face-related uploaded.
6. **Retention schedule** enforced by jobs (`DATA_MODEL.md` §8).
7. **Transparency:** "who viewed my record" for every person (and guardians for children); plain-language privacy notice in en/si/ta.
8. **Data-subject requests** handled in the admin console within 1 month (PDPA, extendable to 3).
9. **Research and AI:** any secondary use (research, model training) needs separate opt-in consent, de-identification and an ethics approval; none in the MVP.

## 4. DPIA plan

| Step | Content | Owner |
|---|---|---|
| Describe processing | Data flows per entry point, processors (cloud, SMS, push, email), transfers | Product + engineering |
| Necessity & proportionality | Why each category is needed per module; retention | Product + DPO |
| Risks to individuals | Re-identification, family coercion (e.g. controlling partner using location), teen disclosure, elder surveillance, biometric misuse, breach, wrong attribution of readings | DPO + clinical safety |
| Measures | Consent design, grants, teen confidentiality, proxy evidence review, location minimisation, encryption, audit, break-glass controls, abuse reporting ("I don't want this person to see my data" fast path) | All |
| Sign-off | DPO opinion; residual risk accepted by management | DPO, Dilshan |

**Family-abuse safeguard:** an adult can remove a grant or leave a family without the admin's approval; support has a confidential "safety concern" flow that hides a person's location and data from named family members immediately.

## 5. Security controls

### 5.1 Identity and access
- Phone OTP + password for families; app lock; optional passkeys.
- **Mandatory MFA** (TOTP or passkey) for doctors and staff; re-authentication for exports, break-glass, bulk changes.
- EdDSA-signed short-lived access tokens (15 min), rotating refresh tokens with reuse detection, revocation on password change (`tokens_valid_after`).
- Device identity for hubs (Ed25519; TPM/secure element in production), rotating refresh, revoke from app/admin.
- Rate limits in Valkey per user, device and IP; account lockout with backoff; OTP attempts limited and HMAC-bound (HMS pattern).

### 5.2 Data protection
- TLS 1.2+ (1.3 preferred) everywhere; HSTS; certificate pinning on the hub (from Cure Home) and optionally on the app.
- Encryption at rest: managed database and storage encryption + **application-level envelope encryption** for identifiers, contact data, notes, messages, location, geofence geometry. Keys in a KMS; rotation yearly or on incident.
- Private object storage only; short-lived signed URLs issued after authorisation; EXIF stripped; antivirus scan on upload; content-type checks.
- Backups encrypted, in a second location, restore-tested quarterly.

### 5.3 Application security
- OWASP ASVS 5.0 L2 baseline, L3 for authentication, session management and access control; MASVS 2.1 L2 + PRIVACY for the app.
- Every route declares its policy (a route without one fails CI).
- Input validation by Pydantic + catalogue schemas; output encoding in React; strict CSP on web apps and the hub kiosk.
- Dependency scanning, SAST (Semgrep/Bandit/ESLint security rules), secret scanning, container image scanning; SBOM per release (CycloneDX); signed images.
- Threat models (STRIDE) per entry point, updated per release.
- Annual external penetration test; before the pilot one covering API, web, app and hub.

### 5.4 Infrastructure
- Private networking for DB/Valkey/storage; least-privilege IAM; app DB role cannot UPDATE/DELETE audit partitions.
- Infrastructure as code with review; no manual changes in production.
- Hub: read-only root, encrypted data partition, kiosk lockdown, SSH off in production, signed A/B OTA (Cure Home plan).
- Logging without PHI; security events forwarded to monitoring with alerting.

### 5.5 Audit
- `audit_event` rows for every PHI read/write, with actor, subject, purpose and basis; hash chain verified nightly; 7-year retention.
- Break-glass sessions reviewed by the DPO within 2 working days.

## 6. Incident response

| Step | Target |
|---|---|
| Detect & triage (on-call) | ≤ 1 h for high severity |
| Contain | As fast as possible; revoke tokens/keys/devices |
| Assess personal-data impact | ≤ 24 h |
| Notify the Data Protection Authority (PDPA) and affected people as the Act and DPA rules require | Within the statutory deadline (confirm with counsel) |
| EU products: CRA early warning to ENISA/CSIRT for actively exploited vulnerabilities | 24 h early warning, 72 h notification |
| Post-incident review, CAPA | ≤ 10 working days |

Runbooks live in `docs/06-operations/` (`RUNBOOK.md`, `SUPPORT_PLAYBOOK.md`); the breach procedure, checked against this table, is `docs/03-compliance/BREACH_PROCEDURE.md` (P6).
