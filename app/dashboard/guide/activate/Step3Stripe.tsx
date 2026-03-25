"use client";

import { useState, useEffect } from "react";

type StripeState = "not_connected" | "incomplete" | "onboarded" | "loading";

interface Step3StripeProps {
  hasAccount: boolean;
  alreadyOnboarded: boolean;
  onComplete: () => void;
}

export default function Step3Stripe({
  hasAccount,
  alreadyOnboarded,
  onComplete,
}: Step3StripeProps) {
  const [stripeState, setStripeState] = useState<StripeState>(
    alreadyOnboarded ? "onboarded" : hasAccount ? "loading" : "not_connected"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the Guide returns from Stripe with an existing account,
  // check onboarding status on mount.
  useEffect(() => {
    if (!hasAccount || alreadyOnboarded) return;

    async function checkStatus() {
      try {
        const res = await fetch("/api/guides/activate/stripe-connect");
        const json = await res.json();
        if (json.onboarded) {
          setStripeState("onboarded");
        } else {
          setStripeState("incomplete");
        }
      } catch {
        setStripeState("incomplete");
      }
    }
    checkStatus();
  }, [hasAccount, alreadyOnboarded]);

  async function handleConnect() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guides/activate/stripe-connect", {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      // Redirect to Stripe hosted onboarding.
      window.location.href = json.url;
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stripeState === "loading") {
    return (
      <div className="text-sm text-muted-foreground">
        Checking your Stripe account status...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {stripeState === "onboarded" && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <span className="text-green-700 text-lg">&#10003;</span>
          <p className="text-sm text-green-800 font-medium">
            Your Stripe account is connected and ready to receive payments.
          </p>
        </div>
      )}

      {stripeState === "incomplete" && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-amber-700 text-lg">!</span>
          <p className="text-sm text-amber-800 font-medium">
            Your Stripe account setup is not complete. Please continue where you
            left off to start receiving payments.
          </p>
        </div>
      )}

      <section>
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How payments work
        </h2>
        <p className="text-muted-foreground mb-4">
          KnittingBridge uses Stripe to process all payments securely. When a
          Maker pays for a session, your share is deposited directly into your
          bank account through Stripe. KnittingBridge never holds your funds or
          has access to your banking details.
        </p>
        <ul className="space-y-2 pl-4 text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-accent/60 shrink-0">-</span>
            <span>
              Stripe handles all payment processing, identity verification, and
              tax reporting
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent/60 shrink-0">-</span>
            <span>
              Your banking information is shared only with Stripe, not with
              KnittingBridge
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent/60 shrink-0">-</span>
            <span>
              Payouts are deposited to your bank account on a rolling basis,
              typically within 2 business days
            </span>
          </li>
        </ul>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {stripeState === "onboarded" ? (
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm
                     hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm
                     hover:bg-primary/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Connecting..."
            : stripeState === "incomplete"
              ? "Continue Stripe Setup"
              : "Connect with Stripe"}
        </button>
      )}
    </div>
  );
}
