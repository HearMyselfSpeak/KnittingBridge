"use client";

import { useState } from "react";
import { REFINEMENT_OPTIONS } from "@/lib/ai/refinement";

import type { AccessInfo } from "./RecolorCounter";

interface Props {
  sessionId: string;
  onRefined: (imageUrl: string, label: string, access?: AccessInfo) => void;
  onRefineStart?: () => void;
  onRefineEnd?: () => void;
  disabled?: boolean;
  baselineImageUrl?: string | null;
}

export function RefinementBar({
  sessionId,
  onRefined,
  onRefineStart,
  onRefineEnd,
  disabled = false,
  baselineImageUrl,
}: Props) {
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRefine(instruction: string, label: string) {
    if (active !== null || disabled) return;
    setActive(instruction);
    console.log("[RefinementBar] baselineImageUrl being sent:", baselineImageUrl);
    onRefineStart?.();
    setError(null);
    try {
      const res = await fetch("/api/color-preview/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, instruction, baselineImageUrl }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string; access?: AccessInfo };
      if (!res.ok) throw new Error(data.error ?? "Refinement failed");
      onRefined(data.imageUrl!, label, data.access);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refinement failed");
    } finally {
      setActive(null);
      onRefineEnd?.();
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quick adjustments
      </p>
      <div className="flex flex-wrap gap-2">
        {REFINEMENT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleRefine(opt.id, opt.label)}
            disabled={disabled || active !== null}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40 hover:bg-secondary/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
