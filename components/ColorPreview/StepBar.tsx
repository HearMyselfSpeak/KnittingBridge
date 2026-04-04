"use client";

const STEPS = ["Upload", "Choose colors", "Preview"];

export function StepBar({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        return (
          <div key={label} className="flex items-center gap-1">
            <span
              className={[
                "text-xs font-medium px-2 py-0.5 rounded-full",
                step === current
                  ? "bg-primary text-primary-foreground"
                  : step < current
                  ? "text-accent"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-muted-foreground/40 text-xs">·</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
