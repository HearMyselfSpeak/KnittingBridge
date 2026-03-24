// Lazy-loaded Stripe client singleton.
// IMPORTANT: Never import stripe at the top level of API route files.
// All API routes must export: export const dynamic = 'force-dynamic'
// Then import lazily:  const { stripe } = await import('@/lib/stripe')

import Stripe from "stripe";

const globalForStripe = globalThis as unknown as { stripe: Stripe };

function createStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey);
}

export const stripe = globalForStripe.stripe ?? createStripeClient();

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}

// Create a Stripe Connect Express account for a Guide.
export async function createConnectAccount(email: string): Promise<string> {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });
  return account.id;
}

// Generate a Connect onboarding link. Redirect the user to the returned URL.
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
  return link.url;
}

// Check whether a Connect account has completed onboarding.
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  const account = await stripe.accounts.retrieve(accountId);
  return account.details_submitted === true;
}

// Create a PaymentIntent for a session. Amount is in cents.
export async function createPaymentIntent(
  amountCents: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    capture_method: "manual",
    metadata,
  });
}

// Capture a previously authorized PaymentIntent.
export async function capturePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId);
}

// Transfer Guide earnings (75%) to their Connect account after session ends.
// amount is the total session amount in cents.
export async function transferGuideEarnings(
  amountCents: number,
  stripeAccountId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Transfer> {
  const guideEarnings = Math.floor(amountCents * 0.75);
  return stripe.transfers.create({
    amount: guideEarnings,
    currency: "usd",
    destination: stripeAccountId,
    metadata,
  });
}

// Refund a PaymentIntent.
export async function refundPayment(
  paymentIntentId: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}
