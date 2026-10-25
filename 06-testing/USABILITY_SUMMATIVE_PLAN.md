# Cure Global — Summative usability evaluation plan (IEC 62366-1)

*v0.1-draft · 23 Oct 2026 · E14-09 / ROADMAP Phase 6 ("summative usability with elders, parents and doctors"). Status: **DRAFT — needs people**. Software can't run this test. It needs:*
- *a human-factors lead and trained moderators (Sinhala, Tamil and English);*
- *recruited participants;*
- *ethics review;*
- *the Clinical Safety Officer (CSO) to approve the critical-task list and the acceptance criteria;*
- *native-speaker clinicians for the si/ta materials.*

*This plan defines what they do and how results feed the clinical safety case (`docs/03-compliance/CLINICAL_SAFETY_CASE.md`, gap G-15).*

## 1. Purpose and scope

**Purpose:** to show, before the pilot, that the intended users can do the **hazard-related tasks** correctly in realistic conditions, without use errors that could cause harm. This is the IEC 62366-1:2015+A1:2020 §5.9 summative evaluation of the user interface of the functions in the safety case's scope.

**In scope:**
- **Family Hub:** the `apps/hub-ui` build on Cure Global with `services/hub-core` and simulated BLE peripherals (`services/ble-sim`), or real pilot devices where available.
- **Doctor console:** `apps/doctor-web`.
- **Family app:** if the wave-6 app is ready by the test date. If it isn't, the app tasks move to a follow-up session and the safety case says so.

**Out of scope:**
- Super Admin console (not a clinical user interface);
- GPS and location features until R2 ships them;
- device-own user interfaces (BP monitor, scale), which belong to the manufacturer.

The **formative** studies that came before (TEST_STRATEGY.md §1, "per phase") shaped the design. The summative test only *validates* it: no design changes happen during a session.

## 2. User profiles (distinct user groups)

Each group differs in a way that can change how a task is performed, so each is a separate group for sampling.

| Group | Who | Characteristics that matter |
|---|---|---|
| U1 Elders | 65+, living with family, e.g. hypertension, diabetes, heart failure | Low vision, tremor, low digital and health literacy; Sinhala or Tamil first; may share the hub with grandchildren |
| U2 Parents | Parents of children 0–12, incl. a newborn | Proxy measurement for a child, infant weighing, vaccines, growth chart, time pressure, a child on the lap |
| U3 Pregnant and postpartum women | Any trimester, and up to 12 weeks postpartum | Pregnancy BP, reduced movements, warning symptoms; with and without an obstetrician on the platform |
| U4 Teens 16–17 | Using their own login | Confidentiality, what a guardian can and can't see, cycle tracking |
| U5 Remote carers | Adult children living abroad (e.g. the Gulf) who use the app mostly | Alert acknowledgement across time zones, the escalation chain |
| U6 Doctors | Family doctors, paediatricians, obstetricians (SLMC-registered) | Worklist under time pressure, targets editor, attention levels, immunisation verification, teen-confidential data |

Language sub-groups: every family group (U1–U5) includes Sinhala and Tamil speakers. U1 includes participants with low literacy who rely on icons and voice.

## 3. Use environments

| Environment | Set-up for the test |
|---|---|
| Home with the Family Hub | A living-room mock-up: hub on a stand or a wall-mounted tablet (Surface/Pi or tablet Lite), ordinary lighting including evening light, background noise (TV), family members walking past the camera, a BLE cuff, a scale and a thermometer (simulated or real) |
| Phone | The participant's own Android phone where possible (the app build installed for the session), mobile data and Wi-Fi, an airplane-mode episode |
| Clinic | A desk with a laptop or desktop browser (Chrome/Edge), interruptions (a phone call, a colleague) during the worklist task |

## 4. Hazard-related use scenarios and critical tasks

A **critical task** is one where a use error, or a failure to complete the task, could cause the harm in a hazard (IEC 62366-1 §5.5; FDA "critical tasks"). The CSO approves this list before recruitment.

