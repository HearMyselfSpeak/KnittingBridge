"use client";

interface Props {
  content: string;
  sender: "maker" | "ai";
}

export default function ChatBubble({ content, sender }: Props) {
  const isMaker = sender === "maker";

  return (
    <div className={`flex ${isMaker ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isMaker
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
