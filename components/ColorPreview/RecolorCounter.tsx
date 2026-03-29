"use client";

import { useEffect, useState } from "react";
import {
  recolorsRemaining,
  recolorsExhaustedFree,
  recolorsExhaustedPurchased,
  weekOneComplete,
  projectLimitReached,
} from "@/lib/color-previews-copy";

interface AccessInfo {
  allowed: boolean;
  tier: "anonymous" | "returning" | "free" | "purchased";
  remaining: number;
  daysUntilReset?: number;
}

interface Props {
  access: AccessInfo | null;
  onAccessChange?: (access: AccessInfo) => void;
}

export function RecolorCounter({ access, onAccessChange }: Props) {
  const [info, setInfo] = useState<AccessInfo | null>(access);

  useEffect(() => {
    if (access) {
      setInfo(access);
      return;
    }
    // Fetch on mount if not provided
    fetch("/api/color-preview/access")
      .then((r) => r.json())
      .then((data: AccessInfo) => {
        setInfo(data);
        onAccessChange?.(data);
      })
      .catch(() => {});
  }, [access, onAccessChange]);

  if (!info) return null;

  // Returning anonymous: email wall
  if (info.tier === "returning" && !info.allowed) {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
        <p className="text-sm text-foreground">{weekOneComplete()}</p>
        <a
          href="/auth/signin"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Confirm your email to continue
        </a>
      </div>
    );
  }

  // Exhausted: free tier
  if (!info.allowed && info.tier === "free") {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
        <p className="text-sm text-foreground">
          {recolorsExhaustedFree(info.daysUntilReset ?? 7)}
        </p>
        <a
          href="/request"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Talk to a Guide about your project
        </a>
      </div>
    );
  }

  // Exhausted: anonymous (week 1 used up all 3)
  if (!info.allowed && info.tier === "anonymous") {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
        <p className="text-sm text-foreground">
          {recolorsExhaustedFree(info.daysUntilReset ?? 7)}
        </p>
        <a
          href="/auth/signin"
          className="inline-block text-sm font-medium text-accent hover:underline"
        >
          Create a free account for weekly recolors
        </a>
      </div>
    );
  }

  // Exhausted: purchased
  if (!info.allowed && info.tier === "purchased") {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <p className="text-sm text-foreground">{recolorsExhaustedPurchased()}</p>
      </div>
    );
  }

  // Counter display (allowed state)
  const tierLabel = info.tier === "purchased" ? "purchased" : "free";
  return (
    <p className="text-xs text-muted-foreground">
      {recolorsRemaining(info.remaining, tierLabel)}
    </p>
  );
}

// Re-export for typing
export type { AccessInfo };
