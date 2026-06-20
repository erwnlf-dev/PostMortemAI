# ⚡ PostMortem AI

> **AI-Powered, ITIL-Aligned Incident Postmortem Report Generator for IT Service Resilience Teams.**

PostMortem AI is a serverless SaaS utility that transforms raw incident data (timelines, severity, symptoms, actions taken) into polished, structured, executive-ready ITIL postmortem reports in seconds.

---

## ✨ Features

- **ITIL-Aligned Output Structure**: Generates 9 core incident report sections (Executive Summary, Timeline, Root Cause/5 Whys, Impact, Contributing Factors, Immediate Actions, CAPA, Lessons Learned, ITIL Classifications).
- **Multi-Provider AI**: Wires client-side requests directly to OpenAI (GPT-4o), Anthropic (Claude Sonnet), or any custom OpenAI-compatible API base URL.
- **Incident Duration (MTTR) Calculator**: Optional detection and resolution date/time entry fields automatically compute incident MTTR in real-time.
- **Session Draft Auto-Save**: In-progress incident details are saved to `sessionStorage` to prevent data loss on accidental browser refreshes.
- **Local Credential Obfuscation**: Stored API keys are base64-encoded/obfuscated locally to prevent plain-text discovery from malicious scripts.
- **Robust Error Recovery**: Native React Error Boundaries capture rendering crashes, offering one-click cache reset options.
- **Performance Optimized**: Google Fonts link preloading, lazy-loading/code-splitting of markdown parsers, and pure CSS transitions.
- **Responsive Layout**: Designed for seamless workflow across desktop layouts, tablet sidebar panels, and mobile bottom tab navigations.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 19, JavaScript (ES6+)
- **Build Tooling**: Vite 8, ESLint
- **Styling**: Vanilla CSS with cohesive HSL-mapped tokens (Dark Theme: `#0A0C10` background, `#FF4D00` action indicators)
- **Libraries**:
  - `react-markdown` + `remark-gfm` (dynamically lazy-loaded for report visual displays)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/postmortem-ai.git
   cd postmortem-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create a default configuration:
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

5. **Build the production bundle**:
   ```bash
   npm run build
   ```
   The static minified outputs will be generated inside the `dist/` directory, ready to be deployed to Vercel, Netlify, or GitHub Pages.

---

## 🔒 Security Note (BYOK)

PostMortem AI operates under a **Bring Your Own Key (BYOK)** model. All LLM queries are executed directly from the client's browser using the provided API keys:
1. No backend proxy is required; your keys are sent directly to the official provider endpoint (or custom base URL).
2. For local safety, keys are base64-obfuscated when stored inside browser `localStorage`.
3. To disable direct browser fetch overrides in enterprise settings, we recommend replacing the direct fetch hooks in `src/hooks/useAI.js` with your own company proxy endpoint.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
