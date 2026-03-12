import { NextRequest, NextResponse } from "next/server";
import { trackFlight, isAviationStackConfigured } from "@/services/aviationstack";

/* ═════════════════════════════════════════════════════════════════
   Live Flight Tracking — Real-time position data
   GET /api/flights/track?flight=BA115
   ═════════════════════════════════════════════════════════════════ */

export async function GET(req: NextRequest) {
  try {
    const flightIata = req.nextUrl.searchParams.get("flight");
    if (!flightIata) {
      return NextResponse.json(
        { success: false, error: "Missing 'flight' parameter (e.g., BA115)" },
        { status: 400 },
      );
    }

    if (!isAviationStackConfigured()) {
      return NextResponse.json(
        { success: false, error: "Flight tracking service not configured" },
        { status: 503 },
      );
    }

    const data = await trackFlight(flightIata.toUpperCase().replace(/\s/g, ""));
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Flight not found or no tracking data available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        flight: {
          number: data.flight.iata,
          airline: data.airline.name,
          status: data.flightStatus,
          date: data.flightDate,
        },
        departure: {
          airport: data.departure.airport,
          iata: data.departure.iata,
          terminal: data.departure.terminal,
          gate: data.departure.gate,
          scheduled: data.departure.scheduled,
          estimated: data.departure.estimated,
          actual: data.departure.actual,
          delay: data.departure.delay,
        },
        arrival: {
          airport: data.arrival.airport,
          iata: data.arrival.iata,
          terminal: data.arrival.terminal,
          gate: data.arrival.gate,
          scheduled: data.arrival.scheduled,
          estimated: data.arrival.estimated,
          actual: data.arrival.actual,
          delay: data.arrival.delay,
        },
        live: data.live
          ? {
              latitude: data.live.latitude,
              longitude: data.live.longitude,
              altitude: data.live.altitude,
              speed: data.live.speed_horizontal,
              heading: data.live.direction,
              isGrounded: data.live.is_ground,
              lastUpdated: data.live.updated,
            }
          : null,
        aircraft: data.aircraft || null,
      },
    });
  } catch (error: any) {
    console.error("Flight tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track flight" },
      { status: 500 },
    );
  }
}
