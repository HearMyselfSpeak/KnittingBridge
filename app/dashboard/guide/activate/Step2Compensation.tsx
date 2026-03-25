"use client";

import { useState, useEffect } from "react";

const SESSION_KEY = "kb_activation_step2";

interface Step2CompensationProps {
  alreadyReviewed: boolean;
  onComplete: () => void;
}

function FeeBreakdownItem({
  label,
  detail,
}: {
  label: string;
  detail: string;
}) {
  return (
    <li className="flex gap-2">
      <span className="text-accent/60 shrink-0">-</span>
      <span>
        <span className="text-foreground font-medium">{label}:</span> {detail}
      </span>
    </li>
  );
}

export default function Step2Compensation({
  alreadyReviewed,
  onComplete,
}: Step2CompensationProps) {
  const [reviewed, setReviewed] = useState(alreadyReviewed);

  // Check sessionStorage on mount for previously reviewed state.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "reviewed") {
        setReviewed(true);
      }
    } catch {
      // Private browsing or quota error, ignore.
    }
  }, []);

  function handleAcknowledge() {
    try {
      sessionStorage.setItem(SESSION_KEY, "reviewed");
    } catch {
      // Ignore storage errors.
    }
    setReviewed(true);
    onComplete();
  }

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {reviewed && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <span className="text-green-700 text-lg">&#10003;</span>
          <p className="text-sm text-green-800 font-medium">
            You have reviewed the compensation structure.
          </p>
        </div>
      )}

      {/* Earnings split */}
      <section>
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          How you get paid
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-border rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-primary">82%</p>
            <p className="text-muted-foreground mt-1">Your earnings</p>
          </div>
          <div className="border border-border rounded-md p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">18%</p>
            <p className="text-muted-foreground mt-1">Platform fee</p>
          </div>
        </div>
        <p className="text-muted-foreground">
          For every session, you receive 82% of the fee. KnittingBridge retains
          18% to cover the costs of running the platform.
        </p>
      </section>

      {/* Tips */}
      <section>
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Tips
        </h2>
        <p className="text-muted-foreground">
          Tips are 100% yours. The platform fee does not apply to tips. When a
          Maker adds a tip after a session, the full amount goes directly to
          your Stripe account.
        </p>
      </section>

      {/* What the fee covers */}
      <section>
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          What the 18% covers
        </h2>
        <ul className="space-y-2 pl-4 text-muted-foreground">
          <FeeBreakdownItem
            label="Payment processing"
            detail="Stripe fees for card charges, payouts, and Connect transfers"
          />
          <FeeBreakdownItem
            label="Matching"
            detail="AI-powered intake, triage, and Guide selection for each request"
          />
          <FeeBreakdownItem
            label="Scheduling"
            detail="Session coordination, availability management, and notifications"
          />
          <FeeBreakdownItem
            label="Dispute resolution"
            detail="Refund handling, mediation, and quality review"
          />
          <FeeBreakdownItem
            label="Platform maintenance"
            detail="Hosting, security, video infrastructure, and ongoing development"
          />
        </ul>
      </section>

      {/* Payout timing */}
      <section>
        <h2
          className="text-lg font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Payout timing
        </h2>
        <p className="text-muted-foreground">
          Earnings are deposited to your bank account on a rolling basis through
          Stripe. Most payouts arrive within 2 business days after a session is
          completed. You can view your payout schedule and history in your
          Stripe dashboard at any time.
        </p>
      </section>

      {/* Acknowledge / Continue */}
      <button
        onClick={reviewed ? onComplete : handleAcknowledge}
        className="px-6 py-2 bg-primary text-white rounded-md text-sm
                   hover:bg-primary/90 transition-colors"
      >
        {reviewed ? "Continue" : "I understand, continue"}
      </button>
    </div>
  );
}
