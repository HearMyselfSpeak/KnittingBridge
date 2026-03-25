"use client";

import { useEffect, useState, useCallback } from "react";
import ActivationStepper from "./ActivationStepper";
import Step1Agreement from "./Step1Agreement";

interface GuideActivationState {
  icAgreementAccepted: boolean;
  stripeOnboarded: boolean;
  availableDays: unknown;
  activationComplete: boolean;
}

interface ActivationFlowProps {
  initialState: GuideActivationState;
}

function stepFromUrl(): number {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  const s = parseInt(params.get("step") || "1", 10);
  return s >= 1 && s <= 5 ? s : 1;
}

export default function ActivationFlow({ initialState }: ActivationFlowProps) {
  const [state, setState] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(1);

  // Derive which steps are completed from the profile state.
  const completedSteps = [
    state.icAgreementAccepted,
    false, // Step 2: compensation review (no DB field, tracked in sessionStorage)
    state.stripeOnboarded,
    state.availableDays != null,
    state.activationComplete,
  ];

  // Find the first incomplete step to set as the initial step.
  const firstIncomplete = completedSteps.findIndex((c) => !c) + 1 || 5;

  useEffect(() => {
    const urlStep = stepFromUrl();
    // Don't let the user skip ahead beyond the first incomplete step.
    const step = Math.min(urlStep, firstIncomplete);
    setCurrentStep(step);
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navStep = useCallback(
    (step: number) => {
      const clamped = Math.min(step, firstIncomplete);
      setCurrentStep(clamped);
      window.history.pushState(null, "", `?step=${clamped}`);
    },
    [firstIncomplete]
  );

  useEffect(() => {
    function onPopState() {
      const s = stepFromUrl();
      setCurrentStep(Math.min(s, firstIncomplete));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [firstIncomplete]);

  function handleStep1Complete() {
    setState((prev) => ({ ...prev, icAgreementAccepted: true }));
    navStep(2);
  }

  return (
    <div>
      <ActivationStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {currentStep === 1 && (
        <Step1Agreement
          alreadyAccepted={state.icAgreementAccepted}
          onComplete={handleStep1Complete}
        />
      )}

      {currentStep === 2 && (
        <div className="text-sm text-muted-foreground">
          Step 2: Compensation Review (coming soon)
        </div>
      )}

      {currentStep === 3 && (
        <div className="text-sm text-muted-foreground">
          Step 3: Connect Stripe (coming soon)
        </div>
      )}

      {currentStep === 4 && (
        <div className="text-sm text-muted-foreground">
          Step 4: Set Availability (coming soon)
        </div>
      )}

      {currentStep === 5 && (
        <div className="text-sm text-muted-foreground">
          Step 5: Confirm Profile (coming soon)
        </div>
      )}
    </div>
  );
}
