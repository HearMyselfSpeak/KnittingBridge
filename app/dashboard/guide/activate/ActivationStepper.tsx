"use client";

const STEPS = [
  "IC Agreement",
  "Compensation",
  "Stripe Connect",
  "Availability",
  "Confirm Profile",
];

interface ActivationStepperProps {
  currentStep: number;
  completedSteps: boolean[];
}

export default function ActivationStepper({
  currentStep,
  completedSteps,
}: ActivationStepperProps) {
  return (
    <nav aria-label="Activation steps" className="mb-8">
      <ol className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps[i];
          const isCurrent = currentStep === stepNum;
          const isLocked = !isCompleted && !isCurrent;

          return (
            <li key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className={`
                    flex h-7 w-7 items-center justify-center rounded-full
                    text-xs font-medium shrink-0 transition-colors
                    ${isCompleted ? "bg-primary text-white" : ""}
                    ${isCurrent ? "bg-accent text-white" : ""}
                    ${isLocked ? "bg-muted text-muted-foreground" : ""}
                  `}
                >
                  {isCompleted ? "\u2713" : stepNum}
                </span>
                <span
                  className={`text-xs hidden sm:inline whitespace-nowrap ${
                    isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-4 sm:w-8 ${
                    isCompleted ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
