# Reference: running a local LLM chatbot on the Cure Home hub (Pi 5 and alternatives)

> Research compiled 2026-10-22. Figures marked est. are estimates; benchmark on the real hub before committing.

## Summary
- **On the Pi 5 CPU, reading the prompt (prefill) is the bottleneck, not writing the answer.** Measured prefill on llama.cpp is about 87 tok/s for a 1B model and about 32 tok/s for a 3B model, both using Q4_0 weights repacked for Arm at load time. A cold 1,500-token prompt therefore takes **about 17 s (1B) or about 47 s (3B) before the first word appears**. Generation then runs at about 12 tok/s (1B) or 5 tok/s (3B) [11].
- **The best measured option on the Pi 5 CPU is Google's Gemma 4 E2B running on LiteRT-LM:** 99–133 tok/s prefill, 7.6–9 tok/s generation, about 1.5 GB RAM [18][20]. The same model on llama.cpp is 3–4× slower at prefill [14][20].
- **The AI HAT+ 2 (Hailo-10H) is a poor fit for this product:**
  - It generates *slower* than the Pi's own CPU.
  - Every LLM is capped at a 2,048-token context.
  - The largest LLM it runs is Qwen3-1.7B.
  - Its Ollama-compatible server (hailo-ollama) rejects tool-calling requests.
  - It costs about $180–200.
  [3][4][6][9]
- **The Jetson Orin Nano Super answers in about 4–7 s (versus 25–90 s on the Pi 5 CPU), but it now costs $399** [28][30].
- **Models of 1–2B parameters are unreliable at calling tools**, and 4-bit quantization makes them worse [33][34][36]. Treat the LLM as the part that writes the answer, and do the data retrieval in code.

---

## 1. LLM speed on the Pi 5 CPU (4× Cortex-A76 cores)

