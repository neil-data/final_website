import logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

from agents import ask_copilot, reset_conversation
from incident import SCRIPTED_INCIDENT, DEMO_QUERY, FOLLOWUP_QUERY

print("\n" + "="*50)
print("MULTI-AGENT TRAFFIC CO-PILOT — LIVE TEST")
print("="*50)
print(SCRIPTED_INCIDENT)

print("\n--- OFFICER QUERY 1 ---")
result = ask_copilot(DEMO_QUERY, SCRIPTED_INCIDENT)

sev = result["severity"]
pred = result["predictions"]
cmd = result["command"]

print(f"\n[SEVERITY]  {sev.get('severity')} (score: {sev.get('severity_score')}/100)")
print(f"[REASONING] {sev.get('reasoning')}")
print(f"[RISKS]     {sev.get('risk_factors')}")
print(f"[CLEARANCE] {sev.get('estimated_clearance_minutes')} minutes estimated")

print(f"\n[CASCADE RISK]  {pred.get('cascade_risk')}")
print(f"[PREEMPTIVE]    {pred.get('recommended_preemptive_action')}")
for p in pred.get("predictions", []):
    print(f"[PREDICTION]    {p.get('intersection')} → {p.get('predicted_speed_kmh')} km/h in {p.get('time_to_congest_minutes')} min ({p.get('confidence_percent')}% confidence)")

print(f"\n[CHAIN OF THOUGHT]\n{cmd.get('chain_of_thought')}")
print(f"\n[SIGNAL]    {cmd.get('signal_retiming')}")
print(f"[DIVERSION] {cmd.get('diversion_route')}")
print(f"[ALERT]     {cmd.get('public_alert')}")
print(f"[NARRATIVE] {cmd.get('narrative')}")
print(f"[CONFIDENCE] {cmd.get('confidence_percent')}%")
print(f"[NEXT REVIEW] in {cmd.get('next_review_minutes')} minutes")

print("\n--- IMPACT ---")
print(f"Pipeline time:  {result['pipeline_seconds']} seconds")
print(f"Manual time:    {result['manual_seconds']} seconds")
print(f"Time saved:     {result['time_saved_minutes']} minutes faster")
