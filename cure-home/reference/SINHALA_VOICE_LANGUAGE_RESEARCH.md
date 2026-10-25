# Reference: Sinhala/English on-device voice and language stack for Cure Home
> Research compiled 2026-10-22. ⚠ marks uncertain or estimated claims; licences must be re-checked before shipping.

## Bottom line
- **Open-ended Sinhala chat on a Pi 5 is not reliable in 2026.** Sub-8B open models score at or near chance on SinhalaMMLU (22–27% against a ~23% random baseline) [2]. I found no published Sinhala benchmark for the newest small models (Gemma 4 E2B/E4B, Qwen3.5 small). Generation runs at 3–8 tok/s on a Pi 5 [27][28], and most tokenizers need 3–12 tokens per Sinhala word (measured below).
- **A narrow health-record assistant is feasible as a hybrid pipeline.** The steps are: Sinhala ASR, then intent and slot extraction, then a database lookup, then a **pre-written Sinhala answer template**, then Sinhala TTS. The best openly reported Sinhala ASR is **16.4% WER / 4.4% CER** on read speech, from a fine-tuned whisper-small [32]. Expect noticeably worse results with elderly, conversational, code-mixed speech in a home.
- **Licence traps.** Meta MMS is CC-BY-NC, and it has **no Sinhala in either its ASR or TTS** releases anyway [39][40]. Aya Expanse and Tiny Aya are CC-BY-NC and don't include Sinhala [12][14]. NLLB is CC-BY-NC, research-only, and excludes the medical domain [68]. openWakeWord's pretrained models are CC BY-NC-SA [51]. The commercially clean core is Whisper (MIT), Omnilingual ASR (Apache-2.0), Gemma 4 and Qwen3/3.5 (Apache-2.0), and SinhalaVITS (MPL-2.0 per its model cards ⚠).

---

## 1. Sinhala in open LLMs

### Coverage

