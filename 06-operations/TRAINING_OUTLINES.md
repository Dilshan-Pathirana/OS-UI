# Cure Global — Training material outlines (pilot)

*v0.1 · 23 Oct 2026 · ROADMAP Phase 6 pilot logistics ("training material"). Outlines only: the materials themselves (videos, leaflets, quick cards, slides) are produced by people and reviewed as listed. Family materials are in **en / si / ta**; medical wording is reviewed by native-speaker clinicians (CLAUDE.md rule 13) and every clinical statement by the Clinical Safety Officer (CSO). Copy must match the intended purpose (`STANDARDS_AND_REGULATIONS.md` §1): no "diagnoses", "detects", "monitors 24/7", accuracy claims for the hub, or "approved by NMRA". All screenshots and examples use the synthetic demo families (Perera, Fernando) — never real people.*

Shared rules for every audience:
- The four status phrases exactly as shipped: **● Within your target · ▲ Above / Below your target · ! Talk to your doctor · ? Check this reading** — always with the symbol and the words, never colour alone.
- **Cure Global is not an emergency service.** In an emergency call **1990** (Suwa Seriya ambulance) or go to the nearest hospital. The platform is not monitored 24 hours a day.
- Privacy is a feature people control: who sees what is decided by consent and can be changed at any time.

---

## A. Families (adults, guardians, carers; elders with a helper)

**Format:** a 60–75 minute assisted onboarding at the Cure branch or at home during hub installation, plus take-home materials; a 15-minute follow-up call in week 1 and week 4. Elders and low-literacy users get one-to-one sessions with a family helper present (assisted consent is attested and notified to the person).

**Learning objectives** — after training, a family member can:
1. Sign in with phone OTP and password, set the app lock, and switch between family members in the app.
2. Explain in their own words what "What can the family see?" means for them, choose Everything / Essentials / Nothing / custom, and change or withdraw it later.
3. Take a reading on the hub for themselves and for a dependant (proxy measurement), and fix a reading filed under the wrong person ("Who was this?" inbox).
4. Read the four status phrases correctly, and say who set the target and when.
5. Say what the platform does not do and what to do in an emergency.
6. Use the daily "I'm OK" check-in and SOS (elders and their carers), and know that being seen by the camera is not a check-in.

