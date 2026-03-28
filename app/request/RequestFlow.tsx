"use client";

import { useState, useCallback } from "react";
import { SessionProvider } from "next-auth/react";
import ConversationPhase, { type TriageData } from "./ConversationPhase";
import Step4Account from "./Step4Account";
import Step5Confirm from "./Step5Confirm";
import Step6Payment from "./Step6Payment";
import Step7Matching from "./Step7Matching";

type Step = "chat" | "account" | "confirm" | "payment" | "matching";

export default function RequestFlow() {
  const [step, setStep] = useState<Step>("chat");
  const [triageData, setTriageData] = useState<TriageData | null>(null);
  const [sessionType, setSessionType] = useState<"15" | "45">("45");
  const [requestId, setRequestId] = useState<string | undefined>();

  const handleTriageComplete = useCallback((data: TriageData) => {
    setTriageData(data);
    setSessionType(data.sessionType);
    setStep("account");
  }, []);

  const handleAccountComplete = useCallback(() => {
    setStep("confirm");
  }, []);

  const handleConfirm = useCallback(() => {
    setStep("payment");
  }, []);

  const handlePaymentComplete = useCallback(
    async (paymentIntentId: string) => {
      if (!triageData) return;

      const res = await fetch("/api/request/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: triageData.description,
          imageUrls: triageData.imageUrls,
          followUpAnswers: triageData.followUpAnswers,
          sophisticationScore: triageData.sophisticationScore,
          triageSummary: triageData.triageSummary,
          sessionType,
          matchCriteria: triageData.matchCriteria,
          encouragement: triageData.encouragement,
          paymentIntentId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRequestId(data.requestId);
      }
      setStep("matching");
    },
    [triageData, sessionType],
  );

  // Chat phase runs without SessionProvider (no auth needed for steps 1-3)
  if (step === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <ConversationPhase onComplete={handleTriageComplete} />
      </div>
    );
  }

  // Steps 4-7 need SessionProvider for auth
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {step === "account" && (
          <Step4Account
            onComplete={handleAccountComplete}
            callbackUrl="/request?step=confirm"
          />
        )}

        {step === "confirm" && triageData && (
          <Step5Confirm
            sessionType={sessionType}
            triageSummary={triageData.triageSummary}
            onConfirm={handleConfirm}
            onChangeType={setSessionType}
          />
        )}

        {step === "payment" && (
          <Step6Payment
            sessionType={sessionType}
            onComplete={handlePaymentComplete}
          />
        )}

        {step === "matching" && <Step7Matching requestId={requestId} />}
      </div>
    </SessionProvider>
  );
}
