"use client";

import { useState, type ReactNode } from "react";
import WeeklyGrid, { DAYS, type DayName } from "./WeeklyGrid";
import { TimezoneSelect, ModeSelector } from "./AvailabilityControls";

type Mode = "scheduled" | "impulse" | null;

interface Step4AvailabilityProps {
  alreadySaved: boolean;
  initialTimezone: string | null;
  initialDays: string[] | null;
  initialBlocks: Record<string, number[]> | null;
  onComplete: () => void;
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
}

function deriveInitialMode(days: string[] | null): Mode {
  if (days === null) return null;
  return days.length === 0 ? "impulse" : "scheduled";
}

export default function Step4Availability({
  alreadySaved,
  initialTimezone,
  initialDays,
  initialBlocks,
  onComplete,
}: Step4AvailabilityProps) {
  const [timezone, setTimezone] = useState(
    initialTimezone || detectTimezone()
  );
  const [mode, setMode] = useState<Mode>(deriveInitialMode(initialDays));
  const [grid, setGrid] = useState<Record<string, number[]>>(
    (initialBlocks as Record<string, number[]>) ?? {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(alreadySaved);

  function toggleHour(day: DayName, hour: number) {
    setGrid((prev) => {
      const current = prev[day] ?? [];
      const next = current.includes(hour)
        ? current.filter((h) => h !== hour)
        : [...current, hour].sort((a, b) => a - b);
      return { ...prev, [day]: next };
    });
  }

  function hasAnyHour() {
    return DAYS.some((d) => (grid[d] ?? []).length > 0);
  }

  function canSubmit() {
    if (!mode) return false;
    if (mode === "impulse") return true;
    return hasAnyHour();
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    const payload =
      mode === "scheduled"
        ? {
            timezone,
            availableDays: DAYS.filter((d) => (grid[d] ?? []).length > 0),
            timeBlocks: grid,
          }
        : { timezone, availableDays: [], timeBlocks: null };

    try {
      const res = await fetch("/api/guides/activate/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      setSaved(true);
      onComplete();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      {saved && (
        <CompleteBanner>
          Your availability has been saved. You can update it below.
        </CompleteBanner>
      )}

      <p className="text-muted-foreground">
        How do you want to receive session requests? There is no minimum
        commitment. You can change this anytime, and you can always go online
        for spontaneous sessions regardless of your schedule.
      </p>

      <TimezoneSelect value={timezone} onChange={setTimezone} />
      <ModeSelector mode={mode} onChange={setMode} />

      {mode === "scheduled" && (
        <section>
          <p className="text-muted-foreground mb-4">
            Tap cells to mark when you are available. Each cell is one hour.
          </p>
          <WeeklyGrid selected={grid} onToggle={toggleHour} />
        </section>
      )}

      {mode === "impulse" && (
        <div className="rounded-md border border-border bg-muted/30 p-4 text-muted-foreground">
          When you are ready for sessions, use the online toggle from your
          Guide dashboard. You will only receive requests while your status
          is set to online.
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!canSubmit() || submitting}
          className="px-6 py-2 bg-primary text-white rounded-md text-sm
                     hover:bg-primary/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving..."
            : saved
              ? "Update and continue"
              : "Save and continue"}
        </button>
        {saved && (
          <button
            onClick={onComplete}
            className="px-6 py-2 border border-border rounded-md text-sm
                       text-foreground hover:bg-muted transition-colors"
          >
            Continue without changes
          </button>
        )}
      </div>
    </div>
  );
}

function CompleteBanner({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3">
      <span className="text-green-700 text-lg">&#10003;</span>
      <p className="text-sm text-green-800 font-medium">{children}</p>
    </div>
  );
}
