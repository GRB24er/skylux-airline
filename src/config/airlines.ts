/* ═══════════════════════════════════════════════════════════════
   Partner Airlines — SKYLUX Codeshare & Interline Partners
   Real IATA codes, real airline data
   ═══════════════════════════════════════════════════════════════ */

export interface PartnerAirline {
  iataCode: string;
  icaoCode: string;
  name: string;
  alliance: "Star Alliance" | "oneworld" | "SkyTeam" | "Independent";
  country: string;
  isCodeshare: boolean;  // true = flights can be marketed as SKYLUX
  hubs: string[];        // IATA airport codes
  logo?: string;
}

export const SKYLUX_IATA = "SX";
export const SKYLUX_ICAO = "SLX";
export const SKYLUX_NAME = "SKYLUX Airways";

export const PARTNER_AIRLINES: PartnerAirline[] = [
  // Star Alliance Partners
  { iataCode: "LH", icaoCode: "DLH", name: "Lufthansa", alliance: "Star Alliance", country: "Germany", isCodeshare: true, hubs: ["FRA", "MUC"] },
  { iataCode: "UA", icaoCode: "UAL", name: "United Airlines", alliance: "Star Alliance", country: "USA", isCodeshare: true, hubs: ["ORD", "IAH", "EWR", "SFO", "IAD", "DEN"] },
  { iataCode: "SQ", icaoCode: "SIA", name: "Singapore Airlines", alliance: "Star Alliance", country: "Singapore", isCodeshare: true, hubs: ["SIN"] },
  { iataCode: "NH", icaoCode: "ANA", name: "ANA", alliance: "Star Alliance", country: "Japan", isCodeshare: true, hubs: ["NRT", "HND"] },
  { iataCode: "TK", icaoCode: "THY", name: "Turkish Airlines", alliance: "Star Alliance", country: "Turkey", isCodeshare: true, hubs: ["IST"] },
  { iataCode: "AC", icaoCode: "ACA", name: "Air Canada", alliance: "Star Alliance", country: "Canada", isCodeshare: true, hubs: ["YYZ", "YVR", "YUL"] },
  { iataCode: "SK", icaoCode: "SAS", name: "SAS", alliance: "Star Alliance", country: "Scandinavia", isCodeshare: true, hubs: ["CPH", "ARN", "OSL"] },
  { iataCode: "LX", icaoCode: "SWR", name: "SWISS", alliance: "Star Alliance", country: "Switzerland", isCodeshare: true, hubs: ["ZRH", "GVA"] },
  { iataCode: "OS", icaoCode: "AUA", name: "Austrian Airlines", alliance: "Star Alliance", country: "Austria", isCodeshare: true, hubs: ["VIE"] },
  { iataCode: "ET", icaoCode: "ETH", name: "Ethiopian Airlines", alliance: "Star Alliance", country: "Ethiopia", isCodeshare: true, hubs: ["ADD"] },

  // oneworld Partners
  { iataCode: "BA", icaoCode: "BAW", name: "British Airways", alliance: "oneworld", country: "United Kingdom", isCodeshare: true, hubs: ["LHR", "LGW"] },
  { iataCode: "QR", icaoCode: "QTR", name: "Qatar Airways", alliance: "oneworld", country: "Qatar", isCodeshare: true, hubs: ["DOH"] },
  { iataCode: "AA", icaoCode: "AAL", name: "American Airlines", alliance: "oneworld", country: "USA", isCodeshare: true, hubs: ["DFW", "MIA", "ORD", "LAX", "JFK"] },
  { iataCode: "CX", icaoCode: "CPA", name: "Cathay Pacific", alliance: "oneworld", country: "Hong Kong", isCodeshare: true, hubs: ["HKG"] },
  { iataCode: "QF", icaoCode: "QFA", name: "Qantas", alliance: "oneworld", country: "Australia", isCodeshare: true, hubs: ["SYD", "MEL"] },
  { iataCode: "JL", icaoCode: "JAL", name: "Japan Airlines", alliance: "oneworld", country: "Japan", isCodeshare: true, hubs: ["NRT", "HND"] },
  { iataCode: "IB", icaoCode: "IBE", name: "Iberia", alliance: "oneworld", country: "Spain", isCodeshare: true, hubs: ["MAD"] },
  { iataCode: "AY", icaoCode: "FIN", name: "Finnair", alliance: "oneworld", country: "Finland", isCodeshare: true, hubs: ["HEL"] },

  // SkyTeam Partners
  { iataCode: "AF", icaoCode: "AFR", name: "Air France", alliance: "SkyTeam", country: "France", isCodeshare: true, hubs: ["CDG", "ORY"] },
  { iataCode: "KL", icaoCode: "KLM", name: "KLM", alliance: "SkyTeam", country: "Netherlands", isCodeshare: true, hubs: ["AMS"] },
  { iataCode: "DL", icaoCode: "DAL", name: "Delta Air Lines", alliance: "SkyTeam", country: "USA", isCodeshare: true, hubs: ["ATL", "DTW", "MSP", "JFK", "LAX", "SEA"] },
  { iataCode: "KE", icaoCode: "KAL", name: "Korean Air", alliance: "SkyTeam", country: "South Korea", isCodeshare: true, hubs: ["ICN"] },
  { iataCode: "SV", icaoCode: "SVA", name: "Saudia", alliance: "SkyTeam", country: "Saudi Arabia", isCodeshare: true, hubs: ["RUH", "JED"] },

  // Independent Major Carriers
  { iataCode: "EK", icaoCode: "UAE", name: "Emirates", alliance: "Independent", country: "UAE", isCodeshare: true, hubs: ["DXB"] },
  { iataCode: "EY", icaoCode: "ETD", name: "Etihad Airways", alliance: "Independent", country: "UAE", isCodeshare: false, hubs: ["AUH"] },
  { iataCode: "AI", icaoCode: "AIC", name: "Air India", alliance: "Star Alliance", country: "India", isCodeshare: true, hubs: ["DEL", "BOM"] },
  { iataCode: "MS", icaoCode: "MSR", name: "EgyptAir", alliance: "Star Alliance", country: "Egypt", isCodeshare: false, hubs: ["CAI"] },
  { iataCode: "KQ", icaoCode: "KQA", name: "Kenya Airways", alliance: "SkyTeam", country: "Kenya", isCodeshare: false, hubs: ["NBO"] },
  { iataCode: "SA", icaoCode: "SAA", name: "South African Airways", alliance: "Star Alliance", country: "South Africa", isCodeshare: false, hubs: ["JNB"] },
];

