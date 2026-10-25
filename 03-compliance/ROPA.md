# Cure Global — Records of processing activities (ROPA)

*v1.0 draft · 23 Oct 2026 · The register of processing activities (PDPA No. 9 of 2022 accountability duties; laid out like GDPR Art. 30(1)). One row per activity, as built. Risk assessment: `DPIA.md`. Data inventory per table: `DPIA.md` §2. Retention enforced by `services/api/app/privacy/retention.py` unless marked "policy". ⚠ marks items for counsel or the DPO. Keep this file current: every PR that adds a data category, processor, export path or retention rule updates it (PR checklist).*

## 1. Controller and DPO

| Item | Value |
|---|---|
| Controller | ⚠ legal entity, registration no., address |
| Representative (if offered in the EU) | ⚠ not appointed — not offered in the EU |
| Data Protection Officer | ⚠ name / external firm, `privacy@…` ⚠ address |
| Joint controllers | None. Doctors on care teams act as independent controllers for their own clinical records ⚠ counsel to confirm (affects the clinical-note and treatment rows) |
| Last reviewed | 23 Oct 2026 (draft) |

## 2. Processing activities

Lawful-basis wording uses PDPA/GDPR terms; ⚠ counsel to map each to the exact PDPA schedule condition. "Subjects" abbreviations: **F** family members with a login, **D** dependants without a login (children, adults lacking capacity), **T** teens 16–17, **P** practitioners, **S** platform staff, **C** third-party contacts (emergency/external care contacts, invitees), **G** hub guests.

