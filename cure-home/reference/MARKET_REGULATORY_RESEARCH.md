# Reference: Market, regulatory, security & clinical research for Cure Home
> Research compiled 2026-10-21 by web search. Figures marked 'flag' are uncertain; re-verify before external use.

# Cure Home: Product Research Brief
*Prepared 21 Oct 2026. Inline citations [n] refer to the Sources list at the end. "Flag" marks items that are uncertain, conflicting between sources, or estimated.*

---

## Executive summary

- **The business that works is the reimbursed B2B2C "kit", not consumer smart mirrors.** Tenovi, Smart Meter, Omron VitalSight and HRS make money on zero-setup data capture tied to clinician workflows. Stand-alone consumer mirrors and big-tech elder-care subscriptions have mostly died (Naked Labs, Lululemon Mirror, Alexa Together, Qardio).
- **Sri Lanka's need is large.** About 1 in 3 adults aged 30–70 has raised BP, 54% of them don't know it, and only 40% of those treated are controlled [26]. 18% of the population is now 60+ [30]. But only 21.5% of 60–69-year-olds used the internet in 2025 [32]. A hub that needs no smartphone fits that gap.
- **Regulatory timing matters.** Sri Lanka's PDPA Parts I and III (core processing duties) take effect **1 Jan 2027** [35][36]. Biometric and health data are special categories [34]. Bundled BP, SpO₂ and glucose devices need NMRA registration. A Raspberry Pi 5 already has a TRCSL type-approval exemption letter [41].
- **The most important design rule** is to keep the hub a "data system" (transfer, store, display) with no alarms, no abnormal flags and no diagnostic thresholds. Put any clinical alerting in the hospital app, where it can be assessed separately [43][44][45].
- **Hardware cost has jumped.** Pi 5 4GB list price went from $60 (2023) to **$110 (Apr 2026)**; 8GB is now $175 [77]. Face recognition runs acceptably on the Pi 5 CPU for a household-sized gallery, so the Hailo HAT is optional.
- **Self-monitoring alone barely moves BP** (−1.0 mmHg, not significant). Self-monitoring with clinician co-intervention gives −6.1 mmHg [87]. Cure's hospital link is the value driver, not the screen.

---

## A. Market and competitors

### A1. Reference business model: US RPM reimbursement (2026)

| CPT | What it pays for | 2026 national rate (HRS) [2] |
|---|---|---|
| 99453 | Setup and education, once per episode | $21.71 |
| 99454 | Device supply, **16–30 days** of data per 30 days | $52.11 (2025: $43.02) |
| **99445 (new)** | Device supply, **2–15 days** of data | $52.11 |
| 99457 | First 20 min of management per month | $51.77 |
| 99458 | Each additional 20 min | $41.42 |
| **99470 (new)** | First 10 min of management (10–19 min) | $26.05 |

- **The old "16-day rule" is relaxed.** In 2026, 99445 pays for 2–15 transmission days. 99470 cannot be billed with 99457 in the same month [2].
- **Rates differ by source.** Prevounce quotes about $47 for 99445 and 99454 [1]. Verify against the CMS final rule.
- **Tenovi's 2025 reference rates:** 99453 $19.73, 99454 $43.03, 99457 $47.88 [3].
- **Scrutiny is rising.** OIG (Sept 2024) found Medicare RPM enrollees grew from about 55,000 (2019) to more than 570,000 (2022), and payments from about $15M to $300M. **43% of enrollees missed at least one required component.** OIG recommends capturing device and data type on claims [4].
- **Lesson:** revenue follows verified daily data plus clinician time. Hardware is a cost of acquiring data.

### A2. Market size (directional only)

- **RPM:** USD 66.33B by 2031 at 12.8% CAGR (MarketsandMarkets) [5]. "RPM systems": USD 16.9B by 2030 at 18.3% CAGR (Grand View) [6]. The ~4× spread reflects different definitions; flag.
- **Aging tech:** AARP/CTA (Jan 2025) projects $120B by 2030 [7].
  - 80% of US adults 50+ own some aging-at-home tech.
  - 60% cite cost as a barrier and 41% cite reliability.
  - 64% feel technology isn't designed for their age.
  - BP and glucose monitors are among the top products older adults are considering [7].

### A3. Competitor landscape

| Player | Offering / price | Status and lesson |
|---|---|---|
| **Withings** | Body Smart $129.95; Body Comp $229.95; Body Scan $499.95; BodyScan 2 $599.95; BPM Connect $129.95; BPM Vision $179.95 (current US list) [8]. BPM Vision was announced at CES 2025 at $130, with 8 user profiles and Wi-Fi [9]. Withings+ costs about $10/mo and includes Cardio Check-Up [9]. | Healthy. Has pivoted into B2B RPM: cellular BPM Connect/Pro and Body Pro scale, EHR integration, usage-based pricing [10]. The "Omnia" mirror (CES 2025) is a concept that Withings itself places 5–10 years away [11]. |
| **CareOS / Baracoda** | Artemis mirror: face recognition, AR, gesture control, telemedicine; BBalance mat [12] | The "digital bathroom" remains a long-term vision. Near-term targets are pharmacies and Japanese hotels (B2B) [12]. No mass-market traction. |
| **Naked Labs** | 3D-scanning mirror plus turntable scale; $14M Series A (2018); price rose from $499 (2016) to **$1,395**; shipping slipped about 18 months [13] | Appears defunct (flag: no shutdown notice found). Lesson: price and novelty without a clinical payer. |
| **Lululemon Mirror** | Acquired for $500M (2020) | Hardware sales ended end-2023 [14]. |
| **HiMirror** | Beauty and skin mirror | Niche; no recent data (flag). |
| **Amazon Alexa Together** | $19.99/mo elder-care subscription launched Dec 2021, replacing the free Care Hub [15] | Retired, "in 2024" per one source [16] and "May 2025" per another [17] (flag). Amazon also shut its HIPAA Alexa skills in Dec 2022 [18]. Lesson: big-tech elder-care features are fragile. |
| **Google Nest Hub (2nd gen)** | Soli radar sleep sensing | The planned Fitbit Premium paywall never happened. Moving to the Google Health app as Google Fit shuts down (July 2026 report) [19]. |
| **Omron VitalSight** | BP monitor plus pre-configured data hub; no Wi-Fi needed; coordinators chase gaps in readings; Medicare-reimbursable [20] | The closest analogue to "hub plus cuff". |
| **Qardio** | QardioArm and QardioBase | Went bankrupt; the app vanished and the cuffs were orphaned. The open-source LibreArm app revived them because the cuff exposes the standard 0x1810 BP service [21]. Lesson: build on standard GATT and support local-first operation. |
| **Tenovi** | Cellular BLE gateway; 60+ FDA-cleared devices (Omron, A&D, Welch Allyn and others) arrive **pre-paired**; plug in and go; LED status ring; data and fulfilment APIs [3] | **The direct analogue of Cure Home's BLE gateway function.** |
| **Smart Meter** | Cellular-native BP, glucose, scale and SpO₂ devices; private AT&T network | More than 25,000 active devices on eClinicalWorks, +107% YoY in 2025. Explicitly sells "no Bluetooth pairing" [22]. |
| **Health Recovery Solutions** | Tablet plus BLE-peripheral kits, logistics, 24/7 monitoring; 1M+ lives | Client-reported 86–88% daily adherence [23]. |
| **Biofourmis** | Enterprise RPM; raised $445M | Cut 120 staff in 2023; merged with CopilotIQ in Oct 2024 [24]. |
| **Xiaomi Body Composition Scale 2** | About $30–40; up to 16 profiles; BLE only [25] | Cheapest scale that broadcasts its readings (see E). |
| Samsung, Lifesense, Hapbee | Not researched in depth (flag) | Hapbee is a wellness "signal" wearable, not a vitals device. |

