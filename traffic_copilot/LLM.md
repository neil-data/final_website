# Traffic Incident Co-Pilot — LLM Module

AI-powered incident command assistant for traffic control officers.

## What this module does
- Ingests live traffic speed data every 5 seconds
- Generates 4 real-time outputs per officer query:
  - Signal re-timing (exact intersections + durations)
  - Diversion route (exact streets + activation sequence)
  - Public alert (copy-paste ready for radio/signs)
  - Incident narrative (2-3 sentence officer briefing)
- Maintains multi-turn conversation memory across the incident
- Measures AI response time vs manual coordination time

## Impact
- AI response time: ~2 seconds
- Manual officer time: ~8 minutes
- Time saved per incident: ~477 seconds

## Tech stack
- LLM: Groq API (llama-3.3-70b-versatile)
- Data: pandas CSV replay loop
- Threading: Python threading module
- Environment: python-dotenv

## File structure
traffic_copilot/
├── llm.py            # Core LLM brain
├── data_pipeline.py  # Live data feed (5 sec intervals)
├── incident.py       # Scripted demo incident
├── traffic_data.csv  # Simulated NYC traffic data
├── test.py           # Basic test
├── live_test.py      # Full system test
└── timer_test.py     # Finals demo test

## Setup
pip install groq pandas python-dotenv

Add GROQ_API_KEY to .env file

## Usage
from llm import ask_claude, reset_conversation
from data_pipeline import start_pipeline, get_latest_traffic

start_pipeline()
traffic = get_latest_traffic()
result = ask_claude("What should I do right now?", traffic)
print(result["narrative"])
print(result["signal_retiming"])
print(result["diversion_route"])
print(result["public_alert"])
```

Save it.

---

Your entire LLM module is now complete. Final structure:
```
traffic_copilot/
├── .env              ✓ API key
├── .gitignore        ✓ protected
├── llm.py            ✓ bulletproof brain
├── incident.py       ✓ scripted demo
├── data_pipeline.py  ✓ live feed
├── traffic_data.csv  ✓ simulated data
├── test.py           ✓ basic test
├── live_test.py      ✓ full system test
├── timer_test.py     ✓ finals demo
└── README.md         ✓ GitHub ready