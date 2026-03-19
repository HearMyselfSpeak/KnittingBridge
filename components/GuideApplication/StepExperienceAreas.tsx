"use client";

import {
  EXPERIENCE_AREAS,
  type StepExperienceAreasData,
} from "@/lib/guide-application-schema";

interface Props {
  data: Partial<StepExperienceAreasData>;
  onChange: (data: Partial<StepExperienceAreasData>) => void;
  errors: Record<string, string>;
}

export function StepExperienceAreas({ data, onChange, errors }: Props) {
  const selected = data.areas ?? [];

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((a) => a !== id)
      : [...selected, id];
    onChange({ areas: next });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Your areas of expertise
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select all that apply. Makers will be matched based on what you know best.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EXPERIENCE_AREAS.map(({ id, label }) => {
          const checked = selected.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={[
                "text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
                checked
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary/40",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      {errors.areas && (
        <p className="text-sm text-destructive">{errors.areas}</p>
      )}
    </div>
  );
}
