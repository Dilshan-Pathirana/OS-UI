# Cure Global — Support playbook

*v0.1 · 23 Oct 2026 · DRAFT for the pilot (E20-05). Needs sign-off by the product owner, the DPO (privacy rules, identity
checks, DSAR intake, safety concerns) and the CSO (emergency and clinical-question scripts). The Sinhala and Tamil
versions of the scripts need native-speaker review, and the clinical wording a native-speaker clinician (CLAUDE.md
rule 13). Engineering procedures: [`RUNBOOK.md`](RUNBOOK.md). App screen names (*Profile → Privacy → My data*, *Family →
Hub → Add hub* …) are provisional until the mobile app (E16) is built; admin-console routes are as built.*

## 1. What support is — and is not

Support helps families and doctors **use** Cure Global: sign-in, invitations, dependants, consents, hubs, devices,
the app. Support is **not** a clinical service and **not** an emergency service.

- **Never** interpret a reading, advise on symptoms, medicines or doses, or say whether something is "normal".
  Clinical questions go to the person's own doctor (in-app messages, not for emergencies) or, if urgent, 1990 / hospital.
- **Never** read health data. Support staff (`ops_support`) see administrative data only (§3). Looking at a record needs
  a break-glass session, which support does not open on its own (§3.3).
- **Emergencies:** the platform is not monitored 24/7. Always give the national numbers first (§7).

## 2. Channels, hours, SLAs

| Channel | Hours (Asia/Colombo) | For |
|---|---|---|
| **WhatsApp Business line** (pilot: one number, shared inbox, 2 agents per shift) | Mon–Sat 08:00–20:00, Sun 09:00–13:00 | Families and doctors; the number is printed on the hub box, in the app (Help) and on the doctor onboarding sheet |
| Phone call-back | Same hours, on request in WhatsApp | Elders, identity checks, safety concerns |
| Email (support@…) | Answered within the SLA | Doctors, organisations, formal complaints, DSAR letters |
| In-app "Help" | Always (FAQ offline in en/si/ta) | Self-service |

Outside hours an auto-reply gives the emergency numbers, says when we will answer, and links the FAQ.

| Ticket type | First response | Target resolution |
|---|---|---|
| Safety concern (§6) | **30 min** in hours; first thing next opening otherwise (the auto-reply tells the person how to reach police 119 / 1929 now) | Restriction in place within 1 h of verification |
| Can't sign in / OTP / locked out | 1 h | Same day |
| Hub offline / broken | 4 h | Swap-out shipped in 2 working days (Colombo), 4 (elsewhere) |
| Invites, dependants, consents | 4 h | 1 working day |
| Doctor onboarding / verification | 1 working day | 3 working days (verification by admin) |
| DSAR (§8) | 1 working day (acknowledge) | Legal deadline: one month, DPO-owned |
| Complaint (§10) | 1 working day | 10 working days |

## 3. What support can see and do

### 3.1 Admin console (`admin.<domain>`, staff account with TOTP)

| Need | Where | API (for reference) | Notes |
|---|---|---|---|
| Find a family | Families → search by family name, member name, or a member's phone/email | `GET /api/v1/admin/families?query=` | Phone/email are matched by keyed hash — support never sees the stored number in full |
| Family detail | Family page | `GET /api/v1/admin/families/{family_id}` | Members, roles, hub profiles (display name, avatar colour, language, vital kinds), account state, invites (masked), consent **metadata**. No clinical data, no care-team names (they can reveal a pregnancy), sensitive hub opt-ins shown as "(sensitive)" |
| Resend / revoke an invite | Family → Invites | `POST /api/v1/admin/families/{family_id}/support-actions` `resend_invite` / `revoke_invite` | Reason (≥ 10 characters) required; audited (only its length is kept) |
| Unlock an account | Family → member | same, `unlock_account` | After identity check (§4) |
| Sign out everywhere | Family → member | same, `end_sessions` | Lost/stolen phone; suspected account takeover |
| Guardianship evidence | Guardianships queue | `GET /api/v1/admin/guardianships`, `POST …/{guardianship_id}/review` | Legal guardian and health proxy need approved evidence; parents of their own children don't |
| Record a death | Person | `POST /api/v1/admin/persons/{person_id}/deceased` | With the family's notification and evidence; stops reminders |
| Hubs | Hubs | `GET /api/v1/admin/hubs`, `GET …/{device_id}`, `POST /api/v1/admin/hubs`, `POST …/{device_id}/revoke` | Status, online/offline, last heartbeat, sync lag, queue, firmware, peripheral batteries |
| Doctors | Practitioners | `GET /api/v1/admin/practitioners`, `POST …/{practitioner_id}/{action}` | Verification by admin staff; support only collects documents |
| Notification delivery | Notifications | `GET /api/v1/admin/notifications/stats` | Per channel per day, error codes; no recipients or texts |
| Safety concern | Person → Safety concern | `POST /api/v1/admin/persons/{person_id}/safety-concern` | §6 |

