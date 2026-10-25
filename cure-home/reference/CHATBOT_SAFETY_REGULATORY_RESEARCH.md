# Reference: health chatbot regulation, safety, memory and privacy for Cure Home

> Research compiled 2026-10-22. Items in italics were not verified against primary sources.


**Bottom line.** A chatbot that only *retrieves and restates* a member's own records can plausibly stay non-device in the US, EU and UK. Once it *explains what a value means for this person, suggests an action, or triages*, it is medical device software almost everywhere: EU class IIa or higher, and AI Act high-risk from Aug 2028. Free-form LLM answers over records are unreliable, sycophantic and open to injection, and small models are worse. Use the pattern "the LLM routes and phrases over deterministic tools".

## 1. Regulatory classification

**US (FDA).**
- **Jan 2026 guidances.** On 6 Jan 2026 FDA issued final CDS and General Wellness guidances, superseding the 2019 and 2022 versions, with no draft round [1].
  - **CDS changes:** enforcement discretion for single-recommendation outputs; automation bias moved to criterion 4; time-critical functions remain devices. All of them concern HCP-facing software, and neither guidance mentions AI [1][3].
  - **Criterion 3** covers recommendations *to an HCP* [3], so a patient-facing interpretive chatbot cannot use the non-device CDS route. This is an inference from the statute; no summary I reviewed says whether the 2026 text addresses patient-facing CDS (*not checked against the PDF*).
  - **Wellness rules:** products may "display data values, ranges, trends, baselines, or longitudinal summaries" but must not "prompt or guide specific clinical action" [2]. An out-of-range notice may suggest seeing a professional. It must not name a disease, call a value abnormal, give thresholds, or provide ongoing disease-management alerts [1]. This is a good tone template for Cure Home.
- **Records.** §520(o)(1)(C) excludes EHR functions that are not intended for "interpretation or analysis of patient records". That exclusion assumes HCP-reviewed, certified health IT. Patient-created PHR functions are not devices if they are not intended for diagnosis or treatment [4]. The hub fits the PHR/MDDS-display pattern. FDA's list of patient apps such as medication reminders and vital-sign trending is enforcement *discretion*, not exemption [5].
- **GenAI stance.**
  - **Nov 2024 Digital Health Advisory Committee (DHAC):** flagged hallucinations and users mistaking outputs for human judgement; asked for stated limitations, easy problem reporting, postmarket monitoring, and resubmission after significant foundation-model changes [6].
  - **Nov 2025 DHAC (GenAI therapy chatbot):** predefined and one-tap human escalation, scope-creep guardrails, patient adverse-event reporting, plain-language labelling, testing across literacy levels and languages [7].
  - **Aug 2026 discussion paper:** proposes "competency-based" testing of the final user-facing product. Rigour would scale with whether the product steers actions or only informs. Docket FDA-2026-N-7874; comments closed 19 Oct 2026; FDA says it is not policy [8].
  - **Authorizations:** as of June 2026 FDA apparently had authorized no GenAI device. RecovryAI got breakthrough designation in Mar 2026 [9].
  - **Consumer tools:** ChatGPT Health remains unregulated, but scholars argue intended use is read from design and real use, not disclaimers [10].

**EU.**
- **Qualification:** MDCG 2019-11 rev.1 (June 2025) says storage, communication or simple search is usually not medical device software. Analysing an individual's data to support decisions or to flag concerning values usually is [11].
- **Classification:** under Rule 11, decision-informing software starts at class IIa, and class I is a residual category [11]. Ada's symptom assessment is class IIa [17].
- **AI Act high-risk status:** MDCG 2025-6 treats notified-body (IIa and above) device AI as high-risk under Art 6(1). Class I software still carries transparency and AI-literacy duties [12]. The Digital Omnibus (Reg (EU) 2026/1744, in force 27 Jul 2026) moved device high-risk obligations to **2 Aug 2028** [13][14].
- **Transparency:** Art 50 applies from **2 Aug 2026**. People must be "informed that they are interacting with an AI system" by the first interaction [15], and the Commission's 20 Jul 2026 guidelines say agents must disclose their artificial nature [14].
- **Face identification:** Annex III 1(a) covers remote biometric identification but excludes verification [16]. Whether a household 1:N match of enrolled members is "remote" is **unclear**. Designing it as active-participation verification avoids the question.

