// Builds a human-readable label for a generated preview frame
// based on the palette assignments that produced it. Pure utility — no AI calls.

import type { PaletteAssignmentInput } from "@/lib/types";

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildPreviewLabel(assignments: PaletteAssignmentInput[]): string {
  if (assignments.length === 0) return "Preview";

  const themed = assignments.filter((a) => a.source === "THEME");
  const allTheme = themed.length === assignments.length;

  // All regions from the same palette theme — single-name label is correct here
  if (allTheme) {
    return toTitleCase(themed[0].targetColorDescription) + " palette";
  }

  // Every other case: list every region with its assigned color, no truncation
  return assignments
    .map((a) => {
      const suffix = a.source === "YARN_PHOTO" ? " yarn" : "";
      return `${a.regionLabel}: ${a.targetColorDescription}${suffix}`;
    })
    .join(", ");
}
