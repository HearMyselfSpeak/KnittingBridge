"use client";

// 1-5 star rating form with blind reveal.
// Below-5 triggers preset reason checkboxes + free-text field.

import { useState, useEffect, useCallback } from "react";

interface Props {
  helpSessionId: string;
  ratedUserId: string;
  role: "maker" | "guide";
}

const MAKER_REASONS = [
  "Guide was hard to understand",
  "Session felt rushed",
  "Advice was not helpful",
  "Technical issues with video",
  "Guide seemed unprepared",
];

const GUIDE_REASONS = [
  "Maker was not prepared",
  "Maker was difficult to communicate with",
  "Session scope was unclear",
  "Technical issues with video",
];

export default function RatingForm({ helpSessionId, ratedUserId, role }: Props) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealedScores, setRevealedScores] = useState<{
    yours: number;
    theirs: number;
  } | null>(null);

  const reasonOptions = role === "maker" ? MAKER_REASONS : GUIDE_REASONS;
  const showFollowUp = score > 0 && score < 5;

  const checkReveal = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/session/rate/reveal?helpSessionId=${helpSessionId}`,
      );
      const data = (await res.json()) as {
        revealed: boolean;
        yours?: number;
        theirs?: number;
      };
      if (data.revealed && data.yours && data.theirs) {
        setRevealedScores({ yours: data.yours, theirs: data.theirs });
      }
    } catch {}
  }, [helpSessionId]);

  useEffect(() => {
    if (!submitted) return;
    const interval = setInterval(checkReveal, 10_000);
    checkReveal();
    return () => clearInterval(interval);
  }, [submitted, checkReveal]);

  async function handleSubmit() {
    if (!score || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/session/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helpSessionId,
          ratedUserId,
          score,
          reasons: reasons.length > 0 ? reasons : undefined,
          freeText: freeText.trim() || undefined,
        }),
      });

      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error("[rating] Submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleReason(reason: string) {
    setReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    );
  }

  if (submitted && revealedScores) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="text-sm text-gray-500">Ratings revealed</p>
        <p className="mt-2 text-lg">
          You rated: {"*".repeat(revealedScores.yours)}
        </p>
        <p className="text-lg">
          They rated: {"*".repeat(revealedScores.theirs)}
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="font-serif text-lg text-[#1B2A4A]">
          Thank you for your rating.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Ratings are revealed once both parties have submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-[#1B2A4A]">
        Rate your {role === "maker" ? "Guide" : "Maker"}
      </h2>

      {/* Stars */}
      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-3xl transition-colors"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <span
              className={
                n <= (hovered || score) ? "text-[#C4704F]" : "text-gray-300"
              }
            >
              *
            </span>
          </button>
        ))}
      </div>

      {/* Below-5 follow-up */}
      {showFollowUp && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">
            What could have been better? (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => toggleReason(reason)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  reasons.includes(reason)
                    ? "border-[#C4704F] bg-[#C4704F]/10 text-[#C4704F]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Anything else you would like to share?"
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
            rows={3}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!score || submitting}
        className="mt-4 rounded bg-[#1B2A4A] px-6 py-2 text-sm text-white hover:bg-[#1B2A4A]/90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