| # | Module | Duration | Content | Materials to produce |
|---|---|---|---|---|
| A1 | Welcome and what Cure Global is (and is not) | 5 min | Record keeping, sharing with your doctor, reminders; not a doctor, not a diagnosis, not an emergency service (1990) | 90-second video (en/si/ta); leaflet page 1 |
| A2 | Accounts, family and members | 10 min | Person ≠ account: dependants have no login; the owner and admins; invites; teen accounts from 13 | Quick card "Your family in the app" |
| A3 | Consent and "What can the family see?" | 10 min | Purposes in plain words; Everything pre-selected except reproductive health and mental wellbeing (separate opt-ins); Essentials; Nothing; withdraw anytime and it takes effect everywhere; "who viewed my record"; safety-concern fast path ("I don't want this person to see my data") | Consent explainer leaflet (en/si/ta) reviewed by counsel; video |
| A4 | Teen privacy | 5 min (guardians and teens 13–17) | From 16 to 18, cycle, pregnancy, contraception, wellbeing, questionnaires and confidential messages are private to the teen on every surface — guardians see no trace; at 16 and 18 the teen re-confirms consents; the 13–15 confidentiality opt-in with a clinician | Leaflet "Your teen's health record" (CSO + DPO review) |
| A5 | The Family Hub | 15 min | Face sign-in (optional; face data never leaves the hub; infants are never face-enrolled); measuring: rest, posture, two BP readings; proxy measurement for a child or elder and infant weighing (difference stored); the "Who was this?" inbox; simple mode for elders; quick logs (feeds, nappies, seizure timer, fall) where enabled; sensitive modules never shown on the hub (pregnancy only with the mother's own opt-in) | Hub quick-start card (laminated, en/si/ta, TRCSL label reference); 3-minute video per task |
| A6 | Reading the results | 10 min | Values, trends, sources (hub, app, Health Connect, typed in); the four phrases; "target set by Dr X on date"; no target set → no phrase; "? Check this reading" only for impossible values or unit mix-ups — a very high or low real reading shows a **safety-net text** instead: measure again, and call 1990 / go to hospital if the same or unwell; wearable (cuffless) readings are "Estimated" and don't count towards targets; growth charts show grey reference curves without labels | Quick card "What the words mean" (CSO-approved) |
| A7 | Medicines, vaccines, appointments | 5 min | Doses as prescribed (no dose advice in the app); marking taken/skipped; vaccine records (parent-entered doses stay unverified until checked); reminders | Quick card |
| A8 | Elders: check-in, SOS, escalation | 10 min | Daily "I'm OK" by tap or voice; missed check-in → carers in order (push → next carer → SMS → emergency contact) until someone acknowledges; SOS on hub and app; test alert during installation | Carer card "When Amma doesn't check in" |
| A9 | Pregnancy (when relevant) | 10 min | Add your MOH clinic and midwife (PHM) as external contacts; pregnancy BP: cuff only (no wrist or watch BP); severe-range readings show a fixed text and notify the admins she chose; "Reduced movements" button = contact the maternity unit now; warning symptoms always visible | Maternity leaflet (obstetrician + CSO review) |
| A10 | Getting help | 5 min | WhatsApp support line and hours; what support can and cannot see (no health data); hub swap-out within 48 h; how to report a problem or a wrong reading | Support card with the number |

**Assessment:** teach-back during the session (the trainer asks the person to show A3, A5, A6 items 1–4 and say what to do in an emergency); a 5-question picture quiz on the four phrases; follow-up call checks whether readings are attributed correctly and the family changed nothing it did not intend. Record completion (not answers) in the pilot tracker.
**Sign-off:** content — CSO (A4, A6, A8, A9), DPO + counsel (A3, A4), product owner; translations — native-speaker clinicians; usability — summative usability findings (`docs/06-testing/USABILITY_SUMMATIVE_PLAN.md`) fed back before printing.

---

## B. Doctors (family physicians, paediatricians, obstetricians, therapists)

**Format:** 90-minute onboarding (live, remote or at the branch) on the demo stack with the synthetic families, plus a 2-page quick reference and short screen videos; office hours weekly during the first month.

**Learning objectives** — after training, a doctor can:
1. Sign in with email, password and TOTP; store recovery codes; explain why MFA is mandatory.
2. Explain which categories their care-team role gives them, and how families add or end the link.
3. Work the worklist in urgency order and clear it (alerts → due reviews → new data).
4. Set personal targets and attention levels correctly, and know families see only those (never population thresholds).
5. Write notes with the right visibility, acknowledge alerts, and mark data reviewed with a message.
6. Respect teen confidentiality and the safeguarding pathway.

| # | Module | Duration | Content | Materials |
|---|---|---|---|---|
| B1 | Purpose and limits | 10 min | Intended purpose; the platform does not diagnose or triage; not monitored 24/7 — set expectations with families (availability text, response time); clinical responsibility stays with the doctor | Slides; signed acknowledgement |
| B2 | Sign-in and security | 5 min | Email + password + TOTP; recovery codes; session timeouts (12 h idle); never share accounts; report a lost phone; no screenshots of patient data into chats | Quick reference |
| B3 | Care teams and categories | 10 min | Double opt-in linking (care requests); role defaults (family doctor/paediatrician, obstetrician/midwife: reproductive health, therapist: behaviour support, …); category scopes; leaving a team; families can end access at any time | Diagram "What your role sees" |
| B4 | The worklist and the member chart | 15 min | Urgency order; provenance markers (filled = measured, hollow = estimated; source and "identified by"); targets band on charts; growth charts with z-scores (doctor only; placeholder reference until the WHO licence — D-9); targets older than 12 months flagged (HZ-02) | Screen video |
| B5 | Targets and attention levels | 15 min | Validation rules; per-context targets; what families see (● ▲ ! phrases with "set by Dr X on date"); pregnancy: set attention levels or explicitly decline within 7 days, otherwise the default safety net applies (HZ-04); urgent bands are fixed and CSO-approved | Worked examples on the demo families |
| B6 | Reviews, notes and messages | 10 min | Mark reviewed with a message (shown on app and hub); note visibility: care team · shared with the person (and guardians) · shared with family viewers the person granted; amendments never overwrite; messages are not for emergencies | Quick reference |
| B7 | Alerts and escalation | 10 min | Doctor-defined alert rules; acknowledging; what the family's escalation chain does; synthetic alert tests; no condition names in notifications | Slides |
| B8 | Teen confidentiality and safeguarding | 10 min | 16–17: confidential modules hidden from guardians on every path including PDF/FHIR; the 13–15 opt-in decision; a pregnancy under 16 can only be recorded by a clinician on her care team and starts the safeguarding pathway (record restricted, national child-protection procedures — hotline ⚠ verify) (HZ-19) | Case scenarios (CSO-written) |
| B9 | Exports | 5 min | PDF report (period, respects confidentiality); FHIR R4 export; both audited; share only through the platform | Quick reference |
| B10 | Break-glass is not for doctors | 2 min | Doctors see data through care-team coverage and grants only; break-glass is a platform-staff procedure with a second approver, audited and notified to the family | One slide |

**Assessment:** a practical on the demo stack: clear a worklist with three items, set a BP target and attention level for "Kamala", write a care-team note and a shared note, acknowledge an alert, and answer three teen-confidentiality scenarios. Pass = all tasks correct; the trainer records completion.
**Sign-off:** CSO (B4–B8 content), DPO (B2, B8, B9), product owner; a doctor from the pilot reviews the materials for practicality.

---

## C. Support staff (WhatsApp line, onboarding team, ops on call)

**Format:** a half-day course (3.5 h) plus shadowing of 5 real onboardings and 10 support conversations; refresher every quarter and after any incident.

**Learning objectives** — after training, a support agent can:
1. Explain and follow the no-PHI rule: support never asks for, reads, copies or forwards health data — in the admin console, WhatsApp, email or tickets.
2. Verify a caller's identity before any account action.
3. Run onboarding help, hub swap-out and device pairing without touching health data.
4. Recognise a safety concern (family coercion or abuse) and use the confidential fast path.
5. Take a data-subject request and hand it to the DPO queue.
6. Know when break-glass applies, how it is approved and that it is reviewed.

| # | Module | Duration | Content | Materials |
|---|---|---|---|---|
| C1 | Privacy rules for support | 30 min | CLAUDE.md rule 7 in practice: no health values, conditions or names of sensitive modules in tickets or WhatsApp; the admin console shows administrative data only (names, roles, invites, hub profile fields, consent metadata); "who viewed my record" shows support access; never send screenshots of patient data; WhatsApp Business account rules and retention | Do/don't card; signed confidentiality agreement |
| C2 | Identity verification | 20 min | Caller verification steps (registered phone call-back / OTP to the registered number, family name and member list, no health questions as "security questions"); what to do when verification fails; never change a phone/email on an unverified request | Script and checklist |
| C3 | Onboarding help | 30 min | Account creation, invites, dependants, consent steps (support explains, the person decides — assisted consent is attested); app lock; Health Connect permissions | Script + FAQ |
| C4 | Hub support and swap-out | 40 min | Fleet view (heartbeat, firmware, sync lag, batteries); remote diagnostics; revoke a lost hub; provisioning and pairing a replacement (pairing code, 10 min); swap-out within 48 h; refurbishment wipe; peripheral re-pairing and the allow-list | Swap-out checklist (`docs/06-operations/SUPPORT_PLAYBOOK.md`) |
| C5 | Safety concerns | 30 min | Signs of coercion; the confidential safety-concern flow that hides a person's data and location from named family members immediately; never tell the other family member; escalate to the DPO; HZ-13 | Scenario cards |
| C6 | DSAR intake | 15 min | Recognise requests (access, export, rectify, erase, restrict, object); log in the DSAR queue; one-month deadline; never send data over WhatsApp — exports are delivered through the signed link from the DPO queue | Flowchart |
| C7 | Break-glass | 20 min | Only for an emergency or a documented need: written reason, ≤ 60 minutes, second approver (super admin / DPO auditor) or flagged single-person emergency mode, audited with purpose `break_glass`, the family is notified, DPO reviews within 2 working days; misuse is a disciplinary matter | Procedure card |
| C8 | Incidents and escalation | 25 min | When to wake the on-call (alert storms, delivery failures, suspected breach, audit chain failure); the runbook; breach reporting within the hour to the DPO; stop criteria for the pilot (`docs/05-roadmap/PILOT_READINESS.md` §5) | Escalation tree (`docs/06-operations/RUNBOOK.md`) |
| C9 | Clinical boundaries | 10 min | Support never interprets readings or gives medical advice; emergencies → 1990; clinical questions → the person's doctor through messages | One slide |

**Assessment:** role-play of six scenarios (failed identity check, lost hub, a request to "see my mother's readings", a suspected safety concern, a DSAR by WhatsApp, a break-glass request) scored against the scripts; a written 10-question quiz on C1, C5, C7; shadowing sign-off by the support lead. Re-assessment after any privacy incident.
**Sign-off:** DPO (C1, C2, C5, C6, C7), support lead (C3, C4, C8), CSO (C9), ops lead (C4, C8).

---

## D. Production plan

| Material | Languages | Owner | Reviewers | Due |
|---|---|---|---|---|
| Family videos (A1, A3, A5 tasks) | en/si/ta | Product + design | CSO, DPO, native-speaker clinicians | Before summative usability |
| Family leaflets and quick cards (A3, A4, A5, A6, A8, A9, A10) | en/si/ta | Product | CSO, DPO, counsel (A3/A4) | Before pilot recruitment |
| Doctor slides, quick reference, screen videos | en | Product | CSO, one pilot doctor | Two weeks before doctor onboarding |
| Support course, scripts, checklists | en (+ si/ta phrases for callers) | Support lead | DPO, ops lead | Before the line opens |
| Completion tracker (names, date, trainer — no health data) | — | Pilot coordinator | DPO | Go-live |
