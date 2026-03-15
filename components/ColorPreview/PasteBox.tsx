"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
  compact?: boolean;
}

async function compressPastedImage(blob: Blob): Promise<Blob> {
  if (blob.size <= 4 * 1024 * 1024) return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const compressed = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
  bitmap.close();
  return compressed;
}

export function PasteBox({ onFile, disabled = false, compact = false }: Props) {
  const [focused, setFocused] = useState(false);
  const [pasted, setPasted] = useState(false);

  const handleDocPaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!focused || disabled) return;
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (!imageItem) return;
      const raw = imageItem.getAsFile();
      if (!raw) return;
      const blob = await compressPastedImage(raw);
      const file = blob === raw ? raw : new File([blob], raw.name || "paste.jpg", { type: blob.type });
      onFile(file);
      setPasted(true);
      setTimeout(() => setPasted(false), 1200);
    },
    [focused, disabled, onFile]
  );

  useEffect(() => {
    document.addEventListener("paste", handleDocPaste);
    return () => document.removeEventListener("paste", handleDocPaste);
  }, [handleDocPaste]);

  return (
    <div
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={[
        "flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors select-none outline-none",
        compact ? "px-3 py-2 gap-0.5" : "px-6 py-10 gap-2",
        focused
          ? "border-accent bg-accent/5"
          : "border-border hover:border-primary/40 cursor-pointer",
        disabled ? "opacity-50 pointer-events-none" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {compact ? (
        <p className="text-xs font-medium text-foreground whitespace-nowrap">
          {pasted ? "Pasted" : "Paste image"}
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">
            {pasted ? "Pasted" : "Paste image here"}
          </p>
          <p className="text-xs text-muted-foreground">Click here, then press Cmd+V</p>
        </>
      )}
    </div>
  );
}
