# Cure Global — ASVS and MASVS self-assessment

*v1.0 draft · 23 Oct 2026 · OWASP ASVS 4.0.3 self-assessment of the API, Super Admin web, Doctor web and the hub's local services — Level 2 across V1–V14, Level 3 for V2 (authentication), V3 (session management) and V4 (access control) — and OWASP MASVS 2.x for the mobile app (E14-06). Evidence points at code (`path:symbol`) and tests (`file::test`); paths under `app/` are in `services/api/`. Threats behind the gaps: [`THREAT_MODELS.md`](THREAT_MODELS.md). Scanner evidence: [`SECURITY_ASSESSMENT.md`](SECURITY_ASSESSMENT.md). This is a self-assessment; the external penetration test ([`PEN_TEST_PLAN.md`](PEN_TEST_PLAN.md)) verifies it.*

## 0. Summary

| Scope | Rows | Met | Partial | Not met | N/A |
|---|---|---|---|---|---|
| ASVS V2 Authentication (L3, every requirement) | 57 | 30 | 12 | 10 | 5 |
| ASVS V3 Session management (L3, every requirement) | 20 | 9 | 3 | 0 | 8 |
| ASVS V4 Access control (L3, every requirement) | 9 | 8 | 1 | 0 | 0 |
| ASVS V1, V5–V14 (L2, per requirement group) | 48 | 19 | 26 | 0 | 3 |
| MASVS 2.x (mobile app, as imported; P2 pending) | 24 | 8 | 10 | 4 | 2 |

Status: **Met** — implemented, with evidence. **Partial** — implemented in part, or met in code but not yet in a deployed environment. **Not met** — gap with an action. **N/A** — the feature doesn't exist in Cure Global (reason given).

The gaps that block the pilot (go/no-go, `ROADMAP.md` Phase 6) are the H/M actions in `THREAT_MODELS.md` §8; the ASVS-specific ones are: minimum password length (2.1.1), TOTP replay (2.8.4/2.8.5), notices on credential changes (2.2.3/2.5.5), session lifetimes for staff and clinicians (3.3.2), step-up re-authentication (3.7.1, 4.3.3; backend-r2b in progress), secrets in a KMS/vault (6.4.x), PHI out of URLs (8.3.1) and the fail-safe `APP_ENV` default (14.3.2).

### 0.1 Why 4.0.3 and how it maps to 5.0