| # | Scenario | Critical task | Groups | Hazard | Use errors to watch for |
|---|---|---|---|---|---|
| CT-01 | Grandmother takes her grandson's temperature on the hub | Choose the right person in the proxy chooser, measure, and confirm whose record it went to | U1, U2 | HZ-01 | Wrong person chosen; banner not read; next reading still attributed to the child |
| CT-02 | A reading of 101.3 on a thermometer set to °F, and an SpO₂ of 82 % | Tell "? Check this reading" (a unit mix-up) apart from the urgent safety-net text, and follow the text: measure again now; if the same or unwell, call 1990 or go to hospital | U1, U2, U5 | HZ-14, HZ-18 | Treating 82 % as a device error; ignoring the urgent text; re-measuring forever without acting |
| CT-03 | Morning check-in | Check in with an explicit "I'm OK" tap; notice that walking past the hub didn't check them in | U1 | HZ-09 | Believing recognition counted; tapping the wrong member |
| CT-04 | A carer abroad gets a missed-check-in alert | Acknowledge the alert so the chain stops, or let it pass to the next carer, knowing which applies | U5 | HZ-09 | Dismissing without acknowledging; assuming someone else acted |
| CT-05 | Baby's movements feel less than usual (week 32) | Find and use "My baby's movements feel reduced", read the contact-now text, and say what she would do now | U3 | HZ-05 | Waiting until tomorrow; looking for a kick count |
| CT-06 | A pregnancy BP of 162/104 with no obstetrician on the care team | Read the pregnancy BP safety-net text and the warning symptoms, and say what she would do; add her clinic or PHM midwife as a contact when asked | U3 | HZ-04 | Reassured because "the app knows"; misreading the not-monitored notice |
| CT-07 | Mother of a 2-year-old opens the growth chart | Describe what the chart shows without inferring a diagnosis; find who to ask | U2 | HZ-07, HZ-03 | Reading neutral curves as "normal/abnormal"; wrong child or sex on the chart |
| CT-08 | "Within your target" next to a target set 14 months ago | Notice who set the target and when; say whether to ask the doctor | U1, U5 | HZ-02 | Reassured without noticing the date |
| CT-09 | Elder checks today's medicines | Mark today's doses taken or skipped correctly; say what to do if a dose was missed (as prescribed, no dose changes) | U1, U5 | HZ-10 | Double-marking; inferring a dose change; confusing morning and evening slots |
| CT-10 | 16-year-old logs a cycle entry and checks what her guardian sees | Find "who can see this"; confirm the guardian sees no trace; find how to share on purpose | U4 | HZ-12 | Believing the guardian can see it (avoidance), or that nobody can (over-sharing through a grant) |
| CT-11 | The internet is down; Grandfather feels unwell | Raise an SOS on the hub; read that it is saved and waiting, and that the national number is 1990 | U1, U2 | HZ-17 | Believing the family was told when they weren't; not calling 1990 |
| CT-12 | Doctor's worklist with an urgent SpO₂ item, a reduced-movements item and new data | Open the urgent items first; acknowledge; set a target with an attention level; record a decision | U6 | HZ-18, HZ-05, HZ-02 | Missing the urgent item; setting the target on the wrong member; wrong unit |
| CT-13 | Doctor verifies vaccines a parent entered against a card photo | Verify the right doses; leave an unclear one unverified | U6 | HZ-06 | Bulk-verifying without checking dates |
| CT-14 | Obstetrician sets or explicitly declines pregnancy BP targets | Set an attention level, or decline, within the 7-day window | U6 | HZ-04 | Leaving it undone without realising the default applies |
| CT-15 | Parent times a seizure on the hub (simulated) | Start the one-tap timer at onset and stop it; find the rescue text | U2 | HZ-11 | Starting late; not stopping; looking for the text in the wrong place |

**Non-critical tasks** (measured for satisfaction only):
- onboarding;
- switching language;
- reading the weekly pregnancy card;
- the visual schedule.

## 5. Participants