**Pattern across these players:**
- **What worked:** zero-touch onboarding (pre-pairing, cellular), a funded clinical loop (staff chase missing data), and standards-based devices.
- **What failed:** premium single-purpose consumer hardware with no payer, subscription add-ons from platforms that deprioritised them, and closed ecosystems that left devices bricked.

---

## B. Sri Lanka context

### B1. NCD burden

- **Hypertension:** 34.8% of adults aged 30–70 (STEPS 2021), up nearly 25% since 2015 [26].
  - 54% of people with raised BP are unaware of it.
  - About 20% of those who are aware take no medication.
  - Only 40% of treated adults are controlled (<140/90).
  - Of about 4.3M hypertensive adults, about 1.5M are treated [26].
  - WHO/MoH SEAHEARTS aims to treat about 1M more people and reach 50% treatment coverage [26].
- **Deaths and diabetes:** 83% of deaths are from NCDs, according to the Minister of Health (Mar 2025) [27].
  - About 20% of adults have diabetes, and 41% of them seek no treatment [27].
  - About 35% of people over 60 have high BP [27].
  - Flag: these figures come from a news report without a named dataset.
- **Survey base:** STEPS 2021 covered 6,267 adults aged 18–69 [28].
- **Obesity:** no national 2021+ figure was retrievable (flag). An urban Colombo study found 34.3% overweight and 31.2% obese using Asian BMI cutoffs (about 65% combined) [29]. That is a local sample, not national.

### B2. Ageing

- People aged 60+ made up 12% of the population in the 2012 census and **18% in the 2024 census**. Projected to reach 25% by 2040 [30].

### B3. Digital access

- **Population and connectivity (Oct 2025) [31]:**
  - Population 23.3M.
  - Internet users 13.9M (59.7%).
  - Mobile connections 30.3M (130%).
  - Social media identities 9.0M.
  - Median mobile download 45.6 Mbps vs fixed 31.7 Mbps; mobile is faster than fixed.
- **Department of Census and Statistics, Jan–Jun 2025 [32]:**
  - National internet use 60.4%, but **ages 60–69 only 21.5%**.
  - Digital literacy for ages 60–69 is 29.0%, versus 70.8% nationally.
  - Only 21.4% of households own a computer (urban 36.3%, estate 5.8%).
- **Implication:** the hub must work with no smartphone and no fixed broadband. Plan for a 4G modem or phone-hotspot fallback.

### B4. Health digitisation

- The MoH **Digital Health Blueprint** (file dated 1 Nov 2023) emphasises HL7 FHIR with planned country-specific profiles, OpenHIE reference architecture, the International Patient Summary, and TOGAF [33].
- It does not mention patient-generated or home-monitoring data [33].
- Cure should emit FHIR Observation resources so it is ready for national integration.

### B5. Personal Data Protection Act No. 9 of 2022 (amended by Act No. 22 of 2025)

- **Phased commencement [34][35][36]:**
  - Part V (Data Protection Authority) has been in force since 17 Jul 2023 [34][37].
  - The original 18 Mar 2025 date for the core Parts was repealed [34].
  - **Gazette 2498/16 (22 Jul 2026) brings ss. 2–3, Part I (processing obligations) and Part III (controllers and processors) into force on 1 Jan 2027** [35][36].
  - Part II (data-subject rights) and Part VII (penalties) still await an order [36].
- **Special categories** include **biometric and health data** [34]. A secondary source says all personal data of children **under 16** is special-category and needs parental consent (flag: verify the age against the Act) [36].
- **Cross-border transfers:** the amendment removed the adequacy mechanism. Transfers (including to cloud) need compliance with Part I and safeguards or instruments set by DPA directive, or listed exceptions such as explicit consent [35][36][37].
- **DPO:** mandatory where core activities involve large-scale special-category processing or systematic monitoring. An external DPO is allowed [35][36].
- **Other duties:**
  - A Data Protection Management Programme (s.12) [37].
  - DPIAs (s.24), submitted to the DPA only on request [35].
- **Penalties:** up to LKR 10M per violation, with doubling for repeat violations [34]. Directors are personally liable unless they prove due diligence [36].
- **Implication:** Cure, which processes biometric and health data from families including children, needs a DPO, a DPIA and a transfer instrument before 1 Jan 2027.

