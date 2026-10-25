# Cure Global — Personal-data breach procedure

*v1.0 draft · 23 Oct 2026 · What on-call, the incident lead and the DPO do when personal data may have been lost, disclosed, altered or made unavailable. Implements `PRIVACY_CONSENT_SECURITY.md` §6 and the PDPA No. 9 of 2022 breach duties. Operational detail (alerts, restore, key rotation, hub swap-out) lives in `docs/06-operations/RUNBOOK.md`; this document owns the personal-data decisions. ⚠ marks points for counsel. Approval: DPO + management before the pilot.*

## 1. Check against PRIVACY_CONSENT_SECURITY.md §6

| §6 step (target) | Covered by | Status | Fix / note |
|---|---|---|---|
| Detect & triage (≤ 1 h for high severity) | §3 detection sources; alert rules in `infra/observability/`; on-call in `RUNBOOK.md` | **Partial** | Software covered (alerts, audit-chain check, log scan). People gap: an on-call rota with phone numbers must exist before the pilot |
| Contain (as fast as possible; revoke tokens/keys/devices) | §6 containment playbooks | **Partial** | Per-account session revocation, hub revocation, share-link revocation by the creator and JWT/KEK rotation exist. Gaps: (a) no bulk "revoke every session" action — use the SQL step in §6.1 until an admin action exists; (b) staff cannot revoke someone else's share link from the console — SQL step in §6.5; (c) `services/api/scripts/rotate_kek.py` does not yet re-wrap notes, messages, review messages, questionnaire answers, safety/capacity reasons, push tokens or OTP identifiers (DPIA A-4), so an old KEK cannot be retired yet |
| Assess personal-data impact (≤ 24 h) | §7 impact assessment; audit search `GET /api/v1/admin/audit`; "who viewed" access log | **Covered** | Query recipes in §7.2 |
| Notify the Data Protection Authority and affected people as the Act and DPA rules require | §8 notification; templates §11 | **Gap (legal)** | ⚠ Counsel: the PDPA notification deadline and form (the DPA rules may set it); until confirmed, **plan for 72 hours** from awareness |
| EU products: CRA early warning 24 h / notification 72 h | §8.3 | **N/A now** | Cure Global is not on the EU market; revisit if it is |
| Post-incident review, CAPA (≤ 10 working days) | §10 | **Covered** | CAPA tracked in the breach register (§9) |
| — (not in §6) Evidence preservation | §5 | **Added** | Audit-chain verification before and after containment |
| — (not in §6) Exercise | §12 | **Added** | Tabletop before the pilot |
| §6 last line: "Runbooks live in `docs/07-operations/`" | `docs/06-operations/RUNBOOK.md` | **Doc fix** | Update the path in `PRIVACY_CONSENT_SECURITY.md` §6 |

## 2. What counts as a personal-data breach

A security incident that leads to accidental or unlawful **destruction, loss, alteration, unauthorised disclosure of, or access to** personal data. Examples for Cure Global:

