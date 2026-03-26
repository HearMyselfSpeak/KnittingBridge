"use client";

import { useState, type ReactNode } from "react";
import DayBlockRow, {
  DAYS,
  SESSION_LENGTHS,
  filterBlocks,
  type DayName,
  type BlockId,
} from "./DayBlockRow";

interface Step4AvailabilityProps {
  alreadySaved: boolean;
  initialDays: string[] | null;
  initialBlocks: Record<string, string[]> | null;
  initialMaxMinutes: number | null;
  onComplete: () => void;
}

export default function Step4Availability({
  alreadySaved,
  initialDays,
  initialBlocks,
  initialMaxMinutes,
  onComplete,
}: Step4AvailabilityProps) {
  const [selectedDays, setSelectedDays] = useState<DayName[]>(
    (initialDays ?? []).filter((d): d is DayName =>
      DAYS.includes(d as DayName)
    )
  );
  const [blocks, setBlocks] = useState<Record<string, BlockId[]>>(
    filterBlocks(initialBlocks)
  );
  const [maxMinutes, setMaxMinutes] = useState<number>(
    initialMaxMinutes ?? 30
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(alreadySaved);

  function toggleDay(day: DayName) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function toggleBlock(day: DayName, blockId: BlockId) {
    setBlocks((prev) => {
      const current = prev[day] ?? [];
      const next = current.includes(blockId)
        ? current.filter((b) => b !== blockId)
        : [...current, blockId];
      return { ...prev, [day]: next };
    });
  }

  function canSubmit() {
    if (selectedDays.length === 0) return false;
    return selectedDays.some((d) => (blocks[d] ?? []).length > 0);
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guides/activate/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableDays: selectedDays,
          timeBlocks: blocks,
          maxSessionMinutes: maxMinutes,
        }),
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
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <span className="text-green-700 text-lg">&#10003;</span>
          <p className="text-sm text-green-800 font-medium">
            Your availability has been saved. You can update it below.
          </p>
        </div>
      )}

      <section>
        <SectionHeading>Available days</SectionHeading>
        <p className="text-muted-foreground mb-4">
          Select the days you are generally available for sessions.
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                selectedDays.includes(day)
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/40"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </section>

      {selectedDays.length > 0 && (
        <section>
          <SectionHeading>Time blocks</SectionHeading>
          <p className="text-muted-foreground mb-4">
            For each day, select when you are available.
          </p>
          <div className="space-y-4">
            {DAYS.filter((d) => selectedDays.includes(d)).map((day) => (
              <DayBlockRow
                key={day}
                day={day}
                selected={blocks[day] ?? []}
                onToggle={(blockId) => toggleBlock(day, blockId)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading>Maximum session length</SectionHeading>
        <select
          value={maxMinutes}
          onChange={(e) => setMaxMinutes(Number(e.target.value))}
          className="border border-border rounded-md px-3 py-2 text-sm
                     bg-background text-foreground"
        >
          {SESSION_LENGTHS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

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

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-lg font-semibold text-primary mb-3"
      style={{ fontFamily: "var(--font-serif)" }}
    >
      {children}
    </h2>
  );
}
