# Cure Global — Penetration test plan and rules of engagement

*v1.0 draft · 23 Oct 2026 · Scope, method, rules of engagement, reporting and fix deadlines for the external penetration test before the pilot (E14-07; `ROADMAP.md` Phase 6: "external penetration test (API, web, app, hub)"; exit: security findings closed). **The test itself must be done by an independent external vendor** — this document is the statement of work annex and the rules both sides sign. Inputs for the testers: [`THREAT_MODELS.md`](THREAT_MODELS.md), [`ASVS_MASVS_ASSESSMENT.md`](ASVS_MASVS_ASSESSMENT.md), [`SECURITY_ASSESSMENT.md`](SECURITY_ASSESSMENT.md), `docs/02-architecture/ACCESS_CONTROL.md`.*

## 1. Objectives

1. Find vulnerabilities an attacker could use against the pilot: account takeover, cross-family or cross-patient data access, teen-confidential disclosure, staff access to PHI outside break-glass, hub compromise from the home LAN, and leakage through exports, notifications or logs.
2. Verify the ASVS 4.0.3 L2 (L3 for authentication, sessions, access control) and MASVS L2 + P self-assessment, and the ETSI EN 303 645 baseline for the hub.
3. Give the go/no-go review (`ROADMAP.md` Phase 6 exit) an independent statement that critical and high findings are closed (retest letter).

## 2. Scope

### 2.1 In scope

| # | Target | Where | Access given | Notes |
|---|---|---|---|---|
| T1 | Cure Global API (`/api/v1/*`, including `/api/v1/hub/*`, `/api/v1/shared/{token}`, `/api/v1/events`) | Staging, `https://api.<staging-domain>/api/v1` | Accounts per role (§5); OpenAPI at `/api/v1/openapi.json` (published in staging) | Grey box; source available on request |
| T2 | Super Admin web | Staging console URL | Staff accounts (§5) | Includes break-glass, DSAR queue, hub fleet, catalogue releases |
| T3 | Doctor web | Staging console URL | Clinician accounts (§5) | Includes worklist, member chart, notes, PDF, SSE |
| T4 | Mobile app (Android APK) | Release-signed build pointing at staging (P2 build of `apps/mobile`) | APK file + family accounts | MASTG static and dynamic; Health Connect and BLE flows on the vendor's test phone |
| T5 | One Family Hub unit, production image | Delivered to the vendor's lab, paired to staging | Physical unit, Wi-Fi network details, one BLE scale and BP monitor from the peripheral catalogue | LAN services: kiosk nginx (:8080), hub-core (:8600), vision (:8700), MQTT (:1883), BLE; boot, disk and USB attack surface |
| T6 | Hub ↔ cloud contract | Between T5 and T1 | As T5 | Device identity, pairing, refresh rotation, revocation, offline queue |
| T7 | Staging infrastructure configuration | `infra/tofu` plans and the staging cloud account (read-only role) | Read-only cloud role; IaC repository | Configuration review only (CIS benchmark), no exploitation of the provider's control plane |
| T8 | R3 additions if merged before the window: FHIR read API + SMART App Launch 2.2, HMS connector | Staging | SMART client registration | Confirmed at kick-off |

### 2.2 Out of scope

- **Production** and any environment with real personal data; Cure Home production (`cure-home-prod*`), HMS production and the developers' machines.
- **Real people**: no social engineering, phishing, vishing or SMS to real families, doctors or staff; no physical entry to homes, clinics or offices.
- **Denial of service** and load testing (performance is tested separately, `docs/06-testing/PERFORMANCE.md`); rate-limit checks are allowed at low volume (§6.3).
- Third-party infrastructure beyond our configuration: the cloud provider's control plane, SMS gateway, email provider, Expo/FCM/APNs, Open-Meteo, Google Play.
- Destructive tests on shared staging data (mass deletion, schema changes) unless arranged for a reserved data set.

## 3. Method

| Area | Standard / guide | Focus |
|---|---|---|
| API and web | OWASP WSTG 4.2; OWASP API Security Top 10 (2023); ASVS 4.0.3 L2/L3 | Authentication (OTP, password, TOTP, recovery codes, refresh reuse), session lifetimes, authorisation per record (BOLA/IDOR), mass assignment, injection, file upload, SSE, exports, share links, CORS, headers, error handling |
| Mobile app | OWASP MASTG; MASVS 2.x L2 + P | Storage (SecureStore, SQLCipher cache, backups), network, deep/App Links, WebView, local authentication, notifications, privacy |
| Family Hub | ETSI EN 303 645 V3.1.3 provisions 5.1–5.13; OWASP IoT Top 10; OWASP ISVS where useful | No default passwords, update integrity, secure storage of keys (`HUB_DB_KEY`, vision templates), exposed LAN services, kiosk escape, MQTT ACLs, BLE spoofing/replay, face-proof forgery, PIN brute force, data deletion on unpairing |
| Cloud | CIS benchmarks for the chosen provider | Network exposure, storage encryption/versioning, IAM least privilege, secrets, logging |
| Privacy | `PRIVACY_CONSENT_SECURITY.md` §3 | No PHI in notifications, logs visible to testers (error pages, headers), URLs |