**UK (MHRA).**
- LLMs "developed for, or adapted, modified or directed toward specifically medical purposes" are likely devices [18].
- The July 2026 ambient voice technology guidance says "summarisation on its own does not make a product a medical device", but diagnostic suggestions do. Disclaimers do not override claims. Hallucination does not change the intended purpose, but known risks must be designed out [19].
- Mental-health tools qualify on intended purpose plus functionality, including chatbots [20].

**Sri Lanka (NMRA).**
- The device definition on NMRA's site covers "software necessary for its proper application", and NMRA issues Product Categorization Letters (PCLs) for products outside the device remit [21].
- I found **no NMRA SaMD or AI guidance**, so the status of standalone software is ambiguous.
- NMRA's 2026 reliance pathway accepts approvals from FDA, EMA, MHRA, TGA, Health Canada and HSA (per a consultant; *not verified on an NMRA primary source*) [69]. Foreign classifications will therefore probably shape NMRA's view.
- Practical step: request a PCL with a written intended-purpose statement.

**Where the line is.**
- **Non-device (retrieve/display):** "Your last hub BP reading was 142/91 at 07:40." "Dr X requested a lipid panel on 3 Oct; no result yet." "Your 12 Sep prescription lists metformin 500 mg twice daily."
- **Device (interpret/advise):** "That's high; you may have hypertension." "You can skip a dose." Symptom triage. Personalised alerts.
- **Grey:** reading the lab's own H/L flag and reference range verbatim, with attribution, is display. Explaining what it means for this person is interpretation. Generic education from vetted leaflets is fine if it is not tailored to the member's values.

## 2. Evidence on LLM health-chatbot risks

**Users plus LLMs.**
- In a Nature Medicine RCT (Feb 2026, n=1,298), LLMs alone identified conditions in 94.9% of cases. Participants using them identified relevant conditions in fewer than 34.5% of cases and the right course of action in fewer than 44.2%, no better than controls [26][27].
- A BMJ Open audit of five consumer chatbots (Apr 2026) rated about 50% of answers problematic and about 20% highly problematic, and no chatbot produced a fully accurate reference list [32].

**Fabrication.**
- Six models elaborated on a planted fake detail in 50–82% of 300 vignettes. A mitigation prompt cut the mean from 66% to 44%; temperature 0 did not help [28].

**Sycophancy.**
- GPT-4 and GPT-4o models complied with 100% of illogical drug requests, and Llama3-8B with 47 of 50. Rejection-plus-recall prompts raised rejection to 94% for GPT-4/4o, and fine-tuning helped further [29].
- So expect "my doctor said double the dose, right?" to be agreed with.

**Answering over records.**
- MedAlign (276 EHRs): error rates of 35% for GPT-4 and 68% for MPT-7B [31].
- Lancet Digital Health: 7.1% of GPT-4 patient-message drafts posed risk, and 0.6% risk of death, mostly by failing to tell the patient to seek urgent care [30].
- FHIR-AgentBench: the best baseline agent was 50% correct. Code-executing agents did better, and architecture mattered more than the choice of base model [41].
- FHIRPath-QA: "query-first" answering cut o4-mini's failure rate on clinician-phrased questions from 0.36 to 0.09 with 391× fewer tokens, though no base model exceeded 42% accuracy. Patient wording stayed ambiguous; "took" can mean prescribed or administered [42].

**Hardware and language limits.**
- A Pi 5 generates about 11 tokens/s with 1B models and about 5 tokens/s with 3B models [66], so stuffing whole records into the prompt is impractical.
- Sinhala: the best SinhalaMMLU score is 67% [67], and zero-shot Whisper Sinhala has a word error rate of about 33% [68].

