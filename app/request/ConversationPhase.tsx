"use client";

import { useState, useCallback } from "react";
import ChatThread, { type ChatMessage } from "./ChatThread";
import ChatInput from "./ChatInput";

export interface TriageData {
  description: string;
  sophisticationScore: number;
  followUpAnswers: string[];
  triageSummary: string;
  sessionType: "15" | "45";
  matchCriteria: string[];
  skillTags: string[];
  makerEmotionalProfile: {
    frustrationLevel: number;
    confidenceLevel: number;
    socialComfort: number;
    urgency: number;
    learningIntent: number;
  };
  encouragement: string;
  imageUrls: string[];
}

interface Props {
  onComplete: (data: TriageData) => void;
}

const OPENING_MESSAGE =
  "Talk as if you are talking to a friend who knows about knitting. What are you working on, and how can we help?";

const BAIL_OUT_MESSAGE =
  "We love that you reached out to KnittingBridge and don't think we can solve your project. Please visit us again when you think we can help.";

let msgId = 0;
function nextId() {
  return `msg-${++msgId}`;
}

type Phase = "initial" | "followup" | "triage" | "bail" | "ready";

export default function ConversationPhase({ onComplete }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), content: OPENING_MESSAGE, sender: "ai" },
  ]);
  const [thinking, setThinking] = useState(false);
  const [phase, setPhase] = useState<Phase>("initial");
  const [triageData, setTriageData] = useState<TriageData | null>(null);

  // Accumulated state across conversation turns
  const [description, setDescription] = useState("");
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [imageUrls] = useState<string[]>([]);

  const addMessage = useCallback(
    (content: string, sender: "maker" | "ai") => {
      setMessages((prev) => [...prev, { id: nextId(), content, sender }]);
    },
    [],
  );

  const ERROR_MESSAGE =
    "Something went wrong on our end. Please try again in a moment.";

  async function handleSend(text: string) {
    if (!text.trim() || thinking) return;
    addMessage(text, "maker");
    setThinking(true);

    if (phase === "initial") {
      // Step 1: Evaluate sophistication
      setDescription(text);
      try {
        const res = await fetch("/api/request/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text }),
        });
        if (!res.ok) {
          setThinking(false);
          addMessage(ERROR_MESSAGE, "ai");
          return;
        }
        const data = await res.json();
        setThinking(false);

        if (data.isBailOut) {
          addMessage(BAIL_OUT_MESSAGE, "ai");
          setPhase("bail");
          return;
        }

        setScore(data.score);
        const followUps: string[] = data.suggestedFollowUps ?? [];
        if (followUps.length > 0) {
          addMessage(followUps.join("\n\n"), "ai");
          setPhase("followup");
        } else {
          await runTriage(text, [], data.score);
        }
      } catch {
        setThinking(false);
        addMessage(ERROR_MESSAGE, "ai");
      }
    } else if (phase === "followup") {
      // Step 2: Maker answered follow-ups, now run triage
      const newAnswers = [...answers, text];
      setAnswers(newAnswers);
      await runTriage(description, newAnswers, score);
    }
  }

  async function runTriage(
    input: string,
    followUpAnswers: string[],
    sophisticationScore: number,
  ) {
    let data;
    try {
      const res = await fetch("/api/request/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, followUpAnswers, sophisticationScore }),
      });
      if (!res.ok) {
        setThinking(false);
        addMessage(ERROR_MESSAGE, "ai");
        return;
      }
      data = await res.json();
    } catch {
      setThinking(false);
      addMessage(ERROR_MESSAGE, "ai");
      return;
    }
    setThinking(false);

    const result: TriageData = {
      description: input,
      sophisticationScore,
      followUpAnswers,
      triageSummary: data.summary,
      sessionType: data.sessionType,
      matchCriteria: data.matchCriteria ?? [],
      skillTags: data.skillTags ?? [],
      makerEmotionalProfile: data.makerEmotionalProfile ?? {
        frustrationLevel: 3, confidenceLevel: 3, socialComfort: 3,
        urgency: 3, learningIntent: 3,
      },
      encouragement: data.encouragement ?? "",
      imageUrls,
    };
    setTriageData(result);

    addMessage(`${data.summary}\n\n${data.encouragement}`, "ai");
    setPhase("ready");
  }

  const inputDisabled = thinking || phase === "bail" || phase === "ready";

  return (
    <div className="flex flex-col h-full">
      <ChatThread messages={messages} thinking={thinking} />

      {phase === "ready" && triageData && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onComplete(triageData)}
            className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Ready to connect with a Guide?
          </button>
        </div>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={inputDisabled}
        placeholder={
          phase === "bail"
            ? ""
            : phase === "followup"
              ? "Answer here..."
              : "Describe your knitting situation..."
        }
      />
    </div>
  );
}
