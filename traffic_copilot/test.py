from llm import ask_claude, reset_conversation
from incident import SCRIPTED_INCIDENT, DEMO_QUERY, FOLLOWUP_QUERY

print("=== LIVE INCIDENT TRIGGERED ===")
print(SCRIPTED_INCIDENT)

print("\n=== OFFICER QUERY 1 ===")
result1 = ask_claude(DEMO_QUERY, SCRIPTED_INCIDENT)
print("SIGNAL:", result1.get("signal_retiming"))
print("DIVERSION:", result1.get("diversion_route"))
print("ALERT:", result1.get("public_alert"))
print("NARRATIVE:", result1.get("narrative"))

updated_traffic = """
Location: E 34th St and 2nd Ave
Speeds: E 34th St = 14 km/h (improving), 2nd Ave = 18 km/h
Status: 2 cars cleared, 1 truck still blocking right lane
EMS arrived: Scene being managed
Time elapsed: 6 minutes since incident
"""

print("\n=== OFFICER QUERY 2 (Finals demo question) ===")
result2 = ask_claude(FOLLOWUP_QUERY, updated_traffic)
print("SIGNAL:", result2.get("signal_retiming"))
print("DIVERSION:", result2.get("diversion_route"))
print("ALERT:", result2.get("public_alert"))
print("NARRATIVE:", result2.get("narrative"))
