import osmnx as ox
import networkx as nx
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

G = None
graph_loaded = False

def load_graph(place="Manhattan, New York, USA"):
    global G, graph_loaded
    try:
        log.info("[ROUTING] Loading OSM graph...")
        # Optimize: smaller bounding box or use cached method
        G = ox.graph_from_place(place, network_type="drive", simplify=True, retain_all=False, truncate_by_edge=True)
        G = ox.add_edge_speeds(G)
        G = ox.add_edge_travel_times(G)
        graph_loaded = True
        log.info("[ROUTING] Graph loaded successfully.")
    except Exception as e:
        log.error(f"[ROUTING] Failed to load graph: {e}")
        log.error("Routing will return error responses. This is OK - system can work without routing.")
        graph_loaded = False

def get_diversion(origin_lat, origin_lon, dest_lat, dest_lon):
    if G is None:
        log.error("[ROUTING] Graph not loaded.")
        return {"error": "Graph not loaded", "streets": [], "summary": "Routing unavailable", "estimated_travel_minutes": 0}
    try:
        orig = ox.nearest_nodes(G, origin_lon, origin_lat)
        dest = ox.nearest_nodes(G, dest_lon, dest_lat)
        route = nx.astar_path(G, orig, dest, weight="travel_time")
        edges = ox.routing.route_to_gdf(G, route)
        street_names = (
            edges["name"]
            .dropna()
            .apply(lambda x: x if isinstance(x, str) else x[0])
            .unique()
            .tolist()
        )
        total_length_km = round(edges["length"].sum() / 1000, 2)
        total_time_min  = round(edges["travel_time"].sum() / 60, 1)
        summary = " -> ".join(street_names)
        log.info(f"[ROUTING] Route found: {summary} ({total_length_km} km, {total_time_min} min)")
        return {
            "streets": street_names,
            "summary": summary,
            "total_length_km": total_length_km,
            "estimated_travel_minutes": total_time_min,
            "node_count": len(route)
        }
    except nx.NetworkXNoPath:
        log.error("[ROUTING] No path found.")
        return {"error": "No path found", "streets": [], "summary": "No route available", "estimated_travel_minutes": 0}
    except Exception as e:
        log.error(f"[ROUTING] Error: {e}")
        return {"error": str(e), "streets": [], "summary": "Routing failed", "estimated_travel_minutes": 0}
    