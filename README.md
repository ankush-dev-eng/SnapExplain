<div align="center">

# 🧠 SnapExplain

[![Typing SVG](https://readme-typing-svg.herokuapp.com/?font=Fira+Code&weight=600&size=24&pause=1000&color=00E5FF&center=true&vCenter=true&width=700&lines=Privacy-First+AI+Study+Assistant;Turn+Notes+Into+Clear+Explanations;Summaries%2C+Key+Points+%26+Quizzes;Built+for+Local-First+AI+Workflows)](https://git.io/typing-svg)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=&fontSize=0" width="100%"/>

**A privacy-first AI study assistant that transforms notes and screenshots into simple explanations, summaries, key points, and interactive quizzes.**

Instead of fighting through dense blocks of textbook text or messy screenshots, SnapExplain digests the material and presents it in multiple interactive, learning-optimized formats. All designed around a local-first abstraction to keep your study material private.

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-7.0.0-black?style=for-the-badge)](https://tesseract.projectnaptha.com/)

![Stars](https://img.shields.io/github/stars/ankush-dev-eng/SnapExplain?style=social) ![Forks](https://img.shields.io/github/forks/ankush-dev-eng/SnapExplain?style=social) ![Last Commit](https://img.shields.io/github/last-commit/ankush-dev-eng/SnapExplain?color=00E5FF&style=flat-square)

</div>

---

### 🧠 What is this?

> Study material can be dense, fragmented, screenshot-heavy, and difficult to revise from quickly.

**SnapExplain** turns supplied material into:
- simple explanations breaking down difficult concepts
- concise summaries
- key points extracting the most important ideas
- interactive MCQs to test retention
- contextual questions through an interactive chat interface

The application is engineered with a privacy-first mindset. Rather than unconditionally beaming sensitive notes to the cloud, the internal architecture abstracts the AI provider, laying the groundwork for Snapdragon NPU integration or local inference endpoints. A bundled demo provider allows immediate functional testing of the responsive WebGL-backed UI.

---

### ✨ Features

<table>
<tr>
<td width="50%" valign="top">

**📄 Content Input**  
Seamlessly paste raw text notes or upload screenshots/images. The app uses Tesseract.js for in-browser OCR extraction, ensuring the text never leaves your device during this step.

**🧠 AI Explanation**  
Transforms complex topics into accessible "Explain Like I'm Learning This" narratives, complete with analogies and key terminology.

</td>
<td width="50%" valign="top">

**📝 Smart Revision**  
Generates concise summaries, bulleted key points, and dynamic 5-question multiple-choice quizzes that provide immediate scoring and feedback.

**🔒 Local-First Architecture**  
A modular `ProviderFactory` isolates the AI logic (`DemoProvider`, `LocalLLMProvider`), intentionally designed to support local on-device processing and AI PCs without heavy refactoring.

</td>
</tr>
</table>

---

### 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| ⚛️ **UI / Framework** | React 19.2 + TypeScript + Tailwind CSS 4.3 |
| 🧠 **AI Layer** | Abstracted Provider (`LocalLLMProvider`, `DemoProvider`) |
| 🖼️ **Image Processing** | `tesseract.js` (In-Browser OCR) |
| 🎨 **Graphics** | Vanilla WebGL (Fluid Canvas Background) |
| ⚡ **Build Tool** | Vite 8.3 |

</div>

---

### ⚙️ How It Works

```mermaid
flowchart LR
    A[Study Material] --> B[Text / Image Input]
    B --> C[Content Processing]
    C --> D[AI Provider]
    D --> E[SnapExplain Analysis]
    E --> F[Summary]
    E --> G[Explanation]
    E --> H[Key Points]
    E --> I[MCQs]
    E --> J[Ask]
```

---

### 🚀 Getting Started

```bash
# 1. Clone the project
git clone https://github.com/ankush-dev-eng/SnapExplain.git
cd SnapExplain

# 2. Install dependencies
npm install

# 3. Fire it up
npm run dev
```

Then open the local dev URL Vite prints — and start transforming your notes. ⚡

---

### 🧪 Snapdragon Relevance & Validation

The application is purposefully designed to target local execution, aligning perfectly with Snapdragon AI PC paradigms:
* **Local Inference:** Eliminates latency and cloud dependency.
* **Privacy:** Sensitive academic material stays strictly on-device.

*Note: The provider architecture heavily scaffolds this workflow, though explicit Snapdragon NPU hardware validation is currently pending verification.*

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=&fontSize=0" width="100%"/>
</div>
