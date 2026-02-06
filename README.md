# CrisisAvert: AI-Agentic Command Center

**CrisisAvert** is a futuristic, voice-enabled Crisis Management Dashboard powered by Agentic AI. It simulates an "Oracle" (Backend Intelligence) that monitors real-time data, assesses threats (Fire, Flood, Earthquake), and orchestrates responses via "The Hand" (React Frontend).

![CrisisAvert Dashboard](https://via.placeholder.com/800x450?text=CrisisAvert+Dashboard+Preview)

## 🚀 Key Features

-   **🧠 The Oracle (AI Brain)**: A Node.js service that simulates cognitive reasoning. It "thinks" through problems using a Chain-of-Thought process.
-   **🗣️ Voice Interface**: Full Audio-Visual experience. The agent *speaks* critical alerts and Phase transitions.
-   **🎙️ Voice Command**: Control the simulation with your voice (e.g., *"Activate Fire Protocol"*).
-   **🌍 Geospatial Intelligence**: Visualizes impact zones (radius/polygons) on a live Satellite Map.
-   **🔔 Multi-Channel Alerting**: Simulates sending SMS/Radio triggers to first responders during CRITICAL events.

## 🛠️ Architecture

-   **Frontend (`/client`)**: React, Vite, TailwindCSS, Socket.io-client, Google Maps API, Web Speech API.
-   **Backend (`/server`)**: Node.js, Express, Socket.io, Google Gemini SDK (AI Reasoning), MCP (Model Context Protocol).

## ⚡ Quick Start

### 1. Prerequisites
-   Node.js (v18+)
-   Google Maps API Key (for the map)
-   (Optional) Google Gemini API Key (for real AI reasoning)

### 2. Installation

```bash
# Clone the repository
git clone <repo-url>
cd CrisisAvert

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 3. Configuration

Create a `.env` file in `/server`:
```env
PORT=3005
GEMINI_API_KEY=your_key_here  # Optional: Defaults to Mock AI if missing
ZERO_RETENTION=false          # Set true for HIPAA/Privacy Mode
```

Create a `.env` file in `/client`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 4. Running the Agent

You need two terminals:

**Terminal 1 (The Oracle):**
```bash
cd server
npm start
# Runs on Port 3005
```

**Terminal 2 (The Hand):**
```bash
cd client
npm run dev
# Open http://localhost:5173
```

## 🎮 Simulation Controls

### Manual Injection
Use the **Simulation Control Panel** on the left to inject threats:
-   **[🔥 FIRE]**: Triggers a Wildfire scenario in Uttarakhand.
-   **[🌊 FLOOD]**: Triggers a Flood scenario in Kerala.
-   **[🏜️ QUAKE]**: Triggers an Earthquake in Himachal.

### Voice Commands 🎙️
1.  Click the **Mic Icon** (Top right).
2.  Say:
    -   *"Activate Fire Protocol"*
    -   *"Inject Flood"*
    -   *"Silence"* (Mute audio)
    -   *"Audio On"* (Unmute)

## 🔒 Privacy (Zero Retention)
To comply with data privacy standards (e.g., HIPAA), set `ZERO_RETENTION=true` in `server/.env`. This ensures that:
-   Intel feeds and Reasoning logs are scrubbed immediately after processing.
-   No historical data is persisted to disk.

---
## ☁️ Deployment

### Frontend (Vercel)
1.  Push this repo to GitHub.
2.  Import the project into Vercel.
3.  Set Root Directory to `CrisisAvert/client`.
4.  Add Environment Variable: `VITE_GOOGLE_MAPS_API_KEY`.
5.  Deploy!

### Backend (Railway/Render)
1.  Import the project into Railway.
2.  Set Root Directory to `CrisisAvert/server`.
3.  Add Environment Variables: `GEMINI_API_KEY`, `ZERO_RETENTION`.
4.  Deploy!

### Connectivity
-   Update `client/src/components/Dashboard.jsx` to point to the deployed Backend URL (`https://your-backend.railway.app`) instead of `localhost:3005`.

---
*Built as a demo for Advanced Agentic Coding.*
