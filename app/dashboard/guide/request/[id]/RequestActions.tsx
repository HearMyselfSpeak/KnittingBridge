"use client";

// Countdown timer + Accept/Decline buttons for Guide request page.
// Auto-declines when countdown reaches zero.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const COUNTDOWN_SECONDS = 300; // 5 minutes

interface Props {
  requestId: string;
}

export default function RequestActions({ requestId }: Props) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [busy, setBusy] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const declinedRef = useRef(false);

  const decline = useCallback(async () => {
    if (declinedRef.current) return;
    declinedRef.current = true;
    try {
      await fetch("/api/request/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
    } catch {
      // Best-effort decline
    }
    router.push("/dashboard/guide");
  }, [requestId, router]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          decline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [decline]);

  async function handleAccept() {
    setBusy(true);
    try {
      const res = await fetch("/api/request/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        router.push("/dashboard/guide?accepted=true");
        return;
      }

      if (res.status === 409) {
        setConflictMsg("Another Guide accepted this request first.");
        setTimeout(() => router.push("/dashboard/guide"), 3000);
        return;
      }

      const data = await res.json().catch(() => ({}));
      console.error("Accept failed:", data);
    } catch (err) {
      console.error("Accept error:", err);
    } finally {
      setBusy(false);
    }
  }

  function handleDecline() {
    setBusy(true);
    decline();
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeDisplay = `${mins}:${secs.toString().padStart(2, "0")}`;
  const urgent = seconds <= 60;

  if (conflictMsg) {
    return (
      <div className="mt-6 rounded-lg border border-[oklch(0.22_0.045_253/0.1)] bg-white p-6 text-center">
        <p className="text-[#1B2A4A]">{conflictMsg}</p>
        <p className="mt-2 text-sm text-[#1B2A4A]/60">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="text-center">
        <p className="text-sm text-[#1B2A4A]/60">Time remaining</p>
        <p
          className={`mt-1 text-3xl font-semibold tabular-nums ${
            urgent ? "text-red-600" : "text-[#1B2A4A]"
          }`}
        >
          {timeDisplay}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDecline}
          disabled={busy}
          className="flex-1 rounded-md border border-[oklch(0.22_0.045_253/0.2)] bg-white px-4 py-3 text-sm font-medium text-[#1B2A4A] transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={busy}
          className="flex-1 rounded-md bg-[#C4704F] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Accepting..." : "Accept"}
        </button>
      </div>
    </div>
  );
}