### B6. NMRA (medical devices)

- **Law and definitions:** devices fall under the NMRA Act No. 5 of 2015. The device definition explicitly includes "software necessary for its proper application" [38].
- **Process [38]:**
  - Foreign manufacturers apply via a local Marketing Authorization Holder.
  - Provisional registration lasts 1–2 years; full registration lasts 5 years.
  - **Product Categorization Letters** settle whether a product is a device.
  - A **Reliance Pathway** exists for FDA, EU, UK and Japan approvals.
  - A low-risk pathway covers Class I devices [38].
- **Classification and timelines [39]:**
  - BP monitors are cited as Class IIa.
  - Glucometers fall under the separate IVD framework.
  - Reliance timelines are about 3–6 months for Class II [39].
  - Self-use devices may need Sinhala and/or Tamil labelling [39].
- **Practical read:**
  - Each bundled BP cuff, oximeter, thermometer and glucometer (plus strips) must be NMRA-registered by Cure or its distributor.
  - A body-composition scale sold for wellness is probably not a device (flag).
  - Request a **PCL for the hub** to document that it is a non-device data display.

### B7. TRCSL and import

- **Type approval rules:** the RTTE Type Approval Rules took effect 16 Dec 2020. Approvals last 4 years and labelling is mandatory [40].
  - Exemptions include transmitters under 50 mW and Wi-Fi/BT embedded in PCs [40].
- **Raspberry Pi 5 already has a TRCSL letter [41]:**
  - It exempts the Pi 5 from type approval at 2.4 and 5 GHz, EIRP under 20 dBm, valid 4 years.
  - Importers still need a TRCSL vendor licence and an application, and frequency charges may apply [41].
  - Confirm whether a finished hub (or a CM5-based design) can rely on that letter (flag).
- **Duties:** Cabinet approved phasing out the CESS on 2,634 HS codes over 2026–2029 [42]. Check VAT and PAL per HS code.

---

## C. Global regulatory

### C1. US FDA

- **MDDS** is software that transfers, stores, converts or displays device data *without analysing it*.
  - Since the 21st Century Cures Act (2016), software-only MDDS is not a device. Hardware MDDS gets enforcement discretion.
  - The line is crossed by active patient monitoring needing a timely response, alarms prompting immediate clinical action, or threshold analysis or insights [43].
- **General Wellness and CDS guidances, revised 6 Jan 2026** [44][45]. Non-invasive estimation of BP, SpO₂ and glucose can be "wellness" if all of these hold:
  - It is not intended for diagnosis or treatment and does not substitute for a cleared device.
  - It gives no outputs that prompt specific clinical action.
  - Any values that mimic clinical values are validated [45].
- **What wellness products may show [44][45]:**
  - Allowed: values, ranges, trends and baselines.
  - Allowed: suggesting a professional evaluation, but only without naming a condition, labelling something "abnormal", stating clinical thresholds, or giving ongoing disease-management alerts.
  - Colour-coded target zones, abnormal flags and "medical grade" claims can push a product out of wellness, and disclaimers did not save WHOOP [44].
- **CDS change:** discrete point-in-time measurements generally aren't a "pattern" [44]. Clinician-side summaries of a few home readings are more tractable.
- **Cure Home's position:** because readings flow to doctors, the **clinical path relies on MDDS, not wellness**. Keep the hub as transfer, store and display. Put risk scores and alerts in the clinician web app, where they can be assessed separately (CDS criteria or a device pathway).

### C2. EU

- **MDR Rule 11 and MDCG 2019-11 rev.1 (June 2025) [46]:**
  - Software that only stores, communicates or simply searches data is generally not a medical device.
  - Software informing diagnostic or therapeutic decisions starts at class IIa.
  - Software monitoring physiological processes is IIa, or IIb for vital parameters where variations could pose immediate danger.
  - Intended-purpose claims are decisive [46].

### C3. Standards (needed if Cure ever registers its own device, and good practice anyway)

- **IEC 62304** software safety classes: A (no injury possible), B (non-serious injury), C (death or serious injury). Classes are derived from **ISO 14971** risk analysis before controls [47].
- **IEC 62366-1** covers usability engineering.
- **ISO 13485** is the QMS that NMRA's reliance and standard pathways expect [39].

### C4. Privacy and biometrics

- **GDPR Art. 9:** "biometric data for the purpose of uniquely identifying a natural person" and "data concerning health" both require an Art. 9 exception, typically explicit consent [48].
- **Illinois BIPA**, amended 2 Aug 2024 [49]:
  - Damages are now recoverable once per person per method (not per scan): $1,000 negligent or $5,000 reckless/intentional.
  - E-signatures are valid for written releases.
  - A public retention and destruction policy is still required [49].
- **EU AI Act Annex III** excludes biometric *verification* whose sole purpose is confirming someone is who they claim to be [50]. A household 1:N greeter is technically identification, so classification is ambiguous (flag; only relevant if sold in the EU).
- **HIPAA** applies only if Cure serves US covered entities as a business associate.

---

## D. Security and privacy

### D1. Baselines

- **OWASP IoT Top 10 (2018) [53]:**
  1. Weak or hardcoded credentials
  2. Insecure network services
  3. Insecure ecosystem interfaces
  4. No secure update mechanism
  5. Outdated components
  6. Insufficient privacy
  7. Insecure transfer and storage
  8. No device management
  9. Insecure defaults
  10. No physical hardening
- **ETSI EN 303 645:** 13 provisions, including no universal default passwords, a coordinated vulnerability disclosure policy and secure updates. It is the blueprint for the EU CRA [54].
- **EU timelines:**
  - The RED cybersecurity delegated act has applied since 1 Aug 2025 [54].
  - The CRA entered into force 10 Dec 2024 [54]. Vulnerability reporting starts Sept 2026 and full application is Dec 2027 (from general knowledge; verify).
- **NIST IR 8259A core baseline [55]:**
  - Device identification
  - Device configuration
  - Data protection
  - Logical access to interfaces
  - Software update
  - Cybersecurity state awareness

### D2. Platform hardening on Pi 5 / CM5

