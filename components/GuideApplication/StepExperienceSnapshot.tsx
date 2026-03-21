"use client";

import { useState } from "react";
import type { StepExperienceSnapshotData } from "@/lib/guide-application-schema";

interface Props {
  data: Partial<StepExperienceSnapshotData>;
  onChange: (data: Partial<StepExperienceSnapshotData>) => void;
  errors: Record<string, string>;
}

const HELP_CONTEXT_OPTIONS = [
  "Ravelry",
  "Reddit",
  "Discord",
  "Facebook groups",
  "Local knitting group",
  "YouTube/social media",
] as const;

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
  const [selectValue, setSelectValue] = useState("");
  const [otherValue, setOtherValue] = useState("");
  const [showOther, setShowOther] = useState(false);

  function update(patch: Partial<StepExperienceSnapshotData>) {
    onChange({ ...data, ...patch });
  }

  const selected: string[] = data.helpContext ?? [];

  function addItem(item: string) {
    if (item && !selected.includes(item)) {
      update({ helpContext: [...selected, item] });
    }
  }

  function removeItem(item: string) {
    update({ helpContext: selected.filter((s) => s !== item) });
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectValue("");
    if (!val) return;
    if (val === "__other__") {
      setShowOther(true);
    } else {
      addItem(val);
    }
  }

  function commitOther() {
    const entries = otherValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    entries.forEach(addItem);
    setOtherValue("");
    setShowOther(false);
  }

  const availableOptions = HELP_CONTEXT_OPTIONS.filter(
    (opt) => !selected.includes(opt)
  );

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

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Where you most often help others</p>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors"
                  aria-label={`Remove ${item}`}
                >
                  &#x2715;
                </button>
              </span>
            ))}
          </div>
        )}

        <select
          value={selectValue}
          onChange={handleSelect}
          className={inputClass}
        >
          <option value="">Select a platform...</option>
          {availableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__other__">Other...</option>
        </select>

        {showOther && (
          <div className="space-y-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitOther();
                  }
                }}
                placeholder="e.g. Instagram, local shop..."
                className={inputClass + " flex-1"}
                autoFocus
              />
              <button
                type="button"
                onClick={commitOther}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Separate multiple entries with a comma
            </p>
          </div>
        )}

        {errors.helpContext && (
          <p className="text-sm text-destructive">{errors.helpContext}</p>
        )}
      </div>
    </div>
  );
}
