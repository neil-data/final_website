import { create } from 'zustand';
import type { GeoLocation } from '@/lib/utils';

export interface PublicAlert { vms: string; radio: string; social: string; }
export interface SignalChange { intersection: string; current_phase_seconds: number; recommended_phase_seconds: number; direction_to_extend: string; reason: string; }
export interface Prediction { intersection: string; current_speed_kmh: number; predicted_speed_kmh: number; time_to_congest_minutes: number; confidence_percent: number; reason: string; }

interface IncidentState {
  narrative: string; chain_of_thought: string; signal_retiming: string; diversion_route: string;
  public_alert: PublicAlert; confidence_percent: number; next_review_minutes: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; severity_score: number; reasoning: string;
  affected_intersections: string[]; estimated_clearance_minutes: number; risk_factors: string[];
  predictions: Prediction[]; cascade_risk: 'HIGH' | 'MEDIUM' | 'LOW'; recommended_preemptive_action: string;
  signal_changes: SignalChange[]; priority_corridor: string; estimated_clearance_improvement_minutes: number;
  pipeline_seconds: number; time_saved_minutes: number;
  locationA: GeoLocation | null;
  locationB: GeoLocation | null;
  loading: boolean; error: string | null;
  setFromResponse: (response: Record<string, unknown>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLocations: (a: GeoLocation, b: GeoLocation) => void;
  clearLocations: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  narrative: 'Major accident blocking two northbound lanes on 7th Avenue at W56th Street. Speed has dropped to 4 km/h. Emergency services on scene.',
  chain_of_thought: 'Speed reading of 4 km/h on a normally 35 km/h segment with zero movement for 8 minutes confirms full blockage.',
  signal_retiming: '7th Ave & W55th St — reduce northbound green to 18s, extend southbound to 42s immediately.',
  diversion_route: 'Activate W55th Street eastbound to 8th Avenue northbound. Update VMS at 7th & W54th. Est. 60% redistribution in 3 min.',
  public_alert: {
    vms: '7TH AVE CLOSED W56TH\nUSE 6TH OR 8TH AVE\nEXPECT 15 MIN DELAY',
    radio: 'Drivers avoid 7th Avenue between 55th and 57th Street. Use 6th or 8th Avenue. Significant delays expected.',
    social: 'TRAFFIC ALERT: 7th Ave closed at W56th St. Switch to 6th or 8th Ave now. Expect 15-20 min delays. #NYCTraffic',
  },
  confidence_percent: 87, next_review_minutes: 5,
  severity: 'CRITICAL', severity_score: 85,
  reasoning: 'Speed of 4 km/h on a normally 35 km/h arterial with zero movement for 8 minutes confirms full blockage.',
  affected_intersections: ['7th Ave & W56th St', '7th Ave & W55th St', 'W56th St & 6th Ave'],
  estimated_clearance_minutes: 18,
  risk_factors: ['Full lane blockage', 'EMS en route', 'Peak hour traffic', 'Times Square proximity'],
  predictions: [
    { intersection: 'W55th St & 7th Ave', current_speed_kmh: 12, predicted_speed_kmh: 4, time_to_congest_minutes: 4, confidence_percent: 90, reason: 'Upstream spillback from blocked segment' },
    { intersection: '6th Ave & W57th St', current_speed_kmh: 20, predicted_speed_kmh: 10, time_to_congest_minutes: 7, confidence_percent: 75, reason: 'Diverted traffic from 7th Ave' },
    { intersection: 'Broadway & W52nd St', current_speed_kmh: 28, predicted_speed_kmh: 15, time_to_congest_minutes: 11, confidence_percent: 60, reason: 'Cascade from 6th Ave congestion' },
  ],
  cascade_risk: 'HIGH',
  recommended_preemptive_action: 'Activate diversion signs on 7th Ave at W54th immediately.',
  signal_changes: [
    { intersection: '7th Ave & W55th St', current_phase_seconds: 30, recommended_phase_seconds: 18, direction_to_extend: 'southbound', reason: 'Reduce northbound inflow to blocked segment' },
    { intersection: '8th Ave & W55th St', current_phase_seconds: 30, recommended_phase_seconds: 45, direction_to_extend: 'northbound', reason: 'Increase capacity on diversion route' },
  ],
  priority_corridor: '8th Avenue northbound',
  estimated_clearance_improvement_minutes: 6,
  pipeline_seconds: 12.4, time_saved_minutes: 7.3,
  locationA: null, locationB: null,
  loading: false, error: null,

  setFromResponse: (response) => {
    const cmd = response.command as Record<string, unknown>;
    const sev = response.severity as Record<string, unknown>;
    const pred = response.predictions as Record<string, unknown>;
    const sig = response.signal as Record<string, unknown>;
    set({
      narrative: cmd?.narrative as string,
      chain_of_thought: cmd?.chain_of_thought as string,
      signal_retiming: cmd?.signal_retiming as string,
      diversion_route: cmd?.diversion_route as string,
      public_alert: cmd?.public_alert as PublicAlert,
      confidence_percent: cmd?.confidence_percent as number,
      next_review_minutes: cmd?.next_review_minutes as number,
      severity: sev?.severity as IncidentState['severity'],
      severity_score: sev?.severity_score as number,
      reasoning: sev?.reasoning as string,
      affected_intersections: sev?.affected_intersections as string[],
      estimated_clearance_minutes: sev?.estimated_clearance_minutes as number,
      risk_factors: sev?.risk_factors as string[],
      predictions: pred?.predictions as Prediction[],
      cascade_risk: pred?.cascade_risk as IncidentState['cascade_risk'],
      recommended_preemptive_action: pred?.recommended_preemptive_action as string,
      signal_changes: sig?.signal_changes as SignalChange[],
      priority_corridor: sig?.priority_corridor as string,
      estimated_clearance_improvement_minutes: sig?.estimated_clearance_improvement_minutes as number,
      pipeline_seconds: response.pipeline_seconds as number,
      time_saved_minutes: response.time_saved_minutes as number,
    });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLocations: (a, b) => set({ locationA: a, locationB: b }),
  clearLocations: () => set({ locationA: null, locationB: null }),
}));

