"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface Props {
  sessionType: "15" | "45";
  onComplete: (paymentIntentId: string) => void;
}

function PaymentForm({
  onComplete,
}: {
  onComplete: (paymentIntentId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        setError(result.error.message ?? "Payment authorization failed.");
        setLoading(false);
      } else if (result.paymentIntent) {
        onComplete(result.paymentIntent.id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected payment error.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div style={{ background: 'yellow', padding: '4px', fontSize: '12px' }}>
        stripe: {stripe ? 'loaded' : 'not loaded'} | elements: {elements ? 'loaded' : 'not loaded'}
      </div>
      <PaymentElement />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Authorizing..." : "Authorize payment"}
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Nothing is charged until the session takes place.
      </p>
    </form>
  );
}

const STRIPE_KEY_PREFIX = (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '').slice(0, 12);

export default function Step6Payment({ sessionType, onComplete }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string>("pending");

  useEffect(() => {
    stripePromise
      .then((s) => setStripeStatus(s ? "resolved" : "resolved-null"))
      .catch((e) => setStripeStatus(`rejected: ${e}`));
  }, []);

  useEffect(() => {
    async function createIntent() {
      try {
        const res = await fetch("/api/request/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionType }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? `Payment setup failed (${res.status})`);
          return;
        }
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Network error during payment setup.",
        );
      }
    }
    createIntent();
  }, [sessionType]);

  const paymentDebug = (
    <div style={{ background: 'yellow', padding: '4px', fontSize: '12px' }}>
      clientSecret: {clientSecret ? 'yes' : 'no'} | error: {error || 'none'} | stripeKey: {STRIPE_KEY_PREFIX || 'MISSING'} | stripePromise: {stripeStatus}
    </div>
  );

  if (error) {
    return (
      <div className="max-w-md mx-auto py-8 px-4 text-center">
        {paymentDebug}
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto py-8 px-4 text-center">
        {paymentDebug}
        <p className="text-sm text-muted-foreground">
          Setting up payment...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {paymentDebug}
      <h2
        className="text-xl font-semibold text-foreground text-center mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Payment details
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Your card will be authorized but not charged yet.
      </p>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm onComplete={onComplete} />
      </Elements>
    </div>
  );
}
