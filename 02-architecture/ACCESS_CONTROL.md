# Cure Global — Roles, access control and consent

*v0.1 · 22 Oct 2026 · Who can see and do what, and why. This is the most important business-logic document: every endpoint calls the policy described here (`services/api/app/consent/policy.py`), and the matrix in §8 is an automated test (`services/api/tests/test_policy.py`, 301 cases, plus 55 through the database fact loader in `tests/test_access_api.py`; it grows with every epic).*

## 1. Model in one paragraph

Access is decided per request by **(actor, action, subject person, data category, purpose)**. Roles say what kind of actor someone is; **relationships** (self, guardian, family admin with a grant, care-team member, paired hub) say whose data they may touch; **consent records and access grants** say which categories; **module flags** add restrictions (teen-confidential, hub-safe, hub opt-in). Every record carries the `module_code` it was captured under, and the policy applies *that module's* flags whatever the category: a BP reading taken in `pregnancy.bp` is teen-confidential even though its category is `vitals`. Everything is deny-by-default, and every allow is audited with its basis and purpose.

## 2. Actors and roles

### 2.1 Platform (Super Admin web)
| Role | Can | Cannot |
|---|---|---|
| `super_admin` | Everything administrative: organisations, staff roles, doctor verification, catalogue releases and overrides, country packs, devices, billing, feature flags, DSAR handling | Read PHI without break-glass |
| `ops_support` | Families' administrative state (members' names, roles, invites, devices, sync, subscriptions), hub fleet, password/OTP resets with identity checks | Read PHI without break-glass |
| `content_manager` | Catalogue drafts, content items, translations, schedules (publishing needs clinical approval) | Publish clinical content alone; see PHI |
| `clinical_safety_officer` | Approve clinical content and catalogue releases, own the hazard log | See PHI |
| `dpo_auditor` | Read audit logs, consent records (metadata), DSAR queue, break-glass reports | Change data |
| `org_admin` | Manage their organisation's practitioners and programmes | See PHI unless also a practitioner on the care team |

Break-glass: any platform role can request time-boxed (≤ 60 min) access to one person's record with a written reason; approval by a second `super_admin` or `dpo_auditor` (single-person emergency mode allowed but flagged); the family is told; the DPO reviews every session.

### 2.2 Clinicians (Doctor web)
| Role | Notes |
|---|---|
| `doctor` | Verified licence required. Clinical read/write within care-team scope |
| `nurse`, `midwife` | Read + record observations and notes; cannot set targets or alert rules unless delegated by a doctor on the same team |
| `therapist` (speech, OT, physio, psychologist) | Scoped to `behaviour_support`, shared documents, messages and their own notes; `vitals` only if the person or guardian adds that category |
| `coordinator` | Programme follow-up: adherence, appointments, messages; vitals summaries only |

### 2.3 Family (Mobile app, Family Hub)
| Family role | Management rights | Health-data rights |
|---|---|---|
| `owner` (exactly one) | Everything in the family: invite/remove, roles, hub pairing, care teams, subscription, transfer ownership | Their own data; dependants' data through guardianship; other adults' data **only through grants** |
| `admin` | Same as owner except transfer ownership and delete family | Same rule as owner |
| `member` (adult with login) | Their own memberships and grants; add own doctors | Their own data; others only through grants |
| `dependant` (no login, or child/teen) | None | Accessed by guardians; teen has own login from the configured age |

**Guardianship** (from `guardianship`) is the legal basis to act for someone: `parent` (until the age of majority), `legal_guardian` (court/legal document), `health_proxy` (documented authority for an adult lacking capacity, e.g. advanced dementia), `designated_carer` (scoped, e.g. a hired carer recording medicines). Family role and guardianship are independent: a grandmother can be a family `admin` with no guardianship over anyone.