- **Secure boot (`rpi-sb-provisioner`) [56][57]:**
  - Supports CM5, CM4 and Pi 5/500. Compute Modules are recommended for production.
  - Burns a hash of your RSA-2048 public key into OTP, signs the EEPROM bootloader and requires a signed `boot.img`.
- **Encryption [56][57]:**
  - Encrypts root with LUKS2 using a device-unique secret in OTP, so it unlocks without a password.
  - Uses AES-XTS; BCM2712 has hardware AES.
- **Caveats [56][57]:**
  - OTP writes are irreversible; losing the signing key bricks updates.
  - JTAG lock and EEPROM write-protect are permanent.
  - The "fde-only" mode is not recommended.
  - No physical tamper resistance is claimed.
  - The tool is still beta.
- **Hardware keys:**
  - Infineon OPTIGA TPM SLB 9672 (TPM 2.0, SPI, CC EAL4+/FIPS) has a Pi HAT eval board. It lists Pi 2/3/4/Zero, not Pi 5, so validate (flag) [58].
  - A Microchip ATECC608 secure element (about $1, ECC P-256) is a cheaper option for an mTLS device key (general knowledge).
- **Identity and provisioning:**
  - Give each device an X.509 certificate generated in the TPM or secure element at the factory.
  - Use mTLS to Cure's API, with short-lived tokens for the UI.
  - Record serial, MAC and cert in the provisioner's manufacturing DB [56].
- **OTA updates [59]:**
  - **Mender** (Apache 2.0, hosted server, delta updates only in paid tiers).
  - **RAUC** (LGPL; pair with Eclipse hawkBit).
  - **SWUpdate** (GPLv2).
  - All support Raspberry Pi via Yocto layers. Balena and OSTree are alternatives.
  - A/B rollback depends on bootloader support, so check it early [59].

### D3. Face-data privacy

- **EDPB Guidelines 3/2019 [51]:**
  - Minimise templates.
  - Keep templates on a device under the user's control.
  - Encrypt any central store with a key held by the individual.
  - **Delete raw images** and verify the deletion.
- **EDPB Opinion 11/2024 (airports) [52]:**
  - Only user-held templates, or a central DB with a user-held key, were judged compatible.
  - An operator- or cloud-held key was not compatible.
- **For Cure Home:**
  - On-device enrolment and matching only.
  - Templates stored encrypted under the TPM-sealed key.
  - No frames uploaded, and video never leaves RAM.
  - Explicit, revocable per-person consent.
  - Children enrolled only with guardian consent.
  - A **guest mode** (no recognition, no logging).
  - A **physical camera shutter or kill switch** with an LED.
  - A "forget me" action that deletes the template locally and in backups.

### D4. Liveness (ISO/IEC 30107-3)

- **iBeta Level 1:** 8 h per attack species, artefacts ≤ $30, 0% penetration allowed [60].
- **iBeta Level 2:** 2–4 days per species, masks ≤ $300, ≤1% penetration allowed [60].
- **Both levels:** BPCER ≤ 15% [60].
- **For a family greeter**, spoofing risk is low. Do not let face match alone unlock history views or doctor-sharing settings; add a PIN or confirm on the Android app.

---

## E. BLE health devices

### E1. GATT services

- **Standard service UUIDs:**
  - Blood Pressure **0x1810** (measurement 0x2A35, *indications*)
  - Health Thermometer **0x1809**
  - Glucose **0x1808** (needs bonding and RACP)
  - Heart Rate **0x180D**
  - Weight Scale **0x181D**
  - Body Composition **0x181B**
  - Pulse Oximeter (PLX) **0x1822**
  - Generic Health Sensor **0x1840** [63]
- **Supporting services:** User Data (0x181C), Current Time (0x1805), Elapsed Time (0x183F).
- **Generic Health Sensor (GHS / GHSP 1.0, adopted; spec page dated 2023) [61][62]:**
  - Based on IEEE 11073-10206 (ACOM), with MDC codes that map to FHIR Observation and UCUM.
  - Supports live, temporarily-stored and stored observations (via RACP).
  - Uses ETS timestamps (UTC, local time or tick counter) and UDS multi-user with consent.
  - Recommends LE Secure Connections Mode 1 Level 4 and encrypted advertising [61].
  - The collector should convert times to UTC and map UDS users to FHIR Patient [61].
  - GHS is the BLE-native successor to the classic IEEE 11073-20601 PHD stack. Few consumer devices ship it yet (flag), so support legacy profiles too.

### E2. Broadcast vs connect

- **Passive broadcast (easy):**
  - Xiaomi scales (XMTZC04HM/05HM etc.) put weight, and on the Mi Scale 2 also impedance, in advertisements.
  - ESPHome reads them "passively… does not pair" [64].
  - Many cheap scales behave similarly. openScale supports Beurer, Medisana, Sanitas, Silvercrest, Yunmai, iHealth, Xiaomi and others [66].
  - Theengs Decoder (C++/Python, Pi-capable) decodes about 40 BLE sensors [67].
- **Connect, bond and indicate (harder):**
  - Omron cuffs need pairing mode ("-P-").
  - Many Omron models use a proprietary EEPROM protocol, and some (HEM-7188T, 7196T) encrypt traffic [65].
  - omblepy documents BlueZ unreliability on Debian 11/12 [65].
  - QardioArm used standard 0x1810 plus a vendor control characteristic [21].
  - Glucometers use the Glucose profile with RACP after bonding.
- **Gateway precedent:** Tenovi avoids all of this by shipping devices pre-paired to the gateway [3]. Cure should do the same at the factory or the pharmacy counter.

### E3. Pitfalls and mitigations

