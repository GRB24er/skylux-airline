/* ═══════════════════════════════════════════════════════════════
   Duffel API Client — Real Flight Search, Pricing & Booking
   Replaces Amadeus (which shut down self-service portal)
   https://duffel.com/docs
   300+ airlines, real prices, real PNR booking
   ═══════════════════════════════════════════════════════════════ */

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

function getToken(): string {
  const token = process.env.DUFFEL_API_TOKEN;
  if (!token) throw new Error("DUFFEL_API_TOKEN not configured");
  return token;
}

export function isDuffelConfigured(): boolean {
  return !!process.env.DUFFEL_API_TOKEN;
}

/** Make an authenticated request to Duffel API */
async function duffelRequest(method: string, path: string, body?: any, params?: Record<string, string>): Promise<any> {
  const token = getToken();
  const url = new URL(`${DUFFEL_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
      "Duffel-Version": DUFFEL_VERSION,
    },
    body: body ? JSON.stringify({ data: body }) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Duffel ${method} ${path} failed:`, res.status, err);
    throw new Error(`Duffel API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

// ── Search cache (5-min TTL) ──
const searchCache = new Map<string, { data: any; expires: number }>();

function getCached(key: string): any | null {
  const entry = searchCache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  if (entry) searchCache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs = 300000): void {
  if (searchCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of searchCache) {
      if (now >= v.expires) searchCache.delete(k);
    }
  }
  searchCache.set(key, { data, expires: Date.now() + ttlMs });
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DuffelOffer {
  id: string;
  live_mode: boolean;
  created_at: string;
  expires_at: string;
  total_amount: string;
  total_currency: string;
  base_amount: string;
  base_currency: string;
  tax_amount: string;
  tax_currency: string;
  total_emissions_kg: string | null;
  owner: {
    id: string;
    iata_code: string;
    name: string;
    logo_symbol_url: string | null;
    logo_lockup_url: string | null;
  };
  slices: DuffelSlice[];
  passengers: { id: string; type: string }[];
  conditions: {
    change_before_departure: { allowed: boolean; penalty_amount?: string; penalty_currency?: string } | null;
    refund_before_departure: { allowed: boolean; penalty_amount?: string; penalty_currency?: string } | null;
  };
  payment_requirements: {
    requires_instant_payment: boolean;
    price_guarantee_expires_at: string | null;
    payment_required_by: string | null;
  };
  allowed_passenger_identity_document_types?: string[];
}

export interface DuffelSlice {
  id: string;
  duration: string; // ISO 8601 e.g., "PT12H30M"
  origin: DuffelAirport;
  destination: DuffelAirport;
  segments: DuffelSegment[];
}

export interface DuffelSegment {
  id: string;
  aircraft: { id: string; iata_code: string; name: string } | null;
  operating_carrier: { id: string; iata_code: string; name: string; logo_symbol_url: string | null };
  marketing_carrier: { id: string; iata_code: string; name: string; logo_symbol_url: string | null };
  operating_carrier_flight_number: string;
  marketing_carrier_flight_number: string;
  origin: DuffelAirport;
  destination: DuffelAirport;
  departing_at: string;
  arriving_at: string;
  duration: string;
  cabin_class: "economy" | "premium_economy" | "business" | "first";
  passengers: {
    passenger_id: string;
    cabin_class: string;
    baggages: { type: string; quantity: number }[];
  }[];
}

export interface DuffelAirport {
  id: string;
  iata_code: string;
  iata_country_code: string;
  name: string;
  city_name: string;
  city: { id: string; iata_code: string; name: string } | null;
  latitude: number | null;
  longitude: number | null;
  time_zone: string;
}

export interface DuffelPassenger {
  id: string;
  type: "adult" | "child" | "infant_without_seat";
  given_name: string;
  family_name: string;
  email: string;
  phone_number: string;
  born_on: string; // YYYY-MM-DD
  gender: "m" | "f";
  title: "mr" | "mrs" | "ms" | "miss" | "dr";
  identity_documents?: {
    type: "passport";
    unique_identifier: string;
    expires_on: string;
    issuing_country_code: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface FlightSearchParams {
  origin: string;         // IATA code
  destination: string;    // IATA code
  departDate: string;     // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  cabinClass?: string;    // economy, premium, business, first
  maxConnections?: number;
}

/** Search for real flight offers via Duffel */
export async function searchFlights(params: FlightSearchParams): Promise<DuffelOffer[]> {
  if (!isDuffelConfigured()) return [];

  const cacheKey = JSON.stringify(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const cabinMap: Record<string, string> = {
      economy: "economy",
      premium: "premium_economy",
      business: "business",
      first: "first",
    };

    const slices: any[] = [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departDate,
      },
    ];

    if (params.returnDate) {
      slices.push({
        origin: params.destination,
        destination: params.origin,
        departure_date: params.returnDate,
      });
    }

    const passengers: any[] = [];
    for (let i = 0; i < params.adults; i++) {
      passengers.push({ type: "adult" });
    }

    const requestBody: any = {
      slices,
      passengers,
    };

    if (params.cabinClass && cabinMap[params.cabinClass]) {
      requestBody.cabin_class = cabinMap[params.cabinClass];
    }

    if (params.maxConnections !== undefined) {
      requestBody.max_connections = params.maxConnections;
    }

    const result = await duffelRequest(
      "POST",
      "/air/offer_requests",
      requestBody,
      { return_offers: "true", supplier_timeout: "25000" },
    );

    const offers: DuffelOffer[] = result.offers || [];
    setCache(cacheKey, offers);
    return offers;
  } catch (error) {
    console.error("Duffel flight search error:", error);
    return [];
  }
}

/** Get a specific offer by ID (refreshed pricing) */
export async function getOffer(offerId: string): Promise<DuffelOffer | null> {
  if (!isDuffelConfigured()) return null;

  try {
    return await duffelRequest("GET", `/air/offers/${offerId}`);
  } catch (error) {
    console.error("Duffel get offer error:", error);
    return null;
  }
}

/** Create a real booking (Order) with Duffel */
export async function createBooking(
  offerId: string,
  passengers: DuffelPassenger[],
): Promise<{ bookingReference: string; orderId: string; raw: any } | null> {
  if (!isDuffelConfigured()) return null;

  try {
    const order = await duffelRequest("POST", "/air/orders", {
      type: "instant",
      selected_offers: [offerId],
      passengers: passengers.map((p) => ({
        ...p,
        identity_documents: p.identity_documents || undefined,
      })),
      payments: [
        {
          type: "balance",
          currency: "USD",
          amount: "0", // Will be set from offer total
        },
      ],
    });

    return {
      bookingReference: order.booking_reference || order.id,
      orderId: order.id,
      raw: order,
    };
  } catch (error) {
    console.error("Duffel booking error:", error);
    return null;
  }
}

/** Cancel a Duffel order */
export async function cancelOrder(orderId: string): Promise<any> {
  if (!isDuffelConfigured()) return null;

  try {
    // First create a cancellation request
    const cancellation = await duffelRequest("POST", "/air/order_cancellations", {
      order_id: orderId,
    });

    // Then confirm it
    if (cancellation?.id) {
      return await duffelRequest("POST", `/air/order_cancellations/${cancellation.id}/actions/confirm`);
    }

    return cancellation;
  } catch (error) {
    console.error("Duffel cancel error:", error);
    return null;
  }
}

/** List airlines from Duffel */
export async function listAirlines(limit = 50): Promise<any[]> {
  if (!isDuffelConfigured()) return [];

  const cacheKey = `airlines:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const result = await duffelRequest("GET", "/air/airlines", undefined, {
      limit: String(limit),
    });
    const airlines = Array.isArray(result) ? result : [];
    setCache(cacheKey, airlines, 86400000); // 24hr cache
    return airlines;
  } catch (error) {
    console.error("Duffel airlines error:", error);
    return [];
  }
}

/** Search airports from Duffel */
export async function searchAirports(query: string): Promise<any[]> {
  if (!isDuffelConfigured()) return [];

  const cacheKey = `airports:${query.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const result = await duffelRequest("GET", "/air/airports", undefined, {
      name: query,
    });
    const airports = Array.isArray(result) ? result : [];
    setCache(cacheKey, airports, 3600000); // 1hr cache
    return airports;
  } catch (error) {
    console.error("Duffel airports error:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// MAPPERS — Convert Duffel format to SKYLUX internal format
// ═══════════════════════════════════════════════════════════════

/** Parse ISO 8601 duration (PT12H30M) to minutes */
export function parseDuration(iso: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

/** Map Duffel cabin class to SKYLUX cabin class */
export function mapCabinClass(duffelClass: string): string {
  const map: Record<string, string> = {
    economy: "economy",
    premium_economy: "premium",
    business: "business",
    first: "first",
  };
  return map[duffelClass] || "economy";
}

/** Map SKYLUX cabin class to Duffel format */
export function toDuffelCabin(skyluxClass: string): string {
  const map: Record<string, string> = {
    economy: "economy",
    premium: "premium_economy",
    business: "business",
    first: "first",
  };
  return map[skyluxClass] || "economy";
}
