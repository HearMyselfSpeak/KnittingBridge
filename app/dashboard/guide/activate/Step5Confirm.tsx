"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Step5ConfirmProps {
  agreementDate: string | null;
  availableDays: string[] | null;
  timeBlocks: Record<string, number[]> | null;
}

function countScheduledHours(blocks: Record<string, number[]>): number {
  let total = 0;
  for (const hours of Object.values(blocks)) {
    total += hours.length;
  }
  return total;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function Step5Confirm({
  agreementDate,
  availableDays,
  timeBlocks,
}: Step5ConfirmProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isImpulse = availableDays != null && availableDays.length === 0;
  const scheduledHours =
    !isImpulse && timeBlocks ? countScheduledHours(timeBlocks) : 0;

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guides/activate/confirm", {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {/* Summary */}
      <section>
        <SectionHeading>Setup summary</SectionHeading>
        <ul className="space-y-3 text-muted-foreground">
          <SummaryItem
            label="IC Agreement"
            value={
              agreementDate
                ? `Signed on ${formatDate(agreementDate)}`
                : "Signed"
            }
          />
          <SummaryItem label="Compensation" value="82% to you, 18% platform fee" />
          <SummaryItem label="Stripe" value="Connected" />
          <SummaryItem
            label="Availability"
            value={
              isImpulse
                ? "Online toggle only"
                : `Weekly schedule, ${scheduledHours} hour${scheduledHours === 1 ? "" : "s"} set`
            }
          />
        </ul>
      </section>

      {/* Activation message */}
      <section>
        <h2
          className="text-xl font-semibold text-primary mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Account activated, congratulations!
        </h2>
        <p className="text-muted-foreground mb-4">
          Your experience matters to someone who is stuck right now. You are
          ready to start helping.
        </p>
        <p className="text-muted-foreground">
          You can update your availability, go online for extra sessions, or
          take a break anytime. Nothing here is locked in.
        </p>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="px-6 py-2 bg-primary text-white rounded-md text-sm
                   hover:bg-primary/90 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Activating..." : "Start receiving requests"}
      </button>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex gap-2">
      <span className="text-green-700">&#10003;</span>
      <span>
        <span className="text-foreground font-medium">{label}:</span> {value}
      </span>
    </li>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-semibold text-primary mb-3"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </h2>
  );
}
