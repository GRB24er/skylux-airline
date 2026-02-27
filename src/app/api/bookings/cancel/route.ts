import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const { bookingId, reason } = await req.json();

    const booking = await Booking.findById(bookingId).populate("flights.flight");
    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    // Check ownership or admin
    if (!["admin", "superadmin"].includes(authResult.user.role)) {
      if (booking.user.toString() !== authResult.user._id.toString()) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
      }
    }

    if (["cancelled", "refunded", "completed"].includes(booking.status)) {
      return NextResponse.json({ success: false, error: "Booking cannot be cancelled" }, { status: 400 });
    }

    // Restore seat availability
    for (const flightRef of booking.flights) {
      const flight = await Flight.findById(flightRef.flight);
      if (flight) {
        const seatIdx = flight.seatMap.findIndex((s: any) => s.class === booking.cabinClass);
        if (seatIdx >= 0) {
          flight.seatMap[seatIdx].availableSeats += booking.passengers.length;
          await flight.save();
        }
      }
    }

    // Deduct loyalty points
    const user = await User.findById(booking.user);
    if (user) {
      user.loyaltyPoints = Math.max(0, user.loyaltyPoints - booking.loyaltyPointsEarned);
      user.totalFlights = Math.max(0, user.totalFlights - 1);
      await user.save();
    }

    // Update booking
    booking.status = "cancelled";
    booking.cancellationReason = reason || "Cancelled by user";
    booking.cancelledAt = new Date();
    booking.payment.status = "refunded";
    await booking.save();

    return NextResponse.json({ success: true, data: { booking }, message: "Booking cancelled and refund initiated" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Cancellation failed" }, { status: 500 });
  }
}