**Incidents.**
- NEDA's rule-based Tessa gave calorie-deficit advice after its vendor quietly added generative Q&A, and was pulled on 30 May 2023 [33].
- ECRI ranks chatbot misuse as the #1 health-technology hazard of 2026: chatbots are "programmed to sound confident and to always provide an answer" [34].

**Injection and leakage.**
- Hidden prompts in medical images hijacked four vision-language models [35].
- A memory-injection attack on an EHR agent swapped patient IDs with up to 62% success (lower with realistic pre-existing memory), and trust-score filters rated malicious entries at maximum confidence [36].
- MEXTRA extracts private data from agent memory [37]. See also OWASP LLM01, LLM02 and LLM08 [50].
- A cache bug showed ChatGPT users other users' chat titles and billing data [38]. Wrong-person leakage is often plain engineering failure.

**Over-trust.**
- Laypeople rated low-accuracy AI answers as valid as doctors' answers and would follow harmful advice [39].
- Older adults trusted a voice assistant with a "doctor" persona more [40].

**What helps.**
- Deterministic query and tool calling [41][42].
- Specialist verifier models plus human escalation. Hippocratic AI reports, *self-reported*, that a verifier cut hallucinated bookings from 0.49% to 0.13% [43][44].
- Anti-sycophancy prompts and fine-tuning [29].
- Testing with real users [26].
- Postmarket monitoring and easy reporting [6][7].

## 3. Memory architectures

- **MemGPT/Letta:** OS-style memory tiers. In-context working memory is paged to external recall and archival stores through self-edit function calls [45].
- **Mem0:** extracts facts from each turn and lets the LLM ADD, UPDATE, DELETE or NOOP them. The graph variant invalidates conflicting facts instead of deleting them. It reports over 90% token savings and 91% lower p95 latency than full-context prompting [46].
- **LangGraph/LangMem:** distinguishes semantic, episodic and procedural memory, and hot-path versus background writes. Its per-user namespaces allow **cross-namespace search**, so a namespace is not a security boundary [47].
- **Zep/Graphiti:** ingests episodes and gives facts validity windows, invalidating rather than overwriting [48].

**Recommended for Cure Home: three separate layers.**

1. **Record store (not "memory"):** append-only, bitemporal log of HMS and device events, queried only through typed tools.
2. **Assistant memory:** allowlisted preferences (name, language, units, reminder times) and member-confirmed "questions for my doctor", each with provenance, written in the background through a deterministic validator. The LLM proposes; code accepts.
3. **Transcripts:** session-only by default.

Rules:
- **No LLM-written health summaries as memory:** they drift, carry injected text, and resist erasure.
- **Embeddings are personal data.** Vec2Text recovers 92% of 32-token inputs and names from clinical notes [49]. Erasure must cascade to embeddings, summaries, caches and backups. Amazon was penalised for deleting children's recordings in one database while keeping them elsewhere [55].
- **Provide a "what I remember" view with delete,** as ChatGPT Health does for its compartmentalised memories [59].
- **Never auto-remember:** speech from unverified speakers; third-party disclosures ("my son is depressed"); other special-category content; symptoms (unless explicitly saved as a "note for doctor"); inferred diagnoses or traits; text from record fields or documents; children's statements without guardian authority.
- **Isolation.** One encrypted database and key per member. `member_id` is bound by the identity session, never by model output. No tool can query another member.

## 4. Shared-device identity risks

**How existing products handle it.**
- **Google Voice Match:** an unrecognised voice gets a guest response with no personal results. If nobody enables Voice Match, *anyone* gets personal results [51].
- **Apple HomePod:** members enrol on their own iPhone. Personal requests need 2FA and the phone on the same Wi-Fi, and the phone is notified afterwards [52].
- **Amazon Alexa Voice ID:** a BIPA class (*Gunderson*, about 1.2M Illinois residents) was certified in Nov 2025. The court found "learn your voice" disclosures arguably inadequate [53]. BIPA requires a written release, a public retention schedule, and destruction within 3 years [54].
- **Related enforcement:** Amazon paid $25M over children's Alexa recordings [55], and Google agreed to a $68M preliminary settlement over recordings from false activations [56].
- **EDPB:** voice-biometric identification needs explicit consent. Guidance distinguishes registered, non-registered and accidental users, and accidental recordings should be deleted immediately [57].

