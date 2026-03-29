"use client";

// In-session chat panel (notes and links).
// Pusher-based, local state only (no DB persistence).
// Messages captured in Daily.co transcript.

import { useState, useRef, useEffect } from "react";
import { usePusherChannel } from "@/lib/use-pusher";

interface Props {
  helpSessionId: string;
  role: "maker" | "guide";
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export default function SessionChat({ helpSessionId, role }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelName = `session-${helpSessionId}`;

  usePusherChannel(channelName, "message", (data) => {
    const msg = data as ChatMessage;
    setMessages((prev) => [...prev, msg]);
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    try {
      await fetch("/api/session/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpSessionId, message: text }),
      });
    } catch (err) {
      console.error("[chat] Send failed:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold text-[#1B2A4A]">Notes</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400">
            Share notes and links during your session.
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <span className="font-medium text-[#1B2A4A]">{msg.sender}</span>
            <span className="ml-1 text-xs text-gray-400">{msg.timestamp}</span>
            <p className="text-gray-700">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t p-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a note..."
          className="flex-1 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="rounded bg-[#1B2A4A] px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
