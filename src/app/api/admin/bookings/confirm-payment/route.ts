import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";
import Flight from "@/models/Flight";
import Aircraft from "@/models/Aircraft";
const _f = Flight; const _a = Aircraft;

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;
    if (!["admin","superadmin"].includes(authResult.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    await connectDB();
    const { bookingId, transactionId, notes } = await req.json();
    if (!bookingId) return NextResponse.json({ success: false, error: "bookingId required" }, { status: 400 });
    const booking = await Booking.findById(bookingId).populate({ path: "flights.flight", select: "flightNumber departure arrival" });
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId = transactionId || "ADMIN-" + Date.now().toString(36).toUpperCase();
    if (notes) booking.payment.notes = notes;
    booking.status = "confirmed";
    await booking.save();
    const user = await User.findById(booking.user);
    if (user) { user.loyaltyPoints += Math.floor(booking.payment.amount * 0.1); user.totalFlights += 1; user.totalSpent += booking.payment.amount; await user.save(); }
    const flight = (booking.flights[0]?.flight) as any;
    const pax = booking.passengers[0];
    if (booking.contactEmail && flight) {
      try {
        await sendEmail({
          to: booking.contactEmail,
          subject: "SKYLUX Airways - Payment Confirmed " + booking.bookingReference,
          html: bookingConfirmationEmail({
            name: (pax?.firstName || "") + " " + (pax?.lastName || ""),
            bookingRef: booking.bookingReference,
            flightNumber: flight.flightNumber || "N/A",
            from: (flight.departure?.city || "?") + " (" + (flight.departure?.airportCode || "?") + ")",
            to: (flight.arrival?.city || "?") + " (" + (flight.arrival?.airportCode || "?") + ")",
            date: flight.departure?.scheduledTime ? new Date(flight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "TBD",
            cabin: ((booking.cabinClass || "economy").charAt(0).toUpperCase() + (booking.cabinClass || "economy").slice(1)),
            total: "$" + (booking.payment.amount || 0).toLocaleString(),
          }),
        });
      } catch (e) { console.error("Email failed:", e); }
    }
    return NextResponse.json({ success: true, message: "Payment confirmed and customer notified" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
