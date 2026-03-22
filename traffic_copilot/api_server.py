from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agents import ask_copilot, reset_conversation
from data_pipeline import get_latest_traffic, start_pipeline
from routing import load_graph
from database import init_db, log_query, get_metrics
import uuid
import threading
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    log.info("[STARTUP] Initializing database...")
    init_db()
    
    log.info("[STARTUP] Starting data pipeline...")
    start_pipeline()
    
    # Load graph in background thread so startup doesn't block
    log.info("[STARTUP] Loading routing graph in background...")
    graph_thread = threading.Thread(target=load_graph, daemon=True)
    graph_thread.start()
    log.info("[STARTUP] Startup complete. System ready.")

@app.post("/copilot")
async def copilot_endpoint(request: Request):
    data = await request.json()
    officer_query = data.get("query")
    session_id = data.get("session_id", str(uuid.uuid4()))
    traffic_data = get_latest_traffic()
    try:
        result = ask_copilot(officer_query, traffic_data)
        log_query(session_id, officer_query, result)
        return result
    except Exception as e:
        return {"error": str(e)}

@app.post("/reset")
async def reset_endpoint():
    reset_conversation()
    return {"status": "reset"}

@app.get("/metrics")
async def metrics_endpoint():
    return get_metrics()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/traffic")
async def traffic():
    return {"data": get_latest_traffic()}