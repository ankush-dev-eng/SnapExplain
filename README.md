# SnapExplain

**Privacy-first AI study assistant designed for Snapdragon-powered Windows PCs.**

SnapExplain takes any study material — a paragraph, a textbook passage, lecture notes, or an image/screenshot — and instantly produces:

- 📖 **Simple Explanation** — plain-language breakdown of the content
- 📄 **Summary** — concise overview of the main ideas
- 🔑 **Key Points** — numbered, actionable takeaways
- ❓ **Practice Quiz (MCQs)** — 5 multiple-choice questions with feedback and explanations
- 💬 **Ask AI** — contextual chat about the content

---

## Problem

Students waste time re-reading dense material. Traditional AI study tools send your private notes to cloud servers, creating privacy concerns. They require internet access and incur API costs per query.

## Solution

SnapExplain processes study material **entirely on your device** — no network requests, no account required, no API costs. The architecture is designed to ultimately leverage the Snapdragon Neural Processing Unit (NPU) for sub-second local inference, making it ideal for students on Snapdragon-powered Windows laptops.

---

## Features

| Feature | Status |
|---|---|
| Single HTML file architecture | ✅ Implemented |
| Text input / paste area | ✅ Implemented & verified |
| Image upload with drag-and-drop | ✅ Implemented & verified |
| WebGL Fluid background | ✅ Implemented & verified |
| OCR text extraction | ✅ Stubbed (Tesseract not fully bundled) |
| Simple Explanation tab | ✅ Implemented & verified |
| Summary tab | ✅ Implemented & verified |
| Key Points tab | ✅ Implemented & verified |
| MCQ Quiz with feedback | ✅ Implemented & verified |
| Ask AI contextual chat (streaming) | ✅ Implemented & verified |
| Reset functionality | ✅ Implemented & verified |
| Loading states | ✅ Implemented & verified |
| Responsive layout | ✅ Implemented |
| Demo mode (in-browser NLP) | ✅ Implemented & verified |
| Local LLM provider (Ollama) | ✅ Implemented & verified |

---

## Architecture

The entire application runs from a single `index.html` file with no build step, bundlers, or frameworks. It is heavily inspired by the "Flowstate" deep-work application design system.

- **HTML/CSS/JS** — Single file
- **WebGL Fluid Simulation** — For an immersive visual experience.
- **Lenis** — Smooth scrolling.

### AI Provider Architecture

SnapExplain uses a provider abstraction layer that cleanly separates the UI from any specific AI implementation:

1. **LocalLLMProvider** — Connects to a local inference endpoint (like Ollama running `phi3:mini`). Now supports streaming chat responses and conversation history.
2. **DemoProvider** — Always available fallback. Uses rule-based NLP for instantaneous static testing.

---

## AI: DemoProvider (Current Implementation)

**What it actually is:** A rule-based, deterministic text-analysis engine running entirely in the browser.
**Limitations:** Not a neural language model — no reasoning, paraphrasing, or cross-sentence inference.

---

## Local / On-Device AI Approach (Ollama)

SnapExplain is ready to connect to a local LLM through Ollama.
1. Run `ollama run phi3:mini`.
2. Ensure Ollama is running at `http://localhost:11434`.
3. The app will automatically detect it and use the local model instead of the Demo mode.

---

## Snapdragon Relevance

SnapExplain is designed with Snapdragon X Elite / X Plus PCs as the target platform:

- **NPU acceleration:** Optimized local models (like Phi-3) compiled for the Snapdragon NPU would run rapidly.
- **Battery efficiency:** On-device inference avoids continuous network I/O.
- **Privacy-by-design:** Study notes never leave the device.

> **Honest disclaimer:** Snapdragon NPU execution has NOT been tested in the current development environment. The DemoProvider and a generic Ollama local server are used in its place.

---

## Running

Simply open `index.html` in any modern web browser. No installation or build steps are required.

---

## Actually Tested Functionality

| Test | Result |
|---|---|
| App loads in browser | ✅ PASS |
| Single HTML structure maintained | ✅ PASS |
| WebGL Fluid rendering | ✅ PASS |
| "Load Demo" populates text | ✅ PASS |
| "Analyze" shows loading state then results | ✅ PASS |
| Tabs navigation works | ✅ PASS |
| Quiz interactions work | ✅ PASS |
| Ask AI tab history and streaming | ✅ PASS |

---

## Known Limitations

1. **OCR not end-to-end tested:** Tesseract.js is not bundled in the single HTML file version to prevent massive file sizes.
2. **No Snapdragon NPU testing:** This environment does not have a Snapdragon device.
3. **Local LLM Model Specifics:** Ollama must be properly configured for CORS if running from a local file protocol.
