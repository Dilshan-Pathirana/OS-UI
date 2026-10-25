# Cure Global — Standards and regulatory strategy

*v0.1 · 22 Oct 2026 · Which standards Cure Global follows, how, and by when. Status of each standard and its source: `docs/reference/STANDARDS_REGULATORY_RESEARCH.md`. This is not legal advice; confirm the regulatory positions with counsel and regulators before launch.*

## 1. Regulatory position (intended purpose)

**Intended purpose statement (draft):** *Cure Global lets families record, store, view and share personal health information. It lets the doctors they choose view that information, set personal targets and alert rules, and send messages. Family-facing parts (app, Family Hub) store and display information, compare readings with targets the person's own doctor set, deliver alerts defined by that doctor or by the family's safety settings, and show a small set of fixed safety-net texts. They do not diagnose, triage or recommend treatment.*

The position is assessed **per function**, not per product. Storing and showing records is one thing; comparing readings with targets and alerting families is another, and the second is not covered by the "data system" exemptions.

| Function | Position | Why | Keep it true by |
|---|---|---|---|
| **Record keeping:** store, show, share, export; trends; provenance | Likely **not a medical device**: US MDDS covers software that only transfers, stores, converts or displays device data; EU MDCG 2019-11 rev.1 treats storage, communication and simple search as not a device | No interpretation (ADR-0012) | Design reviews; a regulatory checklist in every PR touching display logic |
| **Target comparison on family surfaces** (● ▲ !) | **Clinical decision support**, not covered by MDDS. Low risk because the clinician sets the target and the rule is visible, but it must be assessed: US device-CDS analysis (the non-device CDS criteria address software for health-care professionals, not patient-facing displays); EU Rule 11 | Software applies a clinician's rule to a patient's data and shows the result to the patient | Transparent rules ("target set by Dr X on date"); no proprietary scores; clinical safety case per rule type |
| **Alerts to families and doctors** for physiological values (pregnancy BP, urgent bands, seizure > N min, doctor thresholds) | **Monitoring with alarms.** EU MDCG 2019-11 classes monitoring of vital physiological parameters where variations could result in immediate danger as **IIb** (Rule 11). US: a device software function unless an enforcement-discretion category applies ⚠ counsel | Alerts can change what a family does in an emergency | Treat as potentially regulated: ISO 14971 and IEC 62304 discipline now; "not monitored 24/7" disclosure; per-market decision before launch (**D-13**) |
| **Safety alerts** (missed check-in, geofence, SOS, falls logged) | Probably not medical (personal safety), but fall *detection* by a device is the device maker's claim | No physiological interpretation | Keep wording non-clinical |
| Doctor web: summaries, z-scores, questionnaire scoring | **Doctor-only** CDS using published methods and licensed instruments | Shown to clinicians who can review the basis | Clinical safety case per feature |
| Interpretation features (growth z-scores, risk charts, questionnaire scoring) | **Doctor-only**; reference tables from WHO/CDC; licensed instruments | Standard published methods shown to clinicians | Clinical safety case per feature |
| Bundled BLE devices | Medical devices in their own right, registered by the manufacturer/distributor with **NMRA** (and FDA/CE abroad) | Cure Global does not manufacture them | Peripheral catalogue tracks regulatory status per country |
| Family Hub hardware | Radio equipment (Wi-Fi, BLE, camera) | Not medical | TRCSL type approval/exemption (Pi 5 exemption letter; confirm for the finished hub); EU: RED + EN 18031 cybersecurity (from 1 Aug 2025), then the Cyber Resilience Act |
| Face recognition on the hub | Biometric processing (special-category data); identification for display, **not** authentication for sensitive actions | NIST SP 800-63-4 allows biometrics only as part of MFA with a physical authenticator | PIN or app confirmation for sensitive actions; liveness to ISO/IEC 30107-3 before unsupervised use |

**Sri Lanka:** request an **NMRA Product Categorisation Letter** describing the **actual feature set** (record keeping, target comparison, clinician- and family-configured alerts, safety-net texts) rather than asking for a blanket "data system" ruling. NMRA has no SaMD-specific guidance; the device definition includes software. Plan for the answer being that the alerting functions are a device, and keep them separable behind a feature flag.

## 2. Standards map

