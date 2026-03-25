"use client";

import { useState } from "react";
import GuideAgreementPart1 from "@/app/legal/guide-agreement/GuideAgreementPart1";
import GuideAgreementPart2 from "@/app/legal/guide-agreement/GuideAgreementPart2";

interface Step1AgreementProps {
  alreadyAccepted: boolean;
  onComplete: () => void;
}

export default function Step1Agreement({
  alreadyAccepted,
  onComplete,
}: Step1AgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (alreadyAccepted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <span className="text-green-700 text-lg">&#10003;</span>
          <p className="text-sm text-green-800 font-medium">
            You accepted the Independent Contractor Agreement.
          </p>
        </div>

        <div
          className="max-h-[60vh] overflow-y-auto border border-border rounded-md
                      p-6 space-y-10 text-sm text-muted-foreground leading-relaxed"
        >
          <GuideAgreementPart1 />
          <GuideAgreementPart2 />
        </div>

        <button
          onClick={onComplete}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm
                     hover:bg-primary/90 transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  async function handleAccept() {
    if (!agreed) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guides/activate/agreement", {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      onComplete();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div
        className="max-h-[60vh] overflow-y-auto border border-border rounded-md
                    p-6 space-y-10 text-sm text-muted-foreground leading-relaxed"
      >
        <GuideAgreementPart1 />
        <GuideAgreementPart2 />
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground leading-snug">
            I have read and agree to the KnittingBridge Independent Contractor
            Agreement. I understand that I am providing services as an
            independent contractor, not as an employee.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleAccept}
          disabled={!agreed || submitting}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm
                     hover:bg-primary/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Accept Agreement"}
        </button>
      </div>
    </div>
  );
}