Every page view and action is audited with your staff id and purpose `support`.

### 3.2 What support must never do

- Ask for, accept or forward **health information** in WhatsApp ("send me a photo of the reading"). If a family sends
  some anyway: don't reply to it, delete the media from the shared inbox, and tag the ticket `phi-received` (the DPO
  reviews those weekly).
- Read OTP codes back or ask for passwords, OTPs, TOTP or recovery codes. **Cure Global never asks for a code** — say so.
- Tell one family member anything about another adult's data, consents or care team. Each adult controls what the family
  sees ("What can the family see?").
- Tell a guardian anything about a 16–17-year-old's confidential modules (cycle, contraception, pregnancy, wellbeing,
  confidential messages — CLAUDE.md rule 4). The honest answer to "what is my daughter doing in the app?" is: "Some parts
  of the app are private to her from 16. She can show you if she wants to."
- Change consents or grants for someone. Only the person (or their guardian for a child) can, in the app.

### 3.3 Break-glass

Support does not open break-glass sessions to "have a look". A session (`POST /api/v1/admin/break-glass`) needs a written
reason, lasts at most 60 minutes, needs a second approver (super admin or DPO) unless it is a flagged single-person
emergency, notifies the family, and is reviewed by the DPO within 2 working days. Typical valid case: a doctor reports
data in the wrong person's chart and engineering needs to see the record to fix the attribution — engineering opens it,
not support.

## 4. Identity verification (before any account action)

Never act on a WhatsApp message alone. Verify, then act:

1. **Call back** the phone number registered on the account — not the number that messaged you, if different. The
   console never shows the full stored number: ask the person for it, search with it (Families search matches it by
   keyed hash), and call that number only if it finds their account.
2. Ask two of: full name and date of birth of the account holder; the family name in the app; the names of two family
   members; the hub's serial (on the hub's back label) for hub requests.
3. Family **owners/admins** may ask for invites and hub actions for their family. **Adults** may ask only for their own
   account. **Guardians** for their children under 16.
4. Note "identity verified by call-back" (no answers) in the ticket.

Failed verification → no action, polite explanation, ticket tag `id-failed`. Three failures on the same account in a day →
tell the security on-call (possible takeover attempt).

## 5. Hubs

### 5.1 "My hub is offline"

1. Admin console → Hubs → find by serial or family name. Look at last heartbeat, sync lag, queue length.
2. Script (en): *"Your hub keeps working without the internet and saves the readings. Please check that it is plugged in
   and that the Wi-Fi router is on. If you changed your Wi-Fi name or password, open Settings on the hub and choose the
   network again."*
3. Offline > 24 h with power and Wi-Fi fine → guided restart (hold the power button 10 s, wait 2 minutes).
4. Still offline → swap-out (§5.4). Ask whether readings were taken while it was offline — they are on the hub and sync
   when it is back; a dead hub may lose them (RUNBOOK.md §8).

### 5.2 Pairing a new hub

The family **owner or an admin** pairs it: the hub shows a 6-character code (valid 10 minutes) and a QR; in the app
*Family → Hub → Add hub* they enter or scan it. Other members can't. Code expired → restart pairing on the hub for a new
code. "Only the family owner or an admin can pair a hub" → ask the owner, or the owner makes them an admin.

### 5.3 Peripherals and batteries

The hub detail lists peripherals with battery levels. Low battery → tell the family which device (scale, BP monitor,
thermometer) needs batteries (type printed on the device kit card). A device the hub no longer sees → re-pair it from the
hub's Devices screen. Readings from a device that is not on the approved list show as "estimated" or are refused — that
is deliberate (HZ-08).

### 5.4 Swap-out logistics

1. Verify identity (owner/admin).
2. Lost or stolen → ask engineering to **revoke now** (RUNBOOK.md §8 step 2) before anything else.
3. Book the courier: replacement hub (pre-provisioned serial) + return bag; signature on delivery; address taken on the
   call, kept in the courier system only — never in the ticket text.
4. With the new hub: family plugs in, joins Wi-Fi, pairs it (§5.2). Members, profiles and history come back by themselves.
   **Tell them:** faces must be enrolled again on the new hub (face data never leaves a hub), and devices (scale, BP
   monitor) must be paired again. Babies are never face-enrolled.
