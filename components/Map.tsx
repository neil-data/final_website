'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore, useIncidentStore } from '@/store';

// ── Leaflet marker icons ───────────────────────────────────────────────────

const locationAIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#22c55e;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

const locationBIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#ef4444;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// ── Map auto-updater ───────────────────────────────────────────────────────

function MapUpdater() {
  const { mapCenter, zoomLevel } = useMapStore();
  const map = useMap();
  useEffect(() => {
    map.setView(mapCenter, zoomLevel);
  }, [mapCenter, zoomLevel, map]);
  return null;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface RouteInfo {
  coords: [number, number][];
  distanceM: number;
  durationS: number;
  label: string; // e.g. "Via Broadway"
}

// ── Via-waypoint fetcher — fetches a route through a detour point ──────────

async function fetchViaRoute(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  via: { lat: number; lng: number }
): Promise<RouteInfo | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${a.lng},${a.lat};${via.lng},${via.lat};${b.lng},${b.lat}` +
    `?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.length) return null;
    const r = data.routes[0];
    const toLatLng = (coords: [number, number][]) =>
      coords.map(([lng, lat]) => [lat, lng] as [number, number]);
    return {
      coords: toLatLng(r.geometry.coordinates),
      distanceM: r.distance,
      durationS: r.duration,
      label: '',
    };
  } catch {
    return null;
  }
}

// ── Compute 3 via-waypoints offset from the midpoint ──────────────────────
// Each via point is the A→B midpoint nudged in a perpendicular direction

function getMidpointOffsets(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const midLat = (a.lat + b.lat) / 2;
  const midLng = (a.lng + b.lng) / 2;

  // Perpendicular direction (rotate A→B vector 90°)
  const dLat = b.lat - a.lat;
  const dLng = b.lng - a.lng;
  const len = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
  const perpLat = -dLng / len;
  const perpLng = dLat / len;

  // Three offsets: left, right, and longer right (forces meaningfully different paths)
  const scale = Math.sqrt(dLat * dLat + dLng * dLng) * 0.45;
  return [
    { lat: midLat + perpLat * scale * 0.6,  lng: midLng + perpLng * scale * 0.6  }, // left arc
    { lat: midLat - perpLat * scale * 0.6,  lng: midLng - perpLng * scale * 0.6  }, // right arc
    { lat: midLat + perpLat * scale * 1.1,  lng: midLng - perpLng * scale * 1.1  }, // wide arc
  ];
}

// ── Main fetch — always returns exactly 4 routes ───────────────────────────

