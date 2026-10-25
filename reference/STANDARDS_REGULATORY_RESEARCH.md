# Reference: standards and regulations (status on 22 Oct 2026)

*Research run 22 Oct 2026. Labels: **[V]** verified on a primary source · **[S]** secondary source only · **[U]** not verified. `docs/03-compliance/STANDARDS_AND_REGULATIONS.md` turns this into obligations.*

## 1. Interoperability

| Item | Status | Source |
|---|---|---|
| FHIR R4 (4.0.1) | Dated 27 Dec 2018; first release with normative content (Patient and Observation are normative). Maturity: RelatedPerson 2, Group 1, CareTeam 2, Practitioner 3, PractitionerRole 2, Consent 2, Immunization 3, Device 2, DeviceMetric 1, Questionnaire 3, Goal 2, Flag 1, Communication 2, AuditEvent/Provenance 3 [V] | https://hl7.org/fhir/R4/resourcelist.html |
| FHIR R5 (5.0.0) | Published 26 Mar 2023; listed as the current published version; mostly trial-use [V] | https://hl7.org/fhir/history.html |
| FHIR R6 | Not published. 6.0.0-ballot5 (17 Jul 2026) is the second full ballot; "another ballot after this" [V]. A vendor expects production R6 support around late 2027 [S] | https://hl7.org/fhir/6.0.0-ballot5/ballot-intro.html |
| **Recommendation** | Build on **R4 (4.0.1)**: IPS, SMART and national guides are R4-based | — |
| International Patient Summary IG | 2.0.1 (STU 2) on R4 [V] | https://hl7.org/fhir/uv/ips/ |
| ISO 27269 | ISO 27269:2025, 2nd edition (Sep 2025) [V] | https://www.iso.org/standard/84639.html |
| SMART App Launch | 2.2.0 (STU 2.2), on R4, includes Backend Services and token introspection [V] | https://www.hl7.org/fhir/smart-app-launch/toc.html |

