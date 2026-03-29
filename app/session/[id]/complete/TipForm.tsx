"use client";

// Tip form for Makers. Preset amounts + custom with $50 cap.
// Tips go 100% to Guide (no platform fee).

import { useState } from "react";

interface Props {
  helpSessionId: string;
  guideProfileId: string;
  guideFirstName: string;
}

const PRESETS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$15", cents: 1500 },
];

const MAX_TIP_CENTS = 5000;

export default function TipForm({
  helpSessionId,
  guideProfileId,
  guideFirstName,
}: Props) {
  const [selectedCents, setSelectedCents] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCapConfirm, setShowCapConfirm] = useState(false);

  function getAmountCents(): number {
    if (showCustom) {
      const parsed = Math.round(parseFloat(customAmount) * 100);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedCents ?? 0;
  }

  async function handleSubmit() {
    let amountCents = getAmountCents();
    if (amountCents <= 0) return;

    if (amountCents > MAX_TIP_CENTS && !showCapConfirm) {
      setShowCapConfirm(true);
      return;
    }

    if (amountCents > MAX_TIP_CENTS) {
      amountCents = MAX_TIP_CENTS;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/session/tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helpSessionId,
          guideProfileId,
          amountCents,
        }),
      });

      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error("[tip] Submit failed:", err);
    } finally {
      setSubmitting(false);
      setShowCapConfirm(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border bg-white p-6 text-center">
        <p className="font-serif text-lg text-[#1B2A4A]">
          Thank you for your generosity.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Your tip has been sent to {guideFirstName}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="font-serif text-lg font-semibold text-[#1B2A4A]">
        Would you like to leave a tip for {guideFirstName}?
      </h2>

      <div className="mt-4 flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.cents}
            type="button"
            onClick={() => {
              setSelectedCents(preset.cents);
              setShowCustom(false);
              setShowCapConfirm(false);
            }}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selectedCents === preset.cents && !showCustom
                ? "border-[#C4704F] bg-[#C4704F]/10 text-[#C4704F]"
                : "border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            setSelectedCents(null);
            setShowCapConfirm(false);
          }}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            showCustom
              ? "border-[#C4704F] bg-[#C4704F]/10 text-[#C4704F]"
              : "border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <div className="mt-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">$</span>
            <input
              type="number"
              min="1"
              max="50"
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setShowCapConfirm(false);
              }}
              placeholder="Enter amount"
              className="w-24 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
            />
          </div>
        </div>
      )}

      {showCapConfirm && (
        <p className="mt-3 text-sm text-[#C4704F]">
          Tips are capped at $50. Would you like to tip $50?
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={getAmountCents() <= 0 || submitting}
        className="mt-4 rounded bg-[#C4704F] px-6 py-2 text-sm text-white hover:bg-[#b5613f] disabled:opacity-50"
      >
        {submitting
          ? "Sending..."
          : showCapConfirm
            ? "Yes, tip $50"
            : `Send Tip${getAmountCents() > 0 ? ` ($${(getAmountCents() / 100).toFixed(0)})` : ""}`}
      </button>
    </div>
  );
}
