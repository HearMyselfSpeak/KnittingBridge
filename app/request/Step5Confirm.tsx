"use client";

import { SESSION_PRICES } from "@/lib/pricing";

interface Props {
  sessionType: "15" | "45";
  triageSummary: string;
  onConfirm: () => void;
  onChangeType: (type: "15" | "45") => void;
}

const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

const PRICES: Record<string, { label: string; price: string; desc: string }> = {
  "15": {
    label: "Quick look",
    price: formatPrice(SESSION_PRICES["15"]),
    desc: "15 minutes with your Guide. Great for quick questions and stitch checks.",
  },
  "45": {
    label: "Deep dive",
    price: formatPrice(SESSION_PRICES["45"]),
    desc: "45 minutes with your Guide. For detailed walkthroughs and hands-on help.",
  },
};

export default function Step5Confirm({
  sessionType,
  triageSummary,
  onConfirm,
  onChangeType,
}: Props) {
  const selected = PRICES[sessionType]!;
  const other = sessionType === "45" ? "15" : "45";

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h2
        className="text-xl font-semibold text-foreground text-center mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Confirm your session
      </h2>

      <div className="bg-secondary/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          {triageSummary}
        </p>
      </div>

      <div className="border border-primary rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground">
            {selected.label}
          </span>
          <span className="text-lg font-semibold text-foreground">
            {selected.price}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{selected.desc}</p>
      </div>

      <button
        type="button"
        onClick={() => onChangeType(other)}
        className="text-xs text-primary hover:underline mb-6 block"
      >
        Switch to {PRICES[other]!.label.toLowerCase()} ({PRICES[other]!.price})
      </button>

      <p className="text-xs text-muted-foreground text-center mb-6">
        Nothing is charged until the session takes place.
      </p>

      <button
        onClick={onConfirm}
        className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
      >
        Continue to payment
      </button>
    </div>
  );
}