/** Lookup airline by IATA code */
export function getAirline(iataCode: string): PartnerAirline | null {
  return PARTNER_AIRLINES.find((a) => a.iataCode === iataCode) || null;
}

/** Get airline name by IATA code (returns "Unknown Airline" if not found) */
export function getAirlineName(iataCode: string): string {
  if (iataCode === SKYLUX_IATA || iataCode === "SX") return SKYLUX_NAME;
  return getAirline(iataCode)?.name || `${iataCode} Airlines`;
}

/** Get all codeshare partners */
export function getCodesharePartners(): PartnerAirline[] {
  return PARTNER_AIRLINES.filter((a) => a.isCodeshare);
}

/** Check if an airline is a known partner */
export function isPartnerAirline(iataCode: string): boolean {
  return PARTNER_AIRLINES.some((a) => a.iataCode === iataCode);
}

/** Map Amadeus carrier code to display name */
export function carrierToDisplay(carrierCode: string): { name: string; isPartner: boolean; isCodeshare: boolean } {
  if (carrierCode === SKYLUX_IATA) {
    return { name: SKYLUX_NAME, isPartner: false, isCodeshare: false };
  }
  const partner = getAirline(carrierCode);
  if (partner) {
    return { name: partner.name, isPartner: true, isCodeshare: partner.isCodeshare };
  }
  return { name: `${carrierCode} Airlines`, isPartner: false, isCodeshare: false };
}
