"use client";

import { useRef, useState } from "react";
import { PasteBox } from "./PasteBox";

const SIZE_LIMIT = 5 * 1024 * 1024;
const SIZE_ERROR =
  "This image is over the 5 MB limit. Try saving it as a JPEG or reducing the resolution.";

interface Props {
  onFileSelected: (file: File) => void;
  label?: string;
  disabled?: boolean;
  accept?: string;
}

export function UploadZone({
  onFileSelected,
  label = "Upload image",
  disabled = false,
  accept = "image/jpeg,image/png,image/webp",
}: Props) {
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > SIZE_LIMIT) {
      setSizeError(SIZE_ERROR);
      return;
    }
    setSizeError(null);
    onFileSelected(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const uploadClass = [
    "border-2 border-dashed rounded-lg px-6 py-10 text-center transition-colors cursor-pointer",
    dragging
      ? "border-accent bg-accent/5"
      : "border-border hover:border-primary/40 hover:bg-secondary/40",
    disabled ? "opacity-50 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={uploadClass}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={onInputChange}
            disabled={disabled}
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP — up to 5 MB</p>
          </div>
        </button>

        <PasteBox onFile={handleFile} disabled={disabled} />
      </div>

      {sizeError && (
        <p className="text-sm text-destructive">{sizeError}</p>
      )}
    </div>
  );
}