### 2.4 Devices
| Actor | Scope |
|---|---|
| Family Hub (device JWT) | Members of its family who have `hub_enabled` and the required consents. **`hub_safe` modules** in the hub categories (`HUB_CATEGORIES` in `packages/module-catalogue/python/cure_catalogue/categories.py`, shared by the policy and the catalogue validator): `identity`, `vitals`, `growth` (display), `medication` (today), `appointments` (next), `immunization` (due list), `conditions_allergies` (allergies and emergency summary only), `location_safety` (check-in, falls), `behaviour_support` (only `sn.visual_schedule` is hub-safe). **`hub_opt_in` modules** (pregnancy status and readings, postpartum, the elder location banner) only while a `hub_display` consent is active (§6). Never documents, notes, messages, biometrics, or sensitive data outside an opt-in |
| Mobile app install | Acts as the signed-in user; never more than the user |
| Traccar webhook | Can only create `location_event` for registered tracker devices |

## 3. Adults in the same family (the brief's "admin sees everyone", fixed)

- When an adult accepts an invitation, the app shows **"What can the family see?"** with three presets and a custom option:
  - **Everything** (all categories except `reproductive_health` and `mental_wellbeing`, which are asked separately),
  - **Essentials** (vitals, medication, appointments, immunisation, allergies — the default suggestion for elders),
  - **Nothing yet**.
- The choice creates `access_grant` rows to the grantee type `family_role:admin` (all current and future admins) or to named people.
- The adult can change it any time; changes take effect immediately on app and hub.
- **Elders who lack capacity** are covered by a `health_proxy` guardianship with evidence reviewed by support, not by grants.
- What admins always see, without grants: name, display name, photo (if consented for the family), family role, "done today / due" counts (no values), and safety alerts the adult opted into (SOS, missed check-in).

## 4. Doctors and care teams

- **Family care team** (e.g. the family doctor): covers members who are dependants of a consenting guardian, and adults who gave `share_with_care_team` for that team. A newly added adult is asked; nothing is shared until they agree.
- **Person care team** (e.g. a paediatrician for one child, an obstetrician for a pregnancy, a cardiologist for a grandfather): covers only that person.
- Each `care_team_member` has `categories`. Defaults by role:

| Role | Default categories |
|---|---|
| family_doctor | vitals, growth, immunization, medication, appointments, documents, conditions_allergies, clinical_notes, messages |
| paediatrician | as family_doctor, for that child |
| obstetrician / midwife | vitals, reproductive_health (this pregnancy), medication, documents, appointments, messages |
| specialist | vitals, medication, documents, conditions_allergies, clinical_notes, messages |
| therapist | behaviour_support, documents (shared), messages |
| coordinator | vitals (summaries), medication (adherence), appointments, messages |

- Sensitive categories (`reproductive_health`, `mental_wellbeing`, `behaviour_support` for adults) are never included by default for a family-level team; the person (or guardian for young children) shares them explicitly.
- **Linking** is double opt-in (`care_request`): family → verified doctor, or doctor → family code, accepted by an owner/admin (and by each adult for their own data).
- **Ending**: either side ends membership; access stops immediately; authored notes remain with authorship.

## 5. Children and teenagers

Configured per country pack (Sri Lanka proposals in brackets; confirm with counsel):

