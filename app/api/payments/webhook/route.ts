import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe sends the raw body; we must read it as text for signature verification.
async function getRawBody(req: NextRequest): Promise<string> {
  const buf = await req.arrayBuffer();
  return Buffer.from(buf).toString("utf-8");
}

// POST: Receive and process Stripe webhook events.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const { stripe } = await import("@/lib/stripe");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log("Unhandled webhook event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ received: true });
  }
}

// When a Connect account finishes onboarding (or gets updated), sync the
// stripeOnboarded flag on the matching GuideProfile.
async function handleAccountUpdated(account: Stripe.Account) {
  if (!account.id) return;

  const onboarded =
    account.charges_enabled === true && account.payouts_enabled === true;

  const { prisma } = await import("@/lib/prisma");

  const profile = await prisma.guideProfile.findFirst({
    where: { stripeAccountId: account.id },
    select: { id: true, stripeOnboarded: true },
  });

  if (!profile) {
    console.log("No GuideProfile found for Stripe account:", account.id);
    return;
  }

  if (profile.stripeOnboarded !== onboarded) {
    await prisma.guideProfile.update({
      where: { id: profile.id },
      data: { stripeOnboarded: onboarded },
    });
    console.log(
      "Updated stripeOnboarded for GuideProfile",
      profile.id,
      "to",
      onboarded
    );
  }
}

// Mark the HelpSession as paid when the PaymentIntent succeeds.
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const sessionId = paymentIntent.metadata?.helpSessionId;
  if (!sessionId) {
    console.log(
      "payment_intent.succeeded without helpSessionId metadata:",
      paymentIntent.id
    );
    return;
  }

  const { prisma } = await import("@/lib/prisma");

  await prisma.helpSession.update({
    where: { id: sessionId },
    data: {
      paid: true,
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  console.log("Marked HelpSession", sessionId, "as paid");
}

// Log payment failures. The HelpSession stays unpaid so the platform can
// surface an error to the Maker on the next page load.
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const sessionId = paymentIntent.metadata?.helpSessionId;
  const failureMessage =
    paymentIntent.last_payment_error?.message ?? "Unknown failure";

  console.error(
    "Payment failed for PaymentIntent",
    paymentIntent.id,
    "- HelpSession:",
    sessionId ?? "N/A",
    "- Reason:",
    failureMessage
  );

  if (!sessionId) return;

  const { prisma } = await import("@/lib/prisma");

  // Record failure on the Payment if one exists (capture-payment.ts creates it).
  const existing = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: { status: "FAILED" },
    });
  }

  // Also mark the HelpSession as unpaid for surface-level error display.
  await prisma.helpSession.update({
    where: { id: sessionId },
    data: { paid: false },
  });
}