- **Sample size:** at least **15 participants per distinct user group** (U1–U6), following the FDA guidance *Applying Human Factors and Usability Engineering to Medical Devices* (2016), which recommends a minimum of 15 per group for validation. IEC 62366-1 does not set a number. Total ≥ 90.
- **Language split:**
  - U1–U3: at least 5 Sinhala, 5 Tamil and 5 English per group where the population allows; the shortfall is recorded.
  - U1 must include at least 5 participants with low literacy.
- **Who may not take part:** people who took part in formative studies on the same screens (they must be naive to the final design); Cure Global staff and their families.
- **Recruitment:**
  - through pilot clinics, community health workers and MOH areas;
  - U5 remotely (video) from abroad;
  - U6 through the doctors invited to the pilot, plus non-pilot doctors so the test isn't run on the same doctors twice.
- **Compensation:** a fixed amount in line with ethics approval, the same for every participant.

## 6. Ethics and participant consent

- Ethics review by a recognised ethics review committee in Sri Lanka (e.g. a university faculty of medicine ERC) before recruitment.
- Information sheet and consent form in en/si/ta. They cover the purpose, recording (screen and audio; video of hands only, never faces on the hub camera), withdrawal at any time, and data handling.
- **Synthetic data only.** Participants use demo families (the seed), never their own health data. Hub face enrolment is not used, because face data never leaves the hub and isn't needed for these tasks.
- **Minors (U4):** written consent from the 16–17-year-old plus guardian consent as the ERC requires. The CT-10 session is held without the guardian in the room.
- **Safeguarding and distress:** a moderator protocol for a participant who discloses a real health concern or a safeguarding issue (stop, signpost to 1990 or the NCPA, tell the lead). Pregnancy-loss content is not shown to U3 participants.
- **Recordings:** stored encrypted, accessible to the study team only, and deleted 12 months after the report. No recordings in the product repository.

## 7. Protocol

1. **Preparation:**
   - Freeze the build (release candidate, catalogue release id recorded).
   - Seed demo data (`python -m app.seed --reset`) and run hub stacks with `ble-sim` scenarios scripted per task.
   - Pilot-run the protocol with 2 participants, whose results are not counted.
