import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import { sendEmail, eTicketEmail } from "@/services/email";
import "@/models/Flight";
import "@/models/Aircraft";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { bookingReference, lastName } = await req.json();

    if (!bookingReference || !lastName) {
      return NextResponse.json({ success: false, error: "Booking reference and last name are required" }, { status: 400 });
    }

    const booking = await Booking.findOne({
      bookingReference: bookingReference.toUpperCase(),
    }).populate({
      path: "flights.flight",
      populate: { path: "aircraft", select: "name type" },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Verify passenger last name
    const paxMatch = booking.passengers.some(
      (p: any) => p.lastName.toLowerCase() === lastName.toLowerCase()
    );
    if (!paxMatch) {
      return NextResponse.json({ success: false, error: "Last name does not match booking records" }, { status: 403 });
    }

    if (booking.status === "cancelled" || booking.status === "refunded") {
      return NextResponse.json({ success: false, error: "This booking has been cancelled" }, { status: 400 });
    }

    if (booking.status === "checked-in") {
      return NextResponse.json({
        success: true,
        data: { bookingReference: booking.bookingReference, status: "checked-in", alreadyCheckedIn: true },
        message: "You are already checked in",
      });
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json({ success: false, error: "Booking must be confirmed before check-in" }, { status: 400 });
    }

    // Check-in window: 48 hours before departure
    const flight = booking.flights[0]?.flight as any;
    if (flight) {
      const depTime = new Date(flight.departure?.scheduledTime);
      const now = new Date();
      const hoursUntilDep = (depTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilDep > 48) {
        return NextResponse.json({
          success: false,
          error: `Check-in opens 48 hours before departure. Check-in opens on ${new Date(depTime.getTime() - 48 * 60 * 60000).toLocaleString()}`,
        }, { status: 400 });
      }

      if (hoursUntilDep < 1) {
        return NextResponse.json({ success: false, error: "Check-in has closed for this flight" }, { status: 400 });
      }
    }

    // Perform check-in
    booking.status = "checked-in";
    booking.checkInTime = new Date();
    booking.boardingPassGenerated = true;
    await booking.save();

    // Send e-ticket/boarding pass email
    if (flight) {
      const pax = booking.passengers[0];
      const depTime = new Date(flight.departure?.scheduledTime);
      const arrTime = new Date(flight.arrival?.scheduledTime);
      const boardingTime = new Date(depTime.getTime() - 45 * 60000);

      try {
        await sendEmail({
          to: booking.contactEmail,
          subject: `SKYLUX Airways — Boarding Pass Ready | ${booking.bookingReference}`,
          html: eTicketEmail({
            name: `${pax.firstName} ${pax.lastName}`,
            bookingRef: booking.bookingReference,
            flightNumber: flight.flightNumber,
            from: flight.departure?.city || "",
            fromCode: flight.departure?.airportCode || "",
            to: flight.arrival?.city || "",
            toCode: flight.arrival?.airportCode || "",
            date: depTime.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short" }),
            departTime: depTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            arriveTime: arrTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            seat: pax.seatNumber || "TBD",
            gate: "See display",
            boarding: boardingTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          }),
        });
      } catch (e) {
        console.error("E-ticket email failed:", e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        status: "checked-in",
        checkInTime: booking.checkInTime,
        boardingPassUrl: `/boarding-pass/${booking.bookingReference}`,
        passengers: booking.passengers.map((p: any) => ({
          name: `${p.firstName} ${p.lastName}`,
          seat: p.seatNumber || "Auto-assigned",
          cabinClass: p.cabinClass,
        })),
      },
      message: "Check-in successful! Your boarding pass is ready.",
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ success: false, error: error.message || "Check-in failed" }, { status: 500 });
  }
}