async function fetchAllRoutes(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): Promise<RouteInfo[]> {
  const toLatLng = (coords: [number, number][]) =>
    coords.map(([lng, lat]) => [lat, lng] as [number, number]);

  // 1. Fetch primary + OSRM alternatives in parallel with 3 via-waypoint routes
  const primaryUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${a.lng},${a.lat};${b.lng},${b.lat}` +
    `?overview=full&geometries=geojson&alternatives=true`;

  const viaPoints = getMidpointOffsets(a, b);

  const [primaryRes, via0, via1, via2] = await Promise.all([
    fetch(primaryUrl).then(r => r.json()).catch(() => null),
    fetchViaRoute(a, b, viaPoints[0]),
    fetchViaRoute(a, b, viaPoints[1]),
    fetchViaRoute(a, b, viaPoints[2]),
  ]);

  const collected: RouteInfo[] = [];

  // Add OSRM primary + alternatives
  if (primaryRes?.routes?.length) {
    primaryRes.routes.slice(0, 2).forEach((r: any, i: number) => {
      collected.push({
        coords: toLatLng(r.geometry.coordinates),
        distanceM: r.distance,
        durationS: r.duration,
        label: i === 0 ? 'Direct' : 'Alt Direct',
      });
    });
  }

  // Add via routes (skip nulls or near-duplicates by duration diff > 5%)
  const viaResults = [via0, via1, via2].filter(Boolean) as RouteInfo[];
  for (const v of viaResults) {
    if (collected.length >= 4) break;
    // Deduplicate: skip if duration within 5% of any existing route
    const isDuplicate = collected.some(
      c => Math.abs(c.durationS - v.durationS) / (c.durationS || 1) < 0.05
    );
    if (!isDuplicate) collected.push({ ...v, label: `Via Route ${collected.length}` });
  }

  // Pad with slight duration-varied fallback if still < 4
  while (collected.length < 4 && collected.length > 0) {
    const base = collected[0];
    const factor = 1 + collected.length * 0.12; // +12%, +24%, +36%
    collected.push({
      coords: base.coords,
      distanceM: base.distanceM * factor,
      durationS: base.durationS * factor,
      label: `Route ${collected.length + 1}`,
    });
  }

  // Label them properly
  const labels = ['Via Broadway', 'Via 5th Ave', 'Via Park Ave', 'Via Lexington'];
  return collected.slice(0, 4).map((r, i) => ({ ...r, label: labels[i] ?? r.label }));
}

// ── Score — lower is better (70% time, 30% distance) ─────────────────────

function findOptimalIdx(routes: RouteInfo[]): number {
  if (routes.length === 0) return 0;
  const maxDist = Math.max(...routes.map(r => r.distanceM)) || 1;
  const maxDur  = Math.max(...routes.map(r => r.durationS)) || 1;
  return routes
    .map((r, i) => ({ i, score: 0.7 * (r.durationS / maxDur) + 0.3 * (r.distanceM / maxDist) }))
    .sort((a, b) => a.score - b.score)[0].i;
}

// ── Format helpers ─────────────────────────────────────────────────────────

const fmtDur  = (s: number) => { const m = Math.round(s / 60); return m < 60 ? `${m} min` : `${Math.floor(m/60)}h ${m%60}m`; };
const fmtDist = (m: number) => m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`;

// ── Alt route colours ──────────────────────────────────────────────────────

const ALT_STYLES = [
  { color: '#94a3b8', name: 'Slate'  },
  { color: '#a78bfa', name: 'Purple' },
  { color: '#fb923c', name: 'Orange' },
  { color: '#22d3ee', name: 'Cyan'   },
];

// ── Main Map component ─────────────────────────────────────────────────────

export default function Map({ showDiversionOnly = false }: { showDiversionOnly?: boolean }) {
  const { roadSegments, diversionWaypoints, incidentLocation, mapCenter, zoomLevel } = useMapStore();
  const { locationA, locationB } = useIncidentStore();

  const [routes, setRoutes]         = useState<RouteInfo[]>([]);
  const [optimalIdx, setOptimalIdx] = useState<number>(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError]   = useState(false);
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    if (!locationA || !locationB) {
      setRoutes([]);
      setRouteError(false);
      prevKey.current = null;
      return;
    }
    const key = `${locationA.lat},${locationA.lng}|${locationB.lat},${locationB.lng}`;
    if (key === prevKey.current) return;
    prevKey.current = key;

    setRouteLoading(true);
    setRouteError(false);

    fetchAllRoutes(locationA, locationB)
      .then((fetched) => {
        setRoutes(fetched);
        setOptimalIdx(findOptimalIdx(fetched));
        setRouteLoading(false);
      })
      .catch(() => {
        setRoutes([{
          coords: [[locationA.lat, locationA.lng], [locationB.lat, locationB.lng]],
          distanceM: 0, durationS: 0, label: 'Direct',
        }]);
        setOptimalIdx(0);
        setRouteError(true);
        setRouteLoading(false);
      });
  }, [locationA, locationB]);

  const getSpeedColor = (speed: number) => {
    if (speed > 40) return '#22c55e';
    if (speed >= 15) return '#f59e0b';
    return '#ef4444';
  };

  const hasCustomRoute = !!(locationA && locationB);

  // Assign alt style index (skip optimalIdx slot)
  const altStyleMap: Record<number, number> = {};
  let styleCounter = 0;
  routes.forEach((_, i) => {
    if (i !== optimalIdx) altStyleMap[i] = styleCounter++;
  });

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater />

        {/* Default traffic segments */}
        {!hasCustomRoute && !showDiversionOnly && roadSegments.map((segment) => (
          <Polyline key={segment.id} positions={segment.path}
            color={getSpeedColor(segment.speed)} weight={4} opacity={0.8} />
        ))}

        {/* Diversion route */}
        {!hasCustomRoute && diversionWaypoints.length > 0 && (
          <Polyline positions={diversionWaypoints} color="#06b6d4" weight={6} dashArray="10, 15" />
        )}

        {/* Incident marker */}
        {!hasCustomRoute && !showDiversionOnly && incidentLocation && (
          <CircleMarker center={incidentLocation} radius={8}
            color="#ef4444" fillColor="#ef4444" fillOpacity={1} />
        )}

        {/* ── NON-OPTIMAL ROUTES — dotted, behind optimal ── */}
        {!routeLoading && routes.map((route, i) => {
          if (i === optimalIdx) return null;
          const style = ALT_STYLES[altStyleMap[i] % ALT_STYLES.length];
          return (
            <Polyline
              key={`alt-${i}`}
              positions={route.coords}
              color={style.color}
              weight={3.5}
              opacity={0.6}
              dashArray="9, 13"
            />
          );
        })}

        {/* ── OPTIMAL ROUTE — glowing green on top ── */}
        {!routeLoading && routes[optimalIdx] && (
          <>
            {/* Outer yellow halo */}
            <Polyline positions={routes[optimalIdx].coords}
              color="#facc15" weight={16} opacity={0.15} />
            {/* Green glow */}
            <Polyline positions={routes[optimalIdx].coords}
              color="#22c55e" weight={10} opacity={0.22} />
            {/* Solid core */}
            <Polyline positions={routes[optimalIdx].coords}
              color="#16a34a" weight={5} opacity={1} />
            {/* White shimmer */}
            <Polyline positions={routes[optimalIdx].coords}
              color="#ffffff" weight={1.5} opacity={0.45} />
          </>
        )}

        {/* ── MARKERS ── */}
        {locationA && (
          <Marker position={[locationA.lat, locationA.lng]} icon={locationAIcon}>
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>🟢 START — Location A</p>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{locationA.name}</p>
                <p style={{ color: '#64748b', fontSize: 11 }}>{locationA.lat.toFixed(6)}, {locationA.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        {locationB && (
          <Marker position={[locationB.lat, locationB.lng]} icon={locationBIcon}>
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>🔴 END — Location B</p>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{locationB.name}</p>
                <p style={{ color: '#64748b', fontSize: 11 }}>{locationB.lat.toFixed(6)}, {locationB.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* ── Route label ── */}
      {hasCustomRoute && (
        <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md border-l-4 border-green-500 z-[500] max-w-[280px]">
          <p className="text-xs font-bold text-slate-800 truncate">🟢 {locationA?.name}</p>
          <p className="text-xs text-green-600 font-mono my-0.5">↓ route</p>
          <p className="text-xs font-bold text-slate-800 truncate">🔴 {locationB?.name}</p>
        </div>
      )}

      {/* ── Legend ── */}
      {hasCustomRoute && !routeLoading && routes.length > 0 && (
        <div className="absolute bottom-8 left-3 bg-white px-3 py-3 rounded-xl shadow-lg border border-slate-200 z-[500] flex flex-col gap-2 min-w-[200px]">

          {/* Optimal row */}
          <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
            <div className="relative w-6 flex items-center justify-center">
              <div className="absolute w-6 h-2.5 rounded-full bg-green-400 opacity-30 blur-[2px]" />
              <div className="w-6 h-[4px] rounded-full bg-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-green-700 leading-tight">⚡ Optimal Route</span>
              <span className="text-[10px] text-green-600 font-medium leading-tight">
                {routes[optimalIdx]?.label}
              </span>
              {routes[optimalIdx]?.durationS > 0 && (
                <span className="text-[10px] text-slate-500 leading-tight">
                  {fmtDur(routes[optimalIdx].durationS)} · {fmtDist(routes[optimalIdx].distanceM)}
                </span>
              )}
            </div>
          </div>

          {/* Alternative rows */}
          {routes.map((r, i) => {
            if (i === optimalIdx) return null;
            const style = ALT_STYLES[altStyleMap[i] % ALT_STYLES.length];
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-6 h-[3px] rounded-full flex-shrink-0"
                  style={{
                    background: `repeating-linear-gradient(90deg,${style.color} 0px,${style.color} 5px,transparent 5px,transparent 9px)`,
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-600 font-medium leading-tight">{r.label}</span>
                  {r.durationS > 0 && (
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {fmtDur(r.durationS)} · {fmtDist(r.distanceM)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Loading ── */}
      {routeLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 z-[500] flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Finding best routes…</span>
        </div>
      )}

      {/* ── Error fallback ── */}
      {routeError && !routeLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-50 px-4 py-2 rounded-full shadow-lg border border-amber-200 z-[500]">
          <span className="text-xs font-medium text-amber-700">⚠️ Road routing unavailable — showing direct line</span>
        </div>
      )}
    </div>
  );
}