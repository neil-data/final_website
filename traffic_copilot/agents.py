import os
import time
import json
import logging
import traceback
from dotenv import load_dotenv
from groq import Groq
from routing import get_diversion

load_dotenv()

# Configure detailed logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

# Debug: Check if API key is loaded
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    log.error("GROQ_API_KEY not found in environment!")
else:
    log.info(f"GROQ_API_KEY loaded: {api_key[:20]}...")

client = Groq(api_key=api_key)

MANUAL_OFFICER_TIME = 480

def _call_groq(system_prompt, user_message, max_tokens=1000):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        max_tokens=max_tokens,
        temperature=0.2
    )
    return response.choices[0].message.content

def _clean_json(text):
    """Extract and clean JSON from text response"""
    cleaned = text.strip()
    
    # Try to find JSON block if surrounded by other text
    if '```json' in cleaned:
        start = cleaned.find('```json') + 7
        end = cleaned.find('```', start)
        cleaned = cleaned[start:end]
    elif '```' in cleaned:
        start = cleaned.find('```') + 3
        end = cleaned.find('```', start)
        cleaned = cleaned[start:end]
    
    # Remove markdown code fences
    cleaned = cleaned.strip()
    cleaned = cleaned.replace('```', '')
    
    # Try to extract JSON object if there's extra text
    if '{' in cleaned and '}' in cleaned:
        start = cleaned.find('{')
        # Find matching closing brace
        brace_count = 0
        end = -1
        for i in range(start, len(cleaned)):
            if cleaned[i] == '{':
                brace_count += 1
            elif cleaned[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        if end > -1:
            cleaned = cleaned[start:end]
    
    return cleaned.strip()

SEVERITY_PROMPT = """
You are a traffic incident severity classifier.
You analyze raw traffic speed data and classify the incident.

Respond in this exact JSON format only:
{
  "severity": "CRITICAL or HIGH or MEDIUM or LOW",
  "severity_score": 0-100,
  "reasoning": "step by step explanation of why this severity was chosen",
  "affected_intersections": ["list", "of", "affected", "intersections"],
  "estimated_clearance_minutes": 0,
  "risk_factors": ["list", "of", "risk", "factors"]
}

Severity rules:
- CRITICAL: speed < 5 km/h, multiple intersections blocked, major route affected
- HIGH: speed 5-15 km/h, one intersection blocked, alternate routes congesting
- MEDIUM: speed 15-25 km/h, slowdown but traffic moving
- LOW: speed 25-35 km/h, minor delay, self-resolving likely
"""

PREDICTOR_PROMPT = """
You are a traffic congestion prediction specialist.
You analyze current speed trends and predict which roads will congest next.

Respond in this exact JSON format only:
{
  "predictions": [
    {
      "intersection": "exact intersection name",
      "current_speed_kmh": 0,
      "predicted_speed_kmh": 0,
      "time_to_congest_minutes": 0,
      "confidence_percent": 0,
      "reason": "why this road will congest"
    }
  ],
  "cascade_risk": "HIGH or MEDIUM or LOW",
  "recommended_preemptive_action": "specific action to take now before congestion spreads"
}
"""

SIGNAL_PROMPT = """
You are a traffic signal optimization specialist.
You receive a list of affected intersections from a live incident.
Your job is to calculate exact signal phase changes to reduce congestion.

Respond in this exact JSON format only:
{
  "signal_changes": [
    {
      "intersection": "exact intersection name",
      "current_phase_seconds": 0,
      "recommended_phase_seconds": 0,
      "direction_to_extend": "northbound or southbound or eastbound or westbound",
      "reason": "why this change helps"
    }
  ],
  "priority_corridor": "which direction to green-wave traffic through",
  "estimated_clearance_improvement_minutes": 0
}
"""

conversation_history = []

def run_severity_classifier(traffic_data):
    log.info("[AGENT 1] Running severity classifier...")
    start = time.time()
    try:
        reply = _call_groq(SEVERITY_PROMPT, f"Traffic data:\n{traffic_data}", max_tokens=800)
        result = json.loads(_clean_json(reply))
        result["agent"] = "severity_classifier"
        result["response_seconds"] = round(time.time() - start, 2)
        log.info(f"[AGENT 1] Severity: {result.get('severity')} — score: {result.get('severity_score')} ({result['response_seconds']}s)")
        return result
    except Exception as e:
        log.error(f"[AGENT 1] Failed: {e}")
        log.error(traceback.format_exc())
        return {
            "severity": "HIGH",
            "severity_score": 70,
            "reasoning": "Classifier unavailable — defaulting to HIGH",
            "affected_intersections": [],
            "estimated_clearance_minutes": 15,
            "risk_factors": ["Classifier error"],
            "agent": "severity_classifier",
            "response_seconds": round(time.time() - start, 2)
        }

def run_predictor(traffic_data):
    log.info("[AGENT 2] Running congestion predictor...")
    start = time.time()
    try:
        reply = _call_groq(PREDICTOR_PROMPT, f"Traffic data:\n{traffic_data}", max_tokens=800)
        result = json.loads(_clean_json(reply))
        result["agent"] = "predictor"
        result["response_seconds"] = round(time.time() - start, 2)
        log.info(f"[AGENT 2] Cascade risk: {result.get('cascade_risk')} ({result['response_seconds']}s)")
        return result
    except Exception as e:
        log.error(f"[AGENT 2] Failed: {e}")
        log.error(traceback.format_exc())
        return {
            "predictions": [],
            "cascade_risk": "MEDIUM",
            "recommended_preemptive_action": "Monitor adjacent roads closely",
            "agent": "predictor",
            "response_seconds": round(time.time() - start, 2)
        }

def run_signal_agent(traffic_data, severity_result):
    log.info("[AGENT 4] Running signal optimizer...")
    start = time.time()
    try:
        intersections = severity_result.get("affected_intersections", [])
        message = f"""
Traffic data:
{traffic_data}

Affected intersections:
{json.dumps(intersections, indent=2)}

Severity: {severity_result.get('severity')}
Estimated clearance: {severity_result.get('estimated_clearance_minutes')} minutes
"""
        reply = _call_groq(SIGNAL_PROMPT, message, max_tokens=800)
        result = json.loads(_clean_json(reply))
        result["agent"] = "signal_optimizer"
        result["response_seconds"] = round(time.time() - start, 2)
        log.info(f"[AGENT 4] Done ({result['response_seconds']}s)")
        return result
    except Exception as e:
        log.error(f"[AGENT 4] Failed: {e}")
        log.error(traceback.format_exc())
        return {
            "signal_changes": [],
            "priority_corridor": "Unable to calculate",
            "estimated_clearance_improvement_minutes": 0,
            "agent": "signal_optimizer",
            "response_seconds": round(time.time() - start, 2)
        }

def run_command_ai(officer_query, traffic_data, severity_result, predictor_result):
    log.info("[AGENT 3] Running command AI...")
    start = time.time()

    # Simplified prompt to get direct text response
    SIMPLE_COMMAND_PROMPT = """
You are an NYC traffic incident commander. Analyze the situation and provide a brief action plan.
Keep response to 2-3 short sentences. Be direct and actionable.
Do NOT include JSON or markdown - just plain text response.
"""

    diversion = get_diversion(
        origin_lat=40.7484,
        origin_lon=-73.9967,
        dest_lat=40.7580,
        dest_lon=-73.9855
    )

    enriched_message = f"""
Officer query: {officer_query}

Severity: {severity_result.get('severity')} (score: {severity_result.get('severity_score')}/100)
Affected areas: {', '.join(severity_result.get('affected_intersections', ['TBD']))}
Clearance time: {severity_result.get('estimated_clearance_minutes')} minutes
Risk factors: {', '.join(severity_result.get('risk_factors', ['unknown']))}

Cascade risk: {predictor_result.get('cascade_risk')}
Preemptive action: {predictor_result.get('recommended_preemptive_action')}

Provide the command brief:
"""

    try:
        log.info(f"[AGENT 3] Sending to Groq...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SIMPLE_COMMAND_PROMPT},
                {"role": "user", "content": enriched_message}
            ],
            max_tokens=500,
            temperature=0.2
        )
        
        narrative_text = response.choices[0].message.content.strip()
        log.info(f"[AGENT 3] Got response: {narrative_text[:200]}")
        
        # Build structured response from the narrative
        result = {
            "chain_of_thought": f"Incident severity {severity_result.get('severity')} — Cascade risk {predictor_result.get('cascade_risk')}",
            "signal_retiming": "Prioritize main arterial streets — extend green phase on diversion routes",
            "diversion_route": f"{diversion.get('summary', 'Route via alternate streets')}",
            "public_alert": {
                "vms": f"INCIDENT\n{severity_result.get('severity')}\nSEE ALTERNATE ROUTE",
                "radio": f"Traffic incident {severity_result.get('severity')}. {narrative_text[:100]}",
                "social": narrative_text[:280]
            },
            "narrative": narrative_text,
            "confidence_percent": severity_result.get('severity_score', 70),
            "next_review_minutes": 5,
            "agent": "command_ai",
            "response_seconds": round(time.time() - start, 2)
        }
        
        log.info(f"[AGENT 3] Done ({result['response_seconds']}s)")
        return result
        
    except Exception as e:
        log.error(f"[AGENT 3] ERROR: {e}")
        log.error(traceback.format_exc())
        
        # Return a proper response even if Groq fails
        return {
            "chain_of_thought": f"Severity {severity_result.get('severity')} — risk {predictor_result.get('cascade_risk')}",
            "signal_retiming": "Activate coordinated signal progression on main routes",
            "diversion_route": f"{diversion.get('summary', 'Route via 8th Ave / 6th Ave')}",
            "public_alert": {
                "vms": f"INCIDENT\n{severity_result.get('severity')}\nUSE ALT ROUTE",
                "radio": f"Traffic incident reported. {severity_result.get('reasoning', 'Follow officer directions')}",
                "social": f"Traffic alert: {severity_result.get('severity')} incident impacting {', '.join(severity_result.get('affected_intersections', ['area']))}."
            },
            "narrative": f"{severity_result.get('reasoning', 'Incident detected')} Estimated clearance: {severity_result.get('estimated_clearance_minutes', 15)} minutes.",
            "confidence_percent": severity_result.get('severity_score', 70),
            "next_review_minutes": 3,
            "agent": "command_ai",
            "response_seconds": round(time.time() - start, 2)
        }

def ask_copilot(officer_query, traffic_data):
    log.info("=== MULTI-AGENT PIPELINE STARTED ===")
    pipeline_start = time.time()

    severity  = run_severity_classifier(traffic_data)
    predictor = run_predictor(traffic_data)
    signal    = run_signal_agent(traffic_data, severity)
    command   = run_command_ai(officer_query, traffic_data, severity, predictor)

    total_time = round(time.time() - pipeline_start, 2)
    time_saved = round(MANUAL_OFFICER_TIME - total_time, 2)

    return {
        "severity":           severity,
        "predictions":        predictor,
        "signal":             signal,
        "command":            command,
        "pipeline_seconds":   total_time,
        "manual_seconds":     MANUAL_OFFICER_TIME,
        "time_saved_seconds": time_saved,
        "time_saved_minutes": round(time_saved / 60, 1)
    }

def reset_conversation():
    conversation_history.clear()
    log.info("Conversation reset")