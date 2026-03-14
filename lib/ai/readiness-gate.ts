// Readiness gate — validates all conditions before preview generation.
// Enforces the one-preview-at-a-time constraint server-side.

import type { GarmentAnalysisOutput } from "@/lib/validation";
import type { PaletteAssignmentInput, ReadinessCheckResult } from "@/lib/types";

export interface ReadinessInput {
  analysis: GarmentAnalysisOutput;
  assignments: PaletteAssignmentInput[];
  activeGenerationInProgress: boolean;
}

export function checkReadiness(input: ReadinessInput): ReadinessCheckResult {
  const missing: string[] = [];

  // One-at-a-time constraint
  if (input.activeGenerationInProgress) {
    return {
      ready: false,
      missingConditions: ["A preview is already being generated."],
      clarifyingQuestion: undefined,
    };
  }

  // Must have at least one region
  if (input.analysis.regions.length === 0) {
    missing.push("No garment regions were detected.");
  }

  // All regions must have assignments
  const assignedRegionIds = new Set(input.assignments.map((a) => a.regionId));
  const unassigned = input.analysis.regions.filter(
    (r) => !assignedRegionIds.has(r.id)
  );

  if (unassigned.length > 0) {
    const regionLabels = unassigned.map((r) => r.label).join(", ");
    missing.push(`Color not assigned for: ${regionLabels}.`);
  }

  // No ambiguities may remain unresolved
  if (input.analysis.ambiguities.length > 0) {
    missing.push(
      `Unclear colors need resolution: ${input.analysis.ambiguities.join("; ")}.`
    );
  }

  if (missing.length > 0) {
    const clarifyingQuestion =
      unassigned.length > 0
        ? `What color should the ${unassigned[0].label} be?`
        : input.analysis.ambiguities.length > 0
        ? input.analysis.ambiguities[0]
        : undefined;

    return { ready: false, missingConditions: missing, clarifyingQuestion };
  }

  return { ready: true, missingConditions: [] };
}