Testers receive the threat models and the self-assessment and are asked to **try to falsify them**, not only to scan.

## 4. Abuse cases that must be attempted

Each case is run on every path that can carry the data: REST, FHIR export, PDF, SSE, notifications, share links, the hub, the "who viewed my record" view and the DSAR export (`ACCESS_CONTROL.md` §5 rule 6). Seed people are synthetic (§5).

| Id | Case | Expected result |
|---|---|---|
| AC-01 | Dilini (guardian) tries to see anything of Thilini's (16) teen-confidential modules: cycle data, confidential thread, her care team with Dr S. Fernando | No content and **no trace** on any path (HZ-12) |
| AC-02 | Nimal (family owner) reads Kamala's data beyond her "Essentials" grant (conditions, notes, documents); then Kamala withdraws `share_with_family` and Nimal retries on every path and on the hub | Denied beyond the grant; withdrawal effective immediately; hub drops cards at next sync |
| AC-03 | A plain family member, or a member of another family (e.g. Kasun Fernando), reads Perera data by changing ids | 403/404, audited |
| AC-04 | Dr A. Silva (pending verification) and Asha Wijesinghe (therapist, `behaviour_support` only) read vitals, notes or other patients; a doctor reads a patient after the care team ended | Denied |
| AC-05 | `ops_support` or `super_admin` reads PHI without break-glass; self-approves break-glass; uses a session for person A to read person B; keeps reading after 60 minutes; exports a record as staff | Denied; emergency mode flagged; exports refused for `basis=admin` |
| AC-06 | Hub device token reads non-`hub_safe` modules, `hub_opt_in` modules without the person's own `hub_display` consent, a guardian's consent for a teen's pregnancy, another family's members; a revoked hub or a replayed refresh token keeps syncing | Denied; revocation and reuse end the chain |
| AC-07 | Share links: guessing, reuse after expiry or revocation, scope escalation (vitals link → notes), data added after creation outside the snapshot | 404 or policy-limited content |
| AC-08 | A person with a safety restriction against them (E4-09) reads the protected person's data or location | Denied without revealing the restriction |
| AC-09 | A non-clinician records a pregnancy for a girl under 16; a guardian reads a safeguarding-hold record | Refused; restricted to the recording clinician (HZ-19) |
| AC-10 | Token confusion: `mfa`/`otp`/`stream`/`device` tokens used as access tokens; `X-Dev-Actor`, `/auth/dev/login`, `/auth/dev/hub-owner` on staging; `X-Act-As` to a role the account lacks | 401/403/404 |
| AC-11 | Batch writes with someone else's id in `measured_for`/`entered_by`; replayed client ids; oversized batches | Per-item `rejected`; duplicates reported, never double-written |
| AC-12 | Admin population analytics: differencing or small-bucket queries to single out a person | Buckets under 5 persons suppressed, including complementary suppression |
| AC-13 | Audit chain: provoke a fork or a gap; read audit details for values | Chain verifies; details hold ids and counts only |
| AC-14 | DSAR export: a guardian's export of a 16-year-old; reuse of another requester's signed link; link after expiry | Teen-confidential content only to the teen; links personal and short-lived |
| AC-15 | Notifications, SMS, email and push texts, and error responses carry no values, condition or module names | None found |
| AC-16 | Home LAN: call hub-core or vision without the kiosk; forge a vision identify proof; brute-force a member PIN; publish on MQTT to attribute a reading to another member; read the hub's disk after removing it | Refused, locked out, or encrypted at rest |

## 5. Test accounts (synthetic seed only)

Staging is loaded with the synthetic seed (`services/api/app/seed.py`; families and doctors as in `BUILD_BRIEF` §5.5). No real person's data exists in staging. Passwords and TOTP enrolment are handed over out of band at kick-off; the vendor enrols TOTP on first sign-in for staff and clinician accounts. Two testers per role get their own copies (`-t1`, `-t2` labels) so audit trails stay attributable.

