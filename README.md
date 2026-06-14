# ⚔️ ASUNA AI — Your Personal Cybernetic Assistant

ASUNA is an advanced, highly polished, fully responsive full-stack cyberdeck assistant (inspired by Jarvis but styled with the warm, determined, and protective personality of **Asuna Yuki** from *Sword Art Online*). 

ASUNA is designed to coordinate your daily schedules, parse actionable schedules or task reminders in real-time conversations using Gemini AI, track your device's core diagnostics (such as battery levels), and listen actively using continuous hands-free voice-activation.

---

## ✨ Features & Capabilities

- **🌸 Cybernetic Personality**: Programmed with the warmth, strength, and cybernetic loyalty of Asuna Yuki. She calls you "Master" (or your custom codename) and speaks with playful but professional devotion.
- **🗣️ "Awesunnah" Voice Activation**: Implemented with highly sensitive phonetic voice trigger calibration. Perfect for awakening her microphone hands-free by pronouncing `"Awesunnah"`.
- **🔋 Live Power Grid Node**: Dynamically queries the browser's native **Battery Status API**, showing your device's live battery status (%) and interactive charging indicator in her glowing cyber header.
- **🤖 Server-Secure Gemini API**: Proxies all AI queries through a secure Express.js backend using `gemini-3.5-flash`, keeping your personal `GEMINI_API_KEY` safe from standard browser inspector tools.
- **📅 Smart Task Scheduling**: Under the hood, ASUNA analyzes your conversational requests, automatically registers tasks or reminders, calculates relative time references (e.g., *"tomorrow at 3 PM"*), and synchronizes them to private storage.
- **📱 Standalone Mobile PWA**: Configured with full iOS Web App configuration tags, custom launch manifests, and local service worker cache registers. Supports adding to your home screen natively on iPhone Safari.

---

## 🛠️ Project Structure

```text
├── .github/workflows/       # GitHub CI/CD Actions build checks
├── public/
│   ├── manifest.json        # PWA setup descriptors
│   └── sw.js                # Service Worker browser caches
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Glowing cyber status bar + device battery
│   │   ├── ChatPanel.tsx        # Immersive typing, bubbles & quick action nodes
│   │   ├── TasksPanel.tsx       # Live tasks queue & completed log archives
│   │   └── SettingsOverlay.tsx  # Customize Voice models & nickname codenames
│   │
│   ├── types.ts             # Shared strong types
│   ├── App.tsx              # Main system hub & vocal triggers
│   ├── index.css            # Custom Tailwind CSS v4 styling rules
│   └── main.tsx             # React entry point
│
├── server.ts                # Express backend & Gemini API proxy routing
├── vite.config.ts           # Frontend compiler setups
├── package.json             # NPM package controls
└── tsconfig.json            # TypeScript compiler rules
```

---

## 🚀 Quick Start (Local Setup)

Follow these simple steps to run ASUNA on your personal machine or host it on your personal server:

### 1. Prerequisites

Ensure you have **Node.js (v20 or higher)** installed.

### 2. Clone the Repository & Install Dependencies

```bash
git clone <your-github-repo-url>
cd asuna-ai
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file at the root of your directory (or copy the provided `.env.example` file):

```env
# Your secure Gemini API Key from Google AI Studio (aistudio.google.com)
GEMINI_API_KEY="AIzaSyYourKeyHere..."

# Host service URL (used for OAuth callbacks or self-referential paths)
APP_URL="http://localhost:3000"
```

### 4. Run the Development Server

Start the full-stack development environment instantly:

```bash
npm run dev
```

Your system will spin up the Express server with embedded Vite middleware on **port 3000**. Open your browser to:
👉 **`http://localhost:3000`**

---

## 📦 Production Build & Deploy

ASUNA is fully ready for high-performance deployment to cloud servers such as **Cloud Run**, **Render**, **Railway**, **Heroku**, or **VPS**:

### 1. Build and Bundle

Compile the React frontend client and bundle the Express TypeScript server into a self-contained production bundle using `esbuild`:

```bash
npm run build
```

This generates a client-side static distribution folder under `dist/` and compiles the backend code safely into `dist/server.cjs`.

### 2. Run Standalone Server

Start the compiled Node production backend:

```bash
npm start
```

---

## ⚡ Voice Calibration Details

To activate the hands-free model:
1. Tap on the **⚙ CONFIG** button in the header.
2. Toggle on the **"Awesunnah" Wake Word** option. Make sure to grant browser microphone permissions.
3. Keep ASUNA open in the active tab (or as a standalone PWA).
4. Pronounce the trigger clearly as **`Awesunnah`**. The header dynamic icon will glow blue to indicate she is recording your message!

---

*“No matter what, I will stand by your side. Let's make today productive, Master!”* — **ASUNA AI**
