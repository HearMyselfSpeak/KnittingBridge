"use client";

import { useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "maker" | "ai";
}

interface Props {
  messages: ChatMessage[];
  thinking?: boolean;
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary rounded-lg px-4 py-3 flex gap-1.5 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function ChatThread({ messages, thinking = false }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} content={msg.content} sender={msg.sender} />
      ))}
      {thinking && <ThinkingIndicator />}
      <div ref={endRef} />
    </div>
  );
}