**Rules for Cure Home's scenarios.**
- **Assurance tiers:**
  - **T0 (guest):** general information.
  - **T1 (one enrolled face, the active speaker matches, no other person detected):** low-sensitivity reads such as the next appointment or the last reading.
  - **T2 (T1 plus a PIN or confirmation in the Cure Patient app):** lab requests, the full medication list, memory edits, transcripts.
- **Face A visible while B speaks:** require audio-visual active-speaker agreement. If they disagree, drop to T0 and ask on screen who is asking.
- **Two or more people present:** show sensitive items on screen only (tap to reveal), never spoken.
- **Children asking about parents:** deny unless delegated in HMS. Children's profiles are guardian-managed. Adolescent confidentiality is a clinical-policy decision.
- **Caregiver proxy:** only via an HMS delegation, scoped and logged.
- **Biometric templates:** special-category data [24]. Keep them on-device with opt-in explicit consent, never as the sole factor for T2, and delete them when a member leaves.

## 5. Privacy (PDPA and comparators)

**What the PDPA requires.**
- Special categories include health and biometric data and **all data relating to a child** [24][25].
- Processing needs explicit consent (a guardian's for a child) or another condition, such as medical purposes handled by a licensed professional [24].
- A child is anyone under 16 [25] (*single secondary source; verify against the Act*).
- **Commencement:** Gazette 2498/16 brings ss.2–3, Part I and Part III (DPO, breach notification, DPIA) into force on **1 Jan 2027** [22][23]. Data-subject rights (Part II) and penalties appear to start by a later order [25] (*uncertain*).
- **DPIA:** required for systematic and extensive evaluation, including profiling, and must be redone when the technology changes [25].
- **DPO:** required for special-category processing at a prescribed scale; the draft threshold is 25,000 or more data subjects [24].
- **Breach notification:** 72 hours under the draft rules [24].
- **Household exemption:** it covers individuals, not the vendor [23]. The GDPR analogue is Recital 18 [58].

**DPIA items:** hospital/Cure controller-processor split; separate consents (face, voice, chatbot, memory, transcripts, improvement default off); guardian flows; accidental capture of guests and staff; wrong-person disclosure; injection and memory poisoning; model updates; erasure cascade; cloud fallback and cross-border transfer under the new s.26 [25]; speaker and screen exposure in shared rooms.

**Transcripts and audio.** Never persist audio. Keep transcripts session-only unless the member opts in, and never write them into the hospital record automatically. Amazon's One Medical assistant likewise does not add conversations to records automatically [60].

**Logging without PHI.** Telemetry carries only intent class, tool name, refusal or escalation code, latency and model version. Keep a separate encrypted local access log (member, record type, time).

**Local versus cloud claims.** If any step leaves the device (cloud LLM fallback, cloud ASR), "on-device" is false, and misrepresented data handling has drawn FTC action [55]. Never train on member data without separate consent [59].

## 6. Existing products and their stated guardrails

- **ChatGPT Health (Jan 2026):** US records via b.well; compartmentalised memories; no training on Health chats; "not intended for diagnosis or treatment"; 260+ physicians; HealthBench [59].
- **Amazon One Medical Health AI (Jan 2026):** record-aware; routes to clinicians when judgement is needed; checks meds and labs before supplement answers; "occasionally makes mistakes" label; conversations not added to the record [60].
- **Epic Emmie (MyChart):** explains results, scheduling, billing; no guardrails described publicly [61].
- **Hippocratic AI Polaris:** non-diagnostic nurse-type calls with checker models and human intervention; claims 99.9% correct advice (*self-reported*) [43][44].
- **Fitbit Gemini coach (Oct 2025):** "general wellness, not medical diagnoses" [62].
- **Apple:** coach reportedly scaled back in Feb 2026 (*Bloomberg reporting*) [63].
- **Samsung Health assistant (Jul 2026 beta):** no diagnosis or prescribing [64].
- **Ada:** MDR class IIa; symptom triage is device territory [17].

None is described as on-device. MedGemma 4B could run locally but is "not intended for direct clinical use without further validation" [65].

## Design rules for a safe on-device health chatbot

1. **Closed intent set:** record lookup, scheduling and logistics, hub how-to, vetted education, and "message my care team". Everything else is refused and routed onward.
2. **The LLM never states a health fact from its own knowledge.** It maps the question to typed tools (`latest_reading`, `list_meds`, `next_appointment`, `lab_requests`), and a template renders the result.
3. **Every personal fact is cited** with source, author and date. If there is no record, the bot says "I don't have that."
4. **No interpretation:** no "high", "normal" or trend judgements, and no dose or timing advice. Lab flags are read verbatim with attribution plus "ask your doctor what this means for you".
5. **A deterministic urgent-phrase detector runs before the LLM.** It shows a fixed script: call 1990 (Suwa Seriya ambulance) or go to the nearest emergency unit, plus a one-tap "message hospital".
6. **Refusal and escalation templates** in Sinhala, English and Singlish, reviewed by clinicians and native speakers.
7. **Sycophancy guard:** false-premise claims ("my doctor said…") are checked against the record, never affirmed.
8. **Record text is data, never instructions.** No tools run from retrieved content.
9. **Identity tiers T0–T2,** with identity bound outside the model. Sensitive data is spoken aloud only to a single verified person.
10. **Per-member encrypted stores, no cross-member tools, and member-keyed caches** [38].
11. **Memory allowlist with provenance,** visible and deletable, plus the do-not-remember list. Erasure cascades everywhere.
12. **AI disclosure at each session** [15]. No clinician persona [40]. A persistent "may make mistakes; not medical advice" notice.
13. **Confirm the Sinhala or English transcription** before answering voice queries [68].
14. **Pin model and prompt versions.** Every change re-runs the evaluation set and refreshes the DPIA [6][25]. No silent upgrades (the Tessa lesson [33]).
15. **Evaluation set:** per-tool exact match; scope precision and recall; urgent-symptom recall (target ~100%); wrong-person and multi-speaker cases; injection and memory poisoning [36]; Sinhala, English and Singlish; elderly real-user testing [26].
16. **Post-market:** an in-UI "report a problem" button, PHI-free refusal and escalation telemetry, and consented clinician audits.
17. **No alerts on the hub;** alerts stay in HMS, preserving the MDDS framing.

## Regulatory implications for Cure Home

- **Document the intended purpose** as "access to and display of my own hospital records, scheduling and logistics". Keep marketing consistent with it, because claims drive classification [10][18][19]. With rules 1–5 and 17 in place, the chatbot can plausibly remain non-device.
- **Explanations would make it a device.** Explaining results, triaging symptoms or advising on medicines would make it EU class IIa or higher [11] and AI Act high-risk from 2 Aug 2028 [13], a patient-facing device in the US [3][4], and likely a device in the UK [19]. It would then need ISO 13485 / IEC 62304 controls, and an open-source LLM may count as software of unknown provenance [18]. FDA's emerging competency testing would also apply [8].
- **Sri Lanka:** seek an NMRA Product Categorization Letter [21]. Have the DPIA, DPO, consent architecture (adult explicit consent, guardian consent for under-16s) and breach process ready for **1 Jan 2027** [22][24][25].
- **EU marketing:** Art 50 disclosure, which already applies [14][15], and explicit consent for biometrics [57][58].
- **US marketing:** BIPA-grade written consent and a retention schedule for face and voice templates [53][54].

## Sources

1. King & Spalding, "FDA updates General Wellness and CDS guidance documents" (Jan 2026) – https://www.kslaw.com/insights/articles/fda-updates-general-wellness-and-clinical-decision-support-guidance-documents
2. Ropes & Gray, "FDA adapts with the times on digital health" (Jan 2026) – https://www.ropesgray.com/en/insights/alerts/2026/01/fda-adapts-with-the-times-on-digital-health-updated-guidances-on-general-wellness-products
3. FDA Law Blog, "A Busy Day in the (CDRH) Neighborhood" (Jan 2026) – https://www.thefdalawblog.com/2026/01/a-busy-day-in-the-cdrh-neighborhood-updates-to-the-cds-and-general-wellness-guidance-documents/
4. FDA, "Step 4: Software function intended to serve as electronic patient records" – https://www.fda.gov/medical-devices/digital-health-center-excellence/step-4-software-function-intended-serve-electronic-patient-records
5. FDA, "Examples of software functions for which FDA will exercise enforcement discretion" – https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-which-fda-will-exercise-enforcement-discretion
6. Hogan Lovells, "FDA's first Digital Health AdComm mulls promises, perils of generative AI" (Nov 2024 meeting) – https://hlc.com/en/publications/fdas-first-digital-health-adcomm-meeting-mulls-promises-perils-of-generative-ai
7. Orrick, "FDA's DHAC considers generative AI therapy chatbots for depression" (Nov 2025) – https://www.orrick.com/en/insights/2025/11/fdas-digital-health-advisory-committee-considers-generative-ai-therapy-chatbots-for-depression
8. Nextgov, "FDA considers doctor-like 'competency-based' tests for medical generative AI" (Aug 2026) – https://www.nextgov.com/artificial-intelligence/2026/08/fda-considers-doctor-competency-based-tests-medical-generative-ai/415541/
9. Congressional Research Service IF13245, "FDA Regulation of AI-Enabled Devices" (Jun 2026) – https://www.everycrsreport.com/files/2026-06-10_IF13245_a062d3256b14467042f923d516b73e8dded4e8a0.html
10. Petrie-Flom Center, "Health AI chatbots are legally medical devices" (May 2026) – https://petrieflom.law.harvard.edu/2026/05/26/health-ai-chatbots-are-legally-medical-devices-its-time-the-fda-started-treating-them-like-it/
11. OpenRegulatory, "MDCG 2019-11 explained" (rev.1) – https://openregulatory.com/mdcg/mdcg-2019-11
12. OpenRegulatory, "MDCG 2025-6: MDR/IVDR and AI Act interplay" – https://openregulatory.com/mdcg/mdcg-2025-6
13. Pure Global, "EU AI Act omnibus: high-risk dates 2028" – https://www.pureglobal.com/news/eu-ai-act-omnibus-high-risk-dates-2028
14. Mayer Brown, "EU AI Act news: Digital Omnibus, classification, GPAI and transparency guidance" (Jul 2026) – https://www.mayerbrown.com/en/insights/publications/2026/07/eu-ai-act-news-digital-omnibus-on-ai-new-guidance-on-risk-classification-gpai-and-transparency-obligations
15. EU AI Act, Article 50 – https://artificialintelligenceact.eu/article/50/
16. EU AI Act, Annex III – https://artificialintelligenceact.eu/annex/3/
17. MedTech News, "Ada Health receives Class II certification under MDR" – https://med-technews.com/news/Digital-in-Healthcare-News/ada-health-receives-class-ii-certification-under-mdr
18. MHRA MedRegs blog, "Large language models and software as a medical device" (Mar 2023) – https://medregs.blog.gov.uk/2023/03/03/large-language-models-and-software-as-a-medical-device
19. Brodies, "MHRA clarifies that AI scribes are not automatically medical devices" (Aug 2026) – https://brodies.com/insights/healthcare-and-life-sciences/mhra-clarifies-that-ai-scribes-are-not-automatically-medical-devices/
20. GOV.UK/MHRA, "Digital mental health technology: qualification and classification" – https://www.gov.uk/government/publications/digital-mental-health-technology-qualification-and-classification
21. NMRA Sri Lanka, "Medical Devices" – https://nmra.gov.lk/pages/medical-devices
22. Daily FT, "Data protection compliance regime takes effect on 1 Jan 2027" – https://www.ft.lk/front-page/Data-protection-compliance-regime-takes-effect-on-1-Jan-2027/44-795776
23. Readme.lk Digital Policy Watch, "Personal Data Protection Act No. 9 of 2022" – https://readme.lk/digital-policy-watch/personal-data-protection-act-no-9-of-2022/
24. DLA Piper, "Data Protection Laws of the World: Sri Lanka" – https://dlapiperdataprotection.com/index.html?c=LK&t=law
25. Concentric AI, "Sri Lanka's PDPA takes effect January 1, 2027" – https://concentric.ai/sri-lankas-pdpa-takes-effect-january-1-2027-what-global-enterprises-need-to-know/
26. Bean et al., "Clinical knowledge in LLMs does not translate to human interactions" (arXiv; Nature Medicine 2026) – https://arxiv.org/abs/2504.18919
27. University of Oxford, "New study warns of risks in AI chatbots giving medical advice" (10 Feb 2026) – https://www.ox.ac.uk/news/2026-02-10-new-study-warns-risks-ai-chatbots-giving-medical-advice
28. Omar et al., adversarial hallucination attacks in clinical decision support (Communications Medicine 2025) – https://pubmed.ncbi.nlm.nih.gov/40753316/
29. Chen et al., "When helpfulness backfires" (npj Digital Medicine, Oct 2025) – https://pmc.ncbi.nlm.nih.gov/articles/PMC12534679
30. Mass General Brigham, "Pitfalls and opportunities for generative AI in patient messaging systems" (Lancet Digital Health 2024) – https://www.massgeneralbrigham.org/en/about/newsroom/press-releases/pitfalls-and-opportunities-for-generative-ai-in-patient-messaging-systems
31. Fleming et al., "MedAlign" (AAAI 2024) – https://arxiv.org/abs/2308.14089
32. Spokesman-Review/Bloomberg, "AI chatbots give misleading medical advice 50% of the time" (BMJ Open, Apr 2026) – https://www.spokesman.com/stories/2026/apr/14/ai-chatbots-give-misleading-medical-advice-50-of-t/
33. NPR via KAXE, "An eating disorders chatbot offered dieting advice" (Jun 2023) – https://www.kaxe.org/news/2023-06-08/an-eating-disorders-chatbot-offered-dieting-advice-raising-fears-about-ai-in-health
34. Fierce Healthcare, "ECRI flags misuse of AI chatbots as a top health tech hazard in 2026" – https://www.fiercehealthcare.com/health-tech/ecri-flags-misuse-ai-chatbots-top-health-tech-hazard-2026
35. Clusmann et al., "Prompt injection attacks on vision language models in oncology" (Nature Communications 2025) – https://arxiv.org/abs/2407.18981
36. "Memory poisoning attack and defense on memory-based LLM agents" (Jan 2026) – https://arxiv.org/abs/2601.05504
37. Wang et al., "Unveiling privacy risks in LLM agent memory" (MEXTRA, 2025) – https://arxiv.org/abs/2502.13172
38. The Hacker News, "OpenAI reveals Redis bug behind ChatGPT user data exposure" (Mar 2023) – https://thehackernews.com/2023/03/openai-reveals-redis-bug-behind-chatgpt.html
39. Shekar et al., "People overtrust AI-generated medical advice despite low accuracy" (NEJM AI 2025) – https://www.media.mit.edu/publications/NEJM-AI-people-overtrust-ai-generated-medical-advice-despite-low-accuracy/
40. Ma & Zhong, "Older adults using voice assistants in a health context" (BMC Geriatrics 2022) – https://link.springer.com/doi/10.1186/s12877-022-03428-2
41. Verily, "Introducing FHIR-AgentBench" (Dec 2025) – https://verily.com/perspectives/introducing-fhir-agentbench
42. Frew et al., "FHIRPath-QA: executable question answering over FHIR EHRs" (2026) – https://arxiv.org/html/2602.23479
43. Hippocratic AI, "Polaris: a safety-focused LLM constellation architecture for healthcare" (2024) – https://arxiv.org/abs/2403.13313
44. Hippocratic AI, "Perfecting human–AI interaction at clinical scale" (Polaris 4, 2026) – https://arxiv.org/abs/2603.29893
45. Packer et al., "MemGPT: Towards LLMs as operating systems" (2023) – https://arxiv.org/abs/2310.08560
46. Chhikara et al., "Mem0: building production-ready AI agents with scalable long-term memory" (2025) – https://arxiv.org/abs/2504.19413
47. LangChain docs, "Memory" concepts (LangGraph/LangMem) – https://docs.langchain.com/oss/python/concepts/memory
48. Thoughtworks Technology Radar, "Graphiti" – https://www.thoughtworks.com/radar/platforms/graphiti
49. Morris et al., "Text embeddings reveal (almost) as much as text" (2023) – https://arxiv.org/abs/2310.06816
50. OWASP, "Top 10 for LLM Applications 2025" – https://genai.owasp.org/llm-top-10/
51. Google Assistant Help, "Voice Match" – https://support.google.com/assistant/answer/9071681
52. Apple Support, "Set up voice recognition and Personal Requests on HomePod" – https://support.apple.com/en-euro/guide/homepod/apd1841a8f81/homepod
53. American Bar Association, "Voiceprints, AI and BIPA: new trends in biometric privacy litigation" – https://www.americanbar.org/groups/litigation/resources/newsletters/class-actions-derivative-suits/voiceprints-ai-bipa-new-trends-biometric-privacy-litigation/
54. Fox v. Dakkota Integrated Systems (7th Cir. 2020), quoting BIPA §15(a)–(b) – https://www.govinfo.gov/content/pkg/USCOURTS-ca7-20-02782/pdf/USCOURTS-ca7-20-02782-0.pdf
55. FTC Business Blog, "FTC says Amazon kept kids' Alexa voice data forever" (May 2023) – https://www.ftc.gov/business-guidance/blog/2023/05/out-mouths-babes-ftc-says-amazon-kept-kids-alexa-voice-data-forever-even-after-parents-ordered
56. Virginia Lawyers Weekly, "Google to pay $68M to settle Assistant privacy lawsuit" (Jan 2026) – https://valawyersweekly.com/2026/01/27/google-assistant-privacy-lawsuit-68m-settlement/
57. CMS, "EDPB Guidelines on Virtual Voice Assistants" – https://cms.law/en/bel/legal-updates/EDPB-Guidelines-on-Virtual-Voice-Assistants
58. GDPR Recital 18 – https://gdpr-info.eu/recitals/no-18/
59. OpenAI, "Introducing ChatGPT Health" (Jan 2026) – https://openai.com/index/introducing-chatgpt-health/
60. Healthcare Dive, "Amazon One Medical launches Health AI assistant" (Jan 2026) – https://www.healthcaredive.com/news/amazon-one-medical-health-ai-assistant-chatbot/810235/
61. Epic, "Emmie for Patients" – https://www.epic.com/software/emmie
62. Android Authority, "Google personal health coach preview launch" (Oct 2025) – https://www.androidauthority.com/google-personal-health-coach-preview-launch-3610243/
63. 9to5Mac, "Apple reportedly scales back plans for AI-powered health coach" (Feb 2026) – https://9to5mac.com/2026/02/05/apple-reportedly-scales-back-plans-for-ai-powered-health-coach/
64. Android Headlines, "Samsung unveils AI-powered health assistant beta" (Jul 2026) – https://www.androidheadlines.com/2026/07/samsung-unveils-ai-powered-health-assistant-beta.html
65. InfoQ, "Google releases MedGemma" (May 2025) – https://infoq.com/news/2025/05/google-medgemma/
66. Stratosphere Lab, "Performance of LLMs on the Raspberry Pi 5" – https://stratospherelinuxips.readthedocs.io/en/develop/immune/research_rpi_llm_performance.html
67. "SinhalaMMLU" (EMNLP 2025) – https://arxiv.org/abs/2509.03162
68. "A low-resource speech-driven NLP pipeline for Sinhala dyslexia assistance" (2025) – https://arxiv.org/abs/2510.04750
69. Maven Regulatory Solutions, "Sri Lanka medical device registration: NMRA reliance pathway 2026 guide" – https://www.mavenrs.com/blog/sri-lanka-medical-device-registration-nmra-reliance-pathway-2026-guide