2. **Session (60–90 min, one participant, a moderator and a note-taker):**
   - Consent, a background questionnaire, and a short orientation of the kind a real user would get (the same training as the pilot's: the onboarding screens and the family quick guide; no extra coaching).
   - Scenario tasks in a counterbalanced order. For each task the moderator reads the scenario and does not help.
     - If the participant is stuck for 3 minutes or asks for help, the task is scored as *assisted*.
     - Knowledge tasks ("what would you do now?") are asked after the action, to check understanding of safety texts.
   - Post-task questions: what happened, what they thought it meant.
3. **Debrief:**
   - Root-cause interview for every use error, close call and difficulty (§9).
   - System Usability Scale (translated, validated versions where they exist; otherwise flagged as unvalidated).
   - Open feedback.
4. **Remote sessions (U5):**
   - The app and alert tasks over video with screen sharing.
   - Alerts triggered by the moderator through the seeded escalation chain (in the test environment only).

## 8. Data collection

- For each task:
  - outcome: success / use error / close call / difficulty / assisted / not attempted;
  - time on task;
  - the participant's own words for knowledge tasks;
  - observer notes.
- Screen recording on hub, app and console; audio.
- System logs from the test environment (opaque ids only; no PHI exists because the data is synthetic).
- A severity link: each observed use error is mapped to its hazard id and the safety case's severity rating.

## 9. Acceptance criteria and use-error analysis

**Acceptance criteria (proposal — CSO to approve):**
1. **Critical tasks:** no unmitigated use error with a severity rating of 4–5 (Major / Catastrophic) in the safety case's matrix. Every use error, close call or difficulty on a critical task is analysed (§9.1), whatever its frequency. Percentage pass rates are reported, but they are **not** the acceptance criterion (IEC 62366-1 / FDA practice).
2. **Safety texts** (CT-02, CT-05, CT-06, CT-11): on the knowledge probe, at least 90 % of participants per group state the action the text asks for. Any participant who would wait or do nothing is a use error and is analysed.
3. **No group or language is worse:** any critical task with a markedly higher error rate in one language group triggers a translation and content review by native-speaker clinicians.
4. **Non-critical tasks:** SUS ≥ 68 per group (target, not a gate).

**9.1 Root-cause analysis** for each use error, close call and difficulty:
- what happened;
- the participant's explanation;
- the user-interface element involved (screen, text key, icon);
- the root cause: perception, cognition, action, or a training or labelling cause;
- the hazard and its severity;
- whether existing controls mitigate it;
- the decision:
  - **(a)** design change, then a re-test of the affected tasks with new participants;
  - **(b)** labelling or training change, which needs justification that design is not reasonably possible;
  - **(c)** residual risk accepted by the CSO with written justification.

Every decision is recorded in the safety case (§6 for the hazard, §7 for open actions).

## 10. Reporting

The usability engineering file must contain the following. The template for the report:

```text
1. Summary: build, catalogue release, dates, sites, participants per group and language
2. Deviations from this plan and their impact
3. Results per critical task: outcomes table by group and language; use errors, close calls, difficulties with quotes
4. Root-cause analysis per finding (§9.1) and the decision (design / labelling / accepted)
5. Results per safety-text knowledge probe
6. Non-critical tasks and SUS
7. Conclusion: are the residual use-related risks acceptable? → link to CLINICAL_SAFETY_CASE.md §5 and §8
8. Sign-off: human-factors lead, CSO, product owner
Annexes: protocol as run, consent forms, moderator scripts, raw data index (stored outside the repository)
```

## 11. Schedule (before the pilot, ROADMAP Phase 6: 8 Mar – 16 Apr 2027)

| When | Step | Owner |
|---|---|---|
| By 1 Feb 2027 | CSO approves the critical tasks and acceptance criteria; ERC submission | CSO, HF lead |
| Feb 2027 | Recruitment; si/ta materials translated and reviewed; moderators trained | HF lead, reviewers |
| 1 Mar 2027 | Release candidate frozen; test environment seeded | Engineering |
| 8–26 Mar 2027 | Sessions (≈ 90; ~6 per day across 2 sites plus remote sessions) | Moderators |
| 29 Mar – 5 Apr 2027 | Analysis; root causes; design or labelling decisions | HF lead, CSO, product |
| By 12 Apr 2027 | Re-tests for any design changes; report signed; safety case updated | HF lead, CSO |
| 16 Apr 2027 | Go/no-go review uses the report (ROADMAP Phase 6 exit) | Product owner |

## 12. Moderator script outline (en; si and ta versions to be written and reviewed by native speakers)

The outline is the same in all three languages. **Only the wording is translated, never the meaning or the help given.** Translations are back-translated and checked by a native-speaker clinician, and the si/ta scripts are piloted with one participant each.

1. **Welcome** (en / සිංහල / தமிழ்): who we are; we are testing the system, not you; there are no wrong answers; you can stop at any time.
2. **Consent check:** you've read the sheet; recording on; hands and screen only.
3. **Think-aloud warm-up:** a neutral practice task (change the hub language).
4. **Scenario reading:** read each card word for word (the cards are printed in the participant's language). Say nothing more.
5. **During the task:** neutral prompts only: "What are you thinking now?" and "What would you do next?" Never "Are you sure?", and never point at the screen.
6. **When stuck (3 min) or asked for help:** "What would you do at home if this happened?" Then record the task as assisted and move on.
7. **Knowledge probe** after CT-02, 05, 06 and 11: "What does this message ask you to do?" and "What would you do right now?" Record the answer verbatim.
8. **Debrief per use error:** "I noticed …; can you tell me what happened there?"
9. **Close:** SUS; anything else; thank you; compensation; reminder of the support contact.

## 13. Open items needing people

- A human-factors lead and moderators (en/si/ta) to be appointed.
- CSO approval of §4 and §9.
- ERC approval.
- Recruitment through pilot clinics and MOH areas.
- Translation and native-speaker clinician review of all participant-facing materials.
- Test devices: the hub hardware build for the pilot, and validated BP cuffs including a pregnancy-validated one.
- Booking of 2 test sites (Colombo, Kandy) and remote-session tooling.