5. Return the old hub in the bag; engineering wipes it.
6. Close when the new hub shows a heartbeat and the family confirms a reading.

## 6. Safety concerns (E4-09, HZ-13) — fast path

When someone says a family member is controlling, threatening or harming them through Cure Global (location, readings,
messages), or that they don't want a named person to see their data **at all**:

1. **Believe and act.** Don't ask for proof of abuse. Do verify it is really the person (call back on their own number;
   if that is not safe for them, agree a safe time or channel — never call while the other person may be there).
2. In the admin console: Person → **Safety concern** → choose the named family members → reason (kept encrypted, seen
   only by authorised staff) → confirm (`POST /api/v1/admin/persons/{person_id}/safety-concern`). In one step: every
   grant to them is revoked; family sharing, guardianship and admin visibility (counts, alerts, SOS, location) are blocked
   for those members; queued messages to them about the person are cancelled; the hub refreshes. **The named members are
   not notified.**
3. Tell the person what changed, and that they can also leave the family or remove sharing in the app themselves at any
   time without anyone's approval.
4. Give the help numbers: police **119**; women's helpline **1938**; child protection (NCPA) **1929** ⚠ verify all three
   before go-live. If a child is at risk, also follow the safeguarding pathway (CLINICAL_SAFETY.md §4.2) through the CSO.
5. Ticket: tag `safety-concern`, **no details** in the ticket text (ids only); the DPO is informed the same day.
6. Ending a restriction (`POST /api/v1/admin/safety-restrictions/{restriction_id}/end`) only on the protected person's own
   verified request.

## 7. Emergencies

Script (all languages, first line of every reply that sounds urgent):

> *"Cure Global is not an emergency service and is not watched 24 hours a day. If someone is very unwell or in danger,
> call **1990** (Suwa Seriya ambulance) or **119** (police), or go to the nearest hospital now."*

- Then, if relevant: a reading that worries them → "measure again, and call your doctor or 1990 if you are worried" —
  never "that is fine" or "that is high".
- A pregnant woman with headache, vision changes, pain under the ribs, bleeding, or fewer baby movements → *"Go to your
  maternity unit now or call 1990."* (CLINICAL_SAFETY.md §4.1).
- An SOS or alert they think didn't reach anyone → check delivery in Notifications stats (counts and error codes only),
  tell engineering on-call (RUNBOOK.md: `NotificationFailures*`), and make sure they have called 1990 / their carer.
- A doctor reporting a clinical safety issue with the platform (wrong data in a chart, a missing alert) → SEV1 to
  engineering on-call **and** the CSO at once.

## 8. Data-subject requests (intake)

People may ask to **see, export, correct or delete** their data, or to restrict or object to processing (PDPA). Support
takes the request in; the **DPO** handles it (`dpo_auditor` role; RUNBOOK.md §10.2).

1. Best route: the person asks in the app (*Profile → Privacy → My data*), which files the request with a one-month due
   date. For a child under 16 the parent or guardian asks.
2. On WhatsApp/email: verify identity (§4), then file it for them in the admin console or forward to the DPO mailbox the
   same day with the person id — the clock starts when we receive the request, not when the DPO reads it.
3. Exports are delivered as a short-lived signed link in the app — **never** send data over WhatsApp or email.
4. "Delete everything": explain (script) that some records are kept by law (audit trail, records under a legal hold) and
   that the DPO confirms in writing what was erased.
5. Teen (16–17) requests: the teen asks for themselves; a guardian's request for a teen's data never includes the teen's
   confidential modules.

## 9. Status notices

Prepared texts for outages (engineering on-call asks support to post them; no PHI, no blame):

- **Degraded:** *"Some parts of Cure Global are slow right now. Your hub and app keep saving readings and will send them
  when the service is back. In an emergency call 1990."*
- **Notifications delayed:** *"Alerts and reminders may arrive late right now. If you are worried about someone, call them
  or 1990. We will tell you when this is fixed."* (CSO decides when to use it.)
- **Resolved:** *"Cure Global is working normally again. Readings saved during the outage have been sent."*

## 10. Complaints

