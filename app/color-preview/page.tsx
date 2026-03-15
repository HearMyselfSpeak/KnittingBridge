"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadZone } from "@/components/ColorPreview/UploadZone";

export default function ColorPreviewEntryPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      // Create session
      const createRes = await fetch("/api/color-preview/create", { method: "POST" });
      if (!createRes.ok) throw new Error("Could not start session");
      const { sessionId } = (await createRes.json()) as { sessionId: string };

      // Upload garment image
      const form = new FormData();
      form.append("file", file);
      form.append("sessionId", sessionId);
      form.append("kind", "GARMENT_SCREENSHOT");

      const uploadRes = await fetch("/api/color-preview/upload", {
        method: "POST",
        body: form,
      });
      const rawText = await uploadRes.text();
      let uploadData;
      try {
        uploadData = JSON.parse(rawText);
      } catch {
        throw new Error(`Server error (${uploadRes.status}): ${rawText.slice(0, 300)}`);
      }
      if (!uploadRes.ok) {
        throw new Error(uploadData.error ?? `Upload failed (${uploadRes.status})`);
      }

      router.push(`/color-preview/${sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setIsUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Color Preview Tool
        </p>
        <h1
          className="text-3xl font-semibold text-primary leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          See it in a new color before you commit.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Upload a photo of any knitted or crocheted garment. We will identify
          the color regions, then let you describe new colors, name a theme, or
          show us your yarn. The structure stays exactly as it is.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        {[
          { step: "01", text: "Upload a garment photo" },
          { step: "02", text: "Describe your new colors" },
          { step: "03", text: "Get a preview in seconds" },
        ].map(({ step, text }) => (
          <div key={step} className="flex gap-2">
            <span
              className="text-xl font-light text-accent/50 tabular-nums shrink-0"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {step}
            </span>
            <p className="text-muted-foreground leading-snug pt-0.5">{text}</p>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div className="space-y-3">
        <UploadZone
          onFileSelected={handleFile}
          disabled={isUploading}
          label={isUploading ? "Uploading..." : "Upload your garment photo"}
        />
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <p className="text-xs text-muted-foreground text-center">
          Free to use. No account required.
        </p>
      </div>
    </div>
  );
}