| Role | Seed account (staging uses the same labels) | Used for |
|---|---|---|
| Family owner | Nimal Perera (`+94770000001`) | AC-02, AC-03, hub pairing |
| Family admin, pregnant, guardian of a 16-year-old | Dilini Perera (`+94770000002`) | AC-01, AC-06, AC-14 |
| Elder with "Essentials" sharing | Kamala Perera (`+94770000003`) | AC-02 (withdrawal) |
| Teen (16) with confidential modules | Thilini Jayasinghe (`+94770000005`) | AC-01, AC-14 |
| Other family's owner/admin | Ruvini / Kasun Fernando (`+94770000011`, `+94770000012`) | AC-03 |
| Family doctor (verified) | `dr.perera@cure.example` | AC-04 baseline |
| Obstetrician (verified) | `dr.fernando@cure.example` | AC-01 (teen's own care team) |
| Paediatrician (pending verification) | `dr.silva@cure.example` | AC-04 |
| Therapist (`behaviour_support`) | `asha.wijesinghe@cure.example` | AC-04 |
| Super admin | `admin@cure.example` | AC-05 |
| Ops support | `support@cure.example` | AC-05 |
| DPO / auditor (break-glass approver) | `dpo@cure.example` | AC-05, AC-13 |
| Clinical safety officer | `cso@cure.example` | Catalogue release approval |
| Content manager | `content@cure.example` | Content workflow |
| Family Hub | Serial provisioned for the vendor (`CH-PT-0001`), paired to a dedicated synthetic family | AC-06, AC-16 |

Staging uses test numbers on the SMS provider (or a sink) so OTPs reach the vendor without messaging real phones.

## 6. Rules of engagement

### 6.1 Authorisation and timing

- Testing starts only after the authorisation letter (§11) is signed by Cure Global and the vendor, and the cloud provider's penetration-testing policy has been checked (notify the provider if it asks).
- **Window (proposal, inside Phase 6, 8 Mar – 16 Apr 2027):** kick-off 12 Mar 2027; testing 15–26 Mar; draft report 31 Mar; fixes to 7 Apr; retest 8–12 Apr; retest letter by 14 Apr; go/no-go 16 Apr.
- Hours: 08:00–20:00 Asia/Colombo on working days; automated scans outside those hours only when agreed in writing.
- The build under test is frozen: commit SHA and image digests are recorded at kick-off; fixes go to a separate retest build.

### 6.2 Allowed and not allowed

| Allowed | Not allowed |
|---|---|
| Manual and tool-assisted testing of §2.1 targets from the vendor's declared source IPs | Anything in §2.2; testing from undeclared IPs |
| Creating, changing and deleting **synthetic** data through the product | Accessing, copying or keeping data beyond what proves a finding (max 10 records per finding, synthetic only) |
| Exploiting a finding far enough to prove impact | Leaving back doors, web shells, persistent accounts or modified firmware after the test |
| Physical tests on the vendor-held hub unit (boot, disk, USB, JTAG/UART if reachable) | Physical tests on any other hardware or premises |
| Low-volume rate-limit probing (≤ 5 requests/second per tester, short bursts) | Denial of service, flooding, resource exhaustion |
| Static and dynamic analysis of the APK on the vendor's devices | Publishing the APK or findings |

### 6.3 Stop conditions

The vendor stops the affected activity and calls the emergency contact (§7) **within 1 hour** when:
- data that may belong to a real person appears (staging must never hold it — this is itself a critical finding);
- anything outside scope (production, a third party) is reached or affected;
- a **critical** finding is confirmed (remote code execution, authentication bypass, cross-family or teen-confidential data access, staff PHI access without break-glass, hub takeover from the LAN);
- staging becomes unstable or the audit chain verification fails because of testing.

### 6.4 Data handling

- Findings and evidence are stored encrypted at the vendor, shared only through the agreed encrypted channel, and contain synthetic data only (screenshots redacted if anything else appears).
- All test data, credentials and evidence are deleted 30 days after the retest letter; the vendor sends a certificate of destruction.
- After the test, Cure Global rotates every credential handed over, revokes the test hub, and removes the vendor IP allow-list.
- The vendor and every named tester sign an NDA; no sub-contracting without written approval. Data processing follows PDPA (vendor as processor for synthetic data; transfer terms if testers are outside Sri Lanka).

## 7. Contacts and emergency stop

| Role | Name | Channel |
|---|---|---|
| Engagement owner (Cure Global) | Dilshan Pathirana, product owner | *phone and email at kick-off* |
| Technical lead / on-call engineer | *to be named* | *on-call number* (`docs/06-operations/RUNBOOK.md`) |
| DPO | *to be appointed (E14-08)* | *email* |
| Clinical safety officer | *to be named* | *email* (only for findings that change clinical display or alerts) |
| Vendor engagement lead | *vendor* | *phone* |

**Emergency stop:** either side can stop testing at any time by calling the other's lead and confirming in the shared encrypted chat. Cure Global's kill switch: remove the vendor IPs from the staging allow-list and disable the test accounts and the test hub (`POST /api/v1/admin/hubs/{id}/revoke`); the on-call engineer follows the incident runbook if a real-data exposure is suspected.

## 8. Reporting

| Deliverable | When | Content |
|---|---|---|
| Test-plan acknowledgement | Before testing | This plan countersigned; tester names, tools, source IPs |
| Daily status | Each test day | Areas covered, blockers; critical findings already reported by phone |
| Draft report | +3 working days after testing | As final, for fact-checking |
| Final report | +5 working days after testing | Below |
| Retest report and letter | After the retest | Status per finding; a letter stating which critical/high findings are closed, for the go/no-go review and partners |

Each finding has: id; title; affected target and component; **CVSS 4.0** vector and score (base, plus environmental/threat metrics agreed with us — e.g. lower exploit maturity for staging-only issues), severity band (Critical 9.0–10.0, High 7.0–8.9, Medium 4.0–6.9, Low 0.1–3.9, None 0); CWE; references (WSTG, ASVS, MASVS, EN 303 645 provision, `THREAT_MODELS.md` id where one matches); description; reproduction steps; evidence (synthetic data only); impact for families, doctors and the platform; recommendation. The report also includes an executive summary, scope and method, coverage of the abuse cases in §4 (pass/fail each), and a machine-readable export (CSV or JSON) we import into the security backlog.

## 9. Fix deadlines (SLAs) and disposition

| Severity | Fix or mitigate within | Pilot gate |
|---|---|---|
| Critical | 72 hours (mitigation immediately) | **Blocking** — closed and retested before the pilot (E14-07) |
| High | 14 days | **Blocking** — closed and retested before the pilot (E14-07) |
| Medium | 60 days, or a documented risk acceptance by the engineering lead and the DPO | Not blocking if accepted with an owner and date |
| Low / informational | 90 days or backlog | Not blocking |

Every finding gets a disposition in `SECURITY_ASSESSMENT.md` (fixed with commit, mitigated, accepted with reason and expiry, or false positive with evidence), and the matching row in `THREAT_MODELS.md` is updated. Findings that touch clinical display or alerts are also reviewed by the CSO.

## 10. Retest

Included in the contract. Starts within 10 working days of our fix notification, on the retest build, covering every critical, high and medium finding and the abuse cases they touch. Output: retest report and the closure letter (§8).

## 11. Vendor requirements

- Independent of Cure Global's development team; testers with recognised qualifications (e.g. CREST CRT/CCT, OSCP/OSWE, GMOB/eMAPT for mobile, IoT hardware experience for the hub).
- Health-care or regulated-data experience; professional indemnity insurance.
- Signs this plan, the NDA and the authorisation letter; declares tools and source IPs.

## 12. Our pre-test checklist

- [ ] Staging deployed from `infra/tofu` with `APP_ENV=staging` (check `/api/v1/health` `env`), `VIRUS_SCANNER=clamd`, real keys from the secret store, no dev back doors.
- [ ] Synthetic seed loaded; test accounts created; SMS provider in test mode.
- [ ] Scanner run current and dispositioned (`SECURITY_ASSESSMENT.md`); H rows in `THREAT_MODELS.md` §8 closed or explicitly carried into the test.
- [ ] Test hub provisioned (`CH-PT-0001`), production image, paired; BLE peripherals packed; APK built against staging.
- [ ] Backups and monitoring on; restore drill result recorded; on-call staffed during the window.
- [ ] Vendor IPs allow-listed; cloud provider policy checked; contacts in §7 filled in.

## 13. Authorisation letter (template)

> **Authorisation to perform security testing**
>
> Date: ____________
>
> Cure Global (the "Client"), represented by ____________ (name, title), authorises ____________ (the "Vendor"), represented by ____________ (name, title), to perform security testing of the systems listed in section 2.1 of the Cure Global *Penetration test plan and rules of engagement* v____ (the "Plan"), from ____________ to ____________ (Asia/Colombo), from the source IP addresses ____________, by the named testers ____________.
>
> The Vendor will follow the Plan's rules of engagement (section 6), including the out-of-scope list (section 2.2), the stop conditions (section 6.3) and the data-handling terms (section 6.4). The Client confirms it owns or is authorised to permit testing of every in-scope system and has informed its hosting provider where required. Testing outside this scope, these dates or these addresses is not authorised.
>
> Emergency contacts: Client ____________ (phone) · Vendor ____________ (phone).
>
> For the Client: ____________ (signature, name, title, date)
>
> For the Vendor: ____________ (signature, name, title, date)

## 14. Sign-off

| Version | Date | Change | Approved by |
|---|---|---|---|
| 1.0 draft | 23 Oct 2026 | First plan | *pending: product owner, engineering lead, DPO* |