`PRIVACY_CONSENT_SECURITY.md` §5.3 and `STANDARDS_AND_REGULATIONS.md` §2 name **ASVS 5.0** as the target. This sheet uses **4.0.3** because the pen-test vendors and their test cases (and this phase's brief) still work from 4.0.3 ids; the evidence carries over. Before GA the sheet is re-cut on 5.0 using this chapter map:

| 4.0.3 | 5.0.0 |
|---|---|
| V1 Architecture | V15 Secure Coding and Architecture (plus architecture items now inside each chapter) |
| V2 Authentication | V6 Authentication |
| V3 Session management | V7 Session Management; JWT items move to V9 Self-contained Tokens |
| V4 Access control | V8 Authorization |
| V5 Validation, sanitisation, encoding | V1 Encoding and Sanitization; V2 Validation and Business Logic |
| V6 Stored cryptography | V11 Cryptography |
| V7 Errors and logging | V16 Security Logging and Error Handling |
| V8 Data protection | V14 Data Protection |
| V9 Communications | V12 Secure Communication |
| V10 Malicious code | V15 Secure Coding and Architecture |
| V11 Business logic | V2 Validation and Business Logic |
| V12 Files and resources | V5 File Handling |
| V13 API and web service | V4 API and Web Service |
| V14 Configuration | V13 Configuration; HTTP security headers move to V3 Web Frontend Security |
| — | V10 OAuth and OIDC (new; applies to the R3 SMART App Launch work) |

## 1. V2 Authentication — Level 3 (every requirement)

| Id | Requirement (short) | Status | Evidence | Gap / action |
|---|---|---|---|---|
| 2.1.1 | Passwords at least 12 characters | Not met | `app/identity/passwords.py:MIN_LENGTH` = 10 | Raise to 12 (E2-01 note) |
| 2.1.2 | At least 64 characters allowed, at most 128 | Met | `passwords.py:MAX_LENGTH` = 128 | — |
| 2.1.3 | No truncation | Met | Argon2id over the whole input (`passwords.py:hash_password`) | — |
| 2.1.4 | Any printable Unicode allowed | Met | No character-class rules in `passwords.py:check_policy` | — |
| 2.1.5 | Users can change their password | Met | `app/api/auth.py:change_password` | — |
| 2.1.6 | Change needs the current and the new password | Met | `auth.py:change_password` verifies `current_password` | — |
| 2.1.7 | Breached/common passwords refused | Partial | Local list + patterns (`passwords.py:COMMON`, `_SEQUENCES`); `tests/test_security_unit.py::test_weak_passwords_are_refused` | Online k-anonymity check (HIBP range API or a local corpus) |
| 2.1.8 | Strength meter | Not met | — | Meter on sign-up and change-password screens (consoles, app P2) |
| 2.1.9 | No composition rules | Met | `check_policy` has length, common, sequence and identifier rules only | — |
| 2.1.10 | No periodic rotation | Met | No expiry in `user_account` | — |
| 2.1.11 | Paste and password managers allowed | Met | `autoComplete="current-password"` (`apps/admin-web/src/auth/SignIn.tsx`); no paste blocking | — |
| 2.1.12 | Option to show the password | Not met | Plain `type="password"` inputs (`SignIn.tsx`, `Reauth.tsx`) | Show/hide toggle in `@cure/ui-web` `Input` |
| 2.2.1 | Anti-automation (brute force, credential stuffing) | Met | Lockout with backoff (`app/identity/service.py:password_login`); windows (`app/platform/ratelimit.py`); `tests/test_auth_api.py::test_wrong_password_then_lockout`, `::test_otp_attempts_and_rate_limit` | Per-IP buckets see the proxy (THREAT_MODELS TM-API-D3) |
| 2.2.2 | SMS/email only for secondary verification | Partial | Staff and doctors: TOTP, never SMS (`identity/service.py:actor_for_account`). Families: SMS OTP proves the phone at sign-up and for reset (`request_otp` purposes) | Accepted for families (no other factor available at scale); notify on reset (2.2.3) |
| 2.2.3 | Secure notification after authentication details change | Not met | Password change, TOTP enrolment/removal and recovery-code regeneration send nothing (`app/api/auth.py`) | Fixed-text notice (push/SMS/email, no values) on each change |
| 2.2.4 | Phishing resistance (L3) | Not met | TOTP only | Passkeys/WebAuthn for staff and clinicians (R2) |
| 2.2.5 | Mutual TLS between CSP and verifier (L3) | N/A | The API is its own credential service; no separate CSP | Revisit if an external IdP is added |
| 2.2.6 | Replay resistance (L3) | Partial | OTP single use (`verify_otp` `consumed_at`), recovery codes single use (`check_second_factor`), device nonces single use (`app/devices/service.py:token`) | TOTP codes can be replayed inside the window (2.8.4) |
| 2.2.7 | Intent to authenticate (L3) | Met | The user types the OTP/TOTP; the hub signs a fresh server nonce | — |
| 2.3.1 | Initial codes random, ≥ 6 characters, expire | Met | OTP `secrets.randbelow(10**6)`, 10 min (`identity/service.py:request_otp`); staff invite code (`OTP_TEXTS["staff_invite"]`); hub pairing code 6 of 32 symbols, 10 min (`devices/service.py:pairing_start`) | — |
| 2.3.2 | User-provided authenticators (FIDO) supported | Not met | — | Passkeys (R2) |
| 2.3.3 | Renewal instructions for expiring authenticators | N/A | No time-limited authenticators | — |
| 2.4.1 | Passwords stored with an approved KDF | Met | Argon2id (`passwords.py:_hasher`); rehash on login (`needs_rehash`) | — |
| 2.4.2 | Unique salt ≥ 32 bits | Met | argon2-cffi 16-byte random salt | — |
| 2.4.3 | PBKDF2 iterations | N/A | Argon2id used | — |
| 2.4.4 | bcrypt work factor | N/A | Argon2id used | — |
| 2.4.5 | Additional KDF iteration with a secret salt (pepper) | Not met | — | Optional: HMAC pepper from the KMS before Argon2id |
| 2.5.1 | Activation/recovery secrets not sent in clear text | Met | Only one-time codes are sent (10 min); no passwords ever sent | — |
| 2.5.2 | No hints or knowledge-based answers | Met | None exist | — |
| 2.5.3 | Recovery never reveals the password | Met | Reset sets a new password (`auth.py` `/auth/password/reset/confirm`) | — |
| 2.5.4 | No shared or default accounts | Partial | No default accounts in migrations; demo accounts come only from the seed | `python -m app.seed` (without `--reset`) is not refused outside dev (`app/seed.py:seed`): refuse it outside dev/test/synthetic staging |
| 2.5.5 | Notify when an authentication factor changes | Not met | — | As 2.2.3 |
| 2.5.6 | Secure forgotten-password path | Met | OTP to the verified identifier, then every session ends (`identity/service.py:set_password`); `tests/test_auth_api.py::test_password_reset_revokes_every_session` | — |
| 2.5.7 | Lost MFA: identity proofing at enrolment level | Partial | Recovery codes (`identity/service.py:new_recovery_codes`) | Support-assisted reset procedure with identity checks (`docs/06-operations/SUPPORT_PLAYBOOK.md`) |
| 2.6.1 | Look-up secrets single use | Met | Recovery code removed on use (`check_second_factor`) | — |
| 2.6.2 | Look-up secrets ≥ 112 bits or salted + hashed | Partial | 8 characters of 31 symbols (~40 bits, `identity/totp.py:new_recovery_codes`), stored as keyed HMAC (`identity/service.py:_rc_hash`) | Longer codes (≥ 16 characters) or per-code salt + Argon2id |
| 2.6.3 | Look-up secrets resistant to offline attack | Partial | Keyed hash; the key is outside the DB | As 2.6.2 |
| 2.7.1 | No clear-text OOB (SMS) as default MFA | Met | MFA is TOTP; SMS is never a second factor | — |
| 2.7.2 | OOB code expires in 10 minutes | Met | `identity/service.py:OTP_TTL` | — |
| 2.7.3 | OOB code single use, for the original request | Met | `consumed_at`, `purpose` checked (`verify_otp`) | — |
| 2.7.4 | OOB over a secure independent channel | Met | SMS/email separate from the app's TLS channel | — |
| 2.7.5 | OOB verifier keeps only a hash | Met | HMAC digest bound to the challenge id (`_otp_digest`) | — |
| 2.7.6 | OOB code from a CSPRNG, ≥ 20 bits | Met | 6 random digits (`secrets.randbelow`) | — |
| 2.8.1 | TOTP has a defined lifetime | Met | 30 s step, ±1 step (`identity/totp.py:STEP`, `WINDOW`); `tests/test_security_unit.py::test_totp_window_and_format` | — |
| 2.8.2 | OTP seeds protected (HSM or secure key store) | Partial | TOTP secrets envelope-encrypted with AAD `user_account.totp` (`app/platform/crypto.py:encrypt`) | KEK in a KMS (E14-02) |
| 2.8.3 | Approved OTP algorithms | Met | RFC 6238 HMAC-SHA1 (`totp.py:_code`); `tests/test_security_unit.py::test_totp_rfc6238_vector` | — |
| 2.8.4 | A TOTP code is usable only once in its validity period | Not met | `totp.verify` accepts the same code again | Store the last accepted step per account; refuse ≤ it |
| 2.8.5 | Reused TOTP logged, rejected and notified | Not met | — | With 2.8.4: audit `mfa_reuse` + notice |
| 2.8.6 | Physical OTP generators revocable | N/A | No hardware tokens | — |
| 2.8.7 | Biometrics only as a secondary factor (L3) | Met | Hub face recognition identifies for display only; sensitive actions need PIN or app confirmation (`STANDARDS_AND_REGULATIONS.md` §1; `services/hub-core/hub_core/api/core.py:open_session`); the app's biometric unlock is a local gate (`apps/mobile/src/components/security/AppLockGate.tsx`) | — |
| 2.9.1 | Verification keys stored securely | Partial | Hub keys on the device (`hub_core/security.py`), JWT key required from config outside dev (`app/identity/tokens.py:signing_key`) | TPM/SE for hubs; secret store/KMS for JWT key |
| 2.9.2 | Challenge nonce ≥ 64 bits, unique | Met | 192-bit nonce, stored hashed, single use, 60 s (`devices/service.py:challenge`) | — |
| 2.9.3 | Approved algorithms for crypto verifiers | Met | Ed25519 (`devices/service.py:verify_signature`) | — |
| 2.10.1 | Intra-service secrets not static credentials | Partial | Per-service MQTT users (`infra/compose/mosquitto/acl`); generated secrets (`scripts/init_env.py`) | Managed identities / short-lived DB credentials in `infra/tofu` |
| 2.10.2 | No default service credentials | Partial | Compose refuses to start without generated passwords (`POSTGRES_PASSWORD:?`); `app/config.py:database_url` default `cure:cure` is dev only | Remove the credentialed default; CI `cure/cure` is throwaway |
| 2.10.3 | Service passwords stored protected | Partial | `.env` files generated, never committed (CLAUDE.md rule 15) | Secret manager in `infra/tofu` |
| 2.10.4 | No secrets in source code | Met | gitleaks in CI (`.github/workflows/ci.yml` `secrets`); results in `SECURITY_ASSESSMENT.md` | — |

## 2. V3 Session management — Level 3 (every requirement)

| Id | Requirement (short) | Status | Evidence | Gap / action |
|---|---|---|---|---|
| 3.1.1 | Session tokens never in URLs | Partial | Access and refresh tokens only in headers/bodies | SSE stream token in `?token=` (60 s, single-purpose, `app/live/streams.py:stream_token`); share-link capability token in the path by design — keep both out of logs (THREAT_MODELS TM-API-I4, TM-ADM-I2) |
| 3.2.1 | New session token at authentication | Met | `identity/service.py:open_session` creates a new session and tokens on every sign-in | — |
| 3.2.2 | ≥ 64 bits of entropy | Met | Refresh secret `secrets.token_urlsafe(32)` (`_new_refresh`); JWT `jti` | — |
| 3.2.3 | Tokens stored securely in the client | Met | Consoles: access token in memory, refresh in `sessionStorage` (`apps/admin-web/src/auth/session.ts`, `apps/doctor-web/src/auth/session.ts`); app: SecureStore (`apps/mobile/src/store/authStore.ts`) | — |
| 3.2.4 | Approved algorithms for tokens | Met | EdDSA JWT (`identity/tokens.py`), CSPRNG secrets | — |
| 3.3.1 | Logout and expiry invalidate the session | Met | `/auth/logout` revokes the session; every access token re-checks it (`identity/service.py:actor_from_access_token`); `tests/test_auth_api.py::test_sessions_list_end_and_logout` | — |
| 3.3.2 | Periodic re-authentication (L3: 12 h or 15 min idle, with 2FA) | Partial | Staff/clinicians: 2FA, 12 h idle, 7 d absolute (`app/config.py:refresh_idle_staff_s`, `refresh_ttl_staff_s`); families: rolling 30 days | Staff/clinicians to 15 min idle / 12 h absolute; families: absolute 30-day cap with app lock in between |
| 3.3.3 | Option to end other sessions after a password change | Met | A password change ends every session (`identity/service.py:set_password`, `auth.py:change_password`) | — |
| 3.3.4 | Users see and end active sessions | Met | `GET/DELETE /me/sessions` (`app/api/auth.py:my_sessions`, `end_session`) | — |
| 3.4.1 | Cookie `Secure` | N/A | No cookies; Bearer tokens | — |
| 3.4.2 | Cookie `HttpOnly` | N/A | No cookies | — |
| 3.4.3 | Cookie `SameSite` | N/A | No cookies | — |
| 3.4.4 | Cookie `__Host-` prefix | N/A | No cookies | — |
| 3.4.5 | Cookie `path` | N/A | No cookies | — |
| 3.5.1 | Users can revoke OAuth grants of linked apps | N/A | No third-party apps yet | SMART App Launch (R3): grant list + revoke |
| 3.5.2 | Session tokens rather than static API secrets | Met | JWT + rotating refresh for people and hubs (`app/devices/service.py:refresh`); the only static secret is the Traccar webhook (`app/api/internal.py`) | — |
| 3.5.3 | Stateless tokens signed and protected | Met | EdDSA, 15 min, `typ`, `kid`, session re-checked (`identity/tokens.py:decode`); `tests/test_security_unit.py::test_tokens_signed_by_another_key_are_refused` | — |
| 3.6.1 | RP sets max authentication age at the CSP (L3) | N/A | No federation | R3 SMART: honour `max_age` |
| 3.6.2 | CSP tells the RP the last authentication event (L3) | N/A | No federation | R3 SMART: `auth_time` claim |
| 3.7.1 | Full session or re-authentication before sensitive actions | Partial | Password change needs the current password; break-glass needs approval; console hook ready (`apps/admin-web/src/auth/Reauth.tsx`) | API step-up (`reauth-required`) for exports, break-glass, bulk changes — backend-r2b, before pilot |

## 3. V4 Access control — Level 3 (every requirement)

| Id | Requirement (short) | Status | Evidence | Gap / action |
|---|---|---|---|---|
| 4.1.1 | Enforced on a trusted service layer | Met | `app/consent/policy.py:Policy.decide` via `app/consent/service.py:access_context`/`authorize_many`; hub-side `hub_core/api/deps.py:self_only` | — |
| 4.1.2 | Users can't manipulate attributes used by access control | Met | Actor from the token only (`app/api/deps.py:current_actor`); `X-Dev-Actor` dev/test only; `X-Act-As` limited to held roles (`tests/test_auth_api.py::test_act_as_must_be_a_role_the_account_has`) | — |
| 4.1.3 | Least privilege | Met | Care-team categories by role (`app/care/service.py:ROLE_DEFAULTS`), staff roles without PHI, hub-safe modules (`ACCESS_CONTROL.md` §2) | — |
| 4.1.5 | Fails securely, including on exceptions | Met | Deny by default; unknown module → `denied:unknown_module` (`consent/service.py:AccessContext.decide`); 403 problem | — |
| 4.2.1 | Protection against IDOR | Met | Access matrix `tests/test_policy.py`, `tests/test_access_api.py`; every route declares `x-access` (`tests/test_routes.py::test_every_route_declares_its_access_policy`) | — |
| 4.2.2 | Anti-CSRF | Met | Bearer tokens in headers, no ambient cookies; CORS allow-list (`app/main.py:create_app`) | Re-check if a BFF cookie is introduced |
| 4.3.1 | MFA for administrative interfaces | Met | Staff act only with MFA (`identity/service.py:actor_for_account`); `tests/test_auth_api.py::test_staff_token_without_mfa_is_refused` | — |
| 4.3.2 | No directory browsing or metadata files | Met | nginx serves the SPA with `try_files`, no `autoindex` (`apps/admin-web/nginx/default.conf.template`); root `.dockerignore` | — |
| 4.3.3 | Step-up or segregation of duties for high-value actions | Partial | Break-glass needs a second approver (`app/api/break_glass.py`); catalogue releases staged → approved (CSO) → active (`app/modules/catalogue.py:approve_release`, `activate_release`) | Step-up re-auth (3.7.1) |

## 4. V1 and V5–V14 — Level 2 (per requirement group)

| Section | Status | Evidence | Gap / action |
|---|---|---|---|
| V1.1 Secure development lifecycle | Partial | Threat models (`THREAT_MODELS.md`), security stories (BACKLOG E14), PR checklist (`.github/pull_request_template.md`), CI scans | Secure-coding checklist and annual developer training (1.1.7) |
| V1.2 Authentication architecture | Partial | One identity service (`app/identity/service.py`); per-service MQTT users | App connects to Postgres as the owner (1.2.1): least-privilege role (THREAT_MODELS action 4) |
| V1.4 Access-control architecture | Met | Single policy function (`app/consent/policy.py`), deny by default (ADR-0006) | — |
| V1.5 Input and output architecture | Met | Pydantic v2 at the edge; catalogue JSON Schemas (`packages/module-catalogue/schema`) | — |
| V1.6 Cryptographic architecture | Partial | Envelope encryption, key ids, rotation (`app/platform/crypto.py`, `services/api/scripts/rotate_kek.py`) | KMS for the KEK (E14-02) |
| V1.7 Errors, logging and auditing architecture | Partial | JSON logs with a scrubber (`app/platform/logs.py`); audit chain (`app/audit/service.py`) | Ship logs to the central store (`infra/tofu` monitoring) |
| V1.8 Data protection and privacy architecture | Met | Data inventory (`PRIVACY_CONSENT_SECURITY.md` §1), categories and module flags (`cure_catalogue/categories.py`) | — |
| V1.9 Communications architecture | Partial | TLS at the edge; hub requires https (`hub_core/config.py`) | TLS to Postgres/Valkey/S3 inside the cloud (`infra/tofu`) |
| V1.10 Malicious software architecture | Met | Git + PR review + CI; signed images and SBOMs (`ci.yml` `images`) | — |
| V1.11 Business logic architecture | Met | Flows documented (ARCHITECTURE §3); transactions, `FOR UPDATE` on OTP/refresh/pairing, idempotent batches | — |
| V1.12 Secure file upload architecture | Met | Downloads as attachments via signed links (`app/platform/storage.py:presigned_get`) | — |
| V1.14 Configuration architecture | Partial | Containers as non-root (`services/api/Dockerfile` `USER cure`); cosign | Automated, reviewed deployment once `infra/tofu` is applied |
| V5.1 Input validation | Met | Explicit Pydantic models, list limits (`app/api/schemas_records.py`), plausibility ranges (HZ-14) | — |
| V5.2 Sanitisation and sandboxing | Met | Fixed message templates (`app/notifications/templates.py`); no rich text, no SVG uploads (`storage.py:sniff_document`) | — |
| V5.3 Output encoding and injection prevention | Met | SQLAlchemy bound parameters; React escaping; PDF text escaped (`app/exports/pdf.py:_esc`); Semgrep (`SECURITY_ASSESSMENT.md`) | — |
| V5.4 Memory, string and unmanaged code | N/A | Python/TypeScript only | — |
| V5.5 Deserialisation | Met | JSON only; YAML via `yaml.safe_load` (`cure_catalogue/loader.py`) | — |
| V6.1 Data classification | Partial | Identifiers, notes, messages, reasons encrypted in the app (`crypto.py:encrypt`) | Observation values rely on managed-DB encryption (`infra/tofu`) |
| V6.2 Algorithms | Met | AES-256-GCM with fresh nonces and AAD, Ed25519, Argon2id, HMAC-SHA256; `tests/test_security_unit.py::test_envelope_round_trip_and_fresh_nonces`, `::test_tampered_ciphertext_fails` | — |
| V6.3 Random values | Met | `secrets` everywhere for codes and tokens | — |
| V6.4 Secret management | Partial | Secrets from env, generated by `scripts/init_env.py`; production refuses derived JWT keys | Vault/KMS (6.4.1, 6.4.2) |
| V7.1 Log content | Partial | Scrubber and log-scan test (`app/platform/logs.py`, `tests/test_log_scan.py`) | `SMS_BACKEND=dev` logs OTP texts in any environment (`app/platform/messaging.py:send_sms`) — refuse outside dev |
| V7.2 Log processing | Partial | Every allow audited with basis and purpose (`consent/service.py:AccessContext.audit`); logins and refresh reuse audited | Denied decisions are not logged (7.2.2): add a PHI-free security log line per deny |
| V7.3 Log protection | Partial | JSON encoding stops log injection; audit hash chain + nightly check (`app/worker.py:verify_audit_chain`) | Append-only DB role and external anchor (THREAT_MODELS action 4) |
| V7.4 Error handling | Partial | RFC 9457 problems (`app/core/problems.py`), no stack traces | Request id in responses and logs for support |
| V8.1 General data protection | Partial | Exports `no-store` (`app/api/exports.py`); encrypted backups (`scripts/backup.sh`) | `no-store` on every PHI response |
| V8.2 Client-side data protection | Partial | No PHI in `localStorage` (`apps/doctor-web/src/lib/theme.ts` holds the theme only); app cache encrypted and cleared on sign-out | As 8.1 |
| V8.3 Sensitive private data | Partial | DSAR export/rectify/erase (`app/privacy/dsar.py`, `app/api/privacy.py`); retention jobs (`app/privacy/retention.py`); access audited | Admin search sends phone/email/name in the query string (`app/api/admin.py:admin_families` `?query=`, 8.3.1): move to a POST body |
| V9.1 Client communication | Partial | https-only base URLs (`apps/mobile/src/services/api/client.ts`; `hub_core/config.py`) | TLS 1.2+/1.3 and HSTS at the edge (`infra/tofu`), verified in staging |
| V9.2 Server communication | Partial | S3 SSE on https endpoints (`storage.py:put`) | `sslmode=verify-full` for Postgres, TLS for Valkey (`infra/tofu`) |
| V10.2 Malicious code search | Met | No phone-home or analytics SDKs; the hub's only outbound call besides the API is the weather lookup (`hub_core/weather.py`) | — |
| V10.3 Application integrity | Partial | Signed images (cosign); Play-signed app | Signed hub OTA (Cure Home plan) |
| V11.1 Business logic security | Partial | Typed step tokens enforce order (OTP → register, password → MFA); rate limits; `FOR UPDATE` against TOCTOU | Alerting on unusual volumes (`infra/observability`) |
| V12.1 File upload | Partial | Size cap (`app/config.py:max_document_bytes`, `app/records/documents.py`) | Per-person storage quota (12.1.3) |
| V12.2 File integrity | Met | Type from content, not the client (`storage.py:sniff_document`) | — |
| V12.3 File execution | Met | Opaque object keys; client file names unused | — |
| V12.4 File storage | Met | Private bucket outside any web root; clamd fail-closed (`app/platform/scan.py`) | Staging/production `VIRUS_SCANNER=clamd` |
| V12.5 File download | Met | `Content-Disposition: attachment`, sniffed content type | — |
| V12.6 SSRF protection | Met | No user-supplied URLs are fetched | Re-check with the HMS connector (R3) |
| V13.1 Generic web service security | Partial | Authorisation at route and record level | Stream and share-link tokens in URLs (3.1.1); admin `?query=` (8.3.1) |
| V13.2 RESTful web service | Met | Methods per route; Pydantic schemas; Bearer (no CSRF surface) | — |
| V13.3 SOAP | N/A | No SOAP | — |
| V13.4 GraphQL | N/A | No GraphQL | — |
| V14.1 Build and deploy | Partial | CI builds every image; Dockerfiles pinned to minor versions | Apply `infra/tofu` with reviewed plans; digests instead of tags (compose header note) |
| V14.2 Dependencies | Partial | SBOM per image; pip-audit, pnpm audit, Trivy in CI (`SECURITY_ASSESSMENT.md`); MediaPipe self-hosted with checksum (`apps/hub-ui/scripts/fetch-mediapipe.mjs`) | `npm audit` for `apps/mobile`; Renovate/Dependabot |
| V14.3 Unintended security disclosure | Partial | `/docs` dev only, OpenAPI off in production (`app/main.py`); hub-ui `server_tokens off` | `APP_ENV` defaults to `dev` (`app/config.py`) — fail-safe default (THREAT_MODELS action 1); `server_tokens off` in console nginx; uvicorn `--no-server-header` |
| V14.4 HTTP security headers | Partial | CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors` on consoles and kiosk (`apps/*/nginx/default.conf.template`) | HSTS at the edge; same headers for direct API traffic (app, hub) at the edge |
| V14.5 HTTP request header validation | Partial | CORS allow-list (`app/main.py`); nginx overwrites `X-Forwarded-For` | `FORWARDED_ALLOW_IPS` for the edge (THREAT_MODELS TM-API-D3) |

V10.1 (code analysis, L3 only) is outside this L2 scope; Semgrep and ruff `S` rules run anyway (`SECURITY_ASSESSMENT.md`).

## 5. MASVS 2.x — mobile app (`apps/mobile`)

Target profile **MAS-L2 + MAS-P** (`PRIVACY_CONSENT_SECURITY.md` §5.3); MAS-R (resilience) is not targeted for the MVP. The app is still the imported patient app talking to HMS; P2 (wave 6) repoints it at Cure Global, so AUTH rows are re-assessed then.

| Control | Status | Evidence | Gap / action |
|---|---|---|---|
| MASVS-STORAGE-1 Sensitive data stored securely | Met | Tokens in SecureStore (`src/store/authStore.ts`); offline cache in SQLCipher with a per-install key in the Keystore/Keychain (`src/services/queryClient.ts`) | — |
| MASVS-STORAGE-2 Leakage of sensitive data prevented | Partial | Cache and reminders cleared on sign-out (`authStore.ts:signOut`); screenshots blocked while signed in (`src/components/security/ScreenCaptureGuard.tsx`) | `android.allowBackup` not disabled (`app.json`); local medicine reminders put the medicine name on the lock screen (`src/services/reminders.ts`, `notif.medBody`) — use a neutral text |
| MASVS-CRYPTO-1 Strong, current cryptography | Met | Platform keystores, SQLCipher (AES-256), `expo-crypto` random key | — |
| MASVS-CRYPTO-2 Key management | Met | Random 256-bit cache key generated on device, never leaves the keystore-backed SecureStore | — |
| MASVS-AUTH-1 Secure authentication protocols | Partial | Bearer tokens with refresh (`src/services/api/client.ts`) against HMS today | P2: Cure Global EdDSA access tokens + rotating refresh with reuse detection (E16-01) |
| MASVS-AUTH-2 Local authentication done securely | Partial | Biometric app lock; cold start locked (`src/components/security/AppLockGate.tsx`, `src/store/lockStore.ts`) | Event-based unlock (not bound to a Keystore `CryptoObject`): bind the refresh token's release to biometric unlock in P2 |
| MASVS-AUTH-3 Additional authentication for sensitive operations | Partial | Server-side step-up (backend-r2b) | P2: password/biometric before export, sharing, consent withdrawal on behalf of others |
| MASVS-NETWORK-1 Network traffic secured | Met | https base URL; no cleartext traffic enabled | — |
| MASVS-NETWORK-2 Identity pinning | Not met | — | Decide on pinning (D-list); if yes, pin the API's SPKI with a backup pin |
| MASVS-PLATFORM-1 IPC used securely | Partial | Verified App Links for `/hub/pair`, `/hub/claim` (`app.json` `intentFilters`) | Custom scheme `curepatient://` also registered — never carry codes on it |
| MASVS-PLATFORM-2 WebViews used securely | Partial | Navigation filter in the payments WebView (`app/(patient)/appointments/pay.tsx`) | `originWhitelist` `https://*` with JavaScript on; restrict to the gateway's origin or drop (billing R3) |
| MASVS-PLATFORM-3 UI used securely | Met | Masked inputs, screen-capture protection, Recents blur | — |
| MASVS-CODE-1 Up-to-date platform | Met | `minSdkVersion` 26, `targetSdkVersion` 36 (`app.json` `expo-build-properties`) | — |
| MASVS-CODE-2 Updates can be enforced | Not met | — | Minimum supported version from the API (P2) |
| MASVS-CODE-3 No known-vulnerable components | Partial | Expo SDK 57 | `npm audit` in the mobile CI job; results in `SECURITY_ASSESSMENT.md` |
| MASVS-CODE-4 Untrusted input validated | Partial | Pairing/claim codes validated by the server; typed API layer | BLE decoders shared with hub vectors (E16-07, R2) |
| MASVS-RESILIENCE-1 Platform integrity checked | Not met | — | Not targeted for MVP (no MAS-R); optional Play Integrity |
| MASVS-RESILIENCE-2 Anti-tampering | Not met | — | As above |
| MASVS-RESILIENCE-3 Anti-static analysis | N/A | MAS-R not targeted | — |
| MASVS-RESILIENCE-4 Anti-dynamic analysis | N/A | MAS-R not targeted | — |
| MASVS-PRIVACY-1 Access to sensitive data minimised | Met | Blocked permissions (background location, storage, audio, exact alarms), BLE `neverForLocation`, Health Connect types listed (`app.json`) | — |
| MASVS-PRIVACY-2 User identification prevented | Met | No analytics or advertising SDKs; push token only | — |
| MASVS-PRIVACY-3 Transparent about data collection | Partial | In-app legal documents (`src/legal/documents.ts`), policy version (`src/config/app.ts`) | Play data-safety form and privacy notice in en/si/ta reviewed by counsel (P2) |
| MASVS-PRIVACY-4 User control over their data | Partial | Account-deletion URL (`src/config/app.ts`); DSAR API (`app/privacy/dsar.py`) | Export/erase and consent screens in the app (P2) |

## 6. Upkeep

Re-run this sheet each release with the threat-model review (`THREAT_MODELS.md` §9). A row moves to **Met** only with a code pointer and a test or scanner result. Before GA: re-cut on ASVS 5.0 (§0.1) and MASTG test cases for the P2 app.

| Version | Date | Change | Reviewed by |
|---|---|---|---|
| 1.0 draft | 23 Oct 2026 | First self-assessment | *pending: engineering lead, DPO* |
