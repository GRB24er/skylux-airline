import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import Booking from "@/models/Booking";
import { processRefund, isStripeConfigured } from "@/services/stripe";

/* ═════════════════════════════════════════════════════════════════
   Process Stripe Refund
   POST /api/payments/refund
   Body: { bookingId: string, amount?: number, reason?: string }
   ═════════════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateUser(req);
    if ("error" in authResult) return authResult.error;

    await connectDB();
    const { bookingId, amount, reason } = await req.json();

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

    // Check authorization — owner or admin
    const isAdmin = ["admin", "superadmin"].includes(authResult.user.role);
    if (!isAdmin && booking.user.toString() !== authResult.user._id.toString()) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    // Must have a completed payment to refund
    if (booking.payment.status !== "completed") {
      return NextResponse.json(
        { success: false, error: `Cannot refund — payment status is ${booking.payment.status}` },
        { status: 400 },
      );
    }

    // If Stripe is configured and we have a PaymentIntent, process real refund
    if (isStripeConfigured() && booking.payment.stripePaymentIntentId) {
      try {
        const refund = await processRefund(
          booking.payment.stripePaymentIntentId,
          amount,
          "requested_by_customer",
        );

        booking.payment.status = "refunded";
        booking.status = "refunded";
        booking.cancellationReason = reason || "Refund requested";
        booking.cancelledAt = new Date();
        await booking.save();

        return NextResponse.json({
          success: true,
          data: {
            refundId: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            bookingReference: booking.bookingReference,
          },
          message: "Refund processed successfully",
        });
      } catch (stripeError: any) {
        console.error("Stripe refund error:", stripeError);
        return NextResponse.json(
          { success: false, error: `Refund failed: ${stripeError.message}` },
          { status: 500 },
        );
      }
    }

    // Fallback: no Stripe — mark as refunded without real processing
    booking.payment.status = "refunded";
    booking.status = "refunded";
    booking.cancellationReason = reason || "Refund requested";
    booking.cancelledAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      data: { bookingReference: booking.bookingReference },
      message: "Refund marked — no payment processor configured for real refund",
    });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { success: false, error: "Refund processing failed" },
      { status: 500 },
    );
  }
}
