# SnapExplain

Privacy-first AI study assistant for turning notes and screenshots into simple explanations, summaries, key points, and quizzes.

SnapExplain is a local-first learning tool that allows users to instantly transform their study materials into interactive, digestible content. By pasting text or uploading screenshots of lecture notes, the application processes the input to generate simple explanations, concise summaries, bulleted key points, and multiple-choice quizzes. SnapExplain is engineered with a privacy-first mindset, exploring on-device execution to keep user data secure and reduce cloud dependencies.

## Key Features

- **Text & Image Input:** Seamlessly paste study content or upload images/screenshots.
- **AI Analysis:** Transforms complex notes into accessible learning formats.
- **Simple Explanations & Analogies:** Breaks down difficult concepts.
- **Summary & Key Points:** Condenses material into digestible insights.
- **Interactive Quizzes (MCQs):** Tests knowledge retention with dynamic 5-question quizzes.
- **Ask AI (Contextual Q&A):** Interactive chat interface grounded in your uploaded content.
- **Local AI Provider Architecture:** Abstracted provider pattern designed to support local inference endpoints.
- **Demo Provider:** Fully functional rule-based provider for immediate frontend verification.
- **Immersive UI:** A polished dark-mode interface featuring a WebGL fluid background, glassmorphism, and responsive layout.
- **Privacy-First Design:** Architecture intended for on-device processing.

## How It Works

**Architecture Flow:**
```text
User Content
    ↓
Text / Image Input
    ↓
Content Processing (Tesseract.js OCR for images)
    ↓
AI Provider (Abstracted interface)
    ↓
SnapExplain Analysis
    ↓
Summary / Explanation / Key Points / MCQs / Q&A
```

**Implementation Details:**
- **AI Provider Abstraction:** A flexible `ProviderFactory` manages AI endpoints (located in `src/ai/`).
- **DemoProvider:** An implementation returning simulated AI responses for rapid UI testing and fallback.
- **LocalLLMProvider:** A scaffolding for local endpoints (e.g., Ollama or NPU-accelerated local APIs).
- **OCR Service:** Uses `tesseract.js` for on-device image text extraction (`src/services/ocr.ts`).
- **Frontend Components:** Modular React components (`src/components/`) handle stateful rendering for results, quizzes, and chat interactions.

## Privacy and Local AI Architecture

SnapExplain is designed around a local-first AI architecture to reduce unnecessary cloud dependency and support privacy-sensitive study workflows. Rather than transmitting personal study notes or textbooks to external servers, the application is structured so that OCR extraction runs directly in the browser and AI generation can target a local backend endpoint.

## Snapdragon Relevance

As a privacy-focused study application, SnapExplain is highly suitable for AI PCs powered by Snapdragon processors.
- **Local Inference:** Leveraging an NPU allows models to run efficiently on-device without compromising battery life.
- **Privacy & Autonomy:** Students handle sensitive notes without requiring an internet connection or exposing data to cloud providers.
- **Extensible Architecture:** The AI provider abstraction enables seamless swapping between simulated responses, local endpoints (like an NPU-accelerated service), or cloud APIs. 

*Note: The application is designed to target these capabilities; actual Snapdragon hardware validation is pending.*

## Visuals and UX

The application presents an immersive dark interface designed to minimize distractions and enhance focus. An animated WebGL fluid background provides an engaging, dynamic environment behind frosted glass surfaces. The centered AI interaction window ensures a lightweight, responsive, and highly focused user experience across devices.

## Tech Stack

- **TypeScript**
- **React** (v19)
- **Vite** (v8)
- **Tailwind CSS** (v4)
- **Tesseract.js** (In-browser OCR)
- **WebGL** (Fluid canvas background)

## Getting Started

```bash
git clone https://github.com/ankush-dev-eng/SnapExplain.git
cd SnapExplain
npm install
npm run dev
```

## Testing & Validation Status

| Component | Status | Notes |
| :--- | :--- | :--- |
| **Vite / React Build** | PASS | Successfully compiles and serves via `npm run build` |
| **UI Components** | PASS | All tabs, quizzes, and chat interactions render correctly |
| **Demo AI Provider** | PASS | Mock responses return and populate UI successfully |
| **In-Browser OCR** | PENDING | Scaffolded via `tesseract.js`; end-to-end extraction pending |
| **Local LLM Inference**| PENDING | Provider implemented; requires active local endpoint to verify |
| **Snapdragon NPU** | UNTESTED | Architecture supports it; hardware validation not yet performed |
