// Preview generation — builds the image editing prompt and orchestrates generation + storage.

import type { GarmentAnalysisOutput } from "@/lib/validation";
import type { PaletteAssignmentInput } from "@/lib/types";
import { generateImage } from "@/lib/openrouter";
import { storeGeneratedImage } from "@/lib/storage";

export function buildPreviewPrompt(
  analysis: GarmentAnalysisOutput,
  assignments: PaletteAssignmentInput[]
): string {
  const colorMap = new Map(
    assignments.map((a) => [a.regionId, a.targetColorDescription])
  );

  const colorList = analysis.regions
    .map((r) => {
      const newColor = colorMap.get(r.id) ?? r.originalColorDescription;
      return `${r.label} — ${newColor}`;
    })
    .join(", ");

  const colorworkNote =
    analysis.colorworkType !== "none"
      ? ` The garment has ${analysis.colorworkType.replace("-", " ")} colorwork; preserve all motif placement and repeat spacing exactly.`
      : "";

  return [
    "Recolor only the yarn fiber in this knitted garment photo.",
    "Preserve the exact garment silhouette, all motif placement, pattern structure, stitch definition, and proportions.",
    "MOTIF FIDELITY: Every motif, shape, geometric element, line, curve, circle, arc, and design element in the original must appear in the generated preview in exactly the same position, size, proportion, and relationship to other elements. Do not simplify, merge, omit, reposition, or reinterpret any design element. Pay special attention to sleeves, cuffs, hem edges, and partially visible motifs — these are most often lost or simplified and must be reproduced with the same accuracy as the center of the garment.",
    "FRAMING: The output image must have exactly the same aspect ratio, dimensions, framing, zoom level, crop, and composition as the input photo. Do not zoom in, zoom out, reframe, reposition, or crop differently. If the source image is portrait, the output must be portrait. If it shows the full body including feet, the output must show the full body including feet. Every edge of the garment and every edge of the frame must match the source exactly.",
    "NON-GARMENT ELEMENTS: Do not alter skin tone, hair color, facial features, hands, any clothing other than the knitted garment, background, shadows, lighting, or any element that is not yarn fiber. Every pixel outside the knitted garment must be identical to the source image.",
    `New yarn colors: ${colorList}.`,
    analysis.garmentNotes ? `Garment structure: ${analysis.garmentNotes}.` : "",
    colorworkNote,
    "The result must be a pixel-accurate reproduction of the original's structure with only the yarn colors changed — nothing else.",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function buildRefinementPrompt(
  basePrompt: string,
  instruction: string
): string {
  const instructionMap: Record<string, string> = {
    "warmer tones": "Shift all colors toward warmer undertones (more orange/red/yellow).",
    "cooler tones": "Shift all colors toward cooler undertones (more blue/green).",
    "more contrast": "Increase the contrast between the color regions.",
    "less contrast": "Reduce the contrast; bring the color regions closer together.",
    "more saturation": "Make all colors more vivid and saturated.",
    "less saturation": "Desaturate the colors; make them more muted and dusty.",
    "darker overall": "Darken all colors while maintaining their hue relationships.",
    "lighter overall": "Lighten all colors while maintaining their hue relationships.",
  };

  const mappedInstruction = instructionMap[instruction] ?? instruction;
  return `${basePrompt} Adjustment: ${mappedInstruction}`;
}

/**
 * Generate a color preview by editing the original garment photo.
 * Returns the public URL of the stored result image.
 */
export async function generatePreview(
  prompt: string,
  garmentImageUrl: string,
  sessionId: string
): Promise<string> {
  const b64 = await generateImage({ prompt, garmentImageUrl, size: "auto" });
  return storeGeneratedImage(sessionId, b64);
}
