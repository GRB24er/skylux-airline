import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import { createPaymentIntent, isStripeConfigured } from "@/services/stripe";

/* ═════════════════════════════════════════════════════════════════
   Create Stripe PaymentIntent for a pending booking
   POST /api/payments/create-intent
   Body: { bookingId: string }
   Returns: { clientSecret, paymentIntentId }
   ═════════════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: "Payment processing not configured" },
        { status: 503 },
      );
    }

    await connectDB();
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Missing bookingId" },
        { status: 400 },
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (booking.user.toString() !== authResult.user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Only create intent for pending payments
    if (booking.payment.status !== "pending") {
      return NextResponse.json(
        { success: false, error: `Payment is already ${booking.payment.status}` },
        { status: 400 },
      );
    }

    // If already has a payment intent, return existing
    if (booking.payment.stripePaymentIntentId) {
      const { getPaymentIntent } = await import("@/services/stripe");
      const existing = await getPaymentIntent(booking.payment.stripePaymentIntentId);
      if (existing.status !== "canceled") {
        return NextResponse.json({
          success: true,
          data: {
            clientSecret: existing.client_secret,
            paymentIntentId: existing.id,
            amount: booking.payment.amount,
          },
        });
      }
    }

    // Create new PaymentIntent
    const result = await createPaymentIntent({
      amount: booking.payment.breakdown.total,
      bookingReference: booking.bookingReference,
      customerEmail: booking.contactEmail,
      description: `SKYLUX Airways - Booking ${booking.bookingReference}`,
      metadata: {
        bookingId: booking._id.toString(),
        cabinClass: booking.cabinClass,
        passengers: String(booking.passengers.length),
      },
    });

    // Store PaymentIntent ID on booking
    booking.payment.stripePaymentIntentId = result.paymentIntentId;
    booking.payment.status = "processing";
    await booking.save();

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        amount: result.amount,
        bookingReference: booking.bookingReference,
      },
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment" },
      { status: 500 },
    );
  }
}
