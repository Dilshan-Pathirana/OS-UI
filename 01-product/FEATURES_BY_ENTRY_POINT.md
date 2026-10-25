# Cure Global — Features by entry point

*v0.1 · 22 Oct 2026 · What each of the four entry points does, with release tags: **MVP** (pilot), **R2**, **R3**, **Later**. Module-level functions are in `MEMBER_MODULES.md`; this file is about screens and workflows.*

## 0. Personas

| Persona | Who | Main entry point | Wants |
|---|---|---|---|
| **Nimal (38), family owner** | Software engineer in Colombo; wife Dilini (35, pregnant with their second child, Nethmi, due January 2027), son Sahan (6), mother Kamala (64, hypertension, diabetes) and niece Thilini (16) live with them | App, hub | One place for everyone's health; reminders; the doctor sees what matters |
| **Kamala (64), elder** | Basic phone, Sinhala reader, early memory problems | Hub | No passwords; big type; medicines on time; her doctor knows how she is |
| **Ruwan (41), remote caregiver** | Kamala's other son, works in Dubai | App | Know Amma checked her BP and took her medicine; get told if something is wrong |
| **Dilini (35), pregnant** | Teacher, second pregnancy | App, hub | Pregnancy timeline, BP checks, clinic dates, baby's record from day one |
| **Thilini (16), teenager** | Nimal's niece who lives with them | App | Track her cycle privately; talk to the doctor without everyone knowing |
| **Kavindu (9), autistic child** | In a family Cure Global serves in Kandy | Hub (visual schedule), parents' app | Predictable routines; parents log triggers and sleep for the therapist |
| **Dr N. Perera** | Family physician, 3 sessions a week at a Cure branch | Doctor web | See trends between visits, act on what matters, short review cycles |
| **Dr S. Fernando** | Obstetrician | Doctor web | Pregnancy BP and glucose against her targets; reduced-movement events |
| **Asha, therapist** | Speech and language therapist | Doctor web | Goals and home-practice logs |
| **Platform admin** | Cure Global operations | Admin web | Verify doctors, run families' support, manage modules and devices |

---

## 1. Super Admin web (`apps/admin-web`)