| # | Activity | Purpose | Lawful basis | Subjects | Data categories | Recipients / processors | Transfers | Retention | Security measures |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Account & identity** | Sign-in, OTP, password reset, staff MFA, sessions | Contract; legitimate interest (security) | F, P, S | Name, phone, email, password hash, TOTP secret, session/device data | Cloud host; SMS gateway (OTP); email provider (staff, resets) | Per D-4 | Account life; OTP challenges purged 30 d after expiry; auth sessions and refresh tokens purged 30 d after expiry/revocation | Phone/email/TOTP envelope-encrypted, keyed hashes for lookup; argon2; EdDSA 15-min tokens; refresh reuse detection; rate limits |
| 2 | **Family management** | Families, memberships, guardianship, invitations, hub profiles | Contract; guardian consent for children (< 16) | F, D, T, C (invitees) | Names, DOB, relationships, guardianship evidence, invitee phone | Cloud host; SMS (invites) | Per D-4 | Membership: account life; invites purged expiry + 30 d | Invite phone encrypted + hashed; guardianship review for legal guardians / proxies |
| 3 | **Health record keeping** | Lifelong person-centred record: readings, trackers, conditions, medicines, vaccines, growth, documents, pregnancy and other episodes | Explicit consent (`health_data`); health care by the care team ⚠ | F, D, T | Health data incl. reproductive and mental health; documents | Cloud host; object storage | Per D-4 | Life of account + 10 y after last activity; children to age 25 or 10 y, whichever later ⚠ counsel; then archive, then erase (policy — archive tier not yet built) | Policy on every route; audit; private bucket, EXIF stripping, virus scan; storage encryption |
| 4 | **Sharing with family** | Family admins see adults' data the adult chose ("What can the family see?") | Explicit consent (`share_with_family`), withdrawable | F, T (own choice), D (via guardianship) | Health data by category | Family admins (`family_role:<family>:admin`) | — | Grants: revoked on withdrawal (row kept as evidence) | Grants per category; reproductive/mental health separate opt-ins; teen-confidential invisible to guardians |
| 5 | **Care-team access** | Doctors view, set targets/alert rules, write notes, review | Explicit consent (`share_with_care_team`); health care ⚠ | F, D, T, P | Health data in the role's categories; clinical notes | Practitioners on the care team | — | As health records; notes as health records | Care-team role categories (`ROLE_DEFAULTS`); coverage checks; notes envelope-encrypted; mandatory TOTP |
| 6 | **Alerts & notifications** | Check-in misses, SOS, doctor thresholds, safety-net bands, reminders; delivery monitoring; daily synthetic test | Consent (alert preferences) and vital interests for urgent alerts ⚠ | F, D, T, P, C (external contacts by SMS) | Alert records (incl. a copy of the reading in `alert.firing`), recipient, channel, delivery status; push tokens | SMS gateway; Expo push → FCM (Google); email provider | Expo/Google: likely outside Sri Lanka ⚠ | Notifications and deliveries 90 d; alerts with the record | Fixed texts with no values, conditions or sensitive modules (`{name}`, `{count}` only); push tokens encrypted |
| 7 | **Hub display** | Show hub-safe information and opted-in modules on the shared Family Hub; take readings there | Consent (`hub_display` per module for `hub_opt_in`); contract | F, D, T, G | Names, display names, hub-safe readings, due items, check-ins | Family members in the room | — | Hub cache 30 d after sync (on hub, policy); guest claims 15 min, purged with expired codes | `hub_safe` + `HUB_CATEGORIES`; device identity (Ed25519, device JWT); no PHI in MQTT topics |
| 8 | **Face recognition on the hub** | Recognise who is at the hub for display and attribution (not authentication for sensitive actions) | Explicit consent (`biometric_face`, `profile_photo`); guardian for children | F, D (not infants), T | Face templates (embeddings), one face thumbnail | None — stays on the hub | None | Until consent withdrawn or member removed | AES-256-GCM, member-bound AAD, TPM-sealed key, LUKS; camera frames never stored |
| 9 | **Location / GPS** (R2) | Geofences, falls, SOS, last-known position for elders/children with special needs | Consent (`location_tracking`) or documented best-interest decision by a proxy | D, F | Geofence events; raw positions in Traccar | Traccar (self-hosted, our infrastructure) | Per D-4 | Raw positions ≤ 30 d (policy — Traccar purge to configure); events with the record | Consent or best-interest record; audit + notice on position requests; safety-concern flow hides location |
| 10 | **Messaging** | Non-urgent messages between family and care team; teen confidential messages | Explicit consent; health care | F, T, P | Message subject and body | Care team | — | As health records | Subject/body envelope-encrypted; teen-confidential module flags |
| 11 | **Questionnaires** | Licensed/shippable instruments assigned by clinicians | Explicit consent; health care | F, D, T, P | Answers, clinician-only score | Care team | — | As health records | Answers envelope-encrypted; scores clinicians only |
| 12 | **Share links** | Time-limited read-only emergency summary / vitals for a third party | Consent (the person creates it) | F, D, T | Scope snapshot; access count | Whoever holds the link | Wherever opened | Until expiry or revocation; rows kept as evidence ⚠ purge rule | Token hashed; read-only; revocable; audited |
| 13 | **Exports & DSAR** | FHIR bundle, PDF report; data-subject requests (access, export, rectify, erase, restrict, object) | Legal obligation (DSAR); consent (person-initiated exports) | F, D, T | Whole record as allowed by the policy; audit extract | The requester; object storage (export zip) | — | DSAR rows: 7 y ⚠; export zips: deleted after the signed link expires | Built as the requester through the policy (teen data only to the teen); signed short-lived link; audited as `export` |
| 14 | **Support & admin** | Family/people administration, doctor verification, hub provisioning, catalogue | Legitimate interest; contract | F, P, S | Administrative data only (masked phones, roles, consent metadata); doctor licence | Platform staff by role | — | With the related records | No PHI in admin views; support actions audited with a reason |
| 15 | **Break-glass** | Time-boxed staff access to one record in an emergency or investigation | Vital interests / legal obligation ⚠ | F, D, T, S | One person's record (or listed categories) | The staff member; the DPO (review) | — | Sessions kept 7 y ⚠ | Reason, second approver or flagged emergency, ≤ 60 min, `purpose=break_glass` audit, family notified, DPO review ≤ 2 working days |
| 16 | **Safety concern** | Hide a person's data and location from named family members | Vital interests; legitimate interest ⚠ | F, D, T | Protected/restricted pair, support's note | Support staff | — | Until ended; then 7 y ⚠ | Note envelope-encrypted; named members never told |
| 17 | **Audit** | Accountability, "who viewed my record", investigations | Legal obligation; legitimate interest | All | Actor, subject, action, purpose, basis, hashed IP/user agent; ids and counts only | DPO / auditors | — | 7 y, then archive to cold storage | Hash chain verified nightly; append-only for the app role |
| 18 | **Backups** | Restore after loss or corruption (RPO 15 min, RTO 4 h) | Legitimate interest; legal obligation (security of processing) | All | Full database and object storage | Cloud host (second location) | Per D-4 | ⚠ 35 d rolling (PITR) + monthly 12 m — confirm; erasure honoured on restore by replaying the erasure log | Encrypted pg_dump + storage mirror (`scripts/backup.sh` / `.ps1`); restore drill quarterly |
| 19 | **Operations telemetry** | Hub fleet health, API/worker metrics, logs | Legitimate interest | F (hub owners), S | Hub heartbeats (no PHI), device events (ids/counts), metrics (no ids in labels), JSON logs (scrubbed) | Monitoring stack (self-hosted) | Per D-4 | Heartbeats and device events 30 d; outbox events 30 d after dispatch; logs ⚠ 30 d | Log scrubber + log-scan test; opaque ids only |
| 20 | **Analytics aggregates** | Population counts and distributions for the admin console | Legitimate interest (service improvement) — aggregates only | All (aggregated) | Counts, distributions; no identities | Platform staff | — | Computed on demand | k ≥ 5 suppression; no identities |
| 21 | **Billing (R3)** | Plans, subscriptions, payments | Contract; legal obligation (tax) | F | Payer name, plan, payment references (no card data) | Payment gateway ⚠ | ⚠ | ⚠ tax law period | Out of scope until R3 — addendum required |

