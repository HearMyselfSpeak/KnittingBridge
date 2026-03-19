"use client";

import {
  WEEKLY_HOURS_OPTIONS,
  type StepAvailabilityData,
} from "@/lib/guide-application-schema";

interface Props {
  data: Partial<StepAvailabilityData>;
  onChange: (data: Partial<StepAvailabilityData>) => void;
  errors: Record<string, string>;
}

const OPTIONS: {
  value: "async" | "both";
  label: string;
  description: string;
}[] = [
  {
    value: "async",
    label: "Async only",
    description:
      "You communicate via text — messages, voice notes, photos. No live video sessions.",
  },
  {
    value: "both",
    label: "Open to both",
    description:
      "You are willing to do async messaging and live video sessions with Makers.",
  },
];

const selectClass =
  "rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function StepAvailability({ data, onChange, errors }: Props) {
  function setType(value: "async" | "both") {
    onChange({ availabilityType: value, weeklyHours: undefined });
  }

  function setHours(value: string) {
    onChange({
      ...data,
      weeklyHours: value as StepAvailabilityData["weeklyHours"],
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Availability</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How would you like to work with Makers?
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ value, label, description }) => {
          const selected = data.availabilityType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={[
                "w-full text-left px-4 py-4 rounded-lg border transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-secondary/40",
              ].join(" ")}
            >
              <p
                className={[
                  "text-sm font-medium",
                  selected ? "text-primary" : "text-foreground",
                ].join(" ")}
              >
                {label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </button>
          );
        })}
      </div>

      {errors.availabilityType && (
        <p className="text-sm text-destructive">{errors.availabilityType}</p>
      )}

      {data.availabilityType === "both" && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Approximate weekly availability for live sessions
          </p>
          <select
            value={data.weeklyHours ?? ""}
            onChange={(e) => setHours(e.target.value)}
            className={selectClass}
          >
            <option value="">Select hours per week</option>
            {WEEKLY_HOURS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} hours/week
              </option>
            ))}
          </select>
          {errors.weeklyHours && (
            <p className="text-sm text-destructive">{errors.weeklyHours}</p>
          )}
        </div>
      )}
    </div>
  );
}
