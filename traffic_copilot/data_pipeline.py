import os
import time
import threading
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "traffic_data.csv")

df = pd.read_csv(CSV_PATH)
df.columns = df.columns.str.strip()
df = df.sort_values("timestamp").reset_index(drop=True)

timestamps = df["timestamp"].unique()

current_index = 0
latest_formatted = ""
lock = threading.Lock()

def classify_speed(speed):
    if speed < 5:
        return "CRITICAL"
    elif speed < 15:
        return "INCIDENT"
    elif speed < 25:
        return "SLOW"
    elif speed < 35:
        return "MODERATE"
    else:
        return "NORMAL"

def format_snapshot_for_llm(snapshot_df):
    timestamp = snapshot_df["timestamp"].iloc[0]
    lines = [f"Live NYC Traffic Snapshot — {timestamp}"]
    lines.append(f"Total road segments monitored: {len(snapshot_df)}")
    lines.append("")

    critical = snapshot_df[snapshot_df["incident_flag"].astype(str).str.upper().isin(['INCIDENT', 'CONGESTION'])].copy()
    if not critical.empty:
        lines.append("CRITICAL SEGMENTS:")
        for _, row in critical.iterrows():
            incident = "INCIDENT REPORTED" if str(row["incident_flag"]).upper() in ['INCIDENT', 'CONGESTION'] else ""
            diversion = f"Diversion: {row['diversion_route']}" if pd.notna(row["diversion_route"]) and str(row["diversion_route"]) != "" else ""
            lines.append(
                f"  {row['street']} ({row['borough']}): "
                f"{round(row['speed_kmh'], 1)} km/h — "
                f"density {round(row['vehicle_density'])} veh/km — "
                f"travel time {round(row['travel_time_sec'])}s — "
                f"signal: {row['traffic_light_status']} — "
                f"status: {classify_speed(row['speed_kmh'])} "
                f"{incident} {diversion}"
            )

    lines.append("")

    normal = snapshot_df[snapshot_df["speed_kmh"] >= 15].copy()
    if not normal.empty:
        lines.append("OTHER SEGMENTS:")
        for _, row in normal.iterrows():
            lines.append(
                f"  {row['street']} ({row['borough']}): "
                f"{round(row['speed_kmh'], 1)} km/h — "
                f"density {round(row['vehicle_density'])} veh/km — "
                f"{classify_speed(row['speed_kmh'])}"
            )

    lines.append("")
    incident_count = snapshot_df['incident_flag'].astype(str).str.upper().isin(['INCIDENT', 'CONGESTION']).sum()
    lines.append(f"Incidents active: {incident_count}")
    lines.append(f"Avg network speed: {round(snapshot_df['speed_kmh'].mean(), 1)} km/h")

    incident_boroughs = snapshot_df[snapshot_df['incident_flag'].astype(str).str.upper().isin(['INCIDENT', 'CONGESTION'])]['borough'].unique()
    lines.append(f"Boroughs affected: {', '.join(incident_boroughs) if len(incident_boroughs) > 0 else 'None'}")

    return "\n".join(lines)

def read_latest_snapshot():
    global current_index
    with lock:
        current_time = timestamps[current_index % len(timestamps)]
        snapshot_df = df[df["timestamp"] == current_time]
        current_index += 1
        return format_snapshot_for_llm(snapshot_df)

def update_loop():
    global latest_formatted
    while True:
        snapshot = read_latest_snapshot()
        with lock:
            latest_formatted = snapshot
        print(f"[PIPELINE] Data updated")
        time.sleep(5)

def get_latest_traffic():
    with lock:
        return latest_formatted

def start_pipeline():
    global latest_formatted
    latest_formatted = read_latest_snapshot()
    thread = threading.Thread(target=update_loop, daemon=True)
    thread.start()
    print("[PIPELINE] Live feed started from traffic_data.csv")
