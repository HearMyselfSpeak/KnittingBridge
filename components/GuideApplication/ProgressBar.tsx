"use client";

const STEPS = [
  "Identity",
  "Skills",
  "Experience",
  "Samples",
  "Scenarios",
  "Availability",
  "Agreements",
];

const TOTAL = STEPS.length;

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <polyline
        points="1.5 5 4 7.5 8.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProgressBar({ current }: { current: number }) {
  const fraction = (current - 1) / (TOTAL - 1);

  return (
    <div className="w-full mb-8">
      {/* Circle + line track */}
      <div className="relative px-3">
        {/* Background track — spans center-to-center of outer circles */}
        <div className="absolute top-3 inset-x-3 h-px bg-border" />
        {/* Filled track */}
        <div
          className="absolute top-3 left-3 h-px bg-primary transition-all duration-300"
          style={{
            width: `calc(${fraction * 100}% - ${fraction * 1.5}rem)`,
          }}
        />

        {/* Circles */}
        <div className="relative z-10 flex justify-between">
          {STEPS.map((label, i) => {
            const step = i + 1;
            const isDone = step < current;
            const isActive = step === current;

            return (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
                      : "bg-background border-2 border-border text-muted-foreground",
                  ].join(" ")}
                >
                  {isDone ? (
                    <Check />
                  ) : (
                    <span className="text-[10px] font-semibold leading-none">{step}</span>
                  )}
                </div>

                {/* Desktop label */}
                <span
                  className={[
                    "hidden sm:block mt-2 text-[10px] font-medium text-center whitespace-nowrap",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: active label */}
      <p className="sm:hidden mt-3 text-xs text-muted-foreground text-center">
        Step {current} of {TOTAL}:{" "}
        <span className="font-medium text-foreground">{STEPS[current - 1]}</span>
      </p>
    </div>
  );
}
