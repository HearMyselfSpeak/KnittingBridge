"use client";

import type { StepExperienceSnapshotData } from "@/lib/guide-application-schema";

interface Props {
  data: Partial<StepExperienceSnapshotData>;
  onChange: (data: Partial<StepExperienceSnapshotData>) => void;
  errors: Record<string, string>;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function CharCount({ value = "", max }: { value?: string; max: number }) {
  const count = value.length;
  return (
    <span
      className={[
        "text-xs tabular-nums",
        count >= max * 0.9 ? "text-destructive" : "text-muted-foreground",
      ].join(" ")}
    >
      {count}/{max}
    </span>
  );
}

export function StepExperienceSnapshot({ data, onChange, errors }: Props) {
  function update(patch: Partial<StepExperienceSnapshotData>) {
    onChange({ ...data, ...patch });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Your experience
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your background as a knitter.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Years of knitting experience</p>
        <input
          type="number"
          min={0}
          max={80}
          value={data.yearsKnitting !== undefined ? String(data.yearsKnitting) : ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              update({ yearsKnitting: undefined });
            } else {
              const num = parseInt(val, 10);
              if (!isNaN(num)) update({ yearsKnitting: num });
            }
          }}
          placeholder="0"
          className={inputClass + " w-28"}
        />
        {errors.yearsKnitting && (
          <p className="text-sm text-destructive">{errors.yearsKnitting}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-foreground">Types of projects you have completed</p>
          <CharCount value={data.projectTypes} max={200} />
        </div>
        <textarea
          value={data.projectTypes ?? ""}
          onChange={(e) => update({ projectTypes: e.target.value })}
          placeholder="Sweaters, colorwork hats, lace shawls, socks..."
          maxLength={200}
          rows={3}
          className={inputClass}
        />
        {errors.projectTypes && (
          <p className="text-sm text-destructive">{errors.projectTypes}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium text-foreground">Where you most often help others</p>
          <CharCount value={data.helpContext} max={300} />
        </div>
        <textarea
          value={data.helpContext ?? ""}
          onChange={(e) => update({ helpContext: e.target.value })}
          placeholder="Ravelry forums, local knitting groups, teaching friends and family..."
          maxLength={300}
          rows={3}
          className={inputClass}
        />
        {errors.helpContext && (
          <p className="text-sm text-destructive">{errors.helpContext}</p>
        )}
      </div>
    </div>
  );
}
