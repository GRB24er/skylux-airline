import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { constructWebhookEvent, getBookingRefFromEvent, getPaymentIntentIdFromEvent } from "@/services/stripe";
import { sendEmail, bookingConfirmationEmail } from "@/services/email";
import { calculatePointsEarned } from "@/utils/helpers";

/* ═════════════════════════════════════════════════════════════════
   Stripe Webhook Handler
   POST /api/payments/webhook
   Processes: payment_intent.succeeded, payment_intent.payment_failed
   ═════════════════════════════════════════════════════════════════ */

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    let event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {
      case "payment_intent.succeeded": {
        const bookingRef = getBookingRefFromEvent(event);
        const paymentIntentId = getPaymentIntentIdFromEvent(event);

        if (!bookingRef) {
          console.error("No booking reference in payment intent metadata");
          break;
        }

        const booking = await Booking.findOne({ bookingReference: bookingRef }).populate("flights.flight");
        if (!booking) {
          console.error("Booking not found for ref:", bookingRef);
          break;
        }

        // Update booking status
        booking.payment.status = "completed";
        booking.payment.transactionId = paymentIntentId;
        booking.payment.paidAt = new Date();
        booking.status = "confirmed";
        await booking.save();

        // Update user stats
        const user = await User.findById(booking.user);
        if (user) {
          const pointsEarned = calculatePointsEarned(booking.payment.breakdown.total);
          user.loyaltyPoints += pointsEarned;
          user.totalFlights += 1;
          user.totalSpent += booking.payment.breakdown.total;
          booking.loyaltyPointsEarned = pointsEarned;
          await booking.save();
          await user.save();
        }

        // Send confirmation email
        const pf = booking.flights[0]?.flight as any;
        if (pf) {
          try {
            await sendEmail({
              to: booking.contactEmail,
              subject: `SKYLUX Airways - Booking Confirmed ${bookingRef}`,
              html: bookingConfirmationEmail({
                name: `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`,
                bookingRef,
                flightNumber: pf.flightNumber,
                from: `${pf.departure?.city} (${pf.departure?.airportCode})`,
                to: `${pf.arrival?.city} (${pf.arrival?.airportCode})`,
                date: new Date(pf.departure?.scheduledTime).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                }),
                cabin: booking.cabinClass.charAt(0).toUpperCase() + booking.cabinClass.slice(1),
                total: `$${booking.payment.breakdown.total.toLocaleString()}`,
              }),
            });
            booking.eTicketSent = true;
            await booking.save();
          } catch (e) {
            console.error("Confirmation email failed:", e);
          }
        }

        console.log(`[Webhook] Payment succeeded for booking ${bookingRef}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const bookingRef = getBookingRefFromEvent(event);
        if (bookingRef) {
          const booking = await Booking.findOne({ bookingReference: bookingRef });
          if (booking) {
            booking.payment.status = "failed";
            await booking.save();
            console.log(`[Webhook] Payment failed for booking ${bookingRef}`);
          }
        }
        break;
      }

      case "charge.refunded": {
        const bookingRef = getBookingRefFromEvent(event);
        if (bookingRef) {
          const booking = await Booking.findOne({ bookingReference: bookingRef });
          if (booking && booking.payment.status !== "refunded") {
            booking.payment.status = "refunded";
            booking.status = "refunded";
            await booking.save();
            console.log(`[Webhook] Refund processed for booking ${bookingRef}`);
          }
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
