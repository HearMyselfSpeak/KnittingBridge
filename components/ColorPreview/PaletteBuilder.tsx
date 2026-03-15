"use client";

import { useState } from "react";
import type { GarmentAnalysisResult, PaletteAssignmentInput } from "@/lib/types";
import { PasteBox } from "./PasteBox";

const SIZE_LIMIT = 5 * 1024 * 1024;
const SIZE_ERROR =
  "This image is over the 5 MB limit. Try saving it as a JPEG or reducing the resolution.";

interface RegionState {
  description: string;
  source: PaletteAssignmentInput["source"];
  sourceAssetId?: string;
  thumbnailUrl?: string;
  uploading: boolean;
  sizeError?: string;
}

interface Props {
  analysis: GarmentAnalysisResult;
  sessionId: string;
  initialAssignments?: PaletteAssignmentInput[];
  onAssigned: (assignments: PaletteAssignmentInput[]) => Promise<void>;
  disabled?: boolean;
}

export function PaletteBuilder({ analysis, sessionId, initialAssignments = [], onAssigned, disabled = false }: Props) {
  const [regionStates, setRegionStates] = useState<Record<string, RegionState>>(() => {
    const map = Object.fromEntries(initialAssignments.map((a) => [a.regionId, a]));
    return Object.fromEntries(
      analysis.regions.map((r) => [r.id, {
        description: map[r.id]?.targetColorDescription ?? "",
        source: (map[r.id]?.source ?? "DESCRIBED") as PaletteAssignmentInput["source"],
        sourceAssetId: map[r.id]?.sourceAssetId,
        uploading: false,
      }])
    );
  });
  const [theme, setTheme] = useState("");
  const [dirty, setDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setDescription(id: string, val: string) {
    setDirty(true);
    setRegionStates((prev) => ({ ...prev, [id]: { ...prev[id], description: val, source: "DESCRIBED" } }));
  }

  // A region is manually assigned if the user typed a description OR uploaded a yarn photo.
  function isManuallyAssigned(s: RegionState): boolean {
    return s.description.trim().length > 0 || !!s.thumbnailUrl || s.source === "YARN_PHOTO";
  }

  // "Apply to unassigned" — fills only regions with no manual input.
  function applyThemeToUnassigned() {
    if (!theme.trim()) return;
    setDirty(true);
    setRegionStates((prev) => {
      const updates: Record<string, RegionState> = {};
      for (const region of analysis.regions) {
        const s = prev[region.id];
        if (s && !isManuallyAssigned(s)) {
          updates[region.id] = { ...s, description: theme.trim(), source: "THEME" as const };
        }
      }
      return { ...prev, ...updates };
    });
  }

  // "Replace all" — overwrites every region, clearing per-region descriptions and yarn thumbnails.
  function replaceAll() {
    if (!theme.trim()) return;
    setDirty(true);
    setRegionStates((prev) => {
      const updates: Record<string, RegionState> = {};
      for (const region of analysis.regions) {
        const s = prev[region.id];
        if (s) {
          updates[region.id] = {
            ...s,
            description: theme.trim(),
            source: "THEME" as const,
            thumbnailUrl: undefined,
            sourceAssetId: undefined,
          };
        }
      }
      return { ...prev, ...updates };
    });
  }

  async function handleYarnUpload(regionId: string, file: File) {
    if (file.size > SIZE_LIMIT) {
      setRegionStates((prev) => ({ ...prev, [regionId]: { ...prev[regionId], sizeError: SIZE_ERROR } }));
      return;
    }
    setRegionStates((prev) => ({ ...prev, [regionId]: { ...prev[regionId], sizeError: undefined, uploading: true } }));
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sessionId", sessionId);
      form.append("kind", "YARN_PHOTO");
      const res = await fetch("/api/color-preview/upload", { method: "POST", body: form });
      const rawText = await res.text();
      console.log("[yarn upload response]", res.status, rawText);
      let data: { assetId?: string; publicUrl?: string; colorDescription?: string; error?: string };
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned non-JSON (status ${res.status}): ${rawText.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setDirty(true);
      setRegionStates((prev) => ({
        ...prev,
        [regionId]: {
          ...prev[regionId],
          source: "YARN_PHOTO",
          sourceAssetId: data.assetId,
          thumbnailUrl: data.publicUrl,
          description: data.colorDescription ?? prev[regionId].description,
          uploading: false,
        },
      }));
    } catch {
      setRegionStates((prev) => ({ ...prev, [regionId]: { ...prev[regionId], uploading: false } }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const assignments: PaletteAssignmentInput[] = analysis.regions.map((r) => ({
      regionId: r.id,
      regionLabel: r.label,
      targetColorDescription: regionStates[r.id]?.description.trim() || r.originalColorDescription,
      source: regionStates[r.id]?.source ?? "DESCRIBED",
      sourceAssetId: regionStates[r.id]?.sourceAssetId,
    }));
    const empty = assignments.filter((a) => !a.targetColorDescription.trim());
    if (empty.length > 0) {
      setError(`Describe the color for: ${empty.map((a) => a.regionLabel).join(", ")}`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onAssigned(assignments);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Theme shortcut */}
      <div className="rounded-md border border-border bg-secondary/30 px-4 py-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Apply a palette theme</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. autumn leaves, ocean fog, Scandinavian winter"
            className="flex-1 text-sm border border-border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button
            type="button"
            onClick={applyThemeToUnassigned}
            disabled={!theme.trim()}
            className="text-xs px-3 py-1.5 border border-border rounded-md hover:bg-secondary/60 transition-colors disabled:opacity-40 shrink-0"
          >
            Apply to unassigned
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={replaceAll}
            disabled={!theme.trim()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            Replace all
          </button>
        </div>
      </div>

      {/* Per-region inputs */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors by region</p>
        {analysis.regions.map((region) => {
          const state = regionStates[region.id] ?? { description: "", source: "DESCRIBED" as const, uploading: false };
          return (
            <div key={region.id} className="flex items-start gap-3 p-3 border border-border rounded-md">
              {region.hex && (
                <span className="mt-2 w-3 h-3 rounded-sm border border-black/10 shrink-0" style={{ backgroundColor: region.hex }} />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm font-medium text-foreground">{region.label}</p>
                <p className="text-xs text-muted-foreground">{region.originalColorDescription}</p>
                <input
                  type="text"
                  value={state.description}
                  onChange={(e) => setDescription(region.id, e.target.value)}
                  placeholder="Describe the new color..."
                  className="w-full text-sm border border-border rounded px-2.5 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                {/* Yarn analysis loading indicator — always in DOM while uploading */}
                {state.uploading && (
                  <div className="animate-pulse flex items-center gap-2 rounded-md border-2 border-accent/60 bg-accent/5 px-3 py-2">
                    <div className="w-4 h-4 rounded-full bg-accent/40 shrink-0" />
                    <p className="text-xs font-medium text-accent">Analyzing yarn...</p>
                  </div>
                )}
                {/* Thumbnail — shown after upload completes */}
                {state.thumbnailUrl && !state.uploading && (
                  <div className="w-16 h-16 rounded border border-border overflow-hidden">
                    <img src={state.thumbnailUrl} alt="Yarn photo" className="w-full h-full object-cover" />
                  </div>
                )}
                {state.sizeError && <p className="text-xs text-destructive">{state.sizeError}</p>}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0 mt-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={state.uploading || disabled}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleYarnUpload(region.id, file); e.target.value = ""; }}
                  />
                  <span className="text-xs px-2 py-1 border border-border rounded hover:bg-secondary/40 transition-colors block text-center">
                    {state.uploading ? "..." : "Yarn photo"}
                  </span>
                </label>
                <PasteBox
                  onFile={(file) => void handleYarnUpload(region.id, file)}
                  disabled={state.uploading || disabled}
                  compact
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {dirty && <button type="submit" disabled={isSubmitting || disabled} className="w-full bg-primary text-primary-foreground text-sm font-medium px-4 py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">{isSubmitting ? "Saving..." : "Save color assignments"}</button>}
    </form>
  );
}
