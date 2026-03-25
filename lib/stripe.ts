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

// Check whether a Connect account has completed onboarding and is fully operational.
// Both charges_enabled and payouts_enabled must be true before routing sessions to this Guide.
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  const account = await stripe.accounts.retrieve(accountId);
  return account.charges_enabled === true && account.payouts_enabled === true;
}

// Create a PaymentIntent for a session using destination charges.
// Funds flow to the Guide's Connect account; the platform retains application_fee_amount.
// platformFeePercent: 0–1 (e.g. 0.25 = 25%). amountCents is the total charge in cents.
export async function createPaymentIntent(
  amountCents: number,
  guideStripeAccountId: string,
  platformFeePercent: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  const applicationFee = Math.floor(amountCents * platformFeePercent);
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency,
    capture_method: "manual",
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: guideStripeAccountId,
    },
    metadata,
  });
}

// Capture a previously authorized PaymentIntent.
export async function capturePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId);
}

// Refund a PaymentIntent.
export async function refundPayment(
  paymentIntentId: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}
