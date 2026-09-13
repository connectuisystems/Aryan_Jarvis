# E.V.E. SYSTEM // PROJECT CONTEXT & ARCHITECTURE CHECKPOINT

**Project**: Spider-Man: Brand New Day AI Assistant (E.V.E. System)  
**Location**: `C:\Test Projects\jarvis\`  
**Date**: September 13, 2026  
**Reference Mockup**: `Ev.png`

---

## 1. Executive Summary & Core Objectives
- Created a high-tech, futuristic web-based HUD assistant modeled after the Spider-Man: Brand New Day interface mockup (`Ev.png`).
- Integrated **Groq LPU Inference API** for real-time natural language responses tailored to Peter Parker.
- Integrated **Fish Audio** E.V. Liam model audio files and browser speech synthesis.
- Resolved Android Scoped Storage (`content://media/external/file/...`) cross-origin restrictions by engineering a single-file standalone distribution.
- Added a local network Wi-Fi server (`server.js`) listening on `0.0.0.0` for full tablet support with microphone speech recognition.

---

## 2. Technical Stack & Key Components

| Component | Implementation Details |
|---|---|
| **Frontend UI** | HTML5, CSS3 Glassmorphism (`backdrop-filter`), SVG Spider-Web Vector, Canvas 2D Visualizers |
| **Fonts** | Google Fonts: `Orbitron`, `Rajdhani`, `Share Tech Mono` |
| **AI Backend** | Groq API (`https://api.groq.com/openai/v1/chat/completions`) using model `groq/compound` (fallback: `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`) |
| **Groq API Key** | Stored in `.env` as `GROQ_API_KEY` (loaded server-side via `dotenv`) |
| **Voice Audio** | Fish Audio: Liam E.V. model (`a2eaac4c2e1040c09be1257675c8c8c8`), plus Brand New Day, Danu, and Klay voice clips |
| **Audio Engine** | Web Audio API `AudioContext` with custom synthesized sci-fi sound effects & frequency analyser |
| **Local Server** | Node.js HTTP server (`server.js`) bound to `0.0.0.0:3000`, auto-detecting Wi-Fi LAN IP |
| **Build Tool** | `build_standalone.js` (compiles CSS, JS, and base64 audio into self-contained `index.html`) |
| **Distribution** | `eve_spiderman_hud.zip` (clean cross-platform forward-slash archive) |

---

## 3. Solved Challenges & Solutions

### A. Android `content://` URI Scoped Storage Issue
- **Problem**: When `index.html` is opened directly from Android file managers/downloads, Chrome loads it via `content://media/external/file/<id>`. In this sandbox, Chrome cannot resolve relative paths (`./style.css`, `./app.js`, `./audio/ev_liam.mp3`), rendering the page unstyled with broken JavaScript.
- **Solution**: Built `build_standalone.js` to inline all CSS inside `<style>`, all JavaScript inside `<script>`, and embed audio files as base64 data URIs. `index.html` is now 100% self-contained.

### B. Tablet Viewport & Responsive Scaling
- **Problem**: Fixed pixel widths (440px core) and a restrictive `@media (max-width: 992px)` breakpoint caused tablets (typical CSS widths 800px–1024px) to collapse into a single-column layout.
- **Solution**: Removed artificial hardware bezels, implemented `100dvh` edge-to-edge scaling, responsive `clamp()` typography, fluid 3-column layout down to 700px, and dynamic scaling for the holographic arc reactor (`min(44vh, 32vw)`). Added portrait-mode fallback stacking.

### C. Android Microphone Security Policy
- **Problem**: Chrome on Android blocks the microphone on local `file:///` and `content://` protocols.
- **Solution**:
  - Direct file mode automatically opens the high-tech keyboard transmission dialog when mic is clicked.
  - Running `node server.js` provides an HTTP LAN origin (`http://192.168.0.9:3000`) where Chrome grants full microphone permissions.

---

## 4. File Manifest

```
C:\Test Projects\jarvis\
├── index.html                  # 100% Self-contained standalone HUD (inlined CSS/JS/audio, 1.05 MB)
├── style.css                   # Modular stylesheet (fluid 3-column HUD, cyber animations)
├── app.js                      # Modular application script (Groq client, voice, visualizers)
├── server.js                   # Node.js server (0.0.0.0 binding, LAN IP output, /api/chat proxy)
├── build_standalone.js         # Build script to generate inlined index.html from source files
├── eve_spiderman_hud.zip       # Cross-platform ZIP archive for tablet transfer (3.02 MB)
├── Ev.png                      # Original interface mockup image
├── audio/                      # Voice samples
│   ├── ev_liam.mp3             # Fish Audio Liam E.V. model sample
│   ├── ev_brand_new_day.mp3    # Spider-Man Brand New Day baseline rebalancing clip
│   ├── ev_danu_anomalies.mp3   # Physical anomaly detection clip
│   └── ev_klay_anomalies.mp3   # Heightened senses & peak abilities clip
├── HOW_TO_USE_ON_ANDROID.txt   # Step-by-step setup guide for Android tablets
├── README.md                   # System documentation & feature breakdown
└── CONTEXT.md                  # Project context checkpoint (this file)
```

---

## 5. Usage Reference

- **To run on PC**:
  ```bash
  node server.js
  ```
  Open `http://localhost:3000`.

- **To run on Android Tablet over Wi-Fi**:
  With `node server.js` running on PC, open `http://192.168.0.9:3000` in Chrome on the tablet.

- **To run standalone on Tablet**:
  Copy `index.html` to tablet, open in Google Chrome.

- **To rebuild after modifying style.css or app.js**:
  ```bash
  node build_standalone.js
  ```
