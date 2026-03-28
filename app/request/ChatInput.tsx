"use client";

import { useState, useRef } from "react";

interface Props {
  onSend: (text: string, photo?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

async function compressImage(blob: Blob): Promise<Blob> {
  if (blob.size <= 4 * 1024 * 1024) return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const compressed = await canvas.convertToBlob({
    type: "image/jpeg",
    quality: 0.85,
  });
  bitmap.close();
  return compressed;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}: Props) {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const finalFile =
      compressed === file
        ? file
        : new File([compressed], file.name, { type: compressed.type });
    setPhoto(finalFile);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !photo) return;
    onSend(text.trim(), photo ?? undefined);
    setText("");
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-background px-4 py-3"
    >
      {photo && (
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Photo: {photo.name}</span>
          <button
            type="button"
            onClick={() => {
              setPhoto(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="text-destructive hover:underline"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="shrink-0 rounded-md border border-border px-2.5 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Attach photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || (!text.trim() && !photo)}
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