**How to read the table.**
- "TTFT@1.5k" is the time to first token for a 1,500-token prompt. I calculated it as 1,500 ÷ prefill rate, so it is optimistic: prefill slows somewhat as the context grows.
- **"est."** marks my estimate where no measurement exists.
- **Caveats on the main data source [11]:** the NYU NAIRR rows use the Q4_0_4_4 file format, which llama.cpp retired in December 2024 [13]. Those runs therefore predate that change. Current builds repack ordinary Q4_0 files to the same layout when the model loads [13]. A dotprod Q4_K repack added in late 2025 (llama.cpp PR #17494) raised Q4_K_M prefill on the Pi 5 by about 1.5× [12]. The old Q4_K_M prefill figures are therefore pessimistic.
- **Ollama's "prompt eval" numbers for short prompts are not usable**, e.g. 5.4 tok/s for Llama 3.2 3B in [1].

| Model | Runtime / quant | Prefill tok/s | Gen tok/s | RAM | Test, date | TTFT@1.5k |
|---|---|---|---|---|---|---|
| Qwen2.5-0.5B (proxy for Qwen3-0.6B) | llama.cpp Q4_0 repack | 190 | 26.7 | 0.49 GB file | NAIRR, ≤Dec 2024 build [11] | 8 s |
| Qwen3-0.6B | Ollama | – | 23.0 | 1.07 GB RSS | short prompts, Sep 2026 [15] | ~9 s est. |
| Llama 3.2 1B | llama.cpp Q4_0 repack | 86.8 | 12.4 | 0.98 GB file | [11] | **17 s** |
| Llama 3.2 1B | llama.cpp Q4_K_M | 30.5 (old); ~45 est. now | 11.5 | 1.0 GB file | [11][12] | 33–49 s |
| Llama 3.2 1B | Ollama Q4_K_M | – | 11.2–13.0 | 1.24 GB RSS | Sep 2026 [15][16] | – |
| Gemma 3 1B | Ollama | ~25 | ~10–11.5 | 1.1–1.4 GB | Apr–Sep 2026 [16][17] | ~60 s |
| Qwen2.5-1.5B (proxy for Qwen3-1.7B) | llama.cpp Q4_0 / Q4_K_M | 65.9 / 22.3 | 10.1 / 9.6 | 1.1 GB | [11] | 23 / 67 s |
| Qwen3-1.7B | Ollama | – | 8.1 | 1.87 GB RSS | Sep 2026 [15] | ~25–30 s est. |
| MiniCPM5-2B (released 7 Sep 2026) | llama.cpp Q4_K_M, pp512 | 38.8 | 8.5 (2 threads) | 2.8 GB peak | 9 Sep 2026 [14] | 39 s |
| **Gemma 4 E2B** | **LiteRT-LM (mixed 2/4/8-bit)** | **133 (16 GB) / 99 (8 GB)** | **7.6 / 9** | **1.43–1.55 GB** | 1,024-token prefill, 2k context, mid-2026 / 11 Aug 2026 [18][20] | **11–15 s** |
| Gemma 4 E2B | llama.cpp Q4_K_M, pp512 | 29.7 | 6.6–7.2 | 4.35 GB peak | Sep 2026 [14] | 50 s |
| Gemma 3n E2B / E4B | Ollama | ~14 / ~6 | 6.1 / ~2.5 | up to 5.3 GB / 4.2 GB | 2026 [15][17] | 107 / 250 s |
| Llama 3.2 3B | llama.cpp Q4_0 / Q4_K_M | 31.7 / 10.7 | 5.0 / 4.7 | 2.2 GB file; 2.8 GB RSS (Ollama) | [11][15] | **47 s** / 140 s |
| Phi-3.5-mini 3.8B (proxy for Phi-4-mini) | llama.cpp Q4_0 / Q4_K_M | 23.4 / 7.5 | 4.4 / 3.9 | 2.2–2.4 GB file | [11] | 64 / 200 s |
| Qwen3-4B, SmolLM3-3B | no measured Pi 5 prefill found | ~20–30 est. | ~4.5–5 est. | ~2.5–3 GB + KV | – | 50–75 s est. |
| Gemma 3 4B | Ollama Q4_K_M (QAT variant) | ~8 (~12) | 3.5–3.9 (~5) | 3.8–4.3 GB | 2026 [15][17] | 125–190 s |
| Gemma 4 E4B | LiteRT-LM | 51 | 3 | 3.07 GB | mid-2026 [18] | 29 s |
| Qwen3.5-2B / 4B (released Mar 2026) | Ollama | – / 3.6 | 5.0 / 2.3 | 3.6 / 3.4 GB | Aug–Sep 2026 [15][41] | 4B: ~7 min |

**Notes on the table**
- **Runtime choice matters as much as the model.** Two examples:
  - For Gemma 4 E2B, LiteRT-LM is about 4× faster at prefill than llama.cpp and uses about one third of the memory [14][18][20]. It memory-maps the model's 1.12 GB of embeddings rather than loading them into RAM [19].
  - The Raspberry Pi blog's own llama.cpp row for that model contradicts itself: 24/4 tok/s in the main table, 58/7 tok/s in the appendix [20].
- **Generation is limited by memory bandwidth.** On MiniCPM5 it was faster at 2 threads than at 4 (8.5 vs 7.5 tok/s) [14]. Running generation on 2–3 threads costs almost nothing and frees cores for the kiosk UI and face recognition.
- **Qwen3.5 small models are slow on the Pi CPU today.** They use a newer hybrid architecture (Gated DeltaNet) whose CPU kernels appear immature; both measurements are rough [15][41][40].
- **One paper to disregard:** arXiv 2604.24785 (Apr 2026) reports 0.14–0.39 tok/s on the Pi 5 CPU through Ollama [31]. That is 30× below every other source and is almost certainly a misconfiguration.
- **Ollama is slower than llama.cpp:** 10–20% in one comparison [16], and up to 4× slower than llamafile in a study across single-board computers [53].
- **KV-cache cost (my calculation, fp16):**

  | Model | Per token | At 4k context |
  |---|---|---|
  | Llama 3.2 1B | 32 KB | 128 MB |
  | Llama 3.2 3B, Qwen3-0.6B, Qwen3-1.7B | 112 KB | 448 MB |
  | Qwen3-4B | 144 KB | 576 MB |
  | Phi-4-mini | 128 KB | 512 MB |

  A cached 1,000-token prefix per user therefore costs about 32–144 MB.

## 2. Accelerators and alternatives

**Pi 5 + Raspberry Pi AI HAT+ 2 (Hailo-10H, 40 TOPS INT4, 8 GB LPDDR4X)**
- **Price and launch:** launched 15 Jan 2026 at $130 [8]. It is now about $180–200 after the April 2026 increases (checked 12 Oct 2026; treat as approximate) [9].
- **Model list, Hailo Model Zoo v5.4** [3]:

  | Model | Generation tok/s | TTFT |
  |---|---|---|
  | Llama 3.2 1B | 9.89 | 0.35 s |
  | Qwen2/2.5/2.5-Coder 1.5B | 7.35–8.13 | 0.32–0.37 s |
  | DeepSeek-R1-Distill-1.5B | 7.96 | 0.73 s |
  | Qwen3-1.7B | 4.78 | 0.62 s |
  | Qwen2-1.5B function-calling LoRA | 6.69 | – |

  - All use A8W4 weights and a 2,048-token context.
  - The vendor's TTFT is for an unstated, presumably short, prompt.
  - The zoo also has Qwen2-VL and Qwen3-VL 2B vision-language models, and Whisper tiny/base/small (10.6 tok/s for small) [3].
  - Llama 3.2 3B was removed in v5.2 [4].
- **Measured speed:**
  - The best independent prefill figure is 1,287 ms for a 258-token prompt on Qwen2.5-1.5B, about 200 tok/s by my derivation. Generation was 6.91 tok/s, with no throttling over 20 runs (paper dated Jun 2026) [5].
  - On generation the Pi's own CPU wins: about 1.3–2× in CNX's test (Hailo 2.6–8.1 vs CPU 4.8–11.7 tok/s, Jan 2026) [1]. Geerling's figures as compiled in [9] point the same way (Llama 3.2 3B: 2.66 vs 5.55; Qwen2 1.5B: 8.25 vs 12.47).
  - CNX, quoting Eben Upton, puts this down to the Pi 5 and the Hailo-10H having similar LPDDR4X memory systems [1].
- **Limits:**
  - The SDK cannot compile custom or larger LLMs (Qwen3-4B attempt, Feb–Jul 2026) [7].
  - Stock hailo-ollama returns HTTP 500 when a request includes tools or a JSON schema; only community workarounds exist (Feb 2026) [6].
  - Running a vision model and an LLM at the same time segfaulted in Geerling's test [2].
- **Upsides:**
  - The host CPU stays mostly idle and host RAM use is low [1].
  - Whole-system power is about 7.1 W peak, versus 12.3 W for the Pi 5 CPU [9].
  - The ASUS UGen300 is the same chip as a USB stick at $299.99 [9].

**AI HAT+ with Hailo-8/8L (13/26 TOPS, $70/$110 at Jan 2026 prices)** [10]
- Vision only, no LLM support.
- The Hailo-10H's vision performance is about the same as the 26-TOPS Hailo-8 [8].
- It could take YuNet face detection off the CPU.

**NVIDIA Jetson Orin Nano Super 8 GB**
- **Price:** $399 for the developer kit, up from $249 in July 2026 [30].
- **Generation (Super mode, MLC INT4, Jan 2025):** Llama 3.2 3B 43.1 tok/s, Phi-3.5-mini 38.1, Qwen2.5 7B 21.8, Llama 3.1 8B 19.1 [28].
- **Prefill:** the non-Super board measured 339 tok/s for Llama 3.2 3B and 203 tok/s for 7–8B models (MLC, Jan 2025) [29]. Gemma 4 E2B on LiteRT-LM using the GPU did 1,142 tok/s prefill and 24.2 tok/s generation, TTFT 0.9 s for a 1,024-token prompt [18].
- **Power:** 7–25 W.

**Rockchip RK3588**
- **CPU (llama.cpp, Jul 2026):**

  | Model | Prefill (pp1024) | Generation |
  |---|---|---|
  | Llama 3.2 3B Q4_K_M | 25.5 tok/s | 11.3 tok/s |
  | Qwen2.5-1.5B | 54.6 tok/s | 22.6 tok/s |

  [21]
- **NPU (RKLLM 1.3.0, independent test, Aug 2026):**

  | Model | Prefill (50-token prompt) | Generation |
  |---|---|---|
  | Qwen2.5-1.5B W8A8 | 202 tok/s | 9.5 tok/s |
  | Qwen2.5-3B | 112 tok/s | 4.9 tok/s |

  [22] Note the NPU's generation was *below* the CPU's.
- **Rockchip's own figures, 128-token prompts (page updated 16 Oct 2026):**

  | Model | TTFT | Generation |
  |---|---|---|
  | Qwen2.5-1.5B | 412 ms (≈310 tok/s prefill) | 16.3 tok/s |
  | Phi-3 3.8B | 1,022 ms | 7.5 tok/s |
  | MiniCPM3-4B | – | 6.0 tok/s |

  [23]
- **Takeaway:** the NPU helps prefill, not generation.

**Newer NPU options in 2026**
- **M5Stack LLM-8850** (Axera AX8850, 24 TOPS, 8 GB, $99, Oct 2025):
  - Speed: Qwen3-0.6B about 12.9 tok/s; Qwen3-4B 3.7 tok/s, with an 836 ms TTFT on a single 20-token run.
  - Limits: maximum context 2,559 tokens; the card is PCIe x2, but the Pi 5 has a single PCIe lane.
  - [26][27]
- **Rockchip RK1820/RK1828 co-processors:** vendor claims of 59–180 tok/s on 3B–7B models. Development kits cost $889–1,029, and the modules are sold to businesses, with RK3588 hosts [24][25].
- **Qualcomm Dragonwing IQ8 NPU:** Gemma 4 E2B at 3,747 tok/s prefill, 31.7 tok/s generation, 0.3 s TTFT [18].

## 3. Tool calling with 1–4B models

| Model | BFCL v3 overall / non-live / live [32] | BFCL v4 overall [33] | Other |
|---|---|---|---|
| Qwen3-0.6B | 45.8 / 67.8 / 58.9 | 23.9 | multi-turn 1.4% |
| Qwen3-1.7B | 55.5 / 80.0 / 63.5 | 28.4 | missed calls 6.0% → **17.3%** at 4-bit NF4 [36] |
| Qwen3-4B | 62.0 / 82.6 / 75.5 | 35.7 (2507) | 4-bit made no difference (7.3%) [36] |
| Qwen3.5 0.8B / 2B / 4B | – | 25.3 / 43.6 / 50.3 (model card) | – |
| Llama 3.2 1B / 3B | – | 10.8 / 22.0 | BFCL V2 25.7→14.3 (1B), 67.0→53.4 (3B) with plain 4-bit quantization [34] |
| Gemma 3 1B / 4B | – | 7.2 / 19.6 | – |
| Gemma 4 E2B / E4B | – | – | τ2-bench retail 29.4 / 57.5 [39] |
| xLAM-2 1B / 3B | 54.0 / 65.7 | 30.4 / 41.2 | fine-tuned for function calling |
| SmolLM3-3B | – | – | "BFCL" 92.3, against Qwen3-1.7B 89.5 and Qwen3-4B 95.0 on its card. Likely a single-call subset, so not comparable [35]. |
| FunctionGemma 270M | – | – | 58% → 85% on Google's Mobile Actions test after fine-tuning [37] |

Dates: BFCL v4 rows sampled May–Aug 2026; the TinyLLM paper [32] is Nov 2025.

- **Single-call accuracy is reasonable at 4B but not at 1–2B.** Calls like `get_latest_vitals(kind)` from a 3–5-tool menu get roughly 75–83% from Qwen3-4B. At 0.6–1.7B, roughly 1 in 5–8 calls is missed or wrong, and multi-turn tool use is near zero.
- **Quantization's damage shows up as skipped tool calls, not lost knowledge** (NeurIPS 2026) [36]. Test your exact quantized checkpoint.
- **JSON validity can be solved.** llama.cpp's JSON-schema or grammar-constrained decoding guarantees output that parses. It does not make the arguments correct, so validate and retry in code [38].
- **On Phi-4-mini, I found no reliable BFCL score.** The only figures found are approximate tiers from a fine-tuning vendor's blog that conflict with the BFCL v4 numbers above, so I left them out.

## 4. Runtimes on the Pi 5

| Runtime | Pi 5 status |
|---|---|
| **llama.cpp** (`llama-server --jinja`) | Best general choice. Native tool-call formats for Llama 3.x, Qwen2.5, Hermes and others [38]. Speed comes from Q4_0 / IQ4_NL load-time repacking [13] and dotprod Q4_K repacking [12]. |
| **LiteRT-LM** | Fastest measured for Gemma: Gemma 4 E2B at 133/7.6 tok/s, Gemma 4 E4B at 51/3 [18]. ~25 MB command-line tool versus ~1.44 GB for Ollama [20]. For the Gemma 3 270M model, llama.cpp was slightly faster (462 vs 433 prefill, 39 vs 22.6 generation) [20]. |
| **Ollama** | Convenient but slower [16][53]. |
| **ExecuTorch, MLC-LLM, ONNX Runtime GenAI** | No current Pi 5 LLM benchmarks found. ExecuTorch's last Pi figure is 2.1 tok/s for Llama 3 8B (May 2024). |

- **KleidiAI (Arm's optimized CPU kernels):** its int4 dotprod kernels (Aug 2025) are aimed at phones [52]. The Pi 5's A76 cores have dotprod but lack the newer i8mm instructions, so the larger KleidiAI gains do not apply.
- **Memory mapping:** loading via mmap keeps RSS low (LiteRT-LM's Gemma 4 E2B uses 1.4 GB, versus 4.4 GB on llama.cpp [14][20]).
- **Running alongside the hub's other services:** an LLM request saturates memory bandwidth, which will slow face recognition and the Chromium UI during a request. Mitigations:
  - Pin generation to 2–3 threads.
  - Lower the LLM process's priority (nice/cgroups).
  - Process one request at a time.
- **Thermals:** with the official Active Cooler, a sustained full 4-core load holds about 60–63 °C. Without cooling the chip goes past 85 °C and throttles from 2.4 to 1.5 GHz (Oct 2023) [42]. A May 2025 replication measured 54.9 °C with the cooler versus 84.5 °C passive [60].

## 5. Multilingual embedding models

| Model | Size | Dim / context | Sinhala | CPU speed on Pi 5 (**my estimate, scaled from llama.cpp prefill of similar-size models [11]**) |
|---|---|---|---|---|
| multilingual-e5-small | 118M (~21M non-embedding); int8 ~120 MB | 384 / 512 | Built on the XLM-R vocabulary and its 100-language pretraining, which includes Sinhala. XLM-R was "best by far" for Sinhala classification [48]. No Sinhala in its fine-tuning data; needs "query:"/"passage:" prefixes [46]. | ~1.5–3k tok/s; a query in ~10–30 ms |
| LaBSE | ~0.5B (mostly embeddings, BERT-base compute) | 768 / 256 | 109 languages; the card does not confirm Sinhala [47] | ~400–600 tok/s |
| EmbeddingGemma-300M (Sep 2025) | 308M (~100M transformer); <200 MB quantized | 768 (can be truncated to 128) / 2K | "100+ languages"; Sinhala not confirmed [44]. EmbeddingGemma 2 (740M, 8K context) now listed [45]. | ~400–600 tok/s; a 256-token chunk ~0.5 s |
| bge-m3 | 568M (XLM-R large) | 1024 / 8192 | XLM-R base, so Sinhala likely | ~150–200 tok/s; a chunk ~1.5 s |
| Qwen3-Embedding-0.6B | 0.6B, 28 layers | up to 1024 / 32K | Qwen3's 119 languages include Sinhala [49]. MMTEB 64.33, versus bge-m3 59.56 [43]. | ~120–170 tok/s |

I found no measured Pi 5 embedding benchmarks or Sinhala retrieval benchmarks; validate on your own data. The corpus is small: 20 questions/day is about 7,300 turns/year, so brute-force cosine similarity takes under 10 ms.

**Sinhala costs tokens.** Sinhala text typically exceeds 3 tokens per word versus about 1.3 for English, and GPT-4o's tokenizer needs about 2.5× as many tokens for Sinhala [51]. Prefill and generation times scale up accordingly. Model quality: Gemma 3 4B scores 58.3% on the Belebele Sinhala reading test, and the Sinhala fine-tunes HelaLM and Gamunu are built on it. Llama 3.2 3B produced "degenerate" Sinhala in HelaLM's ablation [50].

## 6. Worked estimate for a household of 4

**Assumptions**
- About 20 questions/day; prompt 1,500 tokens (range 1,000–2,000); answer 100 tokens (60–120).
- "Warm" means a 1,000-token per-user prefix (system prompt plus patient summary) is already cached, so only about 500 new tokens need prefill.
- One tool-calling round trip adds about 25–40 generated tokens: roughly +2–3 s on a 1B model, +6–8 s on 3B, +5–8 s on the HAT, +1 s on the Jetson.

| Platform / model | Prefill / gen tok/s | Cold TTFT | Cold total (range) | Warm total |
|---|---|---|---|---|
| Pi 5 CPU, Qwen3-0.6B (est.) | ~170 / 23 | ~9 s | ~13 s (9–18) | ~7 s |
| Pi 5 CPU, Llama 3.2 1B Q4_0 | 87 / 12 | 17 s | **~26 s (16–33)** | ~14 s |
| Pi 5 CPU, Gemma 4 E2B on LiteRT-LM | 99–133 / 8–9 | 11–15 s | **~24–28 s (15–35)** | ~16 s |
| Pi 5 CPU, Llama 3.2 3B Q4_0 | 32 / 5 | 47 s | **~67 s (43–87)** | ~36 s |
| Pi 5 CPU, Qwen3-4B / Phi-4-mini (est.) | ~20–25 / ~4.4 | 60–75 s | ~85–100 s (55–130) | ~45 s |
| Pi 5 CPU, Gemma 4 E4B on LiteRT-LM | 51 / 3 | 29 s | ~62 s (40–90) | ~43 s |
| Pi 5 + HAT+ 2, Qwen2.5-1.5B | ~200 / 6.9 | 7.5 s | **~22 s (14–27\*)** | ~17 s |
| Pi 5 + HAT+ 2, Qwen3-1.7B (prefill est. ~120) | ~120 / 4.8 | ~12 s | ~33 s | ~25 s |
| Jetson, Llama 3.2 3B INT4 | 340–1,000 / 43 | 1.5–4.4 s | **~4–7 s** | ~3–4 s |
| Jetson, Gemma 4 E2B on LiteRT-LM (GPU) | 1,142 / 24 | 1.3 s | ~5.5 s | ~4.5 s |
| Jetson, Qwen2.5 7B INT4 | ~200 / 22 | 7.5 s | ~12 s | ~7 s |

\*A 2,000-token prompt plus 120 output tokens exceeds the HAT's 2,048-token context.

Energy is negligible: 20 questions × ~60 s × ~12 W ≈ 4 Wh/day on the Pi 5 CPU.

**RAM headroom on a Pi 5 8 GB**
- **Baseline hub (my estimate; measure it):**
  - OS: 0.5–0.7 GB
  - Chromium kiosk: 0.6–1.2 GB
  - FastAPI service: 0.1–0.3 GB
  - YuNet/SFace face service: 0.2–0.4 GB
  - BLE gateway: about 0.05 GB
  - **Total: about 1.5–2.6 GB**
- **Voice and search (estimate):** a Whisper-class speech recognizer at 0.3–1 GB, plus e5-small at about 0.2 GB.

| Setup | LLM footprint | Free RAM left |
|---|---|---|
| 1B model or Gemma 4 E2B on LiteRT-LM | 1.2–1.55 GB + KV 0.13 GB | **about 3–4.5 GB** |
| 3–4B model | 2.8–4.3 GB + KV 0.45–0.6 GB | **about 0.5–2.5 GB** (tight; risk of swapping if speech recognition stays loaded) |

- **Pi 5 4 GB:** only workable with a 0.6–1B model.
- **Pi 5 16 GB ($305):** buys headroom, not speed.
- **With the HAT+ 2:** the LLM lives in the HAT's own 8 GB, so a Pi 5 4 GB works. But a 4 GB Pi plus the HAT (~$290–310) costs more than a Pi 5 8 GB ($175).
- **Jetson:** 8 GB is shared between CPU and GPU. With the desktop OS plus kiosk at about 2–3 GB and a 3B INT4 model at about 3 GB, about 2 GB remains; 7B is tight.

## Implications for Cure Home

1. **Design around prefill.**
   - Precompute each person's cached prefix (system prompt plus a compact English summary of their record, 300–600 tokens) as soon as the face is recognized, and save/restore it per user.
   - Keep tool results under about 300 tokens.
   - This brings a 1B-class model from about 26 s to about 10–14 s.
2. **Don't rely on the LLM to call tools.** Use a small intent router or grammar-constrained JSON for the fixed intents (vitals, medications, appointments), then SQL, and let the LLM only phrase the answer. If you do use LLM tool calls, use a model of 4B or larger, or a fine-tuned model such as FunctionGemma or xLAM, and validate every call.
3. **Default stack for the Pi 5 8 GB:** Gemma 4 E2B on LiteRT-LM, which is 140-language, supports function calling, and is the best measured on the Pi. Fallback: llama.cpp `llama-server` with Llama 3.2 1B or Qwen3-1.7B in Q4_0. Skip Ollama, Qwen3.5 small models, Gemma 3n and 4B models on the CPU.
4. **Sinhala needs separate testing.** Plan for about 2.5× the tokens. Keep retrieved context in English and generate short Sinhala answers, streamed to text-to-speech. Evaluate Gemma-based Sinhala fine-tunes; Llama 3.2 is weak in Sinhala.
5. **Skip the AI HAT+ 2.** It generates slower than the CPU, caps context at 2,048, has a 1.7B model ceiling, has no tool support, and costs about $180–200.
6. **Consider the Jetson only for a premium model.** At about 4–7 s per answer it is roughly 5–10× faster, but it costs $399 and draws up to 25 W, and it would replace the Pi rather than sit beside it.
7. **Choose the 8 GB Pi 5.** Fit the Active Cooler, run generation on 2–3 threads at low priority, and handle one request at a time.
8. **Embeddings:** use multilingual-e5-small (int8) only for searching past conversations. Query structured health data with SQL, not vectors.
9. **Safety:** with 1–4B models, show the source values (reading, date, medication) next to every answer, and never let the model state numbers it did not retrieve.

## Sources
1. CNX Software, AI HAT+ 2 review (20 Jan 2026): https://www.cnx-software.com/2026/01/20/raspberry-pi-ai-hat-2-review-a-40-tops-ai-accelerator-tested-with-computer-vision-llm-and-vlm-workloads/
2. Jeff Geerling, AI HAT+ 2 (15 Jan 2026): https://jeffgeerling.com/blog/2026/raspberry-pi-ai-hat-2
3. Hailo GenAI Model Zoo MODELS.rst (v5.4): https://github.com/hailo-ai/hailo_model_zoo_genai/blob/main/docs/MODELS.rst
4. Hailo GenAI Model Zoo CHANGELOG: https://github.com/hailo-ai/hailo_model_zoo_genai/blob/main/docs/CHANGELOG.rst
5. arXiv 2603.23640v2 (Jun 2026): https://arxiv.org/html/2603.23640v2
6. Hailo community, hailo-ollama tools support: https://community.hailo.ai/t/hailo-ollama-tools-support/18624?page=2
7. Hailo community, Qwen3 4B on Hailo-10H: https://community.hailo.ai/t/qwen-3-4b-on-hailo10h/18818
8. Raspberry Pi, AI HAT+ 2 launch: https://www.raspberrypi.com/news/introducing-the-raspberry-pi-ai-hat-plus-2-generative-ai-on-raspberry-pi-5/
9. ComputingForGeeks, Jetson vs AI HAT+ 2 (12/19 Oct 2026): https://computingforgeeks.com/edge-llm-jetson-orin-vs-ai-hat-2-vs-hailo-10h/
10. Tom's Hardware, AI HAT+ 2 review: https://tomshardware.com/raspberry-pi/raspberry-pi-ai-hat-plus-2-review
11. BenchmarkList, Edge LLM Pi 5 (NYU NAIRR data): https://benchmarklist.com/benchmarks/edge_llm_raspberry_pi_5/
12. llama.cpp PR #17494, Q4_K dotprod repack: https://github.com/ggml-org/llama.cpp/pull/17494
13. bartowski, Q4_0 online repacking (Dec 2024): https://huggingface.co/posts/bartowski/807894839859408
14. MiniCPM5-2B vs Gemma 4 E2B on Pi 5 (9 Sep 2026): https://note.com/sakuya_mikagami/n/na61e0c077d17?hl=en
15. SimeonOnSecurity, Pi 5 measurements (Sep 2026): https://simeononsecurity.com/articles/ai-models-raspberry-pi-4-5/
16. Stratosphere Slips, Pi 5 LLM research: https://stratospherelinuxips.readthedocs.io/en/develop/immune/research_rpi_llm_performance.html
17. Kunal Ganglani, Gemma 3 on Pi 5: https://www.kunalganglani.com/blog/gemma-3-raspberry-pi-5-benchmark
18. Google, LiteRT-LM Gemma 4: https://developers.google.com/edge/litert-lm/models/gemma-4
19. litert-community, gemma-4-E2B-it-litert-lm: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
20. Raspberry Pi blog, LiteRT and Gemma (11 Aug 2026): https://www.raspberrypi.com/news/mastering-edge-ai-on-raspberry-pi-with-litert-and-gemma/
21. Turing Pi, RK3588 GGUF CPU benchmarks (29 Jul 2026): https://turingpi.com/llm-inference-benchmarks-rk3588-gguf-quantization/
22. Turing Pi, RK3588 RKLLM (1 Aug 2026): https://turingpi.com/?p=722203
23. Seeed SenseCraft, RKLLM benchmark: https://sensecraft.seeed.cc/ai-lab/en/tutorials/rk/benchmark/llm
24. CNX, RK182x kits: https://www.cnx-software.com/?p=161419
25. Geniatech, RK1828/RK1820 M.2: https://www.geniatech.com/rk1828-rk1820-m2-ai-computing-card/
26. CNX, M5Stack LLM-8850: https://www.cnx-software.com/?p=157983
27. M5Stack, Qwen3-4B on LLM-8850: https://docs.m5stack.com/zh_CN/guide/ai_accelerator/llm-8850/m5_llm_8850_qwen3_4b
28. Edge AI and Vision, JetPack 6.2 Super Mode (21 Jan 2025): https://www.edge-ai-vision.com/2025/01/nvidia-jetpack-6-2-brings-super-mode-to-nvidia-jetson-orin-nano-and-jetson-orin-nx-modules/
29. NVIDIA forum, Orin Nano MLC prefill (Jan 2025): https://forums.developer.nvidia.com/t/jetson-orin-nano-super-dev-kit-performance/318719
30. CNX, Jetson price increase (22 Jul 2026): https://cnx-software.com/2026/07/22/nvidia-increases-the-price-of-jetson-modules-and-devkits-by-up-to-101
31. arXiv 2604.24785 (Apr 2026): https://arxiv.org/html/2604.24785v1
32. TinyLLM, arXiv 2511.22138: https://arxiv.org/pdf/2511.22138
33. BenchmarkList, BFCL v4: https://benchmarklist.com/benchmarks/bfcl_v4/
34. Llama 3.2 3B model card: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
35. SmolLM3-3B model card: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
36. NeurIPS 2026, "Compression Breaks Discipline": https://neurips.cc/virtual/2026/171153
37. Google, FunctionGemma: https://blog.google/technology/developers/functiongemma/
38. Liquid AI docs, llama.cpp structured output: https://docs.liquid.ai/deployment/on-device/llama-cpp/structured-output
39. Google DeepMind, Gemma 4: https://www.deepmind.google/models/gemma/gemma-4
40. Artificial Analysis, Qwen3.5 small models: https://artificialanalysis.ai/articles/qwen3-5-small-models
41. BestLLMFor, Pi edge guide: https://bestllmfor.com/guide/llm-local-raspberry-pi-edge/
42. Raspberry Pi, Heating and cooling Pi 5: https://www.raspberrypi.com/news/heating-and-cooling-raspberry-pi-5/
43. Qwen3-Embedding-0.6B model card: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
44. Google, Introducing EmbeddingGemma: https://developers.googleblog.com/introducing-embeddinggemma/
45. EmbeddingGemma docs: https://ai.google.dev/gemma/docs/embeddinggemma?hl=en
46. multilingual-e5-small model card: https://huggingface.co/intfloat/multilingual-e5-small
47. LaBSE model card: https://huggingface.co/sentence-transformers/LaBSE
48. BERTifying Sinhala: https://arxiv.org/abs/2208.07864
49. Qwen3 119-language list: https://dev.to/projedefteri/qwen3-hybrid-thinking-and-superior-performance-in-119-languages-proje-defteri-56d2
50. HelaLM-4B: https://huggingface.co/Jainamshahhh/helalm-4b
51. WWHO tokenization paper (Mar 2026): https://arxiv.org/html/2603.25309v1
52. Arm, ExecuTorch 0.7 and KleidiAI (Aug 2025): https://huggingface.co/blog/arm/executorch-0-dot-7
53. arXiv 2511.07425, single-board computer LLM benchmarks: https://arxiv.org/abs/2511.07425v1
54. Geerling, ai-benchmarks: https://github.com/geerlingguy/ai-benchmarks
55. DataNorth, Gemma 4 release: https://datanorth.ai/news/google-releases-gemma-4-open-models
56. CNX, ASUS UGen300: https://www.cnx-software.com/2026/08/03/299-99-asus-ugen300-usb-ai-accelerator-combines-hailo-10h-asic-with-8gb-lpddr4/
60. DEV, Pi 5 thermal test (May 2025): https://dev.to/mahinshanazeer/raspberry-pi-5-thermal-showdown-active-cooler-vs-passive-cooling-2e2i
