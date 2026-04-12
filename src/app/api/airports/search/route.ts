import { NextRequest, NextResponse } from "next/server";
import { searchAirports as searchLocalAirports } from "@/data/airports";
import { searchAirports as duffelSearchAirports, isDuffelConfigured } from "@/services/duffel";

export const dynamic = "force-dynamic";

/* ═════════════════════════════════════════════════════════════════
   Airport Search / Autocomplete
   GET /api/airports/search?q=lon&limit=10
   Real Duffel data when available, local fallback
   ═════════════════════════════════════════════════════════════════ */

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q");
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 25);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 },
      );
    }

    let results: any[] = [];

    // Try Duffel Places API first
    if (isDuffelConfigured()) {
      try {
        const duffelResults = await duffelSearchAirports(query);
        results = duffelResults
          .slice(0, limit)
          .map((place: any) => ({
            code: place.iata_code,
            name: place.name,
            city: place.city_name || place.city?.name || "",
            country: place.iata_country_code || "",
            lat: place.latitude,
            lng: place.longitude,
            timezone: place.time_zone || "",
            source: "duffel",
          }));
      } catch (err) {
        console.error("Duffel airport search failed:", err);
      }
    }

    // Fallback or supplement with local database
    if (results.length < limit) {
      const localResults = searchLocalAirports(query, limit - results.length);
      const existingCodes = new Set(results.map((r) => r.code));
      for (const local of localResults) {
        if (!existingCodes.has(local.code)) {
          results.push({
            ...local,
            source: "local",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { airports: results.slice(0, limit) },
    });
  } catch (error: any) {
    console.error("Airport search error:", error);
    return NextResponse.json(
      { success: false, error: "Airport search failed" },
      { status: 500 },
    );
  }
}
