"use client";

import { useState, useCallback, useEffect } from "react";
import ConversationPhase, { type TriageData } from "./ConversationPhase";
import Step4Account from "./Step4Account";
import Step5Confirm from "./Step5Confirm";
import Step6Payment from "./Step6Payment";
import Step7Matching from "./Step7Matching";

type Step = "chat" | "account" | "confirm" | "payment" | "matching";

const STORAGE_KEY = "kb_request_state";

interface SavedState {
  triageData: TriageData;
  sessionType: "15" | "45";
}

function saveRequestState(state: SavedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private browsing, etc.)
  }
}

function loadRequestState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

export default function RequestFlow() {
  const [step, setStep] = useState<Step>("chat");
  const [triageData, setTriageData] = useState<TriageData | null>(null);
  const [sessionType, setSessionType] = useState<"15" | "45">("45");
  const [requestId, setRequestId] = useState<string | undefined>();

  // Restore state after auth redirect
  useEffect(() => {
    const saved = loadRequestState();
    if (saved?.triageData) {
      setTriageData(saved.triageData);
      setSessionType(saved.sessionType);
      setStep("confirm");
    }
  }, []);

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
          skillTags: triageData.skillTags,
          makerEmotionalProfile: triageData.makerEmotionalProfile,
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

  const debugBar = (
    <div style={{ background: 'yellow', padding: '4px', fontSize: '12px' }}>
      Step: {step} | HasTriage: {triageData ? 'yes' : 'no'} | SS: {typeof window !== 'undefined' ? (sessionStorage.getItem('kb_request_state') ? 'has data' : 'empty') : 'ssr'}
    </div>
  );

  // Chat phase runs without SessionProvider (no auth needed for steps 1-3)
  if (step === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {debugBar}
        <ConversationPhase onComplete={handleTriageComplete} />
      </div>
    );
  }

  // Steps 4-7 use session context from root SessionProvider in app/providers.tsx
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {debugBar}
      {step === "account" && (
        <Step4Account
          onComplete={handleAccountComplete}
          callbackUrl="/request?step=confirm"
          onSaveState={() => {
            if (triageData) {
              saveRequestState({ triageData, sessionType });
            }
          }}
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
  );
}
