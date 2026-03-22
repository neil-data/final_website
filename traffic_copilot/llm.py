import os
import time
import json
import logging
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

logging.basicConfig(level=logging.INFO, format="[LLM] %(message)s")
log = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an AI co-pilot for traffic incident command.
You help traffic control officers manage live incidents.

You will receive live traffic data and an officer's query.

Always respond in this exact JSON format, nothing else:
{
  "signal_retiming": "specific intersection names and exact phase duration changes",
  "diversion_route": "exact street names, activation sequence, estimated redistribution",
  "public_alert": "ready-to-publish alert for variable message signs and radio",
  "narrative": "clear explanation the officer can act on immediately"
}

Rules:
- Always name specific intersections
- Always give exact durations in seconds
- Always give exact street names for diversions
- Public alert must be copy-paste ready
- Narrative must be 2-3 sentences max
"""

MANUAL_OFFICER_TIME = 480
MAX_RETRIES = 3
RETRY_DELAY = 5
MAX_HISTORY = 10

conversation_history = []

def _clean_json(text):
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def _trim_history():
    if len(conversation_history) > MAX_HISTORY:
        del conversation_history[:-MAX_HISTORY]
        log.info(f"History trimmed to {MAX_HISTORY} messages")

def _call_api():
    return client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            *conversation_history
        ],
        max_tokens=1000,
        temperature=0.3
    )

def _build_result(reply, ai_time):
    cleaned = _clean_json(reply)
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        log.warning("JSON parse failed — returning raw response")
        result = {
            "signal_retiming": "Unable to parse — see raw response",
            "diversion_route": "Unable to parse — see raw response",
            "public_alert": "Unable to parse — see raw response",
            "narrative": reply,
            "raw": reply
        }

    time_saved = round(MANUAL_OFFICER_TIME - ai_time, 2)
    result["ai_response_seconds"] = ai_time
    result["manual_response_seconds"] = MANUAL_OFFICER_TIME
    result["time_saved_seconds"] = time_saved
    result["time_saved_minutes"] = round(time_saved / 60, 1)
    return result

def ask_claude(officer_query, traffic_data):
    if not officer_query or not officer_query.strip():
        log.error("Empty officer query received")
        return {"error": "Officer query cannot be empty"}

    if not traffic_data or not traffic_data.strip():
        log.error("Empty traffic data received")
        return {"error": "Traffic data cannot be empty"}

    if not os.getenv("GROQ_API_KEY"):
        log.error("GROQ_API_KEY not found in environment")
        return {"error": "API key missing — check your .env file"}

    user_message = f"""
Live traffic data:
{traffic_data}

Officer query: {officer_query}
"""
    conversation_history.append({
        "role": "user",
        "content": user_message
    })

    _trim_history()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            log.info(f"Calling API — attempt {attempt}/{MAX_RETRIES}")
            start_time = time.time()
            response = _call_api()
            ai_time = round(time.time() - start_time, 2)
            reply = response.choices[0].message.content

            conversation_history.append({
                "role": "assistant",
                "content": reply
            })

            log.info(f"Response received in {ai_time}s")
            return _build_result(reply, ai_time)

        except Exception as e:
            log.warning(f"Attempt {attempt} failed: {str(e)}")
            if attempt < MAX_RETRIES:
                log.info(f"Retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                log.error("All retries failed")
                conversation_history.pop()
                return {
                    "error": f"API failed after {MAX_RETRIES} attempts: {str(e)}",
                    "signal_retiming": "API unavailable — use manual protocols",
                    "diversion_route": "API unavailable — use manual protocols",
                    "public_alert": "SYSTEM UNAVAILABLE — OFFICERS USE MANUAL PROTOCOLS",
                    "narrative": "AI system is temporarily unavailable. Please follow standard manual incident response protocols.",
                    "ai_response_seconds": 0,
                    "manual_response_seconds": MANUAL_OFFICER_TIME,
                    "time_saved_seconds": 0,
                    "time_saved_minutes": 0
                }

def reset_conversation():
    conversation_history.clear()
    log.info("Conversation history cleared")

def get_history_length():
    return len(conversation_history)
