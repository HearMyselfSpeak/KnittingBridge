"use client";

// Session end/leave controls.
// Guide: prominent "End Session" button. Maker: understated "Leave Session".
// Handles Maker-left detection for Guide.

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  helpSessionId: string;
  role: "maker" | "guide";
  otherLeft: boolean;
  onSessionEnd: () => void;
}

export default function SessionControls({
  helpSessionId, role, otherLeft, onSessionEnd,
}: Props) {
  const [ending, setEnding] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const router = useRouter();

  async function handleEndSession() {
    if (ending) return;
    setEnding(true);

    try {
      const res = await fetch("/api/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpSessionId }),
      });

      if (res.ok) {
        onSessionEnd();
        router.push(`/session/${helpSessionId}/complete`);
      }
    } catch (err) {
      console.error("[session] End session failed:", err);
    } finally {
      setEnding(false);
    }
  }

  if (role === "guide") {
    return (
      <div className="border-t p-3 space-y-2">
        {otherLeft && (
          <p className="text-sm text-gray-600">
            The Maker has left. End session?
          </p>
        )}
        <button
          type="button"
          onClick={handleEndSession}
          disabled={ending}
          className="w-full rounded bg-[#C4704F] px-4 py-2 text-sm font-medium text-white hover:bg-[#b5613f] disabled:opacity-50"
        >
          {ending ? "Ending..." : "End Session"}
        </button>
      </div>
    );
  }

  // Maker controls
  return (
    <div className="border-t p-3">
      {!confirmLeave ? (
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Leave Session
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to leave?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleEndSession}
              disabled={ending}
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              {ending ? "Leaving..." : "Yes, leave"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmLeave(false)}
              className="rounded px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
              Stay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
