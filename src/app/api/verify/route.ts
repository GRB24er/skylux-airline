import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import "@/models/Flight";
import "@/models/Aircraft";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp = req.nextUrl.searchParams;
    const ref = sp.get("ref");
    const fn = sp.get("fn");
    const pax = sp.get("pax");

    if (!ref) {
      return NextResponse.json({ success: false, error: "Missing booking reference" }, { status: 400 });
    }

    const booking = await Booking.findOne({ bookingReference: ref.toUpperCase() })
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name type registration" } })
      .lean();

    if (!booking) {
      return NextResponse.json({ success: false, verified: false, error: "Booking not found" }, { status: 404 });
    }

    const flight = (booking.flights[0]?.flight) as any;
    const passenger = booking.passengers?.find((p: any) =>
      pax ? (p.lastName + "/" + p.firstName).toUpperCase() === decodeURIComponent(pax).toUpperCase() : true
    ) || booking.passengers?.[0];

    const flightMatch = !fn || flight?.flightNumber === fn;
    const isValid = ["confirmed", "checked-in", "boarded", "completed"].includes(booking.status);

    return NextResponse.json({
      success: true,
      verified: isValid && flightMatch,
      data: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        passenger: passenger ? { firstName: passenger.firstName, lastName: passenger.lastName, cabinClass: passenger.cabinClass } : null,
        flight: flight ? {
          flightNumber: flight.flightNumber,
          departure: { city: flight.departure?.city, airportCode: flight.departure?.airportCode, scheduledTime: flight.departure?.scheduledTime },
          arrival: { city: flight.arrival?.city, airportCode: flight.arrival?.airportCode, scheduledTime: flight.arrival?.scheduledTime },
          aircraft: flight.aircraft?.name || "N/A",
        } : null,
        issuedAt: booking.updatedAt,
        boardingPassGenerated: booking.boardingPassGenerated || false,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, verified: false, error: error.message }, { status: 500 });
  }
}