# "Ask Cure" — feasibility of a local chatbot on each hub

*v0.1 · 2026-10-22 · Decision record for the request: "a locally run chatbot per hub that identifies the person by face, answers their questions asked by text or voice in English or Sinhala, has access to all of the person's details, and automatically updates its memory from new events, appointments, readings and conversations."*

Evidence: `docs/reference/LOCAL_LLM_ON_PI_RESEARCH.md` [LLM], `docs/reference/SINHALA_VOICE_LANGUAGE_RESEARCH.md` [SI], `docs/reference/CHATBOT_SAFETY_REGULATORY_RESEARCH.md` [SAFE]. Section numbers refer to those files.

---

## 1. Verdict

**Feasible, if it is built as a bounded health-record assistant ("Ask Cure"). Not feasible, to a safe and reliable standard, as a free-form chatbot that writes its own answers.**

| Part of the request | Verdict | Why |
|---|---|---|
| Identify the person by face | ✅ Feasible | Already in the design (vision service). Add an active-speaker check for voice (§5). |
| English questions by text | ✅ Feasible | Small on-device model + fixed record lookups; 1–2 s with templates, 10–25 s if the model phrases the answer [LLM §1, §6]. |
| English questions by voice | ✅ Feasible | Whisper base/small on the Pi 5 runs at 0.35–0.55× real time [SI §2]. |
| Sinhala questions by text (Unicode or Singlish) | 🟡 Feasible for a closed set of questions | Open small models score near chance on Sinhala knowledge tests (22–27% vs 23% random) [SI §1]; understanding a fixed set of ~20 intents is achievable with training data; a Singlish→Sinhala transliterator reaches ~9% WER [SI §4]. |
| Sinhala questions by voice | 🟡 Feasible for a closed set, with on-screen confirmation | Best open Sinhala ASR is 16.4% WER on read speech; expect 25–40% for older, conversational, code-mixed speech; needs 10–20 h of in-domain recordings [SI §2]. |
| Spoken Sinhala answers | 🟡 Feasible | SinhalaVITS voices (Dialog + University of Moratuwa) exported to ONNX; fixed phrases pre-recorded or pre-rendered. Licence must be confirmed with Dialog [SI §3]. |
| Free-form answers written by the model in Sinhala | ❌ Not feasible on a Pi 5 | Quality near chance; 3–12 tokens per Sinhala word make a 25-word answer take 9–65 s [SI §1, LLM §1]. |
| "Access to all details of the person" | ✅ Through typed lookups, not by pasting the record into the prompt | A 1,500-token prompt takes 11–47 s just to read on the Pi 5 CPU [LLM §1]; LLMs answering over raw records made 35–68% errors in the MedAlign study, and querying first cut failures from 0.36 to 0.09 [SAFE §2]. |
| "Automatically updates its memory" from events, appointments and readings | ✅ Already true by design | These live in the hub's local store, synced from HMS and the BLE devices. The assistant reads them live; there is nothing for it to "remember". |
| … and from conversations | 🟡 Only an allowlist | Preferences and member-confirmed "notes for my doctor". No model-written health summaries (they drift, can be poisoned and resist deletion) [SAFE §3]. |
| Runs on the planned hardware | 🟡 Needs the Pi 5 **8 GB** | The 4 GB board leaves no room once speech and a model are loaded [LLM §6]. The AI HAT+ 2 is not worth it (slower generation, 2,048-token cap, no tool calls) [LLM §2]. |
| Stays outside medical-device regulation | ✅ If it only retrieves and restates | Explaining what a value means, advising or triaging makes it a medical device (EU class IIa+, AI-Act high-risk from Aug 2028) [SAFE §1]. |

## 2. Why "just put a local LLM on it" fails

1. **Speed.** On the Pi 5 CPU the model has to *read* the prompt before it can answer. At 30–130 tokens/s, a prompt holding the person's details (1,000–2,000 tokens) takes 11–47 s before the first word, then 3–12 words per second [LLM §1, §6].
2. **Sinhala.** Small open models barely understand Sinhala, and most tokenizers spend 8–12 tokens per Sinhala word (Gemma ≈ 3) [SI §1]. Generating good Sinhala on device is out of reach in 2026.
3. **Accuracy and safety.** LLMs answering over health records are wrong a third or more of the time, agree with false premises ("my doctor said double the dose, right?"), and can be hijacked by text inside the data [SAFE §2]. Older users over-trust confident answers [SAFE §2].
4. **Regulation.** A chatbot that interprets readings is a medical device in the EU, UK and US; Sri Lanka has no SaMD guidance yet, so NMRA would likely follow those [SAFE §1].