interface RoadSegment { id: string; path: [number, number][]; speed: number; }
interface MapState {
  roadSegments: RoadSegment[]; diversionWaypoints: [number, number][];
  incidentLocation: [number, number]; mapCenter: [number, number]; zoomLevel: number;
  setMapData: (data: Partial<MapState>) => void;
}

export const useMapStore = create<MapState>((set) => ({
  roadSegments: [
    { id: '1', path: [[40.7549, -73.9840], [40.7530, -73.9855]], speed: 4 },
    { id: '2', path: [[40.7530, -73.9855], [40.7510, -73.9870]], speed: 12 },
    { id: '3', path: [[40.7580, -73.9810], [40.7560, -73.9825]], speed: 25 },
    { id: '4', path: [[40.7560, -73.9825], [40.7540, -73.9840]], speed: 20 },
    { id: '5', path: [[40.7520, -73.9890], [40.7500, -73.9905]], speed: 45 },
    { id: '6', path: [[40.7500, -73.9905], [40.7480, -73.9920]], speed: 42 },
    { id: '7', path: [[40.7549, -73.9840], [40.7565, -73.9800]], speed: 10 },
    { id: '8', path: [[40.7530, -73.9855], [40.7545, -73.9815]], speed: 30 },
  ],
  diversionWaypoints: [[40.7530, -73.9855], [40.7545, -73.9815], [40.7560, -73.9825]],
  incidentLocation: [40.7549, -73.9840],
  mapCenter: [40.7580, -73.9855],
  zoomLevel: 13,
  setMapData: (data) => set((state) => ({ ...state, ...data })),
}));

interface UIState {
  activeTab: string; sidebarOpen: boolean; lastRefreshTimestamp: number;
  setActiveTab: (tab: string) => void; toggleSidebar: () => void; refresh: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard', sidebarOpen: true, lastRefreshTimestamp: Date.now(),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  refresh: () => set({ lastRefreshTimestamp: Date.now() }),
}));