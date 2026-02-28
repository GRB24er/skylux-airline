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
      .populate({ path: "flights.flight", populate: { path: "aircraft", select: "name model" } }).lean();
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    const flight = (booking as any).flights?.[0]?.flight;
    const pax = (booking as any).passengers || [];
    return NextResponse.json({
      success: true,
      data: {
        invoiceNumber: "INV-" + (booking as any).bookingReference,
        bookingReference: (booking as any).bookingReference,
        issueDate: (booking as any).createdAt,
        status: (booking as any).status,
        passenger: pax[0] ? { firstName: pax[0].firstName, lastName: pax[0].lastName } : null,
        contactEmail: (booking as any).contactEmail,
        cabinClass: (booking as any).cabinClass,
        passengerCount: pax.length,
        passengers: pax.map((p: any) => ({ firstName: p.firstName, lastName: p.lastName, cabinClass: p.cabinClass })),
        flight: flight ? { flightNumber: flight.flightNumber, departure: { city: flight.departure?.city, airportCode: flight.departure?.airportCode, scheduledTime: flight.departure?.scheduledTime }, arrival: { city: flight.arrival?.city, airportCode: flight.arrival?.airportCode, scheduledTime: flight.arrival?.scheduledTime }, aircraft: flight.aircraft?.name || "N/A", duration: flight.duration } : null,
        payment: { method: (booking as any).payment?.method, status: (booking as any).payment?.status, amount: (booking as any).payment?.amount, currency: (booking as any).payment?.currency || "USD", transactionId: (booking as any).payment?.transactionId, paidAt: (booking as any).payment?.paidAt },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
