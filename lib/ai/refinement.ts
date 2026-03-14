// Refinement option definitions and quick-action labels.
// The actual prompt building lives in preview-generator.ts.

export const REFINEMENT_OPTIONS = [
  { id: "warmer tones", label: "Warmer tones" },
  { id: "cooler tones", label: "Cooler tones" },
  { id: "more contrast", label: "More contrast" },
  { id: "less contrast", label: "Less contrast" },
  { id: "more saturation", label: "More vivid" },
  { id: "less saturation", label: "More muted" },
  { id: "darker overall", label: "Darker" },
  { id: "lighter overall", label: "Lighter" },
] as const;

export type RefinementOption = (typeof REFINEMENT_OPTIONS)[number]["id"];
