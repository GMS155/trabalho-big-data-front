const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout para Spark
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

// --- Types ---

export interface HealthResponse {
  status: "healthy" | "starting";
}

// GET /vehicles → { vehicles: number[] }
export interface VehiclesResponse {
  vehicles: number[];
}

// GET /vehicles/{veh_id}/trips → { veh_id, trips: [{trip, day}] }
export interface VehicleTrip {
  trip: number;
  day: number;
}
export interface VehicleTripsResponse {
  veh_id: number;
  trips: VehicleTrip[];
}

// GET /vehicles/{veh_id}/summary
export interface VehicleSummary {
  veh_id: number;
  total_trips: number;
  avg_speed: number;
  avg_rpm: number;
  estimated_fuel: number;
  anomalies: number;
}

// GET /vehicles/{veh_id}/last-position
export interface LastPosition {
  veh_id: number;
  lat: number;
  lon: number;
  speed: number;
  timestamp: number;
}

// GET /trips/{trip_id}
export interface TripSummary {
  trip_id: number;
  veh_id: number;
  start_time: number;
  end_time: number;
  distance_km: number;
  avg_speed: number;
}

// GET /trips/{trip_id}/timeline
export interface TripTimeline {
  trip_id: number;
  count: number;
  timestamps: number[];
  speed_kmh: (number | null)[];
  rpm: (number | null)[];
  maf_g_per_s: (number | null)[];
}

// GET /stats/summary
export interface StatsSummary {
  total_vehicles: number;
  total_trips: number;
  avg_speed: number;
  total_fuel_estimated: number;
  top_speeding_vehicle: { veh_id: number; events: number } | null;
}

// GET /speeding
export interface SpeedingEvent {
  VehId: number;
  Trip: number;
  DayNum: number;
  speeding_records: number;
  max_speed_kmh: number;
  avg_speed_kmh: number;
}
export interface SpeedingResponse {
  threshold_kmh: number;
  filters: { veh_id: number | null; day_min: number | null; day_max: number | null };
  count: number;
  events: SpeedingEvent[];
}

// GET /analytics/high-rpm
export interface HighRpmEvent {
  VehId: number;
  Trip: number;
  high_rpm_samples: number;
  max_rpm: number;
  avg_rpm: number;
  avg_speed_kmh: number;
}
export interface HighRpmResponse {
  rpm_threshold: number;
  filters: { veh_id: number | null };
  count: number;
  events: HighRpmEvent[];
}

// --- API Functions ---

export const getHealth = () => apiFetch<HealthResponse>("/health");

export const getVehicles = () => apiFetch<VehiclesResponse>("/vehicles");

export const getVehicleTrips = (vehId: number) =>
  apiFetch<VehicleTripsResponse>(`/vehicles/${vehId}/trips`);

export const getVehicleSummary = (vehId: number) =>
  apiFetch<VehicleSummary>(`/vehicles/${vehId}/summary`);

export const getVehicleLastPosition = (vehId: number) =>
  apiFetch<LastPosition>(`/vehicles/${vehId}/last-position`);

export const getTripSummary = (tripId: number) =>
  apiFetch<TripSummary>(`/trips/${tripId}`);

export const getTripTimeline = (tripId: number, limit = 500) =>
  apiFetch<TripTimeline>(`/trips/${tripId}/timeline?limit=${limit}`);

export const getStatsSummary = (speedingThreshold = 80) =>
  apiFetch<StatsSummary>(`/stats/summary?speeding_threshold=${speedingThreshold}`);

export const getSpeedingEvents = (threshold = 80, vehId?: number) => {
  const params = new URLSearchParams({ threshold: String(threshold) });
  if (vehId !== undefined) params.append("veh_id", String(vehId));
  return apiFetch<SpeedingResponse>(`/speeding?${params}`);
};

export const getHighRpm = (rpmThreshold = 3500, vehId?: number) => {
  const params = new URLSearchParams({ rpm_threshold: String(rpmThreshold) });
  if (vehId !== undefined) params.append("veh_id", String(vehId));
  return apiFetch<HighRpmResponse>(`/analytics/high-rpm?${params}`);
};

