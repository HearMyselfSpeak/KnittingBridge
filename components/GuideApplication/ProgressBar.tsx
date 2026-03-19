"use client";

const STEPS = [
  "Identity",
  "Experience",
  "Snapshot",
  "Sample Work",
  "Scenarios",
  "Availability",
  "Agreements",
];

const TOTAL = STEPS.length;

export function ProgressBar({ current }: { current: number }) {
  return (
    <div className="w-full mb-8">
      {/* Desktop: step labels */}
      <div className="hidden sm:flex items-center gap-0.5 mb-3">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <div key={label} className="flex items-center gap-0.5 flex-1 min-w-0">
              <span
                className={[
                  "text-xs font-medium px-2 py-0.5 rounded-full truncate",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "text-accent"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
              {i < TOTAL - 1 && (
                <span className="text-muted-foreground/30 text-xs flex-shrink-0">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: numbered circles */}
      <div className="flex sm:hidden items-center gap-1 mb-3">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <div key={label} className="flex items-center gap-1">
              <span
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {step}
              </span>
              {i < TOTAL - 1 && (
                <span className="text-muted-foreground/30 text-xs">–</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((current - 1) / (TOTAL - 1)) * 100}%` }}
        />
      </div>

      {/* Mobile: active label */}
      <p className="sm:hidden mt-1.5 text-xs text-muted-foreground">
        Step {current} of {TOTAL}:{" "}
        <span className="font-medium text-foreground">{STEPS[current - 1]}</span>
      </p>
    </div>
  );
}
