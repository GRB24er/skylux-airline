import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import Flight from "@/models/Flight";
import User from "@/models/User";
import { generateBookingReference, calculatePriceBreakdown, calculatePointsEarned } from "@/utils/helpers";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";
import "@/models/Aircraft";

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const body = await req.json();
    const { flightIds, passengers, cabinClass, contactEmail, contactPhone, addOns, paymentMethod, promoCode, useLoyaltyPoints } = body;

    // Validate required fields
    if (!flightIds?.length || !passengers?.length || !cabinClass || !contactEmail || !contactPhone || !paymentMethod) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Fetch flights and validate availability
    const flights = await Flight.find({ _id: { $in: flightIds }, isActive: true });
    if (flights.length !== flightIds.length) {
      return NextResponse.json({ success: false, error: "One or more flights not found or unavailable" }, { status: 404 });
    }

    // Check seat availability
    for (const flight of flights) {
      const seatConfig = flight.seatMap.find((s: any) => s.class === cabinClass);
      if (!seatConfig || seatConfig.availableSeats < passengers.length) {
        return NextResponse.json({
          success: false,
          error: `Not enough seats in ${cabinClass} class on flight ${flight.flightNumber}`,
        }, { status: 400 });
      }
    }

    // Calculate pricing
    const baseFarePerPerson = flights.reduce((sum: number, f: any) => {
      const seat = f.seatMap.find((s: any) => s.class === cabinClass);
      return sum + (seat?.price || 0);
    }, 0);

    const breakdown = calculatePriceBreakdown(baseFarePerPerson, passengers.length, 0, useLoyaltyPoints || 0);

    // Generate unique booking reference
    let bookingRef: string;
    let refExists = true;
    do {
      bookingRef = generateBookingReference();
      refExists = !!(await Booking.findOne({ bookingReference: bookingRef }));
    } while (refExists);

    // Create booking
    const booking = await Booking.create({
      bookingReference: bookingRef,
      user: authResult.user._id,
      flights: flightIds.map((id: string, i: number) => ({
        flight: id,
        direction: i === 0 ? "outbound" : "return",
      })),
      passengers: passengers.map((p: any) => ({ ...p, cabinClass })),
      cabinClass,
      status: "pending",
      payment: {
        status: "pending",
        method: paymentMethod,
        amount: breakdown.total,
        currency: "USD",
        breakdown,
      },
      addOns: addOns || {},
      contactEmail,
      contactPhone,
      loyaltyPointsEarned: calculatePointsEarned(breakdown.total),
    });

    // Update seat availability
    for (const flight of flights) {
      const seatIdx = flight.seatMap.findIndex((s: any) => s.class === cabinClass);
      if (seatIdx >= 0) {
        flight.seatMap[seatIdx].availableSeats -= passengers.length;
        await flight.save();
      }
    }

    // Simulate payment success (in production, integrate Stripe)
    booking.payment.status = "completed";
    booking.payment.paidAt = new Date();
    booking.payment.transactionId = "TXN-" + Date.now().toString(36).toUpperCase();
    booking.status = "confirmed";
    await booking.save();

    // Award loyalty points
    const user = await User.findById(authResult.user._id);
    if (user) {
      user.loyaltyPoints += booking.loyaltyPointsEarned;
      user.totalFlights += 1;
      user.totalSpent += breakdown.total;
      await user.save();
    }

    // Send confirmation email
    const primaryFlight = flights[0];
    try {
      await sendEmail({
        to: contactEmail,
        subject: `SKYLUX Airways — Booking Confirmed ${bookingRef}`,
        html: bookingConfirmationEmail({
          name: `${passengers[0].firstName} ${passengers[0].lastName}`,
          bookingRef,
          flightNumber: primaryFlight.flightNumber,
          from: `${primaryFlight.departure.city} (${primaryFlight.departure.airportCode})`,
          to: `${primaryFlight.arrival.city} (${primaryFlight.arrival.airportCode})`,
          date: new Date(primaryFlight.departure.scheduledTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          cabin: cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1),
          total: `$${breakdown.total.toLocaleString()}`,
        }),
      });
      booking.eTicketSent = true;
      await booking.save();
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
    }

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: "flights.flight", select: "flightNumber departure arrival duration status aircraft" })
      .populate("user", "firstName lastName email")
      .lean();

    return NextResponse.json({
      success: true,
      data: { booking: populatedBooking },
      message: `Booking ${bookingRef} confirmed successfully`,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ success: false, error: error.message || "Booking failed" }, { status: 500 });
  }
}
