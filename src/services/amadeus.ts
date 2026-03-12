/* ═══════════════════════════════════════════════════════════════
   Amadeus GDS API Client
   Handles OAuth2 auth, flight search, pricing, booking, status
   https://developers.amadeus.com/self-service
   ═══════════════════════════════════════════════════════════════ */

const AMADEUS_BASE = {
  test: "https://test.api.amadeus.com",
  production: "https://api.amadeus.com",
};

interface AmadeusToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: AmadeusToken | null = null;

function getBaseUrl(): string {
  const env = (process.env.AMADEUS_ENV || "test") as "test" | "production";
  return AMADEUS_BASE[env] || AMADEUS_BASE.test;
}

function isConfigured(): boolean {
  return !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET);
}

/** Authenticate with Amadeus OAuth2 and cache the token */
async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  const res = await fetch(`${getBaseUrl()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.access_token;
}

/** Make an authenticated request to Amadeus API */
async function amadeusRequest(method: string, path: string, body?: any, params?: Record<string, string>): Promise<any> {
  const token = await authenticate();
  const url = new URL(`${getBaseUrl()}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Amadeus ${method} ${path} failed:`, res.status, err);
    throw new Error(`Amadeus API error: ${res.status}`);
  }

  return res.json();
}

// ── Search cache (5-min TTL) ──
const searchCache = new Map<string, { data: any; expires: number }>();

function getCacheKey(params: Record<string, any>): string {
  return JSON.stringify(params);
}

function getCached(key: string): any | null {
  const entry = searchCache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  if (entry) searchCache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttlMs = 300000): void {
  // Evict old entries if cache too large
  if (searchCache.size > 500) {
    const now = Date.now();
    for (const [k, v] of searchCache) {
      if (now >= v.expires) searchCache.delete(k);
    }
  }
  searchCache.set(key, { data, expires: Date.now() + ttlMs });
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
  cabinClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  maxResults?: number;
  nonStop?: boolean;
}

export interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;  // ISO 8601 e.g., "PT12H30M"
    segments: {
      departure: { iataCode: string; terminal?: string; at: string };
      arrival: { iataCode: string; terminal?: string; at: string };
      carrierCode: string;
      number: string;         // flight number
      aircraft: { code: string };
      operating?: { carrierCode: string };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }[];
  }[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees: { amount: string; type: string }[];
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: { currency: string; total: string; base: string };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;        // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
      fareBasis: string;
      class: string;
      includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number };
    }[];
  }[];
}

/** Search for real flight offers */
export async function searchFlights(params: FlightSearchParams): Promise<{ offers: AmadeusFlightOffer[]; dictionaries: any }> {
  if (!isConfigured()) {
    return { offers: [], dictionaries: {} };
  }

  const cacheKey = getCacheKey(params);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const cabinMap: Record<string, string> = {
      economy: "ECONOMY",
      premium: "PREMIUM_ECONOMY",
      business: "BUSINESS",
      first: "FIRST",
    };

    const queryParams: Record<string, string> = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departDate,
      adults: String(params.adults),
      max: String(params.maxResults || 10),
      currencyCode: "USD",
    };

    if (params.returnDate) queryParams.returnDate = params.returnDate;
    if (params.cabinClass) queryParams.travelClass = params.cabinClass;
    else if (params.cabinClass && cabinMap[params.cabinClass.toLowerCase()]) {
      queryParams.travelClass = cabinMap[params.cabinClass.toLowerCase()];
    }
    if (params.nonStop) queryParams.nonStop = "true";

    const response = await amadeusRequest("GET", "/v2/shopping/flight-offers", undefined, queryParams);
    const result = {
      offers: response.data || [],
      dictionaries: response.dictionaries || {},
    };

    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Amadeus flight search error:", error);
    return { offers: [], dictionaries: {} };
  }
}

/** Confirm pricing for selected flight offer (ensures price hasn't changed) */
export async function confirmPrice(flightOffer: AmadeusFlightOffer): Promise<{ offer: AmadeusFlightOffer; verified: boolean } | null> {
  if (!isConfigured()) return null;

  try {
    const response = await amadeusRequest("POST", "/v1/shopping/flight-offers/pricing", {
      data: {
        type: "flight-offers-pricing",
        flightOffers: [flightOffer],
      },
    });

    return {
      offer: response.data?.flightOffers?.[0] || flightOffer,
      verified: true,
    };
  } catch (error) {
    console.error("Amadeus price confirm error:", error);
    return null;
  }
}

export interface AmadeusPassenger {
  id: string;
  dateOfBirth: string;    // YYYY-MM-DD
  name: { firstName: string; lastName: string };
  gender: "MALE" | "FEMALE";
  contact: {
    emailAddress: string;
    phones: { deviceType: string; countryCallingCode: string; number: string }[];
  };
  documents?: {
    documentType: "PASSPORT";
    birthPlace?: string;
    issuanceLocation?: string;
    issuanceDate?: string;
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    validityCountry?: string;
    nationality: string;
    holder: boolean;
  }[];
}

/** Create a real booking (PNR) with Amadeus */
export async function createBooking(
  flightOffer: AmadeusFlightOffer,
  passengers: AmadeusPassenger[],
  contactEmail: string,
): Promise<{ pnr: string; id: string; raw: any } | null> {
  if (!isConfigured()) return null;

  try {
    const response = await amadeusRequest("POST", "/v1/booking/flight-orders", {
      data: {
        type: "flight-order",
        flightOffers: [flightOffer],
        travelers: passengers,
        remarks: {
          general: [{ subType: "GENERAL_MISCELLANEOUS", text: "SKYLUX AIRWAYS BOOKING" }],
        },
        contacts: [
          {
            addresseeName: { firstName: passengers[0].name.firstName, lastName: passengers[0].name.lastName },
            companyName: "SKYLUX Airways",
            purpose: "STANDARD",
            phones: passengers[0].contact.phones,
            emailAddress: contactEmail,
          },
        ],
      },
    });

    const orderData = response.data;
    return {
      pnr: orderData.associatedRecords?.[0]?.reference || orderData.id,
      id: orderData.id,
      raw: orderData,
    };
  } catch (error) {
    console.error("Amadeus booking error:", error);
    return null;
  }
}

/** Get flight schedule/status from Amadeus */
export async function getFlightSchedule(
  carrierCode: string,
  flightNumber: string,
  departureDate: string,
): Promise<any[]> {
  if (!isConfigured()) return [];

  try {
    const response = await amadeusRequest("GET", "/v2/schedule/flights", undefined, {
      carrierCode,
      flightNumber,
      scheduledDepartureDate: departureDate,
    });
    return response.data || [];
  } catch (error) {
    console.error("Amadeus flight status error:", error);
    return [];
  }
}

/** Search airports/cities using Amadeus Locations API */
export async function searchLocations(keyword: string): Promise<any[]> {
  if (!isConfigured()) return [];

  const cacheKey = `locations:${keyword.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await amadeusRequest("GET", "/v1/reference-data/locations", undefined, {
      subType: "AIRPORT,CITY",
      keyword: keyword.toUpperCase(),
      "page[limit]": "10",
    });
    const results = response.data || [];
    setCache(cacheKey, results, 3600000); // 1 hour cache for locations
    return results;
  } catch (error) {
    console.error("Amadeus location search error:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// MAPPERS — Convert Amadeus format to SKYLUX internal format
// ═══════════════════════════════════════════════════════════════

/** Parse ISO 8601 duration (PT12H30M) to minutes */
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

/** Map Amadeus cabin class to SKYLUX cabin class */
export function mapCabinClass(amadeusClass: string): string {
  const map: Record<string, string> = {
    ECONOMY: "economy",
    PREMIUM_ECONOMY: "premium",
    BUSINESS: "business",
    FIRST: "first",
  };
  return map[amadeusClass] || "economy";
}

/** Map SKYLUX cabin class to Amadeus format */
export function toAmadeusCabin(skyluxClass: string): string {
  const map: Record<string, string> = {
    economy: "ECONOMY",
    premium: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  return map[skyluxClass] || "ECONOMY";
}

/** Check if Amadeus API is available */
export function isAmadeusConfigured(): boolean {
  return isConfigured();
}
