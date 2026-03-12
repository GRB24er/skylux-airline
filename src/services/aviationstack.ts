/* ═══════════════════════════════════════════════════════════════
   AviationStack API Client
   Real-time flight tracking, status, airline & route validation
   https://aviationstack.com/documentation
   ═══════════════════════════════════════════════════════════════ */

const AVIATIONSTACK_BASE = "http://api.aviationstack.com/v1";

function isConfigured(): boolean {
  return !!process.env.AVIATIONSTACK_API_KEY;
}

// ── Response cache ──
const cache = new Map<string, { data: any; expires: number }>();

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs: number): void {
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now >= v.expires) cache.delete(k);
    }
  }
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

/** Make a request to AviationStack API */
async function aviationRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) throw new Error("AviationStack API key not configured");

  const url = new URL(`${AVIATIONSTACK_BASE}/${endpoint}`);
  url.searchParams.set("access_key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`AviationStack error: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`AviationStack: ${data.error.message || data.error.code}`);
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface LiveFlightData {
  flightDate: string;
  flightStatus: "scheduled" | "active" | "landed" | "cancelled" | "incident" | "diverted";
  departure: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled: string;
    estimated?: string;
    actual?: string;
  };
  arrival: {
    airport: string;
    iata: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled: string;
    estimated?: string;
    actual?: string;
  };
  airline: {
    name: string;
    iata: string;
  };
  flight: {
    number: string;
    iata: string;
  };
  aircraft?: {
    registration?: string;
    iata?: string;
  };
  live?: {
    updated: string;
    latitude: number;
    longitude: number;
    altitude: number;
    direction: number;
    speed_horizontal: number;
    speed_vertical: number;
    is_ground: boolean;
  };
}

/** Get real-time flight status by flight IATA code (e.g., "BA115") */
export async function getFlightStatus(flightIata: string): Promise<LiveFlightData[]> {
  if (!isConfigured()) return [];

  const cacheKey = `flight:${flightIata}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await aviationRequest("flights", {
      flight_iata: flightIata,
    });

    const results = response.data || [];
    setCache(cacheKey, results, 120000); // 2-min cache for live data
    return results;
  } catch (error) {
    console.error("AviationStack flight status error:", error);
    return [];
  }
}

/** Get live flight tracking data (position, altitude, speed) */
export async function trackFlight(flightIata: string): Promise<LiveFlightData | null> {
  const flights = await getFlightStatus(flightIata);
  const active = flights.find((f) => f.flightStatus === "active" && f.live);
  return active || flights[0] || null;
}

/** Get airport departures/arrivals schedule */
export async function getAirportSchedule(
  airportIata: string,
  type: "departure" | "arrival" = "departure",
): Promise<LiveFlightData[]> {
  if (!isConfigured()) return [];

  const cacheKey = `schedule:${airportIata}:${type}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const params: Record<string, string> = {};
    if (type === "departure") params.dep_iata = airportIata;
    else params.arr_iata = airportIata;

    const response = await aviationRequest("flights", params);
    const results = response.data || [];
    setCache(cacheKey, results, 300000); // 5-min cache
    return results;
  } catch (error) {
    console.error("AviationStack schedule error:", error);
    return [];
  }
}

export interface AirlineInfo {
  airline_name: string;
  iata_code: string;
  icao_code: string;
  country_name: string;
  country_iso2: string;
  fleet_size?: string;
  status: string;
  type: string;
}

/** Validate airline exists and get info */
export async function getAirlineInfo(airlineIata: string): Promise<AirlineInfo | null> {
  if (!isConfigured()) return null;

  const cacheKey = `airline:${airlineIata}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await aviationRequest("airlines", {
      iata_code: airlineIata,
    });

    const airline = response.data?.[0] || null;
    if (airline) setCache(cacheKey, airline, 86400000); // 24hr cache for static data
    return airline;
  } catch (error) {
    console.error("AviationStack airline info error:", error);
    return null;
  }
}

/** Get routes for a specific airline (validate airline flies a specific route) */
export async function getAirlineRoutes(airlineIata: string): Promise<any[]> {
  if (!isConfigured()) return [];

  const cacheKey = `routes:${airlineIata}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await aviationRequest("routes", {
      airline_iata: airlineIata,
    });

    const routes = response.data || [];
    setCache(cacheKey, routes, 3600000); // 1hr cache
    return routes;
  } catch (error) {
    console.error("AviationStack routes error:", error);
    return [];
  }
}

/** Validate that a specific flight number exists and is real */
export async function validateFlight(flightIata: string): Promise<boolean> {
  const flights = await getFlightStatus(flightIata);
  return flights.length > 0;
}

/** Map AviationStack flight status to SKYLUX status */
export function mapFlightStatus(avStatus: string): string {
  const map: Record<string, string> = {
    scheduled: "scheduled",
    active: "in-flight",
    landed: "arrived",
    cancelled: "cancelled",
    incident: "delayed",
    diverted: "delayed",
  };
  return map[avStatus] || "scheduled";
}

/** Check if AviationStack is configured */
export function isAviationStackConfigured(): boolean {
  return isConfigured();
}