1. Acknowledge within 1 working day, with a ticket number. Listen; don't argue; no clinical statements.
2. Classify: service, billing, privacy (→ DPO), clinical / safety (→ CSO; the CSO decides whether it is a hazard-log item —
   CLINICAL_SAFETY.md §2 step 6), doctor conduct (→ medical director; professional matters to the SLMC are the
   complainant's right).
3. Resolve within 10 working days or explain the delay. Privacy complainants are told they may also complain to the Data
   Protection Authority.
4. Monthly: complaints by category to the product owner, CSO and DPO.

## 11. Macros (en; si/ta to be translated and reviewed)

| Code | When | Text (en) |
|---|---|---|
| `M-OTP` | OTP not received | "Codes can take up to a minute. Please check the number is correct and that you have signal. You can ask for a new code after a short wait (at most 3 codes in 10 minutes). Cure Global will never ask you to tell us a code." |
| `M-LOCK` | Locked after wrong passwords | "For your safety the account pauses after several wrong passwords. You can reset your password in the app with a code to your phone, or we can unlock it after a quick call to check it's you." |
| `M-INVITE` | Invite not arrived / expired | "Invitations last 7 days. The family owner or an admin can resend it from Family → Members, or we can resend it after checking with them." |
| `M-DEPENDANT` | Adding a child | "Parents add children under Family → Add a family member → Child. A legal guardian (not a parent) also uploads the court or other document; we check it before it's active." |
| `M-SHARE` | "Why can't I see my mother's readings?" | "Every adult decides what the family can see. Your mother can open Profile → What can the family see? and choose Everything, Essentials or her own selection. She can change it at any time." |
| `M-TEEN` | Guardian asks about a teen | "From 16 some parts of the app are private to your child, as the law and good care expect. They can show you anything they choose." |
| `M-HUB-OFF` | Hub offline | §5.1 script |
| `M-HUB-SWAP` | Replacement | "We'll send a new hub. When it arrives, plug it in and connect Wi-Fi, then the family owner pairs it in the app. Everyone's profiles come back by themselves; faces and devices need to be set up again." |
| `M-NOT-MEDICAL` | Any clinical question | "We can't give medical advice. Please ask your doctor in the app's messages, or call 1990 if it is urgent." |
| `M-EMERGENCY` | Anything urgent | §7 script |
| `M-DSAR` | Data request | "You can ask for your data in the app under Profile → Privacy → My data. We answer within one month. We'll never send health data over WhatsApp." |
| `M-PHI` | Family sent a reading/photo | "Thank you — please don't send health information here, this chat is not private enough. Your doctor can see your readings in Cure Global." |
| `M-CLOSED` | Outside hours (auto-reply) | "We're closed now and will answer from <time>. In an emergency call 1990 or 119." |

## 12. Ticket categories (tags)

`access` (sign-in, OTP, lock, MFA) · `invite` · `dependant` · `guardianship` · `consent-sharing` · `teen` · `hub-offline` ·
`hub-pairing` · `hub-swap` · `peripheral` · `app-bug` · `doctor-onboarding` · `doctor-linking` · `notification` · `dsar` ·
`safety-concern` · `complaint` · `billing` (R3) · `phi-received` · `id-failed` · `emergency-redirected`.

Tickets hold ids (person, family, device), categories and what was done — never readings, diagnoses, addresses or free
text from the family about their health.

## 13. Escalation map

| To | When | How |
|---|---|---|
| Engineering on-call | Anything broken for more than one family; hub fleet issues; suspected bug in what someone can see | Incident channel / page (RUNBOOK.md §2) |
| CSO | Clinical safety: wrong data in a chart, missed alert, a family acting on something the app showed | Phone + ticket `clinical` |
| DPO | Safety concerns (same day), DSARs, privacy complaints, `phi-received`, anything that might be a breach (**at once** — BREACH_PROCEDURE.md) | DPO mailbox + phone for breaches |
| The person's doctor | Never directly by support; the family messages their doctor in the app | — |
| Product owner | Repeated complaints, policy questions, press or regulator contact | Email |

## 14. Onboarding help (pilot)

- **Families:** a 20-minute onboarding call or home visit with the hub: sign in with phone + OTP; create the family;
  add dependants; invite adults; each adult's "What can the family see?" step (Everything pre-selected; reproductive and
  mental-wellbeing data are separate opt-ins); pair the hub; enrol faces (adults and older children only); pair the
  devices; take one reading per person; show where Help and the emergency numbers are. Training outline:
  [`TRAINING_OUTLINES.md`](TRAINING_OUTLINES.md).
- **Doctors:** account with email + password + TOTP (recovery codes printed and kept safe); licence verification;
  linking with families by code; the worklist; setting targets; marking reviewed. Support collects verification
  documents only through the console's upload, never by WhatsApp.
- Keep a short log per pilot family (date, steps done, open issues; no health data).