| Area | Features | Release |
|---|---|---|
| Sign-in | Password + mandatory TOTP/passkey, session list, re-auth for sensitive actions | MVP |
| Dashboard | Families, persons, active doctors, hubs online, sync lag, open alerts count (no PHI), DSAR due dates, verification queue | MVP |
| Organisations | Create clinics/hospitals/corporates, org admins, programmes | R3 (model in MVP) |
| Families | Search by family name/phone hash/id; administrative view (members' names, roles, invites, devices, subscription, consents metadata); support actions (resend invite, transfer ownership with evidence, unlock account; merge duplicates from R2) | MVP |
| People | Duplicate detection queue, merge tool, deceased recording with evidence, guardianship evidence review (legal guardian / health proxy) | MVP (review), R2 (merge) |
| Doctors | Applications with licence number and evidence; verify against the medical council register (SLMC in Sri Lanka); approve/reject/suspend; specialties; organisations | MVP |
| Care teams | View links between doctors and families (metadata), end a link on request | MVP |
| Module catalogue | Releases (staged → approved by clinical safety officer → active), modules per country pack/org (enable, default state, age bands), metric definitions, tracker schemas, schedules (immunisation, ANC, milestones), **life-stage simulator** | MVP (read + simulator), R2 (overrides, approvals) |
| Content | Tips, danger-sign texts, consent texts, notification templates, translations with review status, clinical approval workflow | MVP (consent texts), R2 |
| Consent policies | Purposes, versions, texts per language, effective dates; re-consent campaigns | MVP |
| Devices | Hubs: provisioning (serial allow-list, public keys), status, firmware, catalogue version, last heartbeat, revoke; peripheral model catalogue (profiles, validation, regulatory status per country); trackers registered in Traccar | MVP (hubs, peripherals), R2 (trackers) |
| Audit & privacy | Audit search (who accessed which person's data, purpose), hash-chain verification status, break-glass sessions and approvals, DSAR queue (access, export, rectify, erase, restrict) with due dates | MVP (audit, DSAR), R2 (break-glass approvals UI) |
| Billing | Plans, subscriptions, entitlements, invoices, lapses (read-only mode) | R3 |
| Platform | Feature flags, notification channels (SMS/push/email providers), integrations (Traccar, HMS), staff roles | MVP |

## 2. Doctor web (`apps/doctor-web`)

| Area | Features | Release |
|---|---|---|
| Onboarding | Apply with licence details, MFA setup, organisation, specialties, availability text, profile for families | MVP |
| Worklist | Ordered: urgent alerts → attention alerts → members due for review (no review in N days, configurable) → new data since last review; filters by family, module, programme | MVP |
| Panel | All families/persons on my care teams, search, tags (programme, risk set by me), last review, adherence | MVP |
| Care requests | Accept/decline families; invite a family by code/QR | MVP |
| Member chart | Header (age, life stage, overlays, allergies, conditions, medicines, care team); timeline; vitals trends vs targets with source/validation markers; module tabs (growth, immunisation, pregnancy, women's health if shared, elder, special needs); documents; notes | MVP (vitals, growth, immunisation, documents, notes), R2 (pregnancy, women's health, special needs, elder safety) |
| Family view | Members I care for in one family, side by side (for the family doctor) | MVP |
| Targets & alerts | Targets per metric/context with attention levels; alert rules (thresholds, trends such as weight + 2 kg in 3 days, missed readings, seizure duration); notification routing | MVP (targets), R2 (rules) |
| Modules | Activate clinician-only modules, programmes, condition packs; choose growth chart set; enable interpretation features for a family | MVP (programmes, growth set), R2 |
| Questionnaires | Assign, view responses and scores (licensed instruments only) | R2 |
| Immunisation verification | Verify parent-entered doses, record clinic-given doses | MVP |
| Review | "Mark reviewed" with an optional message to the family (shown on app and hub) | MVP |
| Notes | Care-team-only or shared notes, amendments with history | MVP |
| Messages | Threads with families/members; templates; "not for emergencies" banner; response-time setting | R2 |
| Appointments | Schedule follow-ups, teleconsult links | R2 (teleconsult Later) |
| Reports | PDF summary for a period; FHIR export | MVP (PDF), R3 (FHIR API) |
| Analytics | My panel: adherence, overdue vaccines, members without review, programme outcomes (7-day BP average change) | R3 |

## 3. Family Hub (`apps/hub-ui` + hub services)

Everything in Cure Home's 20 screens (Boot, Pairing, Ambient, Identify, Who's measuring, Guest, PIN, Orbit View, Detail, Measure, BP check, Glucose context, Inbox, Medicines, Visit, Family, Enrol (add angles), Face setup, Calendar & reminders, Settings) plus the Notices and Dev overlays carries over. Changes and additions:

| Feature | What changes / is added | Release |
|---|---|---|
| Members | From the Cure Global family; display names; life stage; hub-enabled flag; face-enrollable flag | MVP |
| Orbit View | Cards come from the member's active **hub-safe** modules and metrics (infant: weight/temperature; elder: BP/medicines/check-in); pregnancy cards (BP/weight/movements) only after her own `hub_display` opt-in (R2, ADR-0011) | MVP / R2 |
| **Proxy measurement** | "Measuring for…" chooser for guardians and permitted carers; infant weighing via "parent, then parent + baby" | MVP |
| Due today | Per member: medicines, vaccines due, checks due, visits — counts on Ambient (no names of drugs or conditions), details after sign-in | MVP |
| Daily check-in | Elder taps "I'm OK" (or answers the voice prompt) after the greeting; being recognised alone never counts (HZ-09); missed → server alert | MVP |
| SOS | Big button (always reachable, two-step confirm), notifies family carers, shows national emergency number | MVP |
| Growth (infant/child) | Latest weight/length after a proxy measurement, neutral chart | R2 |
| Visual schedule | Picture routine for special-needs members, timers, first/then | R2 |
| Quick logs | Feeds, nappies, seizure timer, fall log, symptom — one tap + member chooser | R2 |
| Review acknowledgements | "Dr Perera reviewed your readings on Monday" | MVP |
| Family board & calendar | From Cure Home + vaccine and clinic dates | MVP |
| Simple mode | Fewer, larger choices; voice prompts | R2 |
| Teleconsult | Video consult on the hub's screen and camera | Later |

## 4. Mobile app (`apps/mobile`)

| Area | Features | Release |
|---|---|---|
| Onboarding | Phone OTP, password, platform terms, create/join family, add dependants, invite adults, consent screens, "What can the family see?" grants | MVP |
| Member switcher | Everyone I can act for, with my relationship and rights; clear "you are viewing Kamala" header | MVP |
| Member home | Life stage, due today, alerts, latest readings vs doctor's targets, module tiles | MVP |
| Family dashboard | Done/due per member; alerts; hub status | MVP |
| Readings | Manual entry with plausibility checks; BLE: OKOK scale (existing) + GATT BP/PLX/thermometer/glucose; Health Connect import/export (expanded types); offline queue | MVP (manual, OKOK, Health Connect), R2 (GATT devices) |
| Modules | Growth charts, vaccine card, milestones, medicines, documents, symptoms (MVP); pregnancy, cycle, menopause, wellbeing, elder safety, special-needs logs, visual-schedule editor (R2); programmes (R3) | MVP / R2 / R3 |
| Doctors | Find verified doctors, request care, manage care teams and what each sees | MVP |
| Messages | Care-team threads, confidential teen threads | R2 |
| Safety | Location sharing (phone as tracker, opt-in), GPS device pairing, geofence editor, alerts with acknowledge/escalate, last known location (audited) | R2 |
| Hub | Pair (QR/App Link), manage, revoke, guest claims | MVP |
| Privacy | Consents, grants, access log ("who viewed"), export (FHIR/PDF), delete account, teen confidentiality controls | MVP (consents, grants, export, delete), R2 (access log UI, teen controls) |
| Notifications | Push (no health values), quiet hours, per-category preferences | MVP |
| Security | App lock (biometric/PIN), screen-capture guard, encrypted cache (from patient app) | MVP |
| Languages | en / si / ta (new screens may ship English first with fallback, as in the patient app) | MVP |

## 5. Key journeys (acceptance scenarios for the pilot)

1. **Family set-up in 10 minutes:** Nimal installs the app, creates the family, adds Sahan as a dependant and Thilini (Dilini as her legal guardian, evidence uploaded), invites Dilini and Kamala, pairs the hub. Kamala (helped by Nimal, recorded as assisted) consents and chooses "Essentials" for the family.
2. **Newborn:** Dilini adds Nethmi at birth with her birth data → Nethmi's record exists with the vaccine schedule and growth chart, and the paediatrician is added to her care team (MVP). From R2, tapping "Baby is born" in the pregnancy module does this and starts postpartum checks.
3. **Elder morning:** Kamala comes to the hub at 7:10, is recognised, sees "Good morning, Amma" and taps "I'm OK" (walking past would not count), measures BP with the cuff (guided), checks off her 8:00 medicines; Ruwan in Dubai sees "Amma: BP done, medicines taken" (no values unless granted).
4. **Missed check-in:** Kamala hasn't checked in by 10:00 → Nimal gets a push, then Ruwan after 10 min, then an SMS to the neighbour contact; Nimal acknowledges.
5. **Wandering:** Kamala's GPS watch leaves the "home" geofence at 21:30 → carers alerted with a one-tap "share wandering plan".
6. **Doctor review:** Dr Perera opens the worklist, sees Kamala's 7-day BP average above target, adjusts the target note, marks reviewed with "Keep checking twice a day"; the hub shows the acknowledgement next morning.
7. **Teen privacy:** Thilini (16) tracks her cycle; Dilini (her legal guardian) and Nimal (admin) see no trace of the module, its reminders or its access log entries; she shares a cycle summary with the family doctor only.
8. **Pregnancy BP:** Dilini's home BP crosses the attention level Dr Fernando set → Dr Fernando's worklist shows an urgent item; Dilini sees fixed text "Talk to your doctor today; if you have headache, vision changes or pain under the ribs, go to the maternity unit or call 1990."
9. **Autism routine:** Kavindu's mother sets a visual schedule; the hub shows it each morning; she logs a meltdown with triggers; the therapist sees weekly patterns.
10. **Consent withdrawal:** Kamala withdraws face sign-in → within 15 minutes the hub deletes her templates and she signs in with "Choose your picture + PIN".