- **User assignment:** use a time window.
  - A recognised face opens a 2–5 minute attribution window, and a reading arriving in it goes to that person.
  - With no face or several faces, the reading goes to an "unassigned" inbox. Withings uses the same pattern with its "unknown measurements" [68].
  - Use weight-band heuristics as a tie-breaker (ESPHome's per-user weight ranges) [64].
  - For Omron, map device user slots 1 and 2 to people. For GHS devices, use UDS.
- **Impedance carry-over:** a partial step-on can attach the previous user's impedance. ESPHome's `clear_impedance` exists for this [64].
- **Partial or duplicate readings:**
  - Scales re-broadcast the same value; deduplicate by device, value and time bucket.
  - Store only "stabilised" results, and only complete systolic/diastolic/pulse sets [21].
  - On reconnect, pull only new records (RACP or new-record counters) [65].
- **Time:** cheap broadcasters have no clock, so use the hub's receive time. Set device clocks via Current Time Service or ETS, and keep everything in UTC [61][65].
- **Units:** honour unit flags (kg/lb, mmHg/kPa, °C/°F, mg/dL vs mmol/L) and IEEE-11073 SFLOAT encoding.
- **Range:** the scale usually lives in the bathroom, away from a living-room hub. Pi 5 has BLE 5.0 [83]. Plan ESP32 BLE proxies or a phone relay.

---

## F. Face recognition on edge devices

- **OpenCV YuNet + SFace (CPU-friendly) [69]:**
  - YuNet is a 338 KB detector with 5 landmarks. SFace is a 36.9 MB embedding model.
  - Default match thresholds: cosine ≥ 0.363 or L2 ≤ 1.128.
  - LFW accuracy is 99.60%, but cross-pose (CPLFW) drops to 91.05% and cross-age (CALFW) to 93.95% [69]. That is the realistic home scenario.
- **Speed [70]:**
  - Raspberry Pi 4: YuNet 6.2 ms (160×120), SFace 68.8 ms.
  - RK3588 A76 CPU: 2.3 ms and 28.9 ms [70].
  - Pi 5 also uses A76 cores at 2.4 GHz, so expect about 25–35 ms per embedding (estimate). That is ample for 2–5 fps greeting.
- **dlib `face_recognition` on Pi 5:**
  - About 5 fps when processing at 192×108, but recognition only works at about 1 m. Full-1080p processing gives about 0.5 fps [71].
  - A separate study measured Pi 5 latency at 0.08 s for face_recognition and 0.18 s for FaceNet [72].
- **Hailo accelerators:**
  - Pipelines use SCRFD-10g (640×640) and ArcFace-MobileFaceNet (112×112) HEFs. SCRFD runs at about 303 fps raw on Hailo-8 [73].
  - AI HAT+ launched Oct 2024 at **$70 (Hailo-8L, 13 TOPS)** and **$110 (Hailo-8, 26 TOPS)** [74].
  - AI HAT+ 2 (Hailo-10H, 40 TOPS, 8 GB) was $130 [75], then +$50 in Apr 2026 [79].
  - Not needed for under 10 enrolled family members; useful only for extra vision features.
- **Bias [76]:**
  - NIST FRVT (Dec 2019, 189 algorithms) found one-to-one false-positive differentials "from a factor of 10 to 100" across demographics, with higher rates for Asian and African-American faces in US-developed algorithms.
  - Asian-developed algorithms showed no large Asian/Caucasian gap.
  - NIST urges testing on your own population [76].
  - **Validate on Sri Lankan faces**, including elderly people and children, siblings and parent–child pairs.
- **Enrolment:**
  - One good frontal photo often suffices [71], but enrol 5–10 frames across yaw, pitch, glasses and lighting.
  - Re-enrol children every 6–12 months.
  - Adapt templates only from high-confidence matches, to avoid drift.
- **Lighting:**
  - Window backlight is the main failure mode. Camera Module 3 offers HDR (up to 3 MP), PDAF, and 75° or 120° (Wide) lenses [81].
  - NoIR plus IR LEDs handles dim rooms.

---

## G. Hardware BOM (USD list prices, Oct 2026)

**The memory-cost shock** (LPDDR4 is reportedly about 7× its 2025 price) [79]:

| Pi 5 | Sep 2023 | 1 Dec 2025 | 2 Feb 2026 | 1 Apr 2026 (current) |
|---|---|---|---|---|
| 2GB | $50 (Aug 2024 launch) | $55 | $65 | **$77.50** (from 1 Oct 2026) |
| 4GB | $60 | $70 | $85 | **$110** |
| 8GB | $80 | $95 | $125 | **$175** |
| 16GB | $120 (Jan 2025 launch) | $145 | $205 | **$305** |

Sources: [77][78][79].

- **CM5:** 4GB Lite with no wireless is $100; 8GB Lite is $165 [77]. Both Pi 5 and CM5 are promised in production until at least January 2036 [82][83].
  - CM5 adds eMMC (16–64 GB), an optional certified radio, and an external-antenna option [82]. It is better for a product (no SD card, secure-boot-first), but needs a carrier board.
- **Display:** Touch Display 2 is $40 (5"), **$60 (7", 720×1280)** or **$80 (10", 1200×1920; Pi 5/CM only)**. It is DSI-connected and powered from GPIO [80].
- **Camera:** Camera Module 3 from $25 [81].
- **RK3588 alternatives** (Orange Pi 5 Plus/Pro, Radxa Rock 5B+) [84][85]:
  - 6 TOPS NPU (ResNet18 INT8 runs in 4.1 ms), PCIe 3.0, Wi-Fi 6 on some models.
  - Now cost **$150–300+** with patchy retail and unclear long-term support. RKNN needs off-board model conversion [84][85].
  - They no longer undercut the Pi.

**Rough hub BOM (Pi 5 4GB build):**

| Item | Cost |
|---|---|
| Pi 5 4GB | $110 |
| 7" Touch Display 2 | $60 |
| Camera Module 3 | $25 |
| 32 GB storage (SD or eMMC) | ~$8–15 |
| 27 W PSU | ~$12 |
| Cooler | ~$5 |
| TPM / secure element | ~$2–6 |
| Mic and speaker | ~$8 |
| Enclosure | ~$10–15 |
| **Total** | **≈ $240–255 landed electronics** |

- Injection-mould tooling, estimated at roughly $10–30k, comes on top (flag: all non-Pi items are estimates).
- **Peripherals:**
  - Xiaomi-class scale $30–40 [25].
  - Registered BLE BP cuff about $40–80, oximeter $20–40, thermometer $20–30, glucometer $20–40 plus recurring strips (estimates).
- **Retail thinking:**
  - Consumer hardware typically retails at 2–3× BOM, which puts the hub at $500–750 before peripherals. That is out of reach for most Sri Lankan households (about LKR 150k–225k at roughly LKR 300/USD; flag the rate).
  - Viable routes:
    - Hospital- or insurer-subsidised lease plus a monthly service fee.
    - A "Lite" tier using a commodity Android tablet (Cure already ships an Android app).
    - A 2GB Pi 5 ($77.50) with tight software (flag: test RAM headroom).

---

## H. Usage, retention and clinical evidence

### H1. Abandonment and engagement

- **Wearables:** one-third of wearable owners stop within 6 months, and over half eventually stop (Endeavour Partners, 2013 survey of 6,223 US consumers) [86].
- **RPM programmes** that sustain use rely on staff outreach when transmissions stop (VitalSight coordinators [20], HRS 24/7 monitoring [23]).
- **AARP:** 64% of people 50+ say tech isn't designed for them [7].
- **Engagement levers for Cure Home:**
  - Ambient daily utility (clock, weather, calendar, medication reminders).
  - Recognition-triggered greetings as the habit cue.
  - Family features (caregiver view in the Android app).
  - Clinician feedback ("Dr X reviewed your readings"), which is the strongest motivator per [87].
- **Daily weighing:** a cellular-scale daily-weighing programme with weekly feedback produced a mean 13.5 lb loss at 6 months (n=91) [93].

### H2. Elderly UX

- **NIA/NLM checklist [94]:**
  - 12–14 pt sans-serif, medium or bold.
  - High contrast and no patterned backgrounds.
  - Avoid placing yellow, blue and green next to each other.
  - Large buttons with text labels and consistent placement.
  - No auto-scrolling text.
  - Test with older adults.
- **WCAG 2.2:** target size minimum 24×24 CSS px (2.5.8 AA) and 44×44 enhanced (2.5.5 AAA) [95].
  - On a 7" 720×1280 panel, use body text ≥ 24 px and targets ≥ 48 px.
- **"Liquid glass" caution:** Apple's translucent Liquid Glass drew legibility complaints (outdoor glare, fatigue). Apple added a "Tinted" option in iOS 26.1 beta (Oct 2025) [96].
  - Use opaque, high-contrast data cards over the live face, and keep glass as an accent only.
- **Voice:** Sinhala and Tamil voice prompts (TTS quality is a flag) matter given 29% digital literacy among 60–69-year-olds [32].

### H3. Clinical evidence

- **Self-monitoring alone barely helps.** An IPD meta-analysis (Tucker 2017, 15 trials, n=7,138 at 12 months) found −3.2 mmHg overall [87]:
  - Self-monitoring alone: **−1.0 (not significant)**.
  - Self-monitoring with intensive support (titration, education): **−6.1 mmHg** [87].
- **TASMINH4** (n=1,182, UK primary care), clinic SBP at 12 months vs usual care [88]:
  - Self-monitoring: −3.5 mmHg.
  - **Telemonitoring: −4.7 mmHg**.
  - Telemonitoring reached significance earlier (at 6 months) [88].
- **SPRINT** (n=9,361) [89]:
  - Targeting SBP < 120 vs < 140 cut the primary CV outcome (HR 0.75) and all-cause mortality (HR 0.73) [89].
  - This underpinned lower US thresholds [90].
  - The 2025 AHA/ACC guideline "strengthens and elaborates" out-of-office BP monitoring [90].
- **HBPM protocol:**
  - Validated upper-arm device; 2 readings morning and 2 evening for 7 days (minimum 5).
  - Discard day 1; measure before meds after 5 minutes' rest; average ≥135/85 means hypertension [91].
  - **This needs 4 BP readings per day, which conflicts with a "max ~3 readings/day/user" cap.**
- **Heart failure:** weigh daily at the same time, and report a gain of more than 2 kg in 3 days (ESC patient guidance) [92].

---

## Implications for Cure Home

- **Position it as a gateway plus display, not a diagnostic.**
  - The hub transfers, stores and displays data (MDDS-like), with neutral trend charts.
  - No red/amber "hypertension" zones, no abnormal labels, no alarms on the hub.
  - Alerting and risk scoring live in the Cure hospital app under clinician control and get their own regulatory assessment [43][44][45][46].
- **Lead with the clinical loop.** Sell to hospitals and doctors as a hypertension, diabetes and heart-failure home-monitoring programme with clinician review. The evidence only supports benefit with co-intervention [87][88].
  - Mirror the US RPM structure (setup fee plus monthly device and data fee plus clinician-time fee) as the Sri Lankan price model [2].
- **Copy Tenovi's onboarding.** Pre-pair bundled devices at the factory or pharmacy, and show an LED or on-screen "reading received" confirmation [3].
  - Prefer devices with standard GATT (0x1810, 0x181D/0x181B, 0x1809, 0x1822, 0x1808) or GHS, to avoid Qardio-style lock-in [21][61].
- **Rethink the reading cap.** Make the cap per metric and per session. Add an "HBPM week" mode (2×2 readings per day for 7 days, day 1 discarded) and a heart-failure daily-weight mode [91][92].
- **Make attribution explicit.** Use a face-triggered attribution window, an unassigned inbox with one-tap confirm, weight-band tie-breaks and device user-slot mapping. Never silently assign ambiguous readings [64][68].
- **Plan for connectivity.** Use BLE proxies for bathroom scales, and an LTE or phone-hotspot fallback, because mobile beats fixed broadband in Sri Lanka [31].
- **Handle face data with privacy by design:**
  - On-device templates only, TPM-sealed and encrypted, with raw frames never stored or uploaded [51][52].
  - Explicit per-person consent, guardian consent for under-16s (verify the age [36]), guest mode, a physical shutter and kill switch, and a PIN for sensitive actions.
- **PDPA readiness by 1 Jan 2027** [35][36][37]:
  - Appoint a DPO (external is allowed) and run a DPIA.
  - Set up the s.12 programme and a cross-border transfer instrument for any non-Sri Lankan cloud.
  - Prefer Sri Lankan hosting for health data.
- **NMRA and TRCSL:**
  - Register bundled BP, oximeter, thermometer and glucometer devices via the Reliance Pathway through a local MAH.
  - Obtain a PCL for the hub [38][39].
  - Use the Pi 5 TRCSL exemption letter and a vendor licence, and confirm coverage for a CM5 design [41].
- **Hardware:**
  - Prototype on Pi 5 4GB; productise on CM5 with eMMC, secure boot, LUKS and TPM [56][82].
  - Budget for memory-driven price volatility: Pi 5 4GB is up 83% since 2023 [77].
  - Skip the Hailo HAT for v1 [70][74].
  - Evaluate a low-cost Android-tablet "Cure Home Lite" for price-sensitive households.
- **Security baseline:**
  - ETSI EN 303 645 / NIST 8259A controls [54][55].
  - Per-device X.509 with mTLS.
  - Signed A/B OTA (RAUC + hawkBit, or Mender) with rollback [59].
  - A vulnerability disclosure policy and no default credentials [53].
- **Face recognition:**
  - Start with YuNet + SFace on CPU [69][70].
  - Test FAR/FRR on Sri Lankan families, including elderly people, children, siblings and backlit rooms. Tune thresholds locally rather than using the LFW default [69][76].
- **UI:**
  - Large opaque cards with ≥ 48 px targets and Sinhala, Tamil and English.
  - Voice prompts, with "glass" effects as an accent only [94][95][96].
  - Daily-life widgets build the habit; clinician acknowledgements sustain it [87].
- **Output and avoid:**
  - Emit FHIR Observations (LOINC/MDC codes) to align with the MoH blueprint and future national exchange [33][61].
  - Avoid a premium consumer-mirror strategy, which has repeatedly failed [13][14][15][16].

---

## Sources

1. https://blog.prevounce.com/2026-remote-patient-monitoring-cpt-codes-whats-new-and-what-to-know
2. https://www.healthrecoverysolutions.com/blog/2026-rpm-and-ccm-reimbursement-codes-and-payment-updates
3. https://www.tenovi.com/tenovi-gateway/
4. https://hallrender.com/2024/10/18/oig-releases-report-calling-for-additional-oversight-of-remote-patient-monitoring/
5. https://www.marketsandmarkets.com/Market-Reports/remote-patient-monitoring-market-77155474.html
6. https://prnewswire.com/news-releases/remote-patient-monitoring-system-market-worth-16-9-billion-by-2030-grand-view-research-inc-301664494.html
7. https://www.aarp.org/press/releases/2025-1-8-new-report-finds-growing-interest-tech-aging-well-home.html
8. https://www.withings.com/us/en/landing/price-adjustment
9. https://ubergizmo.com/2025/01/withings-bpm-vision-ces-2025
10. https://www.withings.com/us/en/health-solutions/physicians-group
11. https://nextpit.com/withings-omnia-turns-your-reflection-into-a-health-dashboard
12. https://www.frenchtechjournal.com/inside-baracodas-connected-health-ambitions/
13. https://www.mobihealthnews.com/content/naked-labs-gets-14m-it-begins-shipping-its-body-scanning-smart-mirror
14. https://connectthewatts.com/2023/10/03/lululemon-cancels-fitness-mirror/
15. https://techcrunch.com/2021/12/07/amazon-launches-its-19-99-per-month-alexa-together-elder-care-subscription-for-families/
16. https://www.besidecare.com/blog/what-to-use-now-that-alexa-together-is-gone/
17. https://parentshomecare.com/guides/alexa-together-discontinued
18. https://www.mobihealthnews.com/news/amazon-ends-support-third-party-hipaa-compliant-alexa-program
19. https://9to5google.com/2026/07/31/nest-hub-sleep-google-health/
20. https://omronhealthcare.com/wp-content/uploads/CES2023-OMRON-VitalSight-Fact-Sheet.pdf
21. https://ptylr.com/posts/2025-09-28-librearm-breathing-new-life-into-qardioarm-devices
22. https://www.businesswire.com/news/home/20251211819141/en/Smart-Meter-and-eClinicalWorks-More-Than-Double-RPM-Adoption-in-2025-Powering-a-New-Era-of-Connected-Care-for-Patients
23. https://www.healthrecoverysolutions.com/
24. https://www.fiercehealthcare.com/health-tech/hlth24-copilotiq-biofourmis-merge-carve-out-bigger-slice-home-care-solutions-market
25. https://www.techadvisor.com/article/722849/xiaomi-mi-body-composition-scale-2-review.html
26. https://www.who.int/srilanka/news/detail/17-05-2025-world-hypertension-day-2025
27. https://newsfirst.lk/2025/03/29/83-of-deaths-in-sri-lanka-caused-by-non-communicable-diseases
28. https://extranet.who.int/ncdsmicrodata/index.php/catalog/947/study-description
29. https://pmc.ncbi.nlm.nih.gov/articles/PMC6893241
30. https://www.adaderana.lk/news/114093/sri-lankas-elderly-population-increased-to-18
31. https://datareportal.com/reports/digital-2026-sri-lanka
32. https://www.statistics.gov.lk/Resource/en/ComputerLiteracy/Bulletins/2025-FirstSixMonths.pdf
33. https://ohie.org/wp-content/uploads/2024/04/DigitalHealthBluePrint_SRILANKA-2.pdf
34. https://en.wikipedia.org/wiki/Personal_Data_Protection_Act_(Sri_Lanka)
35. https://readme.lk/digital-policy-watch/personal-data-protection-amendment-act-no-22-of-2025/
36. https://concentric.ai/sri-lankas-pdpa-takes-effect-january-1-2027-what-global-enterprises-need-to-know/
37. https://dpa.gov.lk/media/DPA_Circular_012026_E.pdf
38. https://nmra.gov.lk/pages/medical-devices
39. https://resource.ddregpharma.com/blogs/medical-device-registration-in-sri-lanka/
40. https://ib-lenhardt.com/news/new-type-approval-procedure-comes-into-effect-on-16-12-2020
41. https://pip.raspberrypi.com/categories/894-approvals/documents/RP-005217-CF/rpi-5-Sri-Lanka.pdf
42. https://newsfirst.lk/2026/03/04/sri-lanka-to-phase-out-cess-on-imported-goods
43. https://sequenex.com/medical-device-data-systems-fda-guidance/
44. https://innolitics.com/articles/clinical-decision-support-and-general-wellness-guidance-updates/
45. https://www.ropesgray.com/en/insights/alerts/2026/01/fda-adapts-with-the-times-on-digital-health-updated-guidances-on-general-wellness-products
46. https://openregulatory.com/mdcg/mdcg-2019-11
47. https://www.greenlight.guru/blog/iec-62304-software-safety-classes
48. https://gdpr-info.eu/art-9-gdpr/
49. https://www.kslaw.com/insights/articles/illinois-bipa-reform-takes-effect
50. https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3
51. https://www.eurosmart.com/?id=87&na=v
52. https://www.dataprotectionreport.com/2024/07/edpb-opines-on-the-use-of-facial-recognition-in-airports
53. https://www.networkworld.com/article/966868/top-10-iot-vulnerabilities.html
54. https://www.qima.com/blog/certification/securing-consumer-iot-the-new-cybersecurity-rules-every-smart-device-must-follow
55. https://www.sheppard.com/insights/blogs/nist-releases-cybersecurity-guidance-nistir
56. https://www.raspberrypi.com/documentation/security/secure-boot-provisioner.html
57. https://www.raspberrypi.com/documentation/security/security-architecture.html
58. https://www.infineon.com/assets/row/public/documents/30/49/infineon-board-description-optiga-tpm-slb-9672-rpi-evaluation-board-datasheet-en.pdf
59. https://fosdem.org/2025/events/attachments/fosdem-2025-6299-exploring-open-source-dual-a-b-update-solutions-for-embedded-linux/slides/236750/leon-anav_nHAgFc8.pdf
60. https://www.ibeta.com/iso-30107-3-presentation-attack-detection-confirmation-letters/
61. https://www.bluetooth.com/wp-content/uploads/2024/03/GenericHealthSensorGuide.pdf
62. https://www.bluetooth.com/specifications/specs/generic-health-sensor-profile/
63. https://docs.embassy.dev/trouble-host/git/default/prelude/service/constant.GENERIC_HEALTH_SENSOR.html
64. https://git.sudo.is/home-assistant/esphome-docs/src/branch/current/components/sensor/xiaomi_miscale.rst
65. https://github.com/userx14/omblepy
66. https://f-droid.org/en/packages/com.health.openscale
67. https://www.cnx-software.com/2022/07/22/theengs-open-source-tools-to-decode-ble-sensors-work-on-esp32-raspberry-pi-android-phone/
68. https://support.withings.com/hc/articles/115009126147
69. https://docs.opencv.org/4.x/d0/dd4/tutorial_dnn_face.html
70. https://github.com/opencv/opencv_zoo/blob/main/benchmark/README.md
71. https://core-electronics.com.au/guides/face-recognition-with-raspberry-pi-and-opencv/
72. https://rcs.cic.ipn.mx/2025_154_5/Low-Resource%20Hardware%20Performance%20Analysis%20for%20Real-Time%20Facial%20Recognition.pdf
73. https://community.hailo.ai/t/a-comprehensive-guide-to-building-a-face-recognition-system/8803?page=2
74. https://tomshardware.com/raspberry-pi/raspberry-pi-release-higher-performance-ai-hat-13-and-26-tops-variants
75. https://tecnoblog.net/noticias/raspberry-pi-anuncia-placa-ai-hat-2-com-40-tops-para-ia-preco-e-alto/
76. https://www.infodocket.com/2019/12/19/new-nist-study-evaluates-effects-of-race-age-sex-on-face-recognition-software/
77. https://raspberry.tips/en/raspberrypi-infos/raspberry-pi-prices-lifecycle
78. https://www.notebookcheck.net/Raspberry-Pi-5-now-costs-up-to-205-due-to-RAM-crisis.1218213.0.html
79. https://www.gigazine.net/gsc_news/en/20260402-raspberry-pi-price-increases
80. https://raspberrypi.com/products/touch-display-2
81. https://raspberrypi.com/products/camera-module-3
82. https://www.raspberrypi.com/products/compute-module-5/
83. https://www.raspberrypi.com/products/raspberry-pi-5/
84. https://raspberry.tips/en/raspberrypi-tutorials/raspberry-pi-alternatives-sbc
85. https://tinycomputers.io/posts/rockchip-rk3588-npu-benchmarks.html
86. https://www.mobihealthnews.com/news/survey-one-third-wearable-device-owners-stopped-using-them-within-six-months
87. https://pmc.ncbi.nlm.nih.gov/articles/PMC5604965
88. https://wikijournalclub.org/wiki/Efficacy_of_self-monitored_blood_pressure,_with_or_without_telemonitoring,_for_titration_of_antihypertensive_medication_(TASMINH4)
89. https://especialidades.sld.cu/medinterna/2015/11/13/a-randomized-trial-of-intensive-versus-standard-blood-pressure-control/
90. https://www.acc.org/latest-in-cardiology/articles/2025/10/28/12/49/jacc-focus-issue-outlines-high-bp-guideline-implementation-challenges-solutions
91. https://pubmed.ncbi.nlm.nih.gov/27051984/
92. https://www.heartfailurematters.org/?p=153
93. https://globalhealth.duke.edu/news/daily-self-weighing-helps-study-participants-lose-weight
94. https://corpora.tika.apache.org/base/docs/govdocs1/562/562513.html
95. https://wcag.com/developers/2-5-8-target-size-minimum-level-aa/
96. https://gulfnews.com/technology/companies/apple-yields-tinted-control-in-ios-261-beta-4-tones-down-liquid-glass-after-backlash-1.500315176
