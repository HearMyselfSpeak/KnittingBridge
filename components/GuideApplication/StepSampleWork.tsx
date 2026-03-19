"use client";

import { useRef, useState } from "react";
import type { SampleImageData } from "@/lib/guide-application-schema";

const SIZE_LIMIT = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_IMAGES = 3;

interface Props {
  images: SampleImageData[];
  onChange: (images: SampleImageData[]) => void;
  errors: Record<string, string>;
}

const textareaClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function StepSampleWork({ images, onChange, errors }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setSizeError("Only image files are accepted.");
      return;
    }
    if (file.size > SIZE_LIMIT) {
      setSizeError("Each image must be under 5 MB.");
      return;
    }
    setSizeError(null);
    const previewUrl = URL.createObjectURL(file);
    onChange([...images, { file, previewUrl, caption: "" }]);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(images[index].previewUrl);
    onChange(images.filter((_, i) => i !== index));
  }

  function updateCaption(index: number, caption: string) {
    onChange(images.map((img, i) => (i === index ? { ...img, caption } : img)));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Sample work</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share 1–3 finished project photos with a short description of each. JPEG, PNG,
          WebP, or AVIF — up to 5 MB each.
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img, i) => (
            <div
              key={img.previewUrl}
              className="flex gap-4 p-4 rounded-lg border border-border bg-secondary/30"
            >
              <div className="flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={`Sample work ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-md border border-border"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Image {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={img.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  placeholder="Describe this project — what it is, any techniques used, what makes it representative of your work..."
                  maxLength={500}
                  rows={3}
                  className={textareaClass}
                />
                <div className="flex justify-between items-center">
                  {errors[`caption_${i}`] ? (
                    <p className="text-xs text-destructive">{errors[`caption_${i}`]}</p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {img.caption.length}/500
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-lg px-6 py-8 text-center hover:border-primary/40 hover:bg-secondary/40 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={onInputChange}
          />
          <p className="text-sm font-medium text-foreground">
            {images.length === 0 ? "Add a photo" : "Add another photo"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {images.length === 0
              ? "Upload 1–3 finished project images"
              : `${MAX_IMAGES - images.length} more allowed`}
          </p>
        </button>
      )}

      {(sizeError || errors.images) && (
        <p className="text-sm text-destructive">{sizeError ?? errors.images}</p>
      )}
    </div>
  );
}