## 3. What is feasible: the "Ask Cure" design

**Principle: the model understands the question; code finds the facts; a reviewed template says the answer.**

```
push-to-talk / keyboard
   │  (face session already open: member_id bound by the identity service, never by the model)
   ▼
ASR  ── English: Whisper base (int8)         ── Sinhala: fine-tuned whisper-small (SinhaSpeech run11)
   │                                             biased with this member's medicine/doctor names
   ▼
Urgent-phrase detector (rules, before any model) ──► fixed script: "Call 1990 (Suwa Seriya)…" + "Message hospital"
   ▼
Intent + slot parser (closed set of ~20 intents)
   │   option A: fine-tuned XLM-R / HelaBERT classifier (fast, ~50 ms)
   │   option B: Gemma 4 E2B with grammar-constrained JSON output (~2–5 s)
   ▼
Typed lookups on hub-core (SQL, member-scoped, no free text from records into the model)
   ▼
Answer template (EN / SI / TA, written by native speakers, approved by the clinical lead)
   ▼
Screen card (always, with source and date) + TTS (English Piper voice; Sinhala SinhalaVITS → ONNX,
                                                 fixed phrases pre-rendered, only numbers/names synthesised)
```

### Intent set for v1 (closed)
| Group | Intents |
|---|---|
| Readings | latest reading of a vital · readings in a period (as a list, no judgement) · my doctor's target · when I last measured |
| Medicines | what do I take today · did I take X · mark X as taken · when does my prescription end |
| Visits | next appointment · live queue number · how long until my turn · how to book (hands off to the phone app) |
| Records | status of my lab request (status only, no results interpretation) |
| Hub help | how do I measure BP / weight · why didn't my reading save · add a family member (starts the flow) |
| Day | weather · today's reminders · add a reminder · calendar today |
| Care team | add a note for my doctor (read back, then saved to HMS as a patient message) |
| Safety | urgent phrases (rules) · anything else → "I can't help with that here. Ask your doctor or call 1990 if it's urgent." |

### Where an LLM still helps (optional, English first)
- **Understanding** varied phrasing (option B above), especially Singlish and code-mixed text.
- **Hub help questions** answered only from the hub's own manual (retrieval over a vetted document), never medical knowledge.
- Recommended runtime: **Gemma 4 E2B on LiteRT-LM** (Apache-2.0, ~1.5 GB RAM, ~99–133 tok/s prefill, 8–9 tok/s generation; fewest tokens per Sinhala word) [LLM §1, SI §1]. Fallback: llama.cpp with Llama 3.2 1B / Qwen3-1.7B (Q4_0) for English only. Cache each member's 300–600-token prefix when their face is recognised; run generation on 2–3 threads at low priority [LLM Implications].
- Do **not** reuse the HMS server chatbot model (Llama 3.2 3B via Ollama) for Sinhala: it produces degenerate Sinhala and spends ~12 tokens per word [LLM §5, SI §1].

### Memory, done safely
| Layer | What it holds | How it updates |
|---|---|---|
| Record store (not "memory") | Readings, medicines, doses, appointments, queue, lab-request status, doctor targets, reminders | Automatically, from HMS sync and the BLE devices (already in ARCHITECTURE §6) |
| Assistant memory (allowlist) | Language, preferred name, units, reminder times, "notes for my doctor" | Proposed by the parser, accepted by code, confirmed by the member; visible and deletable in "What Cure remembers" |
| Conversation transcript | The current session only | Deleted when the session ends unless the member opts in; audio never stored |

Never auto-remember: anything said by an unverified speaker, things said about other people, symptoms (unless the member saves them as a note for the doctor), inferred conditions, text copied from records, children's statements without a guardian. Erasure cascades to embeddings, caches and backups [SAFE §3].

## 4. Expected performance (Pi 5 8 GB, CPU only)

| Path | Typical time to answer | Notes |
|---|---|---|
| Text, intent classifier + template | ~1 s | Same in Sinhala and English |
| Voice English, Whisper base + template + TTS | ~3–5 s | Push-to-talk, 3–5 s utterance |
| Voice Sinhala, whisper-small + template + TTS | ~6–12 s | Includes "Did you ask …?" confirmation for low-confidence results |
| Text English with the LLM phrasing the answer (cached prefix) | ~10–16 s | Option for hub-help questions |
| Same on a Jetson Orin Nano Super ($399) | ~4–7 s | Only if a premium tier needs open conversation [LLM §6] |

