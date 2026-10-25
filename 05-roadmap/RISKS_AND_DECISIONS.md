# Cure Global — Risks and decisions

*v0.1 · 22 Oct 2026*

## 1. Risk register

| ID | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | **Scope is very large** (8 member types × 4 surfaces) and the team is small | High | High | Module engine so content is data. MVP limited to core + child + elder. R2/R3 behind flags. Strict phase exits | Dilshan |
| R-02 | Cure Home pilot and Cure Global compete for the same time | High | Medium | One hub codebase (ADR-0007). Cure Home pilot stays on HMS. Cure Global pulls hub changes | Dilshan |
| R-03 | Access-control bugs leak sensitive data (teen, reproductive, location) | Medium | High | Single policy function. Access-matrix tests on every path. Pen test. Audit and "who viewed" | Eng lead |
| R-04 | Family coercion or abuse through sharing or location | Medium | High | Adults control their own grants. Safety-concern flow. Location consent and review. DPIA | DPO |
| R-05 | Wrong reading attribution on shared devices | Medium | High | Cure Home attribution engine. Proxy confirmation. Audits | Eng + CSO |
| R-06 | Doctors don't review: the loop breaks | Medium | High | Worklist design. Review fees in plans. "Reviewed" acknowledgements. Coordinator role | Product |
| R-07 | Licences block clinical content (WHO growth tables, M-CHAT-R/F, GMFCS, CDC milestones) | Medium | Medium | Request early (Phase 0). Placeholder curves in dev. Link out where needed | Dilshan |
| R-08 | Sri Lanka schedule changes (polio, MCV2, TT→aTd recommendations from NIS 2025) | High | Low | Versioned schedule data. CSO sign-off. Admin activation | CSO |
| R-09 | PDPA core duties start 1 Jan 2027, before the pilot | Certain | Medium | Build compliance in from Phase 1. DPO appointed and PDPA baseline live in Phase 1 (by 1 Jan 2027); DPIA v1 before any real health data (Phase 6) | DPO |
| R-10 | Regulatory reclassification (alerts or z-scores seen as diagnosis) | Low–Med | High | ADR-0012. Interpretation is doctor-only. NMRA categorisation letter. Intended-purpose discipline | Dilshan |
| R-11 | Huawei watches (common locally) can't sync via Health Connect | High | Low | Manual/cuff readings. Evaluate Huawei Health Kit in R3 | Product |
| R-12 | GPS trackers: 3G-only devices, poor battery, false falls | Medium | Medium | Approved models only (4G Cat-1/LTE-M + VoLTE). "Are you OK?" step. Daily charging routine | Ops |
| R-13 | Low-end Android phones struggle (Skia charts, BLE, Health Connect) | Medium | Medium | Test on the dedicated phone plus one low-end device. Glass off. Performance budgets | Mobile dev |
| R-14 | Notification delivery failures (FCM, SMS) during an emergency | Medium | High | Escalation across channels. Delivery monitoring. Daily synthetic tests. Clear "not an emergency service" message | Ops |
| R-15 | Doctor impersonation | Low | High | Licence verification. MFA. Suspension. Audit | Admin |
| R-16 | Data residency and hosting cost | Medium | Medium | Hosting decision D-4. Cost model per family. Partitioning and summaries | Dilshan |
| R-17 | Expo/RN upgrade churn in a monorepo | Medium | Low | Mobile stays outside the pnpm workspace at first. Pin versions. Upgrade per SDK release with a test pass | Mobile dev |
| R-18 | Face recognition bias or failure for some members | Medium | Medium | Cure Home eval harness on local families. PIN fallback. Proxy measurement. Children re-enrol | Vision |

L = likelihood, I = impact.

## 2. Decisions needed from Dilshan

| ID | Decision | Options | Recommendation | Blocks |
|---|---|---|---|---|
| **D-1** | Relationship of Cure Global to Cure Home and HMS | (a) Cure Home pilot continues on HMS; Cure Global reuses the hub and absorbs Cure Home after the pilot · (b) Move Cure Home onto Cure Global before its pilot · (c) Build Cure Global inside HMS | **(a)** | Phase 0 |
| **D-2** | Primary buyer for the Cure Global pilot | Families direct (incl. diaspora) · Cure clinics' programmes · both | **Both**, with recruitment through Cure branches | Phase 6 |
| **D-3** | Age thresholds for Sri Lanka | Digital consent 16 (PDPA child definition) · teen login 13 · teen confidentiality 16 · majority 18 | As listed; confirm with counsel | Phase 1 |
| **D-4** | Hosting for health data | In Sri Lanka (local DC/cloud) · regional cloud (e.g. Mumbai/Singapore) with a PDPA transfer safeguard | Decide after a cost/latency check; design is region-agnostic | Phase 6 |
| **D-5** | Mobile app identity | New app `lk.cure.global` · evolve `lk.cure.patient` | **New app.** The patient app stays for HMS patients until the HMS connector lands | Phase 2 |
| **D-6** | Product names | Cure Global (platform), Cure Family Hub (device), app name | Confirm | Phase 2 |
| **D-7** | Admin family members' default visibility of adults | Grants (consent-based, recommended) · automatic | **Grants** (`ACCESS_CONTROL.md` §3) | Phase 1 |
| **D-8** | Doctor review model | Free for linked doctors in the pilot · paid review programme | Free in pilot, measure minutes; price for R3 | Pilot |
| **D-9** | Licences to request now | WHO growth tables, M-CHAT-R/F, GMFCS-E&R, CDC milestones (or link out) | Request all in Phase 0 | Phase 5 |
| **D-10** | Clinical Safety Officer and reviewers | Named doctors (paediatrics, obstetrics, family medicine, geriatrics) | Appoint in Phase 0–1 | Catalogue releases |
| **D-11** | iOS | Not before the pilot · parallel | After the pilot | R3 |
| **D-12** | Hub hardware for the pilot | Surface Pro (as Cure Home), Pi 5, Android tablet "Lite" | Mix: Surface/Pi for 10 homes, Lite for the rest | Phase 6 |
| **D-13** | Regulatory scope of target comparison and alerts (`STANDARDS_AND_REGULATIONS.md` §1) | (a) Sri Lanka first, NMRA letter describing the real features, device-grade process for alerting · (b) strip family-facing physiological alerts outside Sri Lanka · (c) certify (EU IIb route) | **(a)**, keep alerting behind a feature flag so (b) stays possible | NMRA request (Phase 6) |
