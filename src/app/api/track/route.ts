import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";

const _f = Flight; const _a = Aircraft;

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ref = req.nextUrl.searchParams.get("ref");
    if (!ref) return NextResponse.json({ success: false, error: "Booking reference required" }, { status: 400 });

    const booking = await Booking.findOne({ bookingReference: ref.toUpperCase() })
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model manufacturer" } })
      .lean();

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const flight = (booking as any).flights?.[0]?.flight;
    const pax = (booking as any).passengers || [];

    return NextResponse.json({
      success: true,
      data: {
        bookingReference: (booking as any).bookingReference,
        status: (booking as any).status,
        cabinClass: (booking as any).cabinClass,
        passengerCount: pax.length,
        passengers: pax.map((p: any) => ({ firstName: p.firstName, lastName: p.lastName })),
        payment: {
          status: (booking as any).payment?.status,
          amount: (booking as any).payment?.amount,
          method: (booking as any).payment?.method,
        },
        flight: flight ? {
          flightNumber: flight.flightNumber,
          status: flight.status,
          aircraft: flight.aircraft?.name || "N/A",
          departure: {
            city: flight.departure?.city,
            airportCode: flight.departure?.airportCode,
            airport: flight.departure?.airport,
            terminal: flight.departure?.terminal,
            gate: flight.departure?.gate,
            scheduledTime: flight.departure?.scheduledTime,
            actualTime: flight.departure?.actualTime,
          },
          arrival: {
            city: flight.arrival?.city,
            airportCode: flight.arrival?.airportCode,
            airport: flight.arrival?.airport,
            terminal: flight.arrival?.terminal,
            gate: flight.arrival?.gate,
            scheduledTime: flight.arrival?.scheduledTime,
            actualTime: flight.arrival?.actualTime,
          },
          duration: flight.duration,
          distance: flight.distance,
        } : null,
        createdAt: (booking as any).createdAt,
        boardingPassAvailable: ["confirmed","checked-in","boarded","completed"].includes((booking as any).status),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
