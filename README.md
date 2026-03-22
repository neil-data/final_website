<div align="center">

# 🚦 TrafficMind AI

### LLM Co-Pilot for Traffic Incident Command

> Upload live sensor feeds → Get *AI-powered signal re-timing, diversion routes, public alert drafts & conversational incident queries* — all in real time. No manual synthesis. No cognitive overload. Just smarter command decisions.

✅ Interactive demo running on Streamlit Cloud  

<br/>

[![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white)](https://streamlit.io/)
[![Claude](https://img.shields.io/badge/Claude%20Sonnet%204.6-6B4FBB?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Python](https://img.shields.io/badge/Python%203.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Folium](https://img.shields.io/badge/Folium%20Maps-77B829?style=for-the-badge&logo=leaflet&logoColor=white)](https://python-visualization.github.io/folium/)
[![OSMnx](https://img.shields.io/badge/OSMnx%20%2B%20NetworkX-0064A4?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://osmnx.readthedocs.io/)
[![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/)

<br/>

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![Track](https://img.shields.io/badge/Track-Smart%20Transportation-0064A4?style=flat-square)
![Problem](https://img.shields.io/badge/Problem%20Statement-3-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange?style=flat-square)

<br/>

</div>

---

## The Problem

When a major accident strikes, traffic control officers are drowning in fragmented information — radio calls, sensor feeds, camera streams, and city maps — all at once, under extreme time pressure.

- *No integrated view* — sensor data, incident reports, and road information live in separate systems that don't communicate with each other
- *Manual decision-making* — signal re-timing and diversion routes are chosen from experience alone, with zero computational support
- *Hand-drafted alerts* — public messages for variable signs, radio, and social media are written manually during the most chaotic moments
- *Every minute matters* — response delay means longer clearance times, more secondary accidents, and measurable economic loss

The question isn't whether better tools would help — they clearly would. The question is whether an LLM can ingest live feeds and reason across them fast enough to be *genuinely useful under pressure*.

> *TrafficMind AI answers that question with a yes.*

---

## What It Builds

TrafficMind AI is an *LLM-powered incident co-pilot* that ingests live traffic feeds and generates four types of real-time intelligence in natural language:


📡 Live Traffic Feed
        │
        ├── 🚦 Signal Re-Timing Suggestions
        │       └── Named intersections · Exact phase duration changes · Priority corridors
        │
        ├── 🗺️  Diversion Route Recommendations
        │       └── Activation sequence · Estimated traffic redistribution · A* optimal paths
        │
        ├── 📢 Ready-to-Publish Public Alerts
        │       └── Variable message signs · Radio broadcast scripts · Social media posts
        │
        └── 💬 Conversational Incident Narrative
                └── 'Is it safe to open the southbound lane now?'
                    'What's the estimated clearance time?'
                    'Which route has the least secondary risk?'


*The officer stays in command. The AI handles the cognitive load.*

---

## System Architecture

mermaid
flowchart TD
    A("🚗 Live Traffic Feed\nNYC Speed CSV") -->|"5-second replay intervals"| B("📊 Feed Simulator\nPandas + Threading")
    B -->|"Speed, flow, congestion"| C("⚛️ Streamlit Dashboard\nMap · Sidebar · Chat")
    C -->|"Incident trigger"| D("🧠 Incident Prompt Builder\nStructured context assembly")
    D -->|"Prompt + feed snapshot"| E("🤖 Claude Sonnet 4.6\nAnthropics Python SDK")
    E -->|"Signal suggestions"| F("🚦 Signal Re-Timing Panel")
    E -->|"Route alternatives"| G("🗺️ Diversion Overlay\nFolium + streamlit-folium")
    E -->|"Alert drafts"| H("📢 Public Alert Generator")
    E -->|"Multi-turn answers"| I("💬 Conversational Query\nIncident Narrative")
    J("🌐 OSMnx Graph\nReal Street Names") -->|"Road network"| K("🔀 A* Router\nNetworkX")
    K -->|"Optimal diversion paths"| G
    G --> C

    style A fill:#E53935,color:#fff,stroke:#B71C1C
    style B fill:#FB8C00,color:#fff,stroke:#E65100
    style C fill:#1E88E5,color:#fff,stroke:#0D47A1
    style D fill:#5E35B1,color:#fff,stroke:#311B92
    style E fill:#6B4FBB,color:#fff,stroke:#4527A0
    style F fill:#E53935,color:#fff,stroke:#B71C1C
    style G fill:#43A047,color:#fff,stroke:#1B5E20
    style H fill:#00897B,color:#fff,stroke:#004D40
    style I fill:#3949AB,color:#fff,stroke:#1A237E
    style J fill:#6D4C41,color:#fff,stroke:#3E2723
    style K fill:#546E7A,color:#fff,stroke:#263238


---

## Data Flow

mermaid
sequenceDiagram
    actor Officer
    participant UI as 🖥️ Streamlit UI
    participant Feed as 📡 Feed Simulator
    participant OSM as 🌐 OSMnx + NetworkX
    participant LLM as 🤖 Claude Sonnet 4.6

    Feed->>UI: Stream NYC speed data (every 5 sec)
    UI->>UI: Render speed-coloured road segments on Folium map
    Officer->>UI: Flag incident location on map
    UI->>OSM: Request real road names + graph
    OSM-->>UI: Street-level graph with weights
    UI->>OSM: Run A* routing for diversion paths
    OSM-->>UI: Optimal diversion routes
    UI->>LLM: POST structured prompt (incident + feed snapshot + routes)
    LLM-->>UI: Signal re-timing · Diversion plan · Alert drafts
    UI-->>Officer: Render all four intelligence panels
    Officer->>UI: 'Is it safe to open the southbound lane now?'
    UI->>LLM: Multi-turn conversational query
    LLM-->>UI: Natural language answer with context
    UI-->>Officer: Incident narrative response


---

## ML & AI Pipeline

TrafficMind AI is not a generic chatbot wrapper. It is a *structured incident reasoning system* that combines real-time data simulation, graph-based routing, and multi-turn LLM inference.

### Feed Simulation Layer

| Component | Technology | Role |
|:----------|:-----------|:-----|
| *Speed Replay* | Pandas CSV reader | Loads NYC traffic speed dataset, replays at 5-second intervals |
| *Threading* | Python threading | Non-blocking background feed ingestion |
| *Congestion Scoring* | Computed speed ratios | Flags segments below threshold as incident-critical |

### Map & Routing Layer

| Component | Technology | Role |
|:----------|:-----------|:-----|
| *Road Graph* | OSMnx | Downloads real OpenStreetMap street network with actual intersection names |
| *Diversion Routing* | NetworkX A\* | Computes optimal bypass routes weighted by current congestion |
| *Map Render* | Folium + streamlit-folium | Speed-coloured road segments + diversion overlays on interactive map |

### LLM Inference Layer


Incident Context Assembly
        │
        ├── Current congestion snapshot (top N blocked segments)
        ├── Affected intersections (real OSM names)
        ├── Computed diversion route options (A* outputs)
        ├── Weather / time-of-day context
        └── Officer's conversational history (multi-turn)
                │
                ▼
        Claude Sonnet 4.6 (Anthropic Python SDK)
                │
        ┌───────┼───────┬────────────┐
        ▼       ▼       ▼            ▼
   Signal   Diversion  Alert     Incident
   Re-timing  Routes   Drafts    Narrative


*Prompt engineering strategy:* Each inference call sends a structured system prompt encoding the officer's role, incident severity, available road context, and prior recommendations — enabling coherent multi-turn reasoning across the full incident lifecycle.

---

## Features

### Intelligence Panels

| Panel | Output |
|:------|:-------|
| *Signal Re-Timing* | Named intersections + recommended phase duration changes (e.g., "Extend green on 5th Ave North by 25 sec") |
| *Diversion Routes* | Step-by-step activation sequence with estimated % traffic redistribution per route |
| *Public Alert Drafts* | Three ready-to-publish formats: variable message sign (140 chars), radio script, social media post |
| *Incident Narrative* | Conversational Q&A — officers query the live incident state in plain English |

### Platform Capabilities


✅  Real-time NYC traffic speed feed replayed at 5-second intervals
✅  Speed-coloured interactive Folium map with congestion overlays
✅  Real street names from OSMnx OpenStreetMap graph download
✅  A* optimal diversion routing via NetworkX
✅  Structured incident prompt with full feed snapshot context
✅  Multi-turn conversational incident query (session state preserved)
✅  Three-format public alert generation per incident
✅  Signal phase recommendations with named intersection targets
✅  Streamlit sidebar + chat panel layout — no context switching
✅  Stateless, deployable on any Python 3.10+ environment


---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| *Dashboard* | Streamlit (Python) | Renders map, sidebar, and chat panel in a unified incident command view |
| *Map Layer* | Folium + streamlit-folium | Speed-coloured road segments · diversion route overlays · interactive incident flagging |
| *Road Network* | OSMnx | Downloads real OpenStreetMap graph with actual street names and intersection topology |
| *Routing Engine* | NetworkX (A\* algorithm) | Computes optimal diversion paths weighted by live congestion |
| *Feed Simulation* | Pandas + Python threading | Replays NYC traffic speed CSV at 5-second intervals in background thread |
| *LLM Layer* | Anthropic Python SDK (claude-sonnet-4-6) | Structured incident prompt + multi-turn conversational queries |

---

## Project Structure


trafficmind-ai/
│
├── 📄 app.py                        # Streamlit entry point — layout, session state, render loop
│
├── 📂 feed/
│   ├── 📄 simulator.py              # Pandas CSV reader + threading-based 5-sec replay engine
│   └── 📄 nyc_speed_data.csv        # NYC traffic speed dataset (source feed)
│
├── 📂 map/
│   ├── 📄 road_graph.py             # OSMnx graph download + caching
│   ├── 📄 router.py                 # NetworkX A* diversion routing
│   └── 📄 folium_renderer.py        # Speed-coloured segments + diversion overlay builder
│
├── 📂 llm/
│   ├── 📄 prompt_builder.py         # Structures incident context into Claude prompt
│   ├── 📄 claude_client.py          # Anthropic SDK wrapper — single + multi-turn inference
│   └── 📄 response_parser.py        # Extracts signal / diversion / alert / narrative blocks
│
├── 📂 components/
│   ├── 📄 signal_panel.py           # Streamlit component — signal re-timing display
│   ├── 📄 diversion_panel.py        # Streamlit component — route activation sequence
│   ├── 📄 alert_panel.py            # Streamlit component — three-format alert drafts
│   └── 📄 chat_panel.py             # Streamlit component — conversational incident Q&A
│
├── 📄 requirements.txt
└── 📄 .env.example


---

## Quick Start

### Prerequisites

- [Python 3.10+](https://python.org/)
- [Anthropic API Key](https://console.anthropic.com/)
- Internet connection (OSMnx downloads road graph on first run)

---

### 1️⃣ Clone the Repository

bash
git clone https://github.com/your-org/trafficmind-ai.git
cd trafficmind-ai


---

### 2️⃣ Install Dependencies

bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt


---

### 3️⃣ Configure Environment

bash
cp .env.example .env


env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CITY=Manhattan, New York, USA       # OSMnx graph target city
FEED_INTERVAL_SEC=5                 # Speed data replay interval
CONGESTION_THRESHOLD=0.4            # Speed ratio below which segment is flagged


---

### 4️⃣ Run the Dashboard

bash
streamlit run app.py
# → Dashboard: http://localhost:8501


---

## API Reference

### Incident Prompt Structure

The LLM is called with a structured prompt assembled from live context:

python
{
  "role": "system",
  "content": """
    You are TrafficMind AI, an incident co-pilot for traffic control officers.
    You have access to live feed data and must produce four outputs:
    1. Signal re-timing — name intersections, specify phase changes in seconds
    2. Diversion routes — activation sequence, estimated redistribution %
    3. Public alerts — VMS (140 chars), radio script, social media post
    4. Incident narrative — answer officer queries conversationally
    Be specific. Be actionable. Prioritise life-safety over throughput.
  """
}


### Example LLM Response

json
{
  "signal_retiming": [
    { "intersection": "5th Ave & 42nd St", "change": "Extend northbound green by 25 sec, suppress eastbound phase" },
    { "intersection": "6th Ave & 34th St", "change": "Add 15 sec pedestrian clearance, reduce southbound green by 10 sec" }
  ],
  "diversion_routes": [
    { "route": "Via 7th Ave → W 57th St → 8th Ave", "sequence": ["Activate at 14:32", "Open barrier at 14:34"], "redistribution": "~35% of southbound volume" },
    { "route": "Via 11th Ave → W 34th St", "sequence": ["Hold until primary fills", "Activate at 14:38"], "redistribution": "~20% overflow" }
  ],
  "alerts": {
    "vms": "ACCIDENT 5TH AVE/42ND ST. USE 7TH AVE. EXPECT 20 MIN DELAY.",
    "radio": "Drivers on 5th Avenue near 42nd Street — a major incident is blocking all southbound lanes. Please divert via 7th Avenue. Expect delays of 20 minutes or more.",
    "social": "🚨 Traffic Alert: Major accident at 5th Ave & 42nd St. All southbound lanes blocked. Divert via 7th Ave or 11th Ave. Delays 20+ min. #NYCTraffic"
  },
  "narrative": "Two southbound lanes remain blocked. The incident vehicle has not yet been cleared. Based on current queue build-up at 34th St, I would not recommend opening the southbound lane for at least 12 more minutes."
}


---

## Example Dashboard Output


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         🚦 TRAFFICMIND AI — INCIDENT COMMAND PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INCIDENT STATUS
──────────────────────────────────────────────────────
  Location      :  5th Ave & 42nd St, Manhattan
  Severity      :  High — Multi-vehicle, all lanes blocked
  Duration      :  14 min since detection
  Feed Lag      :  < 5 seconds

SIGNAL RE-TIMING RECOMMENDATIONS
──────────────────────────────────────────────────────
  🔴  5th Ave & 42nd St   →  Suppress eastbound phase entirely
  🟡  6th Ave & 34th St   →  +15 sec pedestrian clearance
  🟢  7th Ave & 57th St   →  +20 sec northbound green (diversion support)

DIVERSION ROUTES (ACTIVATE IN ORDER)
──────────────────────────────────────────────────────
  Route 1  →  7th Ave → W 57th St → 8th Ave      (~35% volume)
  Route 2  →  11th Ave → W 34th St                (~20% overflow)

PUBLIC ALERT DRAFTS
──────────────────────────────────────────────────────
  VMS     :  ACCIDENT 5TH AVE/42ND. USE 7TH AVE. 20 MIN DELAY.
  Radio   :  Southbound 5th Ave blocked at 42nd. Divert via 7th Ave...
  Social  :  🚨 Major accident 5th Ave & 42nd St. All lanes blocked...

OFFICER QUERY
──────────────────────────────────────────────────────
  Officer  :  "Is it safe to open the southbound lane now?"
  AI       :  "Not yet. Queue extends to 34th St. Recommend waiting
               12 more minutes until the incident vehicle clears."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


---

## Who Uses It

| User | How They Use TrafficMind AI |
|:-----|:----------------------------|
| *Traffic Control Officers* | Real-time incident command — map view, signal recommendations, diversion activation |
| *City Traffic Management Centres* | Centralised monitoring of multiple simultaneous incidents |
| *Public Information Officers* | One-click ready-to-publish alert drafts across all channels |

---

## Why It Matters

Traditional incident management forces officers to mentally synthesise feeds from disconnected systems, draft communications by hand, and make routing decisions from experience alone — all simultaneously, under maximum pressure.

TrafficMind AI doesn't replace the officer. It eliminates the cognitive bottleneck, so the officer can focus on command decisions rather than data synthesis. A working demo can quantify this directly: *specific minutes of response time saved vs manual coordination*, measured against the NYC speed feed replay.

---

## Roadmap

| Status | Feature |
|:------:|:--------|
| ✅ | Live feed simulation — NYC speed CSV at 5-second intervals |
| ✅ | Speed-coloured Folium map with congestion overlays |
| ✅ | OSMnx real street graph + NetworkX A\* diversion routing |
| ✅ | Structured incident prompt with Claude Sonnet 4.6 |
| ✅ | Signal re-timing + diversion + alert + narrative outputs |
| ✅ | Multi-turn conversational incident Q&A |
| 🔜 | Live CCTV frame ingestion (vision model integration) |
| 🔜 | Real-time city sensor API connectors |
| 🔜 | Officer authentication + incident log persistence |
| 🔜 | Multi-incident parallel command view |
| 🔜 | Deployment to city TMC infrastructure |
| 🔜 | Response time benchmarking vs manual baseline |

---

## Contributing

Contributions are always welcome!

bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "feat: add amazing feature"

# 4. Push to your branch
git push origin feature/amazing-feature

# 5. Open a Pull Request 🎉


Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---
## Teammname: Tech Titan


# Teamname & Teamwork:
---
Chidatma Patel: LLM Integration — Groq Llama 3.3 Prompt Eng. & API 
---
---
Devashya Jethva: Backend — Data Pipeline, OSMnx & NetworkX Routing 
---
---
Neil Banerjee: Team Lead & Primary Frontend — Next.js Dashboard & Leaflet Map
---
---
Rajvardhansingh Chauhan: Presentation & Documentation
---
---
Vinayak Agarwal: Supporting Frontend — Streamlit Layout & UI

## License

This project is licensed under the [MIT License](LICENSE).
---

---

<div align="center">

Built for the Smart Transportation Track — Problem Statement 3

*The officer stays in command. The AI handles the cognitive load.*

[![Star on GitHub](https://img.shields.io/github/stars/your-org/trafficmind-ai?style=social)](https://github.com/your-org/trafficmind-ai)

</div>
