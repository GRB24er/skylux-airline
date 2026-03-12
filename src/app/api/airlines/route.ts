import { NextRequest, NextResponse } from "next/server";
import { PARTNER_AIRLINES, SKYLUX_NAME, SKYLUX_IATA, SKYLUX_ICAO, getCodesharePartners } from "@/config/airlines";
import { getAirlineInfo, isAviationStackConfigured } from "@/services/aviationstack";

/* ═════════════════════════════════════════════════════════════════
   Airlines — List SKYLUX + partner airlines with real data
   GET /api/airlines                     — List all
   GET /api/airlines?code=BA             — Specific airline info
   GET /api/airlines?codeshare=true      — Only codeshare partners
   ═════════════════════════════════════════════════════════════════ */

export async function GET(req: NextRequest) {
  try {
    const codeParam = req.nextUrl.searchParams.get("code");
    const codeshareOnly = req.nextUrl.searchParams.get("codeshare") === "true";

    // Single airline lookup
    if (codeParam) {
      const code = codeParam.toUpperCase();

      // Check local config first
      const local = PARTNER_AIRLINES.find((a) => a.iataCode === code);
      let realData = null;

      // Enrich with real data from AviationStack
      if (isAviationStackConfigured()) {
        try {
          realData = await getAirlineInfo(code);
        } catch (err) {
          console.error("AviationStack airline lookup error:", err);
        }
      }

      if (!local && !realData) {
        return NextResponse.json(
          { success: false, error: `Airline ${code} not found` },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          airline: {
            iataCode: local?.iataCode || realData?.iata_code || code,
            icaoCode: local?.icaoCode || realData?.icao_code || "",
            name: local?.name || realData?.airline_name || code,
            alliance: local?.alliance || "Independent",
            country: local?.country || realData?.country_name || "",
            isCodeshare: local?.isCodeshare || false,
            hubs: local?.hubs || [],
            fleetSize: realData?.fleet_size || null,
            status: realData?.status || "active",
            isPartner: !!local,
            verified: !!realData,
          },
        },
      });
    }

    // List airlines
    const airlines = codeshareOnly ? getCodesharePartners() : PARTNER_AIRLINES;

    const skylux = {
      iataCode: SKYLUX_IATA,
      icaoCode: SKYLUX_ICAO,
      name: SKYLUX_NAME,
      alliance: "Independent" as const,
      country: "International",
      isCodeshare: false,
      hubs: ["LHR", "JFK", "DXB", "SIN"],
      isPrimary: true,
    };

    return NextResponse.json({
      success: true,
      data: {
        primary: skylux,
        partners: airlines.map((a) => ({
          iataCode: a.iataCode,
          icaoCode: a.icaoCode,
          name: a.name,
          alliance: a.alliance,
          country: a.country,
          isCodeshare: a.isCodeshare,
          hubs: a.hubs,
        })),
        totalPartners: airlines.length,
      },
    });
  } catch (error: any) {
    console.error("Airlines API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve airlines" },
      { status: 500 },
    );
  }
}
