"use client";

// Main session room orchestrator. Embeds Daily.co video, timer, chat, controls.
// Layout: video area (70-75%) + sidebar (timer, chat, triage panel).

import { useEffect, useRef, useState, useCallback } from "react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import SessionTimer from "./SessionTimer";
import SessionChat from "./SessionChat";
import TriagePanel from "./TriagePanel";
import SessionControls from "./SessionControls";

interface Props {
  helpSessionId: string;
  roomUrl: string;
  token: string;
  role: "maker" | "guide";
  sessionMinutes: number;
  participantName: string;
  triageSummary: string | null;
  imageUrls: string[];
  requestTitle: string;
}

export default function SessionRoom(props: Props) {
  const {
    helpSessionId, roomUrl, token, role,
    sessionMinutes, triageSummary, imageUrls, requestTitle,
  } = props;

  const videoRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [bothJoined, setBothJoined] = useState(false);
  const [otherLeft, setOtherLeft] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const joinReported = useRef(false);
  const noshowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Report own join to server
  const reportJoin = useCallback(async () => {
    if (joinReported.current) return;
    joinReported.current = true;
    try {
      const res = await fetch("/api/session/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpSessionId }),
      });
      const data = (await res.json()) as { bothJoined?: boolean };
      if (data.bothJoined) setBothJoined(true);
    } catch (err) {
      console.error("[session] Join report failed:", err);
    }
  }, [helpSessionId]);

  // Start no-show timer when we join but other hasn't
  const startNoshowTimer = useCallback(() => {
    const delayMs = sessionMinutes === 15 ? 3 * 60_000 : 7 * 60_000;
    noshowTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/session/noshow-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ helpSessionId }),
        });
      } catch (err) {
        console.error("[session] No-show check failed:", err);
      }
    }, delayMs);
  }, [helpSessionId, sessionMinutes]);

  useEffect(() => {
    if (!videoRef.current || callRef.current) return;

    const call = DailyIframe.createCallObject({ url: roomUrl, token });
    callRef.current = call;

    call.on("joined-meeting", () => {
      reportJoin();
      startNoshowTimer();
    });

    call.on("participant-joined", () => {
      setBothJoined(true);
      if (noshowTimerRef.current) clearTimeout(noshowTimerRef.current);
    });

    call.on("participant-left", () => setOtherLeft(true));

    call.join().catch((err: unknown) => {
      console.error("[session] Failed to join Daily room:", err);
    });

    return () => {
      if (noshowTimerRef.current) clearTimeout(noshowTimerRef.current);
      call.leave().catch(() => {});
      call.destroy();
      callRef.current = null;
    };
  }, [roomUrl, token, reportJoin, startNoshowTimer]);

  if (sessionEnded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Redirecting to session summary...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF8F5]">
      {/* Video area */}
      <div className="relative flex-[3] bg-black" ref={videoRef}>
        <iframe
          src={`${roomUrl}?t=${token}`}
          allow="camera;microphone;fullscreen;display-capture"
          className="h-full w-full border-0"
          title="Video session"
        />
        <SessionTimer
          sessionMinutes={sessionMinutes}
          bothJoined={bothJoined}
          role={role}
        />
      </div>

      {/* Sidebar */}
      <div className="flex w-80 flex-col border-l border-gray-200 bg-white">
        {role === "guide" && triageSummary && (
          <TriagePanel
            triageSummary={triageSummary}
            imageUrls={imageUrls}
            requestTitle={requestTitle}
          />
        )}
        <SessionChat helpSessionId={helpSessionId} role={role} />
        <SessionControls
          helpSessionId={helpSessionId}
          role={role}
          otherLeft={otherLeft}
          onSessionEnd={() => setSessionEnded(true)}
        />
      </div>
    </div>
  );
}
