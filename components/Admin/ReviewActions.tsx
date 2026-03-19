"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  profileId: string;
  currentStatus: string;
}

export function ReviewActions({ profileId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDone = currentStatus === "APPROVED" || currentStatus === "DECLINED";

  async function act(action: "approve" | "decline") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${profileId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Request failed.");
      } else {
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  if (isDone) {
    return (
      <span
        className={[
          "inline-block px-3 py-1 rounded-full text-xs font-medium",
          currentStatus === "APPROVED"
            ? "bg-green-100 text-green-800"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {currentStatus === "APPROVED" ? "Approved" : "Declined"}
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={!!loading}
          onClick={() => act("approve")}
          className="px-5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading === "approve" ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          disabled={!!loading}
          onClick={() => act("decline")}
          className="px-5 py-2 rounded-md border border-border bg-background text-foreground text-sm font-medium hover:bg-secondary/60 disabled:opacity-60 transition-colors"
        >
          {loading === "decline" ? "Declining..." : "Decline"}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
