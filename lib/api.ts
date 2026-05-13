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

// GET /data → retorna array direto
export interface TelemetryRecord {
  DayNum: number;
  VehId: number;
  Trip: number;
  "Timestamp(ms)": number;
  "Latitude[deg]": number;
  "Longitude[deg]": number;
  "Vehicle Speed[km/h]": number;
  "MAF[g/sec]": number | null;
  "Engine RPM[RPM]": number;
  "Absolute Load[%]": number | null;
  "OAT[DegC]": number | null;
  "Fuel Rate[L/hr]": number | null;
}

// GET /vehicles → { vehicle_ids: number[] }
export interface VehiclesResponse {
  vehicle_ids: number[];
}

// GET /vehicles/{veh_id}/trips → { veh_id, trips: [{Trip, DayNum}] }
export interface Trip {
  Trip: number;
  DayNum: number;
}
export interface TripsResponse {
  veh_id: number;
  trips: Trip[];
}

// GET /trips/{trip_id} → { trip_id, count, records: TelemetryRecord[] }
export interface TripTelemetryResponse {
  trip_id: number;
  count: number;
  records: TelemetryRecord[];
}

// GET /stats/speed → { avg_kmh, max_kmh, min_kmh }
export interface SpeedStats {
  avg_kmh: number;
  max_kmh: number;
  min_kmh: number;
}

// GET /analytics/speeding → { threshold_kmh, count, results: [...] }
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
  count: number;
  results: SpeedingEvent[];
}

// GET /analytics/routes → { precision, count, routes: [...] }
export interface RouteEntry {
  lat: number;
  lon: number;
  count: number;
}
export interface RoutesResponse {
  precision: number;
  count: number;
  routes: RouteEntry[];
}

// GET /analytics/stops → { min_consecutive_samples, count, stops: [...] }
export interface StopEntry {
  VehId: number;
  Trip: number;
  DayNum: number;
  stopped_samples: number;
  start_timestamp_s: number;
  end_timestamp_s: number;
  latitude: number;
  longitude: number;
  duration_s: number;
}
export interface StopsResponse {
  min_consecutive_samples: number;
  count: number;
  stops: StopEntry[];
}

// GET /analytics/fuel → { count, results: [...] }
export interface FuelEntry {
  VehId: number;
  Trip: number;
  DayNum: number;
  fuel_liters_est: number;
  avg_maf_g_per_s: number;
  max_maf_g_per_s: number;
  sample_count: number;
}
export interface FuelResponse {
  count: number;
  results: FuelEntry[];
}

// GET /analytics/rpm-ranking → { count, ranking: [...] }
export interface RpmRankEntry {
  rank: number;
  VehId: number;
  avg_rpm: number;
  avg_maf_g_per_s: number;
  avg_speed_kmh: number;
  moving_samples: number;
}
export interface RpmRankingResponse {
  count: number;
  ranking: RpmRankEntry[];
}

// GET /anomalies → { count, records: [...] }
export interface Anomaly {
  DayNum: number;
  VehId: number;
  Trip: number;
  "Timestamp(ms)": number;
  "Latitude[deg]": number;
  "Longitude[deg]": number;
  "Vehicle Speed[km/h]": number;
  "MAF[g/sec]": number | null;
  "Engine RPM[RPM]": number;
  rpm_z?: number;
  maf_z?: number;
}
export interface AnomaliesResponse {
  count: number;
  records: Anomaly[];
}

// --- API Functions ---

export const getHealth = () => apiFetch<HealthResponse>("/health");

export const getData = (limit = 50, offset = 0) =>
  apiFetch<TelemetryRecord[]>(`/data?limit=${limit}&offset=${offset}`);

export const getVehicles = () => apiFetch<VehiclesResponse>("/vehicles");

export const getVehicleTrips = (vehId: number) =>
  apiFetch<TripsResponse>(`/vehicles/${vehId}/trips`);

export const getTripTelemetry = (tripId: number, limit = 200) =>
  apiFetch<TripTelemetryResponse>(`/trips/${tripId}?limit=${limit}`);

export const getSpeedStats = () => apiFetch<SpeedStats>("/stats/speed");

export const getSpeedingEvents = (threshold = 80) =>
  apiFetch<SpeedingResponse>(`/analytics/speeding?threshold=${threshold}`);

export const getTopRoutes = () => apiFetch<RoutesResponse>("/analytics/routes");

export const getLongStops = () => apiFetch<StopsResponse>("/analytics/stops");

export const getFuelConsumption = () => apiFetch<FuelResponse>("/analytics/fuel");

export const getRpmRanking = () => apiFetch<RpmRankingResponse>("/analytics/rpm-ranking");

export const getAnomalies = (limit = 50) =>
  apiFetch<AnomaliesResponse>(`/anomalies?limit=${limit}`);