| Model | Sinhala? | Evidence | Licence |
|---|---|---|---|
| **Qwen3** (0.6–32B dense) | **Listed** among the 119 languages, under Indo-European ("Sinhala"); Tamil is listed under Dravidian [4] | The tech report's multilingual evaluations (Multi-IF, INCLUDE, MMMLU, etc.) contain no Sinhala [5] | Apache-2.0 for the dense models [4] |
| **Qwen3.5** small (0.8/2/4/9B, Mar 2026) | Claims 201 languages; vocabulary ~248K [6] | No Sinhala evaluation found. A Sri Lankan continued-pretraining of Qwen3.5-4B (Chat2Find-CPT) says it beats the base model in Sinhala and Tamil but publishes no benchmarks [8] | Apache-2.0 [6][7] |
| **Gemma 3 / 3n** | "140+ languages" for text; 3n covers 35 for multimodal [9][11] | No per-language list. The SinLlama authors say Sinhala "has not been considered during pre-training of… Llama and Gemma" [1] ⚠ (this conflicts with the 140+ claim, and Gemma's tokenizer is clearly Sinhala-aware, see below) | Gemma Terms of Use: source-available, commercial use allowed under the use policy [9] |
| **Gemma 4** (E2B/E4B/12B/26B-A4B/31B; Apr 2026) | Pre-trained on 140+ languages, "out-of-the-box" support for 35+ [10] | E2B/E4B/12B accept **audio** (ASR, 30-s cap). The only ASR score given is a FLEURS average of 0.08–0.09, with no Sinhala breakdown [10] | **Apache-2.0** [10] |
| **Llama 3.x / 4** | Not official. Llama 4's 12 languages exclude Sinhala [15] | Llama-3.1-8B gets 23–29% on SinhalaMMLU [2] | Llama Community Licence: 700M-MAU cap, "Built with Llama" notice, derivative names must start with "Llama" [16] |
| **Aya Expanse 8B/32B** | No (its 23 languages exclude Sinhala) [12] | 22.6% / 25.1% on SinhalaMMLU [2] | CC-BY-NC [12] |
| **Tiny Aya** (3.35B, Feb 2026) | **No.** Its ~70 languages include Tamil but not Sinhala [13][14] | — | CC-BY-NC [14] |
| Aya-101 | Yes, officially [1] | 13B, too large for a Pi | ⚠ Apache-2.0 (not re-checked) |
| BLOOMZ, Mistral, Phi-3 | No [1] | — | — |
| **SinLlama** (UoM, 2025) | Llama-3-8B with an extended Sinhala vocabulary and continued pretraining on 10.7M sentences [1] | **Base model only, not instruction-tuned** [17]. With LoRA fine-tuning it beats Llama-3-8B on classification (news F1 86.4 vs 61.1) [1] | Llama 3 licence [17] |
| SinhaLM (Gemma-3-4B-it LoRA, iCIIT 2025) | Trained on 50K Sinhala-FLAN samples [18] | Only a 5-sentence perplexity test, with implausible numbers ⚠ | Apache-2.0 adapter on top of Gemma terms [18] |
| SinBERT / **HelaBERT** (UoM encoders) | Sinhala-only | HelaBERT-Large: news-category macro-F1 90.4, vs XLM-R-large 89.5 and SinBERT-L 85.2 [20] | SinBERT MIT [19]; HelaBERT licence not stated [20] |

I found no LIRNEasia, NSBM or UCSC open LLM release.

### Benchmarks that include Sinhala
- **SinhalaMMLU** (Sep 2025, 26 models, zero-shot) [2]:
  - Claude 3.5 Sonnet 67.7%, GPT-4o 63.0%, Qwen2.5-72B-Chat 41.2%, Qwen2.5-7B-Chat 27.2%.
  - Llama-3.1-8B-Chat 25.3%, Llama-3.2-3B/1B ~22%, Aya-Expanse-8B 22.6%.
  - Gemma 3, Qwen3 and SinLlama were **not tested**.
  - All models drop on culturally specific questions; Claude falls to 39%.
- **Unicode vs romanised Sinhala** (IIT, Jan 2026) [3], perplexity on 200 sentences:
  - Llama-3.1-8B: 2.37 Unicode vs 77.2 romanised.
  - Mistral-7B: 3.62 vs 74.8.
  - gemma-3-4b-pt: 11.06 vs 132.7.
  - Perplexity can't be compared across different tokenizers, but every model shows a huge gap between the two scripts.
  - Single rater, small sample ⚠.
- **Global-MMLU** includes Sinhala but publishes no per-language accuracy [21]. A Sinhala **Global PIQA** set exists (110 items) [22].
- I found **no published Belebele sin_Sinh, FLORES-200 or SIB-200 numbers** for Gemma 3/3n/4, Qwen3/3.5 or Llama 3.2. You would need to run these yourself; lm-eval-harness has Belebele and Global-MMLU.

### Tokenizer efficiency (my own measurement)
Method: offline tokenizer files from the npm `@lenml/tokenizer-*` packages and `gpt-tokenizer`, plus Whisper's `multilingual.tiktoken` [23][25]. Texts: the UDHR from NLTK (545 Sinhala words; 882 English words) [24], and 4 health questions I wrote ("What was my BP this morning?" etc.) in Sinhala, English and romanised Singlish.

| Tokens per word | Gemma 3 | GPT-4o (o200k) | Qwen3 | Llama 3.1 | Whisper |
|---|---|---|---|---|---|
| UDHR Sinhala | **2.98** | 3.63 | 9.74 | 12.05 | 11.65 |
| UDHR Tamil | 2.98 | 3.86 | 11.61 | 14.73 | — |
| UDHR English | 1.34 | 1.26 | 1.26 | 1.26 | 1.88 |
| Health questions, Sinhala (21 words) | **3.19** | 3.43 | 7.71 | 9.43 | 8.81 |
| Health questions, English | 1.17 | 1.22 | 1.26 | 1.26 | — |
| Health questions, romanised Singlish | 1.65 | 1.48 | 1.87 | 1.87 | — |

Caveats ⚠: these are small samples, and the UDHR file dates from 2009.

Other reported figures:
- Chat2Find's corpus statistics imply **~2.2 tokens/word for Qwen3.5's new tokenizer** [8]. This is derived, not benchmarked ⚠.
- Extending the Llama-3.2 vocabulary cuts Sinhala tokens by ~70% [26].

**Effect on speed:**
- Gemma 4 E2B on a Pi 5 (16 GB, CPU, LiteRT-LM) prefills at 133 tok/s and decodes at 8 tok/s, with a 7.8 s time-to-first-token. E4B: 51 / 3 tok/s, 20.5 s TTFT [27].
- Gemma 3 4B QAT under Ollama decodes ~5 tok/s; Gemma 3 1B ~11 tok/s [28]. Llama-3.2-3B decodes 4.7 tok/s [29].
- A 25-word Sinhala answer is ≈75 tokens for a Gemma-family model, about 9–25 s. The same answer is ≈240–300 tokens with Qwen3 or Llama, about **50–65 s**. Inference; Gemma 4 is assumed to share Gemma 3's tokenizer ⚠.
- The Raspberry Pi AI HAT+ 2 (Hailo-10H) only targets int4 models of ~1–1.5B and reaches roughly 1–8 tok/s [30], so it doesn't help here.

---

## 2. Sinhala speech-to-text on device

**Whisper zero-shot** supports the `si` language token [25], but the evidence on quality conflicts ⚠:
- A 2026 review cites ~35–45% FLEURS WER for small through large-v3 [31].
- One fine-tune card measured base whisper-small at **130.9% WER / 244% CER**, on only 10 samples [33].
- Sinhala is absent from OpenAI's large-v3 per-language chart, which lists about 60 languages [25].
- Treat zero-shot Whisper as unusable for Sinhala.

**Structural problem:** Whisper's decoder context is 448 tokens, and openai-whisper samples at most 224 by default [25]. At 9–12 tokens per Sinhala word, that is only ~20–25 words per 30-s window. This is fine for short commands but argues for VAD-segmented, short utterances.

**Fine-tuned checkpoints** (dozens exist on Hugging Face, mostly whisper-small [36]):

| Checkpoint | Data | Reported result | Licence |
|---|---|---|---|
| **SinhaSpeech/whisper-small-sinhala-run11** | OpenSLR-52 plus a collected set | **16.38% WER / 4.43% CER** on a speaker-disjoint test set of 15,860 utterances [32] | Apache-2.0, but trained on CC BY-SA data [41] ⚠ |
| janiduchamika/…-general-185k (small) | not stated | 25.0% WER [—same listing 36] | Apache-2.0 |
| seniruk/whisper-medium-si | not stated | 28.7% WER [34] | not stated |
| Lingalingeswaran/whisper-small-sinhala_v3 | own dataset | 46.5% WER [35] | Apache-2.0 |
| hlasith/whisper-sinhala-small | OpenSLR-30 TTS lines | 61.7% WER / 14.9% CER, on 10 samples [33] | "other" |
| kasunw/whisper-large-v3-sinhala | OpenSLR | not reported | Apache-2.0 |

A faster-whisper (CTranslate2) build of a Sinhala small model also exists [36].

**Other engines:**
- **Meta Omnilingual ASR** (Nov 2025, **Apache-2.0**):
  - Its per-language table gives **Sinhala CER 7.2%** (225 training hours) for the 7B LLM-ASR model [37].
  - The 300M CTC variant needs ~2 GiB, but its Sinhala accuracy is unpublished. FLEURS-81 average CER is 11.8 for 300M-CTC vs 5.6 for 7B-LLM [37][38] ⚠.
  - CTC is character-level and non-autoregressive, so it avoids the token-length problem above.
- **MMS (mms-1b-all):** CC-BY-NC, and Sinhala (`sin`) is absent from its language list [39].
- **w2v-BERT 2.0** (MIT, 600M) [44]:
  - A 2025 UCSC thesis fine-tuned it on a 40-hour, 123-speaker read corpus. It reports 1.79% WER and beat Whisper and XLS-R [43].
  - Likely optimistic, given read-prompt overlap ⚠.
- Other published results: XLSR-53 26.4% WER; Kaldi TDNN 35.2%; E2E LF-MMI 23.4% on corrected OpenSLR-52 [31].
- **Vosk** has no Sinhala model [45].
- **Gemma 4 audio** on Sinhala is untested ⚠ [10].

**Datasets:**
- OpenSLR-52: ~185K utterances, CC BY-SA 4.0 (Google) [41].
- OpenSLR-30: multi-speaker TTS corpus, CC BY-SA [42].
- Common Voice Sinhala: 5–15 h; FLEURS: ~12 h [31].

**Pi 5-class speed:**
- On a CM5 (the same 4×Cortex-A76 chip as the Pi 5), Whisper-base runs at **RTF 0.34–0.36** (sherpa-onnx), 0.55 (faster-whisper) and 1.48 (vanilla) [46].
- I found no measured whisper-small figures on a Pi 5. Estimates are ~1.7–2.5 minutes of processing per audio minute [48], and community reports say small is the practical upper limit on a Pi 5 [47] ⚠.
- So a 5-s Sinhala command on fine-tuned whisper-small takes ~5–10 s.

**Elderly and code-mixed speech:**
- Older voices raised WER by ~9 points absolute in classic ASR work [49]. A 2025 Dutch study of people aged 65+ saw little degradation on read speech but worse results on conversation [50].
- The 2026 review finds **no annotated Sinhala–English code-switched ASR resources**, no elderly-speech results, and high real-world WER [31].
- Expect English drug names (e.g. "metformin") to be mangled. Bias recognition with the user's own medication list (Whisper prompt or fuzzy matching).

**Wake word:**
- openWakeWord: code is Apache-2.0, but **pretrained models are CC BY-NC-SA 4.0**. Train your own wake word [51].
- Porcupine supports 9 languages, none of them Sinhala. Other languages are "case-by-case" for commercial customers [52].
- For 60+ users, a **physical push-to-talk button** is the safer default. This is a design recommendation, not a measured result.

---

## 3. Sinhala text-to-speech on device
- **MMS-TTS has no Sinhala model.** Hugging Face lists `mms-tts-sid/sig/sil` but no `mms-tts-sin`, while `mms-tts-tam` exists [40]. MMS is CC-BY-NC in any case [39].
- **Piper** has no Sinhala voice [58]. However, espeak-ng supports Sinhala phonemisation (`si`) [59], so a voice can be trained. Note that piper1-gpl is **GPL-3.0** [58].
- **SinhalaVITS** (Dialog + University of Moratuwa, 26 Nov 2025) [53][54][55]:
  - Coqui VITS, ~2 h per voice, one female and one male voice. Input is Unicode, romanised internally.
  - The model cards say **MPL-2.0**, but the press release calls it a "non-commercial initiative." Confirm with Dialog ⚠.
- **Pathnirvana dataset:** 13.7 h, two speakers, **GPL plus an "inoffensive use" restriction** [56]. VITS voices trained on it use MPL-2.0 [57].
- **Naturalness:** VITS on Pathnirvana scored MOS 4.07–4.18 naturalness and 4.24–4.62 intelligibility (UCSC 2025, small panel ⚠) [43].
- **Speed:** On a Pi 4 (4 threads), Piper-medium runs at RTF ~0.36, while Coqui-style VITS runs at ~2.2 [60]. A Pi 5 should be roughly 2–3× faster ⚠ (estimate). So exporting a Sinhala voice to Piper/ONNX format is what makes real-time speech practical.
- Coqui XTTS-v2 does not support Sinhala and carries a non-commercial model licence ⚠ (from memory).

---

## 4. Romanised Sinhala / Singlish input
- **Best open transliterator:** BERT-based back-transliteration (IIT, IndoNLP 2025) gets **WER 8.5–9.0% / CER ~2%**, including a test set of vowel-dropped ad-hoc typing [61]. The code is on GitHub [63]; its licence is not stated.
- **Code-mixed input:** a fine-tuned Swa-Bhasha mBART scores BLEU 49.7, vs 33.4 for Gemini 2.5 Flash few-shot and 4.0 for rule-based [62].
- **Helakuru** is closed. Its voice typing was "powered by Google Voice recognition" (2017) [64].
- **LLMs** degrade sharply on romanised text [3].
- Romanised text is cheap in tokens (1.5–1.9 per word, measured above). Normalising it to Unicode before NLU, or training the intent model on both scripts, is the safer route.
- Sinhala is diglossic: spoken grammar differs from written [71]. Write the answer templates in polite spoken register.

---

## 5. Licences for commercial use
- **Commercially usable:**
  - Apache-2.0: Gemma 4, Qwen3 dense, Qwen3.5, Omnilingual ASR, MADLAD-400-MT [69].
  - MIT: Whisper [25], w2v-BERT 2.0 [44], SinBERT [19].
  - MPL-2.0 (⚠ verify): SinhalaVITS.
- **Commercial use with conditions:** Gemma 3/3n (Gemma Terms of Use) [9]; Llama 3.x and SinLlama (Community Licence: attribution and naming rules) [16][17].
- **Non-commercial:** MMS [39], Aya Expanse and Tiny Aya [12][14], NLLB-200 (also research-only) [68], openWakeWord pretrained models [51].
- **Copyleft:** GPL-3 for piper1 [58] and the Pathnirvana data [56]; CC BY-SA for OpenSLR-30/52 [41][42]. Whether CC BY-SA carries over to fine-tuned weights is legally unsettled ⚠.
- **Paid:** Porcupine [52].

---

## 6. Feasibility verdict
- **Fully on-device, reliable answers to health-record questions in Sinhala on a Pi 5: yes, but only as a constrained pipeline.** Free-form LLM generation is not reliable enough.
- **Realistic accuracy:**
  - ASR on clean read speech: ~16% WER / 4% CER [32].
  - Elderly conversational speech in a home: plausibly 25–40% WER ⚠ (extrapolated from [31][49]).
  - Closed-domain intent detection over ~10–20 intents can tolerate many word errors. CNN classifiers working on character probabilities from an English ASR already map Sinhala and Tamil commands to intents [72]. Expect >90% intent accuracy only after in-domain data collection ⚠.
  - Slot values (drug names, dates, numbers) are the weak point. Resolve them against the user's own record and read the result back for confirmation.
- **Hybrid designs used in practice:**
  1. ASR → small encoder classifier (XLM-R, SinBERT, HelaBERT) or an LLM with grammar-constrained JSON output → SQL → templated Sinhala answer → TTS.
  2. RAG plus a large cloud LLM. The UCSC prototype used Llama-3.3-70B [43].
  3. A cloud fallback. Google voice typing has supported Sinhala since 2017 [65]; Azure has si-LK fast transcription [66] and si-LK neural voices (Thilini, Sameera) [67]. This brings privacy trade-offs.
  4. Translate-pivot through English: blocked by NLLB's licence; MADLAD is 3B and research-grade.
- **Sri Lankan products:** Dialog only released TTS [53]. Helakuru and Gboard rely on Google's cloud speech [64][65]. I found no on-device Sinhala voice assistant. Local commentary stresses testing colloquial speech, code-switching and spelling variation [70].

## Implications for Cure Home
1. Use an **intent/slot plus templates** architecture: ~15 health intents and native-speaker-written spoken-Sinhala templates. Use the LLM, if at all, only for NLU into JSON or for English chat.
2. **ASR:** start from SinhaSpeech whisper-small-sinhala-run11 (faster-whisper int8). In parallel, evaluate Omnilingual CTC-300M/1B (Apache-2.0) and a w2v-BERT fine-tune on recordings of **elderly Cure users**. Budget for collecting 10–20 h of in-domain speech.
3. **Push-to-talk button** as the default; train a custom openWakeWord model later.
4. **LLM pick for any generation:** Gemma 4 E2B (Apache-2.0, ~3 tokens per Sinhala word, 8 tok/s on a Pi 5) or Qwen3.5-4B. Avoid Qwen3 and Llama for Sinhala output because of the 3–4× token cost. Run Belebele, SinhalaMMLU and Global-PIQA-si plus your own health-QA set before committing.
5. **TTS:** SinhalaVITS (confirm the licence with Dialog), converted to ONNX/Piper. Pre-render the fixed template phrases to cache and synthesise only the variable slots.
6. **Text input:** a Unicode keyboard plus a Singlish→Sinhala normaliser [61]. Train the NLU on both scripts.
7. **Bias recognition with each user's medication, doctor and appointment lists.** Always read back numbers and drug names, and show the answer on screen.
8. **Licence hygiene:** no MMS, NLLB, Aya or openWakeWord pretrained models in the product. Track CC BY-SA and GPL obligations.
9. An **optional cloud fallback** (Azure/Google si-LK) only with explicit consent. Data-protection obligations were not researched here.

## Sources
1. SinLlama (arXiv 2508.09115) https://arxiv.org/html/2508.09115v3
2. SinhalaMMLU (arXiv 2509.03162) https://arxiv.org/html/2509.03162
3. Rajapakse & Weerasinghe 2026, Unicode vs Romanized Sinhala https://arxiv.org/html/2601.14958v1
4. Qwen3 blog https://qwenlm.github.io/blog/qwen3/
5. Qwen3 Technical Report https://arxiv.org/html/2505.09388
6. Qwen3.5-0.8B (Modal) https://modal.com/library/qwen/qwen3-5-0-8b
7. Artificial Analysis, Qwen3.5 small models https://artificialanalysis.ai/articles/qwen3-5-small-models
8. Chat2Find-CPT https://huggingface.co/Chat2Find/Chat2Find-CPT
9. Gemma (Wikipedia) https://en.wikipedia.org/wiki/Gemma_(language_model)
10. Gemma 4 model card https://ai.google.dev/gemma/docs/core/model_card_4
11. Gemma 3n developer guide https://developers.googleblog.com/introducing-gemma-3n-developer-guide/
12. Aya Expanse (Ollama) https://registry.ollama.ai/library/aya-expanse
13. Tiny Aya docs https://docs.cohere.com/docs/tiny-aya
14. Tiny Aya Global card https://huggingface.co/CohereLabs/tiny-aya-global
15. Llama 4 (Ollama) https://registry.ollama.ai/library/llama4:scout
16. Llama 3.2 Community License (copy) https://docs.oracle.com/cd/E17952_01/heatwave-9.4-license-com-en/license-llama-3-2-1b-instruct.html
17. SinLlama_v01 https://huggingface.co/polyglots/SinLlama_v01
18. SinhaLM Gemma-3-4b LoRA https://huggingface.co/iCIIT/SinhaLM-Sinhala-Gemma-3-4b-it-FT
19. SinBERT-large https://huggingface.co/NLPC-UOM/SinBERT-large
20. HelaBERT https://huggingface.co/papers/2608.22922
21. Global-MMLU https://arxiv.org/pdf/2412.03304
22. Sinhala Global PIQA https://arxiv.org/abs/2602.02207
23. Tokenizer packages used for measurement https://www.npmjs.com/package/@lenml/tokenizers ; https://www.npmjs.com/package/gpt-tokenizer
24. NLTK UDHR corpus https://github.com/nltk/nltk_data
25. OpenAI Whisper repo (tokenizer.py, decoding.py, language-breakdown.svg, MIT) https://github.com/openai/whisper
26. Sinhala Llama-3.2 tokenizer https://huggingface.co/Minuri/sinhala-llama-3.2-1b-tokenizer
27. Gemma 4 LiteRT-LM benchmarks https://developers.google.com/edge/litert-lm/models/gemma-4
28. Gemma 3 on Pi 5 benchmark https://www.kunalganglani.com/blog/gemma-3-raspberry-pi-5-benchmark.md
29. Stratosphere Pi 5 LLM tests https://stratospherelinuxips.readthedocs.io/en/develop/immune/research_rpi_llm_performance.html
30. AI HAT+ 2 analysis https://www.hardware-corner.net/local-llms-raspberry-pi-ai-hat-plus-2/
31. Sinhala ASR critical review (Oct 2026) https://arxiv.org/html/2610.05681
32. SinhaSpeech whisper-small run11 https://huggingface.co/SinhaSpeech/whisper-small-sinhala-run11
33. hlasith whisper-sinhala-small https://huggingface.co/hlasith/whisper-sinhala-small
34. seniruk whisper-medium-si https://huggingface.co/seniruk/whisper-medium-si
35. whisper-small-sinhala_v3 https://model.aibase.com/models/details/1915693342467448833
36. Hugging Face Sinhala Whisper listing https://huggingface.co/api/models?search=whisper%20sinhala&limit=50&sort=downloads
37. Omnilingual ASR repo and per-language CSV https://github.com/facebookresearch/omnilingual-asr
38. omniASR model card https://huggingface.co/facebook/omniASR-LLM-7B
39. MMS-1b-all https://huggingface.co/facebook/mms-1b-all
40. Hugging Face mms-tts search https://huggingface.co/api/models?author=facebook&search=mms-tts-si&limit=100
41. OpenSLR-52 https://openslr.org/52/
42. OpenSLR-30 https://openslr.org/30/
43. UCSC Sinhala speech-to-speech chatbot thesis (2025) https://dl.ucsc.cmb.ac.lk/jspui/bitstream/123456789/4905/1/20000715,%2020001207,%2020002009%20.pdf
44. w2v-BERT 2.0 https://huggingface.co/facebook/w2v-bert-2.0
45. Vosk models https://alphacephei.com/vosk/models
46. Whisper speed on CM5 (Pi 5-class) https://pamir-ai.hashnode.dev/benchmarking-whispers-speed-on-raspberry-pi-5-how-fast-can-it-get-on-a-cpu
47. whisper.cpp discussion #166 https://github.com/ggml-org/whisper.cpp/discussions/166
48. PromptQuorum STT comparison (estimates) https://www.promptquorum.com/power-local-llm/local-whisper-stt-comparison-2026
49. Vipperla et al. 2010, Ageing voices https://era.ed.ac.uk/items/8125ea76-2748-4f18-bc04-6f2e87e4ac2f/full
50. ASR for older adults (Dutch) https://arxiv.org/html/2508.08684v3
51. openWakeWord https://github.com/dscripka/openWakeWord
52. Porcupine https://github.com/Picovoice/porcupine
53. Dialog SinhalaVITS release https://dialog.lk/news/dialog-and-university-of-moratuwa-mobile-communications-research-lab-launch-sinhalavits
54. SinhalaVITS-TTS-F1 https://huggingface.co/dialoglk/SinhalaVITS-TTS-F1
55. SinhalaVITS-TTS-M2 https://huggingface.co/dialoglk/SinhalaVITS-TTS-M2
56. Pathnirvana Sinhala TTS dataset https://github.com/pnfo/sinhala-tts-dataset
57. tts-si-female-vits https://huggingface.co/tharindumihi/tts-si-female-vits
58. Piper voices list and COPYING (GPL-3) https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md
59. espeak-ng languages https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md
60. sherpa-onnx VITS RTF on Pi 4 https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/vits.html
61. Perera et al., IndoNLP 2025 https://aclanthology.org/2025.indonlp-1.16.pdf
62. Swa-Bhasha Resource Hub https://arxiv.org/pdf/2507.09245
63. Singlish-Transliterator code https://github.com/Sameera2001Perera/Singlish-Transliterator
64. Helakuru voice typing (2017) https://readme.lk/helakuru-sinhala-voice-typing/
65. Google adds Sinhala voice recognition (2017) https://www.dailymirror.lk/breaking-news/Google-adds-voice-recognition-for-Sinhala-and-Tamil/108-134707
66. Azure Speech language support https://learn.microsoft.com/ms-my/azure/ai-services/speech-service/language-support
67. Azure si-LK voice listing https://json2video.com/ai-voices/azure/voices/si-lk-thilinineural
68. NLLB-200-distilled-600M https://huggingface.co/facebook/nllb-200-distilled-600M
69. MADLAD-400-3B-MT https://huggingface.co/google/madlad400-3b-mt
70. readme.lk on Sri Lanka AI Week 2026 https://readme.lk/sri-lanka-ai-week-hard-part-starts-after-demos/
71. Sinhala NLP survey (diglossia) https://arxiv.org/html/1906.02358v25
72. Karunanayake et al. 2019, speech-to-intent for low-resource languages https://preview.aclanthology.org/setup/P19-2040