| Setting | Meaning | LK proposal |
|---|---|---|
| `age_of_majority` | Parent guardianship ends; full self-control | 18 |
| `digital_consent_age` | Below this, a guardian gives consent for processing | 16 (PDPA No. 9 of 2022: a child is under 16, all of a child's personal data is special-category, and consent means a parent's or guardian's consent) |
| `teen_login_age` | A child can get their own login (still under guardianship) | 13 |
| `teen_confidentiality_age` | `teen_confidential` modules are private to the teen by default | 16 |

Rules:
1. Below `teen_login_age`: guardians manage everything.
2. From `teen_login_age` to `teen_confidentiality_age`: the teen has a login; guardians still see everything, **except** modules the teen asks to keep confidential *and* a care-team doctor approves (`teen_confidential_opt_in`, recorded with the doctor's approval; API in BACKLOG E4-10).
3. From `teen_confidentiality_age` to `age_of_majority`: `teen_confidential` modules are private to the teen and their care team by default. **The one list** (the `teen_confidential: true` flag in the catalogue is the source of truth; the validator requires it on every reproductive-health module): cycle, contraception, preconception, menopause, all pregnancy, postpartum and pregnancy-loss modules, wellbeing check-ins, questionnaires (PHQ-9, EPDS…), confidential messages with the doctor. Guardians see **no trace** of these modules: not their content, not that they exist, not their reminders, appointments, vaccines or readings (each record carries its module, see §1). Everything else stays visible to guardians.
4. **At `teen_confidentiality_age` (re-consent):** the teen is asked, in the app, to confirm or change the consents and grants their guardians gave (`PRIVACY_CONSENT_SECURITY.md` §2), to review which care teams see what, and is told what is now private. Until they answer, the earlier consents stay in force, and confidential modules are private anyway. The worker raises this task on the birthday (MODULE_ENGINE.md §7).
5. At `age_of_majority`: guardianship (parent) ends automatically, the record locks to the person and their care team, the person is invited to claim their account and choose grants. Parents get a notice that access changed.
6. A guardian can never read the teen's confidential data through any other path: exports, FHIR, PDFs, the hub, notifications, alert texts, the family calendar, and **the "who viewed my record" view**, which hides events about teen-confidential modules from guardians (so a confidential consultation does not show up as "Dr S. Fernando viewed Thilini's record").
7. **Pregnancy under 16** is a safeguarding matter under Sri Lankan law. The platform does not decide it: only a clinician on the girl's care team can record a pregnancy episode for someone under `digital_consent_age`, which starts the safeguarding pathway in `CLINICAL_SAFETY.md` §4; who else may see it follows that clinician's documented decision.

**Family situations the rules must handle** (each has access-matrix cases before its epic closes):
- **Separated parents who are both guardians.** Each guardian acts independently for reads and routine records. Consent changes that widen access (new grants, new care teams, hub enrolment, research) need the guardian who *gave* the original consent, or every guardian if the country pack says so (`family_rules.joint_guardian_consent`, LK proposal false). A withdrawal by either guardian wins, as withdrawal always does (rule 3 of CLAUDE.md), and both are notified. A court order uploaded by support can remove or limit one parent's guardianship.
- **A minor mother.** A 16- or 17-year-old mother is the guardian (`parent`) of her baby, with the full rights of rule 1 for the baby's record, while she herself is still under her own guardians for non-confidential data. Her guardians get no access to the baby's record unless she grants it (or a court order gives them guardianship). Under 16, a clinician and support confirm guardianship arrangements with evidence.
- **A dependant elder in two homes.** One `person`, two family memberships; each family's admins see only what the elder (or their health proxy) granted to that family.

## 6. Sensitive modules and the shared screen

- Modules have `sensitivity` (normal / sensitive / restricted) and `hub_safe` (true/false) in the catalogue.
- The hub renders `hub_safe` modules only. It never shows `reproductive_health`, `mental_wellbeing` or teen-confidential data, even to the identified member (a shared screen can be seen by others), **except** through a `hub_opt_in` module the person switched on:
  - **What can be switched on:** pregnancy (week card, BP, weight, movements, glucose), postpartum check-ins, and the elder location banner ("Amma's watch: at home" — never a map). The catalogue marks these `hub_opt_in: true`.
  - **How:** consent purpose `hub_display`, per person and module, given in the app ("Show my pregnancy on the hub"). For an adult lacking capacity, the health proxy may give it. **For teen-confidential data only the person's own consent counts**: a guardian can't switch the hub on for a 16-year-old's pregnancy.
  - **Withdrawal** removes the cards from the hub at the next sync (≤ 60 s) and purges the hub's cached copy.
  - Readings the hub *captures* for a pregnant member who hasn't opted in are stored under `core.vitals`; the pregnancy alert rules still use every BP reading in the episode.
- Notifications (push, SMS, email, hub banners) never contain values, condition names or module names in the sensitive set. Example: "New message from your care team", not "Your HbA1c result".

## 7. Decision procedure (implemented in `app/consent/policy.py`)

```
decide(actor, action, subject, category, purpose):
  deny if subject.merged_into or (subject.deceased and action is write and actor is not clinician/support)
  if actor is platform staff:
      allow only administrative categories; PHI only inside an active break_glass_session for subject
  if actor is hub device:
      deny unless subject ∈ hub.family active members with hub_enabled
      allow if module is hub_safe, category ∈ HUB_CATEGORIES, category not sensitive, module not teen-confidential
      allow if module is hub_opt_in and a hub_display consent is active
               and (it was given by the subject, or teen confidentiality doesn't apply)
      deny
  if actor.person == subject:                                # self
      allow (except clinical_notes with visibility=care_team)
  if guardianship(actor.person → subject) active and covers category:
      if the record's module (or category) is teen-confidential for subject (§5): skip to care team / grants
      allow
  if care_team_member(actor.practitioner) active for subject and category ∈ member.categories
         and supporting consent active (or subject is a dependant of a consenting guardian):
      allow (purpose = treatment)
  if access_grant(subject → actor or actor's family role) active and category ∈ grant.categories
         and permission covers action:
      allow (purpose = family_care)
  deny
every allow → audit_event(actor, action, subject, resource, basis, purpose)
```

## 8. Access matrix (encoded in `services/api/tests/test_policy.py`)

Legend: ✔ allowed · ✖ denied · G with a grant · C with care-team scope + consent · P via guardianship · BG break-glass only

| Actor → / Data ↓ | Self | Owner/admin (adult subject) | Guardian (child < 16) | Guardian (teen 16–17), normal | Guardian (teen 16–17), confidential | Family doctor | Obstetrician (pregnancy team) | Therapist | Hub | Support |
|---|---|---|---|---|---|---|---|---|---|---|
| Identity & photo | ✔ | ✔ | ✔ | ✔ | — | C | C | C | ✔ (consented) | admin fields only |
| Vitals | ✔ | G | P | P | — | C | C | ✖ | ✔ (hub-safe) | BG |
| Growth | ✔ | G | P | P | — | C | ✖ | ✖ | ✔ | BG |
| Immunisation | ✔ | G | P | P | — | C | ✖ | ✖ | due list | BG |
| Medication | ✔ | G | P | P | — | C | C | ✖ | today | BG |
| Reproductive health (incl. pregnancy-module vitals, visits, vaccines) | ✔ | ✖ (unless explicit G) | P (< 16) | — | ✖ | C (explicit share) | C | ✖ | ✖, or status card with own `hub_display` opt-in | BG |
| Mental wellbeing | ✔ | ✖ (unless explicit G) | P (< 16) | — | ✖ | C (explicit share) | ✖ | C (explicit share) | ✖ | BG |
| Behaviour support | ✔ | G | P | P | — | C | ✖ | C | visual schedule only | BG |
| Location & safety | ✔ | G (safety alerts opt-in) | P | P | — | ✖ (unless shared) | ✖ | ✖ | check-in/falls; location banner with `hub_display` opt-in | BG |
| Clinical notes (care-team only) | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ (team) | ✔ (team) | own | ✖ | BG |
| Clinical notes (shared) | ✔ | G | P | P | — | ✔ | ✔ | own | ✖ | BG |
| Audit "who viewed my record" | ✔ | own only | P | P (teen-confidential events hidden) | ✖ | ✖ | ✖ | ✖ | ✖ | dpo_auditor |

## 9. Authentication requirements

| Actor | Factors | Session |
|---|---|---|
| Family member (app) | Phone OTP at sign-up; password; app lock (biometric/PIN) on the device; optional passkey | Access 15 min, refresh 30 d rotating (bound to the install) |
| Doctor, staff | Password + **mandatory** TOTP or passkey; re-auth for exports, break-glass, target changes in bulk | Access 15 min, refresh 12 h idle / 7 d max |
| Hub | Ed25519 challenge-response; key in TPM/secure element in production | Access 15 min, refresh 30 d rotating with reuse detection |
| Hub user | Face (signed vision proof) or Choose-your-picture + PIN; PIN for sensitive actions | Session ends when the face leaves (Cure Home rules) |

## 10. As built (Phase 1, 23 Oct 2026)

- **One entry point.** `services/api/app/consent/service.py` `authorize()` / `AccessContext` loads the facts (self,
  guardianship, family roles, grants incl. `family_role:<family_id>:admin`, care-team coverage, break-glass, hub
  membership, `hub_display` and teen-confidentiality consents, the module's flags and data categories) and calls the pure
  `Policy.decide`. Allows are audited with basis and purpose; every denial answers the same 403 wording; a module the
  caller may not see answers 404 (no trace).
- **The module's sensitive categories must be covered too.** A record's module `data_categories ∩ {reproductive_health,
  mental_wellbeing}` are added to what a care team, a guardian's listed scope or a grant must cover, so a vitals-only grant
  or the family doctor does not open a `pregnancy.bp` reading (the "Reproductive health (incl. pregnancy-module vitals…)"
  row of §8). For a 16–17-year-old, a grant opens teen-confidential data only through an explicit share of its sensitive
  category; confidential messages never open through a grant.
- **Identity for co-members and clinicians.** Every active co-member of a family reads names, display names, roles and
  the hub profile (basis `family`); a covering clinician reads who their patient is (basis `care_team`). Nothing else
  comes without a grant (the "counts only" rule of §3; done/due counts arrive with records in wave 2).
- **Presets** (build-brief decision §2): Everything = every category except `reproductive_health` and `mental_wellbeing`
  (separate opt-ins); Essentials = vitals, medication, appointments, immunization, conditions_allergies; Nothing; custom.
  Each change is a new `share_with_family` consent (the previous one is withdrawn as superseded and its grant revoked).
- **Default categories:** as §4, except obstetrician and midwife also get `clinical_notes`, so the pregnancy team has its
  own care-team notes (the §8 row says ✔).
- **Guardianship:** `legal_guardian` and `health_proxy` count only after support approves the evidence
  (`review_status`); `parent` and `designated_carer` count at once. `parent` and a minor's `legal_guardian` end at the age
  of majority (worker), with a handover task and a notice to the parents.
- **Separated parents:** `policy.guardian_consent_change()` — withdrawal or narrowing by either guardian wins; widening
  needs the guardian who gave the consent; with `family_rules.joint_guardian_consent` a new consent waits for every
  guardian's co-signature (`POST /consents/{id}/cosign`).
- **Break-glass:** `break_glass_session` (requested → active → ended / expired / rejected); `rel.break_glass` only for the
  requesting staff member, for that person, inside the window. The family and the DPO are notified (ids only).
- **Doctors and staff** need TOTP; an access token without the `mfa` claim can't act as practitioner or staff. Suspended
  practitioners lose coverage on the next request (coverage counts verified practitioners only) and their sessions end.
- **Every route declares its protection** (`x-access` in OpenAPI; `tests/test_routes.py`).
- **Clinical notes (wave 3).** A care-team note needs the module's sensitive categories too (a pregnancy-team note isn't the
  family doctor's); the author reads their own notes while still covering the person (the therapist's "own"); a note
  shared with the subject reaches the person and their guardians but never opens through a grant; shared with family
  viewers it also reaches grant holders with `clinical_notes` (§8 "Clinical notes (shared)"). Matrix: `tests/test_policy.py`
  rows `notes_*`, `tests/test_policy_notes.py`.
- **Alerts, exports, live events (wave 3).** An alert is filed under a module like a record (`app/alerts/views.py`):
  clinical alerts reach covering clinicians only; family safety alerts (SOS, missed check-in, inactivity) reach whoever may
  read location & safety and, without a grant, the family's owners/admins and guardians; every escalation recipient is
  checked. FHIR, PDF and the event stream decide per record with the same policy; staff get no export outside break-glass.

## 12. As built — R2 part B (backend-r2b, 23 Oct 2026)

- **Therapists** read and write behaviour support (behaviour log, sleep diary, visual schedule, care profile, therapy goals),
  shared documents, messages and their own notes — never vitals, medication, location, conditions or the Down syndrome
  checklist; goals are set by a covering practitioner only. Matrix: `tests/test_r2b_access.py` (`test_therapist_scope`,
  `test_asha_on_kavindu`).
- **Location & safety** (`elder.safety_gps`): the person, guardians/health proxy and carers with a `location_safety` grant
  read places, events and the last location (each request audited; the person is told); family owners/admins without a grant
  receive the safety alerts only (§3). Registration needs `location_tracking` consent or a proxy's best-interest consent. The
  hub gets one status word, only with the person's own `hub_display` opt-in.
- **A minor mother** (§5): the 16–17-year-old registers her baby herself and is its `parent` guardian; her own guardians get no
  access to the baby (identity only, as co-members) until she grants it; nobody else can register a minor's baby (403
  `minor-mother`); under 16 is the safeguarding pathway (409) and a `parent` guardian under 16 needs reviewed evidence.
- **Merged records** are denied on every path (`Subject.merged`); merging needs every family's (and each adult record
  holder's) consent.
- **Shared summaries** (wandering plan, communication passport) are snapshots of what the *sharer* may read; the public link
  expires (≤ 72 h / ≤ 7 days), can be withdrawn, and every view is audited.
- **Step-up (§9)** is enforced for doctors and staff (`app/identity/stepup.py`): exports, shares, break-glass, bulk target
  changes, DSAR completion, merges and evidence views need a sign-in or `POST /auth/reauth` within 10 minutes.
- **Support** sees care links without the kind of a sensitive person-level link, and evidence documents through signed,
  audited links — never health records.

## 13. As built (R3, 23 Oct 2026)

Matrix: `services/api/tests/test_policy_r3.py` (pure cases) and `tests/test_z_r3_*.py` (through the database).

- **Coordinator (§2.2).** Categories a practitioner covers *only* through a `coordinator` care-team membership are limited:
  `vitals` as **summaries only** (`Request.summary`: cohort averages and changes, counts, status against the person's own
  target, weekly series — never individual readings), `medication` **read-only** (adherence), `appointments` and `messages` as
  usual; no notes, documents, targets or alert rules. A full membership (doctor, nurse…) on the same person lifts the limit
  (`care/coverage.py care_team_scope_for`). Sensitive and teen-confidential modules stay out as for any family-level member.
- **Organisation admin (§2.1).** `org_admin` is staff bound to one organisation. As staff it reads administrative identity only —
  no PHI, no summaries, and it can't request break-glass (`PLATFORM_ROLES` excludes it). The same account acting as a
  practitioner reads patients only through the care team. Org views carry counts, suppressed under 5.
- **SMART apps (E19-04).** An app's token makes the authorising user the actor, narrowed by `Relationship.app_categories`
  (from the granted scopes): read only, bound to one patient (anyone else → refused), and sensitive or teen-confidential data
  only when the **subject** authorised the app themselves and chose "include sensitive" — a guardian can connect an app for a
  child, never with the child's sensitive data. The authorisation is a `smart_app` consent: withdrawal or revocation ends the
  app's access on its next request. Reads are audited as exports (`purpose=third_party_app`).
- **HMS connector and wearables.** Only the person, a parent/legal guardian of a minor or a health proxy links an HMS record
  or a wearable cloud; imports and scheduled syncs run as that person through the policy (a lost guardianship stops them);
  withdrawing `hms_connector` stops every sync.
- **Read-only after a lapse (E21-03)** is not an access rule but a write refusal on top of it: a family user's writes on a
  lapsed person/family answer 402 `read-only`; reads, exports, safety and privacy actions are never blocked.
