import time
import logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

from data_pipeline import start_pipeline, get_latest_traffic
from agents import ask_copilot, reset_conversation

print("[SYSTEM] Starting multi-agent traffic co-pilot...")
start_pipeline()

time.sleep(2)

# --- TURN 1 ---
print("\n[SYSTEM] First officer query...")
traffic = get_latest_traffic()
print("\nCurrent data:\n", traffic)

print("\n--- AGENT PIPELINE RUNNING ---")
result = ask_copilot("What should I do right now?", traffic)

sev = result["severity"]
pred = result["predictions"]
cmd = result["command"]

print(f"\n[SEVERITY]   {sev.get('severity')} (score: {sev.get('severity_score')}/100)")
print(f"[REASONING]  {sev.get('reasoning')}")
print(f"[RISKS]      {sev.get('risk_factors')}")
print(f"[CLEARANCE]  {sev.get('estimated_clearance_minutes')} minutes estimated")

print(f"\n[CASCADE RISK]  {pred.get('cascade_risk')}")
print(f"[PREEMPTIVE]    {pred.get('recommended_preemptive_action')}")
for p in pred.get("predictions", []):
    print(f"[PREDICTION]    {p.get('intersection')} → {p.get('predicted_speed_kmh')} km/h in {p.get('time_to_congest_minutes')} min ({p.get('confidence_percent')}% confidence)")

print(f"\n[CHAIN OF THOUGHT]\n{cmd.get('chain_of_thought')}")
print(f"\n[SIGNAL]     {cmd.get('signal_retiming')}")
print(f"[DIVERSION]  {cmd.get('diversion_route')}")
print(f"[ALERT]      {cmd.get('public_alert')}")
print(f"[NARRATIVE]  {cmd.get('narrative')}")
print(f"[CONFIDENCE] {cmd.get('confidence_percent')}%")
print(f"[NEXT REVIEW] in {cmd.get('next_review_minutes')} minutes")

print(f"\n[IMPACT] Pipeline time: {result['pipeline_seconds']}s — saved {result['time_saved_minutes']} minutes vs manual")

# --- WAIT FOR DATA UPDATE ---
print("\n[SYSTEM] Waiting 10 seconds for data to update...")
time.sleep(10)

# --- TURN 2 ---
print("\n[SYSTEM] Follow up query...")
traffic = get_latest_traffic()
print("\nUpdated data:\n", traffic)

print("\n--- AGENT PIPELINE RUNNING ---")
result2 = ask_copilot("Is the situation improving? Should I adjust anything?", traffic)

sev2 = result2["severity"]
cmd2 = result2["command"]

print(f"\n[SEVERITY]   {sev2.get('severity')} (score: {sev2.get('severity_score')}/100)")
print(f"\n[CHAIN OF THOUGHT]\n{cmd2.get('chain_of_thought')}")
print(f"\n[SIGNAL]     {cmd2.get('signal_retiming')}")
print(f"[DIVERSION]  {cmd2.get('diversion_route')}")
print(f"[ALERT]      {cmd2.get('public_alert')}")
print(f"[NARRATIVE]  {cmd2.get('narrative')}")
print(f"[CONFIDENCE] {cmd2.get('confidence_percent')}%")
print(f"[NEXT REVIEW] in {cmd2.get('next_review_minutes')} minutes")

print(f"\n[IMPACT] Pipeline time: {result2['pipeline_seconds']}s — saved {result2['time_saved_minutes']} minutes vs manual")

print("\n[SYSTEM] Done.")
