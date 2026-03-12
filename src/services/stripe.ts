/* ═══════════════════════════════════════════════════════════════
   Stripe Payment Service
   Handles PaymentIntents, refunds, and webhook verification
   ═══════════════════════════════════════════════════════════════ */

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
    stripeInstance = new Stripe(secretKey, { apiVersion: "2023-10-16" as any });
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT INTENTS
// ═══════════════════════════════════════════════════════════════

export interface CreatePaymentParams {
  amount: number;          // in dollars (will be converted to cents)
  currency?: string;
  bookingReference: string;
  customerEmail: string;
  description?: string;
  metadata?: Record<string, string>;
}

/** Create a Stripe PaymentIntent for a booking */
export async function createPaymentIntent(params: CreatePaymentParams): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}> {
  const stripe = getStripe();

  const amountCents = Math.round(params.amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: (params.currency || "usd").toLowerCase(),
    metadata: {
      bookingReference: params.bookingReference,
      customerEmail: params.customerEmail,
      ...params.metadata,
    },
    receipt_email: params.customerEmail,
    description: params.description || `SKYLUX Airways Booking ${params.bookingReference}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount: params.amount,
  };
}

/** Retrieve a PaymentIntent by ID */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// ═══════════════════════════════════════════════════════════════
// REFUNDS
// ═══════════════════════════════════════════════════════════════

/** Process a full or partial refund */
export async function processRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: "duplicate" | "fraudulent" | "requested_by_customer",
): Promise<Stripe.Refund> {
  const stripe = getStripe();

  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason || "requested_by_customer",
  };

  // Partial refund: amount in cents
  if (amount !== undefined) {
    params.amount = Math.round(amount * 100);
  }

  return stripe.refunds.create(params);
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOKS
// ═══════════════════════════════════════════════════════════════

/** Verify and construct a Stripe webhook event */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured");
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/** Extract booking reference from payment intent metadata */
export function getBookingRefFromEvent(event: Stripe.Event): string | null {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  return paymentIntent.metadata?.bookingReference || null;
}

/** Extract payment intent ID from event */
export function getPaymentIntentIdFromEvent(event: Stripe.Event): string {
  const obj = event.data.object as Stripe.PaymentIntent;
  return obj.id;
}