RAM on the 8 GB board: hub baseline ~1.5–2.6 GB + speech ~0.3–1 GB + Gemma 4 E2B ~1.5 GB → ~3–4.5 GB left [LLM §6]. Expect face tracking and the UI to slow during an LLM call; one request at a time.

## 5. Identity and privacy rules

- **Who is asking:** the answer goes only to the member whose face session is open **and** who is speaking (lip movement matched to the voice, MediaPipe landmarks + voice-activity detection). If they disagree, or nobody is identified, answer as a guest (general help only).
- **Assurance tiers** [SAFE §4]: T0 guest — help and weather only; T1 one identified, speaking member — today's readings, next visit, today's medicines; T2 T1 + PIN or confirmation in the phone app — full medicine list, lab requests, notes for the doctor, memory edits, transcripts.
- **More than one person present:** sensitive answers appear on screen (tap to reveal) and are never spoken aloud.
- **Children** cannot ask about parents unless an HMS delegation allows it; children's profiles are guardian-managed.
- **Consent:** separate, revocable consent per member for voice, the assistant, and saved memory; guardian consent under 16 (verify the age in the PDPA); update the DPIA before 1 Jan 2027 [SAFE §5].
- **Logs:** only intent name, tool used, refusal/escalation code, latency and model version. No questions, answers or audio in telemetry.

## 6. Safety rules (non-negotiable)

1. The model never states a health fact it did not get from a lookup; every personal fact on screen shows its source and date.
2. No interpretation: no "high", "normal", "improving", no dose or timing advice. Comparisons only against the doctor's own target, with the fixed words from PRODUCT_SPEC §4.7.
3. False premises ("my doctor said I can skip it") are checked against the record and never agreed with.
4. Record text is data, never instructions; nothing in a record can trigger a tool.
5. Urgent phrases are caught by rules before any model runs and always get the fixed script.
6. "Ask Cure is an automated assistant and can make mistakes. It does not give medical advice." is shown at the start of every session.
7. Model, prompt and template versions are pinned; every change re-runs the evaluation set (§8).

## 7. Cost and effort

| Item | Estimate |
|---|---|
| Board change | Pi 5 4 GB → 8 GB: about +$65 per hub |
| Audio | 2-mic array HAT or USB mic (~$15–70), speaker, physical push-to-talk button |
| Sinhala speech data | 10–20 h of recordings from 50+ older speakers (consented), transcription |
| Language work | Native-speaker template writing (SI/TA), clinical review of every template |
| Engineering (after the core roadmap) | Spike 3 weeks; build 8–10 weeks for the closed-intent assistant in EN + SI |
| Optional premium hardware | Jetson Orin Nano Super ($399) replacing the Pi, if open conversation becomes a requirement |

## 8. Go / no-go spike (3 weeks, before committing)

Build a throwaway prototype on a real Pi 5 8 GB with the dashboard running and test it against these targets:

| Metric | Target |
|---|---|
| Sinhala intent accuracy (top-1) on ≥ 300 recorded questions from ≥ 20 speakers aged 55+ | ≥ 90 % |
| Slot accuracy (drug name, vital, date) after read-back | ≥ 95 % |
| English intent accuracy on the same question set | ≥ 95 % |
| Voice round trip, p90 (Sinhala) | ≤ 10 s |
| Orbit View frame rate during a request | ≥ 30 fps |
| Wrong-member disclosures in 100 two-person scenarios | 0 |
| Urgent-phrase recall (SI/EN/Singlish test set) | 100 % |
| Free RAM during a request | ≥ 1 GB |

If Sinhala voice misses its targets, ship **text + English voice** first and keep collecting Sinhala speech data.

## 9. Recommendation

1. Don't add a free-form local LLM chatbot to v1.
2. Add **"Ask Cure"** as an optional module after the core roadmap (new Phase 10 in `docs/03-roadmap/ROADMAP.md`), preceded by the 3-week spike.
3. Plan the hub on the **Pi 5 8 GB** from now on, so the assistant can be added by software update.
4. Write the intended purpose as "access to and display of my own Cure records, scheduling and hub help" and keep all copy consistent with it; ask NMRA for a Product Categorisation Letter that covers the assistant.
5. Revisit open conversation in 2027 when on-device Sinhala models and NPU boards have improved; a Cure-hosted server model (in Sri Lanka, with consent) is the fallback if open conversation becomes essential, but then the assistant is no longer "local".