| Area | Standard | How Cure Global uses it | When |
|---|---|---|---|
| Interoperability | **HL7 FHIR R4 (4.0.1)** | Domain model aligned; export bundles; R3 read API | MVP export; R3 API |
| | IPS IG 2.0.1 / ISO 27269:2025 | Patient summary for share links | R3 |
| | SMART App Launch 2.2 (+ Backend Services) | Third-party and clinic access | R3 |
| | LOINC, UCUM, ICD-11 (SNOMED CT where licensed) | Codes in the catalogue and exports | MVP |
| | **WHO SMART Guidelines** (digital adaptation kits; ANC and immunisation FHIR IGs) | Shape the ANC and immunisation schedules so they can map to WHO's computable guidance (GAP G-I6) | R2 (schedules), R3 (FHIR) |
| Devices | Bluetooth health profiles (BP 1.1.1, PLX 1.0.1, HTS 1.0, Glucose 1.0.1, WSS/BCS 1.0.1, UDS 1.1.1), GHS 1.0 / ISO/IEEE 11073-10206:2024, ITU-T H.810 (Continua) | Peripheral integration | MVP (existing profiles), R3 (GHS) |
| Quality | **ISO 13485:2016**-style QMS (lightweight: document control, design control, CAPA) | Ready for registration if any feature is regulated as a device (§1) | Start in Phase 0; certify only if needed |
| Risk | **ISO 14971:2019** | Hazard log and risk controls (`CLINICAL_SAFETY.md`) | MVP |
| Software lifecycle | **IEC 62304** Ed. 1.1 (Ed. 2 "health software" expected ~2028) treated as good practice; **IEC 82304-1** for the product | Requirements traceability, unit/integration tests, release records, SOUP list (SBOM) | MVP |
| Health-app quality | **ISO/TS 82304-2** (health and wellness apps: quality and reliability; the basis of the EU health-app label work) ⚠ check current status | Self-assessment of the app against its questions (privacy, security, usability, health value) and a public label if a scheme exists in the target market | Before GA |
| Usability | **IEC 62366-1** | Formative tests with elders, parents and doctors; summative before the pilot | Phase 1 – pilot |
| Health software security | **IEC 81001-5-1:2021** | Secure development lifecycle, threat modelling, vulnerability handling | MVP |
| Information security | **ISO/IEC 27001:2022** (+ ISO 27799:2025 health guidance) | ISMS scope: platform + operations; certification target post-pilot | Readiness by GA |
| Privacy | **ISO/IEC 27701:2025** (standalone PIMS) | Privacy management system alongside the ISMS | Readiness by GA |
| App/API security | **OWASP ASVS 5.0** L2 (L3 for auth/session/access), **MASVS 2.1** L2 + PRIVACY | Security requirements and test cases | MVP |
| IoT security | **ETSI EN 303 645 V3.1.3**; EN 18031-1/2/3 (EU); CRA (EU) | Hub baseline (no default passwords, updates, vulnerability disclosure, secure storage) | MVP baseline |
| Biometrics | ISO/IEC 30107-3:2023 (PAD), ISO/IEC 19795-1 (performance) | Liveness and FAR/FRR testing on local families | Before unsupervised face sign-in |
| Accessibility | **WCAG 2.2 AA** (EN 301 549 V4.1.1 in the EU) | Web, app; hub rules from the Cure Home design guide | MVP |
| Clinical safety | DCB0129-style clinical risk management (UK practice, used as good practice) | Clinical safety case, hazard log, safety officer sign-off | MVP |

## 3. Privacy law obligations

| Law | Key obligations for Cure Global | Status |
|---|---|---|
| **Sri Lanka PDPA No. 9 of 2022** (+ Amendment No. 22 of 2025) | Health and biometric data are special categories; **a child is under 16 and all of a child's personal data is special-category**; parent/guardian consent for children; DPO; DPIA (submit on request); breach notification; processor contracts; cross-border transfers only with Authority safeguards or listed exceptions; data-subject requests answered within 1 month (extendable to 3) | Core Parts in force **1 Jan 2027** (Gazette 2498/16); rights and penalties Parts by later order. **Design for full compliance from day one.** |
| GDPR (EU users, EU hosting) | Art. 9 explicit consent or health-care basis; Art. 8 children (16 by default); DPIA; records of processing; DPO; transfers | If offered in the EU |
| EHDS (EU) 2025/327 | General application 26 Mar 2027; wellness-app label for apps claiming EHR interoperability from 2029 | If offered in the EU |
| HIPAA | Only if serving US covered entities as a business associate; Security Rule update still pending | Not planned |
| India DPDP Act + Rules 2025 | Verifiable parental consent; consent managers; main duties from May 2027 | If expanding to India |
| UK GDPR / NHS DCB0129/0160 | If deployed with NHS bodies | Not planned |

## 4. Market-specific gates

| Gate | Sri Lanka (launch) | Others (later) |
|---|---|---|
| Medical device | NMRA categorisation letter describing the real features; bundled devices NMRA-registered (BP monitors cited as Class IIa; glucometers under the IVD framework) | FDA analysis per function (MDDS for records; CDS and device software functions for target comparison and alerts); EU MDR Rule 11 (alerting likely IIb); UKCA/CE |
| Radio | TRCSL type approval/exemption; vendor licence | CE (RED + EN 18031), FCC |
| Privacy | PDPA programme, DPO, DPIA, hosting decision + transfer instrument if outside Sri Lanka | GDPR/DPDP etc. |
| Professional | Medical council guidance on remote consultation (no official telemedicine guideline as of 2023 — confirm current position) | Local telehealth rules |
| AI (if Ask Cure or AI features return) | — | EU AI Act high-risk dates moved to 2 Dec 2027 (Annex III) and 2 Aug 2028 (Annex I/MDR) by Regulation (EU) 2026/1744 |
| Cybersecurity (EU) | — | CRA reporting already applies (since 11 Sep 2026) to products on the EU market; full application 11 Dec 2027 |

## 5. Compliance work plan (summary; tasks in `BACKLOG.md` epic E14)

| When | Deliverable |
|---|---|
| Phase 0–1 | Intended purpose statement; regulatory checklist in PR template; threat model v1; DPIA v0 (structure); records of processing; ASVS/MASVS requirement mapping; hazard log v1 |
| Before pilot | DPIA v1 approved; consent texts in en/si/ta reviewed by counsel; NMRA categorisation letter requested; penetration test (API, web, app, hub); clinical safety case v1 signed; usability (formative) with elders and parents; vulnerability disclosure policy published; retention schedule approved |
| Phase 1, before 1 Jan 2027 | DPO appointed (external allowed); PDPA baseline live: records of processing, privacy notice, breach procedure, processor agreements, transfer instrument if needed. Development uses synthetic data only; real personal data (doctor sign-ups, pilot recruitment) starts only after this |
| Before GA | ISO 27001 + 27701 readiness assessment; summative usability; IEC 62304/82304-1 documentation set; SBOM per release; incident response exercised |
