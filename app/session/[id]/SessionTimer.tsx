"use client";

// Countdown timer for live sessions.
// Starts when both participants join. Grace period warnings for Guide.
// Exact copy from brief for all user-facing strings.

import { useEffect, useState, useRef } from "react";

interface Props {
  sessionMinutes: number;
  bothJoined: boolean;
  role: "maker" | "guide";
}

function formatTime(totalSeconds: number): string {
  const abs = Math.abs(totalSeconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const sign = totalSeconds < 0 ? "-" : "";
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionTimer({ sessionMinutes, bothJoined, role }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!bothJoined) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bothJoined]);

  if (!bothJoined) {
    return (
      <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-4 py-2 text-white">
        <p className="text-sm">Waiting for the other participant to join...</p>
      </div>
    );
  }

  const totalSessionSeconds = sessionMinutes * 60;
  const remaining = totalSessionSeconds - elapsed;
  const overSeconds = elapsed - totalSessionSeconds;
  const graceEndSeconds = 10 * 60; // 10-minute grace
  const isOvertime = remaining <= 0;

  // Guide-only grace period warnings
  let guideWarning: string | null = null;
  if (role === "guide" && isOvertime) {
    if (overSeconds >= 570 && overSeconds < 600) {
      guideWarning = "Thirty seconds. Finish your thought.";
    } else if (overSeconds >= 540 && overSeconds < 570) {
      guideWarning = "One minute. Start wrapping up so your Maker leaves with clarity.";
    } else if (overSeconds >= 480 && overSeconds < 540) {
      guideWarning =
        "Two minutes left. If there is one last thing to share, now is the time.";
    }
  }

  // Both-party warning at 10 min over
  const showClosingWarning = isOvertime && overSeconds >= 600 && overSeconds < graceEndSeconds + 60;

  return (
    <div className="absolute left-4 top-4 flex flex-col gap-1">
      <div
        className={`rounded-lg px-4 py-2 text-white ${
          isOvertime ? "bg-red-600/80" : "bg-black/60"
        }`}
      >
        <p className="font-mono text-lg font-semibold">
          {isOvertime ? formatTime(-overSeconds) : formatTime(remaining)}
        </p>
        {isOvertime && remaining > -graceEndSeconds && (
          <p className="text-xs text-white/80">Session time complete</p>
        )}
      </div>

      {guideWarning && (
        <div className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white">
          {guideWarning}
        </div>
      )}

      {showClosingWarning && (
        <div className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white">
          Room closing in 1 minute.
        </div>
      )}
    </div>
  );
}