- A guardian or family member sees data the policy should have hidden (teen-confidential data, an adult's ungranted category) — an **access-policy defect is a breach** even if only one record leaked.
- Health data in a log, MQTT topic, push/SMS/email text, crash report or analytics (CLAUDE.md rule 7).
- A shared hub shows a sensitive module (ADR-0011).
- A reading attributed to the wrong person and shown to another family member (HZ-01).
- A lost or stolen hub or phone with a live session; a leaked share link.
- Database, backup or bucket exposure; stolen credentials; KEK or JWT key exposure.
- Unavailability: data lost with no restore (ransomware, failed restore).
- A staff member reading a record without a break-glass session, or a break-glass session found inappropriate on DPO review.

Near misses (caught before anyone saw data) are logged in the register as `near_miss` and reviewed the same way.

## 3. Detection sources

| Source | Signal | Where |
|---|---|---|
| Monitoring alerts | Error-rate spikes, 401/403 storms, refresh-token reuse, rate-limit hits, outbox/notification failures, hub fleet anomalies | Alert rules in `infra/observability/`; `RUNBOOK.md` |
| Audit-chain verification | Nightly `verify_audit_chain` fails (worker logs `AUDIT CHAIN BROKEN`; admin console shows it) | `services/api/app/worker.py`, `GET /api/v1/admin/audit/chain` |
| Log-scan test / log review | PHI pattern found in logs (CI test or a production scan with the same scrubber patterns) | `services/api/tests/test_log_scan.py`, `services/api/app/platform/logs.py` |
| Break-glass review | DPO marks a session `inappropriate` | `POST /api/v1/admin/break-glass/{id}/review` |
| User reports | Family, doctor or staff report via the WhatsApp support line, email or in-app | Support playbook (`docs/06-operations/SUPPORT_PLAYBOOK.md`) |
| Security researchers | Vulnerability disclosure (policy to publish before the pilot) | ⚠ `security.txt` / disclosure policy |
| Processors | SMS / push / email / cloud provider breach notice | Processor contracts |
| Scanners | Secret found by gitleaks; critical CVE in a running image | CI (`SECURITY_ASSESSMENT.md`) |

## 4. Roles

| Role | Who | Does |
|---|---|---|
| On-call engineer | Rota ⚠ | First response, triage, containment steps, opens the incident record |
| Incident lead | Engineering lead (deputy: on-call senior) | Owns the incident, decides severity with the DPO, coordinates |
| DPO | ⚠ appointed DPO | Decides whether it is a notifiable breach, notifies the Authority, approves notices to people, owns the register |
| Clinical Safety Officer | CSO | Clinical impact (wrong attribution, missed alerts, altered readings); may require clinical follow-up of affected people |
| Communications | Product owner (Dilshan) | Notices to families, doctors, partners; media; approved by the DPO |
| Counsel | ⚠ | Legal deadlines, law-enforcement contact, contractual notices |

## 5. Evidence preservation (do first, then keep doing)

1. Open the incident record (breach register row, §9) with the time you became **aware** — the notification clock starts here.
2. Verify the audit chain **before** containment changes anything: `POST /api/v1/admin/audit/chain/verify` (role `super_admin` or `dpo_auditor`). Record the result id. Repeat after containment.
3. Snapshot what you will change: export the relevant audit range (`GET /api/v1/admin/audit?subject=…&from=…&to=…`), the affected rows' ids (never values) and the deployment version.
4. Preserve logs and take a database snapshot / PITR marker (`RUNBOOK.md`, restore section). Do not delete anything that could be evidence; retention jobs for affected tables can be paused by a **legal hold** (`legal_hold`, migration 0009).
5. Keep notes in the incident record with ids and counts only — no health values or names in tickets or chat.

## 6. Containment playbooks

### 6.1 Compromised user or staff account
- One account: Super Admin → family → support action `end_sessions` (`POST /api/v1/admin/families/{family_id}/support-actions`, reason required) — revokes every session of that account. A password reset sets `user_account.tokens_valid_after`, which also kills outstanding access tokens.
- Staff: remove the staff role (`DELETE /api/v1/admin/staff-roles/{id}`), which ends their sessions.
- Practitioner: suspend (`POST /api/v1/admin/practitioners/{id}/suspend`), which ends their sessions and care-team access.
- **Everyone** (key or database compromise): until a bulk action exists, run under change control: `UPDATE user_account SET tokens_valid_after = now();` and `UPDATE auth_session SET revoked_at = now(), revoked_reason = 'incident' WHERE revoked_at IS NULL;` — every client must sign in again.

### 6.2 Lost, stolen or tampered Family Hub
- Revoke: Super Admin → Hubs → revoke (`POST /api/v1/admin/hubs/{device_id}/revoke`) or the family's owner/admin in the app (`DELETE /api/v1/hubs/{device_id}`). Revocation kills the hub's refresh chain; the device JWT expires within its lifetime.
- Face templates stay encrypted on the hub (TPM-sealed key, LUKS partition); nothing face-related is on the server to revoke. Ask the family to report theft to the police if the hub is not recovered.
- Swap-out: `RUNBOOK.md` hub swap-out.

### 6.3 JWT signing key exposure
- Generate a new Ed25519 key, set `JWT_PRIVATE_KEY`, move the old public key to `JWT_PREVIOUS_PUBLIC_KEYS` only if you want existing tokens to keep working — in a compromise, **do not** list it, so every token signed with the old key fails at once; then run §6.1 "Everyone".

### 6.4 Data-encryption key (KEK) exposure
- Rotate: new secret in `DEV_KEK` (KMS key in production), old one in `DEV_KEK_PREVIOUS`, restart api + worker, then `uv run python scripts/rotate_kek.py` (from `services/api`; `--dry-run` first; `--rehash` if `LOOKUP_HASH_KEY` is unset). ⚠ Until DPIA A-4 is fixed the script does not re-wrap every encrypted column, so the old KEK must stay listed; treat the columns it skips as exposed.
- If the lookup-hash key is exposed: set a new `LOOKUP_HASH_KEY` and run with `--rehash`.

### 6.5 Leaked share link
- The creator revokes it in the app (`DELETE /api/v1/share-links/{link_id}`). Staff, until a console action exists: `UPDATE share_link SET revoked_at = now() WHERE id = '<id>';` (or by `created_by_person_id` for all of a person's links). The access count and last access time on the row show whether it was opened.

### 6.6 Access-policy or export defect (data shown to the wrong person)
- Turn the path off: feature flag (`PUT /api/v1/admin/feature-flags/{key}`) or roll back the release (`RUNBOOK.md`). For the hub, the next members refresh (≤ 15 min) removes data once the policy is fixed.
- Identify every disclosure from the audit log (`action = read|export`, `basis`, `purpose`, `resource_type`) for the affected period.

### 6.7 PHI found in logs, topics or notification texts
- Stop the source (hotfix or flag), then purge the affected log range at the log store and in backups of logs; record where copies went (log processor, support tickets).
- Add the pattern to the scrubber (`app/platform/logs.py`) and a case to `tests/test_log_scan.py`.

### 6.8 Processor breach (SMS, push, email, cloud)
- Get the processor's incident details in writing; rotate the credentials they hold; assess what data they had (texts are fixed and carry no health values — confirm).

## 7. Impact assessment (≤ 24 h)

### 7.1 Severity matrix

| | **Data**: non-sensitive admin data (masked, counts) | **Data**: contact/identity data | **Data**: health data | **Data**: reproductive / mental health, teen-confidential, biometric, location, children's data |
|---|---|---|---|---|
| **1 person, contained, no evidence of misuse** | Low | Low | Medium | High |
| **2–50 people or misuse possible** | Low | Medium | High | Critical |
| **> 50 people, or published / exfiltrated** | Medium | High | Critical | Critical |

Raise one level for: data seen by someone with power over the person (controlling partner — HZ-13; guardian of a teen — HZ-12), clinical harm possible (CSO), or the data cannot be recovered. **High and Critical are notifiable by default**; Medium is decided by the DPO and recorded; Low is registered.

### 7.2 Query recipes (ids and counts only)
- Who saw what: `GET /api/v1/admin/audit?subject=<person_id>&from=&to=` and the person's access log; for a defect, filter by `resource_type` and `basis`.
- Which people: collect `subject_person_id` values; count them; map to families for notices (names are looked up only when the notice is sent).
- Break-glass: `GET /api/v1/admin/break-glass` for sessions in the window.

## 8. Notification

### 8.1 Data Protection Authority (Sri Lanka)
- **Deadline:** within the statutory deadline — ⚠ confirm with counsel (the PDPA and DPA rules); **plan for 72 hours from awareness**. If not all facts are known, notify what is known and follow up.
- **Content:** nature of the breach, categories and approximate numbers of people and records, likely consequences, measures taken and proposed, DPO contact. No health values or names in the notice itself; an annex with ids goes only through the Authority's secure channel ⚠.
- **Who:** the DPO, after the incident lead and management are informed.

### 8.2 Affected people
- When the breach is likely to result in a high risk to them (High/Critical, or the DPO decides). Guardians are notified for children — **except** where the breach concerns a teen's confidential data: notify the **teen only**, never the guardian (CLAUDE.md rule 4). For a person lacking capacity, notify the recorded health proxy.
- Channel: in-app + SMS/email with a **fixed text that carries no health data** (§11); details in the app after sign-in or by phone from the DPO.
- Without undue delay; the same day for Critical once containment is in place.

### 8.3 Others
- Care-team doctors whose patients are affected (clinical follow-up, CSO).
- Processors and partners as contracts require. Police if a crime (theft, intrusion) ⚠ counsel.
- EU CRA (ENISA/CSIRT, 24 h early warning / 72 h): not applicable while the product is not on the EU market.

## 9. Breach register (template)

Keep in the DPO's controlled register (not in a public issue tracker). One row per incident, including near misses and non-notified incidents.

| Field | Value |
|---|---|
| Incident id | `BR-YYYY-NNN` |
| Aware at (UTC) / detected by | |
| Reported by (role) | |
| Description (no values, no names) | |
| Data categories | identity / contact / health / reproductive / mental / teen-confidential / biometric / location / children |
| People affected (count) / records (count) | |
| Severity (§7.1) and rationale | |
| Containment actions and times | |
| Audit-chain check ids (before / after) | |
| Notifiable? Decision by DPO, date, reason | |
| Authority notified at / reference | |
| People notified at / channel / count | |
| Clinical impact (CSO) | |
| Root cause | |
| CAPA items, owners, due dates, status | |
| Closed at / closed by | |

## 10. Post-incident review and CAPA (≤ 10 working days)

1. Blameless review: timeline, detection gap, containment time, what worked.
2. Root cause (5 whys); hazard log update if clinical (`CLINICAL_SAFETY.md`); threat model update (`THREAT_MODELS.md`).
3. CAPA: code fix with a regression test (access-matrix case, log-scan case, notification-template case), monitoring rule, runbook change, training.
4. DPIA and ROPA updated if the risk picture changed.
5. DPO closes the register row when CAPA items are done or accepted.

## 11. Notification templates (no PHI)

**SMS / push (en):** "Cure Global: we are contacting you about a security incident that may affect your account. Please open the app or call {support_number}. We will never ask for your password or OTP."

**Email / in-app (en):**
> Subject: Important: a security incident affecting your Cure Global account
>
> On {date} we found that {plain description without health details, e.g. "some information in your family's account could be seen by another account holder"}. The information involved was {categories, e.g. "health readings"}. We {containment, e.g. "fixed the problem the same day and ended all sign-ins"}. You can {actions, e.g. "sign in again and check 'Who viewed my record'"}. If you have questions, contact our Data Protection Officer at {dpo_contact}. We have informed the Data Protection Authority.

si / ta: ⚠ translations by native speakers and counsel review before the pilot. Never name the condition, module or value in any notice.

## 12. Exercise plan

| Exercise | When | Scenario | Pass criteria |
|---|---|---|---|
| Tabletop 1 | Before the pilot (Phase 6) | A guardian of a 16-year-old sees a cycle-tracking entry through a new export path | Triage ≤ 1 h; correct decision to notify the teen only; register row complete; CAPA with an access-matrix test |
| Tabletop 2 | Before the pilot | Stolen hub + leaked database backup | Hub revoked; KEK rotation steps walked through; DPA notice drafted within 72 h |
| Technical drill | Quarterly, with the restore drill | Restore + audit-chain verification after a simulated corruption | Restore within RTO; chain verifies |

## 13. Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| DPO | | | |
| Engineering lead | | | |
| Management (Dilshan) | | | |
| Counsel (deadlines, templates) | | | |