## 3. Processors and recipients

| Processor | Service | Data | Location | Agreement |
|---|---|---|---|---|
| Cloud provider ⚠ (D-4) | Compute, managed Postgres 17 (PITR), object storage, KMS, secrets | All platform data | ⚠ region | ⚠ DPA to sign |
| SMS gateway ⚠ (local) | OTP, invitations, alerts to external contacts | Phone number, fixed text | ⚠ | ⚠ |
| Expo (push service) → Google FCM | Push notifications | Push token, fixed text | USA ⚠ | ⚠ Expo terms + Google terms |
| Email provider ⚠ | Staff sign-in, resets, alerts | Email, fixed text | ⚠ | ⚠ |
| Traccar | GPS server | Positions | Self-hosted (our infrastructure) | n/a (software, not a processor) |
| Pen-test vendor ⚠ | Security test | Synthetic data only | ⚠ | NDA + rules of engagement (`PEN_TEST_PLAN.md`) |

## 4. International transfers

| Transfer | Safeguard | Status |
|---|---|---|
| Hosting outside Sri Lanka (if D-4 chooses a regional cloud) | PDPA cross-border rules: adequacy/Authority-approved safeguards or listed exceptions ⚠ | Open — decision D-4 |
| Push via Expo/FCM | Fixed texts only (no health data); contract terms ⚠ | Open |
| Diaspora family members (e.g. a carer in Dubai) viewing data | Data subject's own choice (grant) ⚠ counsel: is this a transfer by the controller? | Open |

## 5. Data-subject rights handling

| Right | How | SLA |
|---|---|---|
| Access / export | `POST /api/v1/persons/{id}/dsar` (type `access` or `export`) → DSAR queue → export zip (FHIR + PDF + audit extract), signed link | 1 month, extendable once by 2 months (`dsar_request.due_on`, `extended_to`) |
| Rectification | Records: amend with history (`observation_revision`); identity fields: DSAR `rectify` flow | 1 month |
| Erasure | DSAR `erase` flow; blocked by an active `legal_hold`; tombstone in the audit log; consent rows kept as evidence | 1 month |
| Restriction / objection | DSAR `restrict` / `object`, handled by the DPO manually (DPIA A-13) | 1 month |
| Withdraw consent | Any surface; takes effect everywhere, grants revoked in the same transaction | Immediate |
| Transparency | "Who viewed my record" (`app/consent/access_log.py`) | Immediate |

## 6. Change log

| Version | Date | Change |
|---|---|---|
| 1.0 draft | 23 Oct 2026 | First register from the as-built system |
