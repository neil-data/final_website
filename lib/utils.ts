import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Location types ─────────────────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
}

// ── Geocode a place name using OpenStreetMap Nominatim (free, no API key) ──

export async function geocodeLocation(placeName: string): Promise<GeoLocation | null> {
  try {
    // Always append NYC context for accuracy
    const query = placeName.toLowerCase().includes('new york') || placeName.toLowerCase().includes('nyc')
      ? placeName
      : `${placeName}, New York City, NY`;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=us`;

    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'NYC-Traffic-Copilot/1.0' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      name: data[0].display_name.split(',').slice(0, 2).join(',').trim(),
    };
  } catch (error) {
    console.error('[geocodeLocation] Error:', error);
    return null;
  }
}

// ── Extract location A and B from officer query ────────────────────────────
// Handles patterns like:
//   "from Civic Center to Tribeca"
//   "Civic Center TO Tribeca"
//   "A: Times Square B: Central Park"
//   "incident at 7th Ave and W56th St near Times Square"

export function extractLocations(query: string): { locationA: string | null; locationB: string | null } {
  const q = query.trim();

  // Pattern 1: "from X to Y"
  const fromTo = q.match(/from\s+(.+?)\s+to\s+(.+)/i);
  if (fromTo) {
    return { locationA: fromTo[1].trim(), locationB: fromTo[2].trim() };
  }

  // Pattern 2: "X to Y" (without "from")
  const xToY = q.match(/^(.+?)\s+to\s+(.+)$/i);
  if (xToY) {
    return { locationA: xToY[1].trim(), locationB: xToY[2].trim() };
  }

  // Pattern 3: "A: X B: Y" or "A=X B=Y"
  const abLabel = q.match(/[Aa][:\s=]+(.+?)\s+[Bb][:\s=]+(.+)/i);
  if (abLabel) {
    return { locationA: abLabel[1].trim(), locationB: abLabel[2].trim() };
  }

  // Pattern 4: "start: X end: Y" or "origin: X destination: Y"
  const startEnd = q.match(/(?:start|origin)[:\s]+(.+?)\s+(?:end|destination|dest)[:\s]+(.+)/i);
  if (startEnd) {
    return { locationA: startEnd[1].trim(), locationB: startEnd[2].trim() };
  }

  return { locationA: null, locationB: null };
}