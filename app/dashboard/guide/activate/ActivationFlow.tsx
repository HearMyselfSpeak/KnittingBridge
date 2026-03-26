"use client";

import { useEffect, useState, useCallback } from "react";
import ActivationStepper from "./ActivationStepper";
import Step1Agreement from "./Step1Agreement";
import Step2Compensation from "./Step2Compensation";
import Step3Stripe from "./Step3Stripe";
import Step4Availability from "./Step4Availability";

interface GuideActivationState {
  icAgreementAccepted: boolean;
  hasStripeAccount: boolean;
  stripeOnboarded: boolean;
  availableDays: string[] | null;
  timeBlocks: Record<string, string[]> | null;
  maxSessionMinutes: number | null;
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

function readCompReviewed(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      sessionStorage.getItem("kb_activation_step2") === "reviewed"
    );
  } catch {
    return false;
  }
}

export default function ActivationFlow({ initialState }: ActivationFlowProps) {
  const [state, setState] = useState(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [compReviewed, setCompReviewed] = useState(readCompReviewed);

  // Derive which steps are completed from the profile state.
  const completedSteps = [
    state.icAgreementAccepted,
    compReviewed,
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

  function handleStep2Complete() {
    setCompReviewed(true);
    navStep(3);
  }

  function handleStep3Complete() {
    setState((prev) => ({ ...prev, stripeOnboarded: true }));
    navStep(4);
  }

  function handleStep4Complete() {
    setState((prev) => ({ ...prev, availableDays: prev.availableDays ?? [] }));
    navStep(5);
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
        <Step2Compensation
          alreadyReviewed={compReviewed}
          onComplete={handleStep2Complete}
        />
      )}

      {currentStep === 3 && (
        <Step3Stripe
          hasAccount={state.hasStripeAccount}
          alreadyOnboarded={state.stripeOnboarded}
          onComplete={handleStep3Complete}
        />
      )}

      {currentStep === 4 && (
        <Step4Availability
          alreadySaved={state.availableDays != null}
          initialDays={state.availableDays}
          initialBlocks={state.timeBlocks}
          initialMaxMinutes={state.maxSessionMinutes}
          onComplete={handleStep4Complete}
        />
      )}

      {currentStep === 5 && (
        <div className="text-sm text-muted-foreground">
          Step 5: Confirm Profile (coming soon)
        </div>
      )}
    </div>
  );
}
