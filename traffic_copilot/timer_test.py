from llm import ask_claude, reset_conversation
from incident import SCRIPTED_INCIDENT, DEMO_QUERY, FOLLOWUP_QUERY

print("=== FINALS DEMO — LIVE INCIDENT ===")
print(SCRIPTED_INCIDENT)

print("\n[OFFICER] Query 1...")
result = ask_claude(DEMO_QUERY, SCRIPTED_INCIDENT)

print("\nSIGNAL:", result.get("signal_retiming"))
print("DIVERSION:", result.get("diversion_route"))
print("ALERT:", result.get("public_alert"))
print("NARRATIVE:", result.get("narrative"))

print("\n--- IMPACT NUMBERS ---")
print(f"AI response time:     {result.get('ai_response_seconds')} seconds")
print(f"Manual officer time:  {result.get('manual_response_seconds')} seconds (8 minutes)")
print(f"Time saved:           {result.get('time_saved_seconds')} seconds")
print(f"                      ({result.get('time_saved_minutes')} minutes faster)")
