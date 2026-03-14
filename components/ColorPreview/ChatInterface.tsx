"use client";

import { useState, useEffect } from "react";
import { GarmentSummary } from "./GarmentSummary";
import { PaletteBuilder } from "./PaletteBuilder";
import { PreviewCanvas, type PreviewFrame } from "./PreviewCanvas";
import { RefinementBar } from "./RefinementBar";
import { StepBar } from "./StepBar";
import { buildPreviewLabel } from "@/lib/ai/preview-label";
import type {
  ColorSessionStatus,
  GarmentAnalysisResult,
  PaletteAssignmentInput,
  UploadedAssetView,
} from "@/lib/types";

interface Props {
  sessionId: string;
  initialStatus: ColorSessionStatus;
  initialAssets: UploadedAssetView[];
  initialAnalysis: GarmentAnalysisResult | null;
  initialAssignments: PaletteAssignmentInput[];
  initialPreviewUrl: string | null;
}

const SPIN = "w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin";
const PALETTE_STATUSES: ColorSessionStatus[] = ["AWAITING_COLOR_DIRECTION", "AWAITING_REGION_MAPPING", "AWAITING_MORE_YARN_INFO", "READY_FOR_PREVIEW"];

export function ChatInterface({ sessionId, initialStatus, initialAssets, initialAnalysis, initialAssignments, initialPreviewUrl }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [frames, setFrames] = useState<PreviewFrame[]>(
    initialPreviewUrl ? [{ imageUrl: initialPreviewUrl, label: buildPreviewLabel(initialAssignments) }] : []
  );
  const [currentAssignments, setCurrentAssignments] = useState<PaletteAssignmentInput[]>(initialAssignments);
  const [isRefining, setIsRefining] = useState(false);
  const [baseline, setBaseline] = useState<string | null>(initialAssets.find((a) => a.kind === "GARMENT_SCREENSHOT" || a.kind === "GARMENT_CLOSEUP")?.publicUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const garmentAssets = initialAssets.filter(
    (a) => a.kind === "GARMENT_SCREENSHOT" || a.kind === "GARMENT_CLOSEUP"
  );
  const garmentImageUrl = garmentAssets[0]?.publicUrl ?? null;

  useEffect(() => {
    const needs = (status === "AWAITING_GARMENT_UPLOAD" || status === "ANALYZING_GARMENT")
      && garmentAssets.length > 0 && !analysis;
    if (needs) void runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    setStatus("ANALYZING_GARMENT");
    setError(null);
    try {
      const res = await fetch("/api/color-preview/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { analysis?: GarmentAnalysisResult; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data.analysis!);
      setStatus("AWAITING_COLOR_DIRECTION");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setStatus("FAILED");
    }
  }

  async function handleAssigned(assignments: PaletteAssignmentInput[]) {
    const res = await fetch("/api/color-preview/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, assignments }),
    });
    const data = (await res.json()) as { readiness?: { ready: boolean }; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to save assignments");
    setCurrentAssignments(assignments);
    setStatus(data.readiness?.ready ? "READY_FOR_PREVIEW" : "AWAITING_REGION_MAPPING");
  }

  async function handleGenerate() {
    setStatus("GENERATING_PREVIEW");
    setError(null);
    try {
      const res = await fetch("/api/color-preview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setFrames((prev) => [...prev, { imageUrl: data.imageUrl!, label: buildPreviewLabel(currentAssignments) }]);
      setBaseline(garmentImageUrl);
      setStatus("PREVIEW_READY");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStatus("FAILED");
    }
  }

  function handleRefined(imageUrl: string, label: string) {
    setFrames((prev) => [...prev, { imageUrl, label }]);
  }

  function handleRefineStart() {
    console.log("[ChatInterface] baseline at refine start:", baseline);
    setIsRefining(true);
  }
  function handleRefineEnd() { setIsRefining(false); }

  if (status === "ANALYZING_GARMENT") {
    return (
      <div>
        <StepBar current={1} />
        <div className="flex flex-col items-center gap-3 py-20">
          <div className={SPIN} />
          <p className="text-sm text-muted-foreground">Analyzing your garment...</p>
        </div>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-foreground">{error ?? "Something went wrong."}</p>
        <button onClick={() => { setStatus("AWAITING_GARMENT_UPLOAD"); setError(null); }} className="text-sm font-medium text-primary hover:underline">
          Start over
        </button>
      </div>
    );
  }

  if (status === "GENERATING_PREVIEW") {
    return (
      <div className="space-y-6">
        <StepBar current={3} />
        <PreviewCanvas originalImageUrl={garmentImageUrl} frames={frames} isLoading={true} regionLabels={analysis?.regions.map((r) => r.label)} selectedBaseline={baseline} onBaselineSelect={setBaseline} />
      </div>
    );
  }

  if (status === "PREVIEW_READY" && frames.length > 0) {
    return (
      <div className="space-y-6">
        <StepBar current={3} />
        <PreviewCanvas originalImageUrl={garmentImageUrl} frames={frames} isLoading={isRefining} regionLabels={analysis?.regions.map((r) => r.label)} selectedBaseline={baseline} onBaselineSelect={setBaseline} />
        <RefinementBar
          sessionId={sessionId}
          onRefined={handleRefined}
          onRefineStart={handleRefineStart}
          onRefineEnd={handleRefineEnd}
          baselineImageUrl={baseline}
        />
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => setStatus("AWAITING_COLOR_DIRECTION")}
            disabled={isRefining}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Try different colors
          </button>
        </div>
      </div>
    );
  }

  if (analysis && PALETTE_STATUSES.includes(status)) {
    return (
      <div className="space-y-6">
        <StepBar current={2} />
        {garmentImageUrl && (
          <img src={garmentImageUrl} alt="Uploaded garment" className="h-40 w-auto object-contain rounded-lg border border-border" />
        )}
        <GarmentSummary analysis={analysis} />
        <div className="border-t border-border pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Assign new colors</p>
          <PaletteBuilder analysis={analysis} sessionId={sessionId} initialAssignments={initialAssignments} onAssigned={handleAssigned} />
        </div>
        {status === "READY_FOR_PREVIEW" && (
          <button onClick={() => void handleGenerate()} className="w-full bg-accent text-accent-foreground text-sm font-medium px-4 py-3 rounded-md hover:opacity-90 transition-opacity">
            Generate preview
          </button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-20">
      <div className={SPIN} />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}
