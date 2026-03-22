import sqlite3
import time
import logging

log = logging.getLogger(__name__)
DB = "copilot.db"

def init_db():
    conn = sqlite3.connect(DB)
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        query TEXT,
        severity TEXT,
        cascade_risk TEXT,
        pipeline_seconds REAL,
        time_saved_seconds REAL,
        ts INTEGER
    );
    CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        avg_speed REAL,
        incident_count INTEGER,
        raw TEXT,
        ts INTEGER
    );
    """)
    conn.commit()
    conn.close()
    log.info("[DB] Database initialized.")

def log_query(session_id, query, result):
    try:
        conn = sqlite3.connect(DB)
        conn.execute("INSERT INTO queries VALUES (NULL,?,?,?,?,?,?,?)", (
            session_id,
            query,
            result.get("severity", {}).get("severity"),
            result.get("predictions", {}).get("cascade_risk"),
            result.get("pipeline_seconds"),
            result.get("time_saved_seconds"),
            int(time.time())
        ))
        conn.commit()
        conn.close()
        log.info("[DB] Query logged.")
    except Exception as e:
        log.error(f"[DB] Failed to log query: {e}")

def get_metrics():
    try:
        conn = sqlite3.connect(DB)
        row = conn.execute("""
            SELECT COUNT(*) as total_queries,
                   AVG(time_saved_seconds) as avg_saved,
                   SUM(time_saved_seconds) as total_saved,
                   AVG(pipeline_seconds) as avg_ai_time
            FROM queries
        """).fetchone()
        conn.close()
        return {
            "total_queries": row[0],
            "avg_time_saved_minutes": round((row[1] or 0) / 60, 1),
            "total_time_saved_minutes": round((row[2] or 0) / 60, 1),
            "avg_ai_response_seconds": round(row[3] or 0, 2),
            "manual_baseline_seconds": 480
        }
    except Exception as e:
        log.error(f"[DB] Failed to get metrics: {e}")
        return {}