**Vital-signs LOINC codes (FHIR R4 vital-signs profile [V], https://hl7.org/fhir/R4/observation-vitalsigns.html):**

| Measure | Code | UCUM unit |
|---|---|---|
| Vital-signs panel | 85353-1 | — |
| BP panel | 85354-9 | — (components) |
| Systolic BP | 8480-6 | mm[Hg] |
| Diastolic BP | 8462-4 | mm[Hg] |
| Heart rate | 8867-4 | /min |
| Respiratory rate | 9279-1 | /min |
| SpO₂ | 2708-6; with pulse oximetry, also 59408-5 [V] | % |
| Body temperature | 8310-5 | Cel |
| Body weight | 29463-7 | kg |
| Body height | 8302-2 | cm |
| BMI | 39156-5 | kg/m2 |
| Head circumference | 9843-4 | cm |

**Glucose:** 2339-0 (blood, mg/dL) [V]; 41653-7 (capillary blood by glucometer, mg/dL) [V]; 14743-9 (capillary by glucometer, mmol/L) [V]. HbA1c 4548-4 and serum glucose 2345-7 [U].

**Terminologies:**
- LOINC is free for commercial use with the licence notice [V] (https://loinc.org/kb/license/).
- UCUM is at v2.2 (2024-06-17) [V]; licence terms [U].
- **SNOMED CT: Sri Lanka is not a SNOMED International member** (54 members; India is one), so use in Sri Lanka needs an affiliate licence and fees may apply [V] (https://www.snomed.org/members).
- ICD-11 has been in effect since 2022 [V]; Sri Lanka's adoption is [U].

## 2. Devices

| Item | Status | Source |
|---|---|---|
| ISO/IEEE 11073-10206 (ACOM) | ISO/IEEE 11073-10206:2024 [V] | https://www.iso.org/standard/87828.html |
| Bluetooth Generic Health Sensor (GHSP/GHSS 1.0) | Adopted 13 Jun 2023; exchange protocol for 11073-10206 [V] | https://www.bluetooth.com/wp-content/uploads/Files/Specification/HTML/GHSP_v1.0/out/en/index-en.html |
| Bluetooth health services | Blood Pressure 1.1.1, Health Thermometer 1.0, Heart Rate 1.0, Glucose 1.0.1, CGM 1.0.2, Pulse Oximeter 1.0.1, Weight Scale 1.0.1, Body Composition 1.0.1, User Data 1.1.1 [V] | https://www.bluetooth.com/specifications/specs/ |
| ITU-T H.810 (Continua) | Edition 5 (11/2019) is the only edition in force [V] | https://www.itu.int/itu-t/recommendations/rec.aspx?rec=H.810 |

## 3. Quality and safety

| Standard | Status | EU MDR harmonised | FDA recognised |
|---|---|---|---|
| ISO 13485:2016 | Current; confirmed 2025 [V] | Yes (EN ISO 13485:2016 + A11:2021) [V] | US QMSR incorporates it from **2 Feb 2026** [V] |
| ISO 14971:2019 | Current | Yes (+A11:2021) [V] | Yes (5-125) [V] |
| IEC 62304 | Ed. 1.1 (2006+A1:2015) current. **Ed. 2 not published**: CD2 expected Aug 2026, publication forecast 2028. Draft drops safety classes A/B/C for two rigour levels, covers "health software" [S/U] | No | Yes (13-79) [V] |
| IEC 82304-1:2016 | Current | No | Yes (13-97) [V] |
| IEC 62366-1:2015+A1:2020 | Current | No | Yes (5-129) [V] |
| IEC 81001-5-1:2021 | Current | No | Yes (13-122) [V] |

## 4. Security

| Item | Status | Source |
|---|---|---|
| ISO/IEC 27001:2022 (+Amd 1:2024) | Transition from 2013 ended 31 Oct 2025 [V] | https://www.iso.org/standard/27001 |
| ISO/IEC 27701:2025 | 2nd edition (14 Oct 2025), now a **standalone** privacy management system standard [V] | https://www.iso.org/standard/27701 |
| ISO 27799:2025 | Health-sector guidance aligned with ISO/IEC 27002:2022 [S] | https://www.evs.ee/en/iso-27799-2025 |
| OWASP ASVS | 5.0.0 (May 2025) [V] | https://github.com/OWASP/ASVS |
| OWASP MASVS | 2.1.0 (Jan 2024), adds MASVS-PRIVACY [V] | https://mas.owasp.org/ |
| ETSI EN 303 645 | V3.1.3 (2024-09) [V] | https://www.etsi.org/deliver/etsi_en/303600_303699/303645/ |
| EN 18031-1/2/3:2024 (radio equipment cybersecurity) | Cited with restrictions by Decision (EU) 2025/138; obligations apply from 1 Aug 2025 [V/S]. Applies to the hub (Wi-Fi + BLE + camera) as non-medical radio equipment | https://eur-lex.europa.eu/eli/dec_impl/2025/138/oj/eng |
| EU Cyber Resilience Act | In force 10 Dec 2024; **vulnerability and incident reporting since 11 Sep 2026** (24 h early warning, 72 h notification); full application **11 Dec 2027**; MDR/IVDR products excluded [V] | https://digital-strategy.ec.europa.eu/en/policies/cra-summary |
| FDA premarket cybersecurity guidance | Final Jun 2025 [V]; revised 3 Feb 2026 for the QMSR [S] | https://innolitics.com/articles/2026-cybersecurity-guidance/ |
| NIST SP 800-63-4 | Final 31 Jul 2025. Face biometrics must include presentation-attack detection; FMR ≤ 1:10,000; **biometrics only as part of MFA with a physical authenticator** [V] | https://pages.nist.gov/800-63-4/sp800-63b.html |
| ISO/IEC 30107-3:2023 | Presentation-attack detection testing, 2nd edition [V] | https://www.iso.org/standard/79520.html |
| ISO/IEC 19795-1:2021 | Biometric performance testing; under revision [V] | https://www.iso.org/standard/73515.html |

## 5. Privacy and regulation

### Sri Lanka
- **PDPA No. 9 of 2022** [V] (https://documents.gov.lk/view/acts/2022/3/09-2022_E.pdf):
  - A **"child" is under 16**.
  - All personal data of a child is **special-category** data, as are health data and biometric data used for unique identification.
  - A child's consent means a parent's or guardian's consent.
- **Amendment No. 22 of 2025** [V] (https://dpa.gov.lk/acts/22-2025_E_251104_201549.pdf):
  - Commencement is by ministerial order.
  - Cross-border transfers need Authority-set safeguards or a listed exception (e.g. explicit consent).
  - Data-subject requests must be answered in 1 month, extendable to 3.
  - DPIAs are submitted on request.
- **Commencement** [S] (Daily FT, Daily Mirror):
  - Gazette 2498/16 (22 Jul 2026) brings ss.2–3, Part I and Part III into force on **1 Jan 2027**. These cover lawful processing, DPO, breach notification, DPIA, processors and transfers.
  - Part II (rights) and Part VII (penalties) have no date yet.
  - The Data Protection Authority has operated since 2023.
- **NMRA** [V] (https://www.nmra.gov.lk/pages/medical-devices):
  - The device definition includes software, but there is no SaMD-specific guidance.
  - There is a reliance-pathway guideline (28 Oct 2025).
  - A product-categorisation letter route answers "is this a device?".
- **National digital health** [S] (https://wiki.ohie.org/x/DAA6CQ):
  - The national EHR is FHIR-based (limited scope, 1 M+ records).
  - It uses the **Personal Health Number (PHN)**, a JeMPI client registry, OpenHIM and Open Concept Lab.
  - The National Digital Health Architectural Blueprint is dated 2023.
- **Telemedicine** [V, WHO SEARO 2023]: no official guideline as of Feb 2023. Newer guidance and medical-record retention rules are [U].

### EU
- **GDPR:**
  - Art. 9 covers health and biometric data, with explicit consent (9(2)(a)) or health care (9(2)(h)) as the legal basis.
  - Art. 8 sets the child-consent age at 16 by default; member states may lower it to 13 [U as fetched].
  - The GDPR "Digital Omnibus" is still a proposal [S].
- **MDR Rule 11 / MDCG 2019-11 rev.1** (17 Jun 2025) [V]:
  - Software informing diagnosis or therapy is IIa and up.
  - Monitoring vital parameters where changes could mean immediate danger is IIb.
  - Storage, communication or simple search is usually not a device.
- **AI Act:** the Digital Omnibus on AI is Regulation (EU) 2026/1744 (OJ 24 Jul 2026) [S]. It postpones the high-risk dates:
  - Annex III systems from **2 Dec 2027**.
  - Annex I systems (incl. MDR) from **2 Aug 2028**.
  - Art. 50 transparency still applies from 2 Aug 2026.
- **European Health Data Space (EU) 2025/327:**
  - In force 26 Mar 2025; general application **26 Mar 2027**.
  - The wellness-app label (Art. 47) applies from 26 Mar 2029 for patient summaries, and from 26 Mar 2031 for labs, images and discharge reports. It is needed only if the app claims to work with EHRs [V/S].

### US
- **HIPAA Security Rule update:** proposed rule of 6 Jan 2025, no final rule; target moved to Jul 2027 [V/S].
- **FDA:**
  - The General Wellness and CDS guidances were revised on 6 Jan 2026 [S]. Non-invasive BP, SpO₂ and glucose estimates can be wellness if they don't label values abnormal, name conditions or use clinical thresholds.
  - The **MDDS guidance** (final, Sep 2022) says software that only transfers, stores, converts or displays device data is **not a device** [V].

### UK
- CE marks are accepted until 30 Jun 2030 for MDR devices [V].
- DCB0129/DCB0160 clinical-safety standards apply to NHS deployment [S].

### India
- The DPDP Rules were notified 13 Nov 2025. Main duties, including verifiable parental consent, apply from May 2027 [S].
- Health-care processing for children has an exemption [S].

### Accessibility
- WCAG 2.2 is the current W3C Recommendation; WCAG 3.0 is still a Working Draft (10 Sep 2026) [V].
- EN 301 549 V4.1.1 (2 Sep 2026) aligns with WCAG 2.2 [S].

## 6. Messaging and retention
- **England** (NHS Records Management Code, 2023) [V]:
  - Adult records are kept 8 years; children's until their 25th birthday (26th if 17 at the end of treatment).
  - SMS and messaging are in scope as part of the record.
- **FHIR:** Communication for messages; AuditEvent and Provenance for audit trails.

## Still to verify
- Sri Lanka: ICD-11 adoption, SNOMED affiliate fees, medical-record retention, telemedicine guidance after 2023.
- Licences and codes: the UCUM licence; LOINC 2345-7 and 4548-4.
- Standards and law texts:
  - IEC 62304 Ed. 2 on the IEC site.
  - The operative texts of GDPR Art. 8/9 and CRA Art. 2(2).
  - Any Digital Omnibus change to the CRA.
  - The Sri Lanka gazette text itself.
