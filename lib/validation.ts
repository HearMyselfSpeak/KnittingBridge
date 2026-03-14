// Zod schemas for all API inputs and AI outputs.
// All AI responses MUST be validated with these before use.

import { z } from "zod";

// ─── API input schemas ────────────────────────────────────────────────────────

export const CreateSessionInput = z.object({
  userId: z.string().optional(),
});

export const UploadAssetInput = z.object({
  sessionId: z.string().min(1),
  kind: z.enum(["GARMENT_SCREENSHOT", "GARMENT_CLOSEUP", "YARN_PHOTO"]),
});

export const AnalyzeInput = z.object({
  sessionId: z.string().min(1),
});

export const AssignPaletteInput = z.object({
  sessionId: z.string().min(1),
  assignments: z
    .array(
      z.object({
        regionId: z.string().min(1),
        regionLabel: z.string().min(1),
        targetColorDescription: z.string().min(1).max(500),
        source: z.enum(["DESCRIBED", "YARN_PHOTO", "THEME", "AUTO_FILLED"]),
        sourceAssetId: z.string().optional(),
      })
    )
    .min(1),
});

export const GenerateInput = z.object({
  sessionId: z.string().min(1),
});

export const RefineInput = z.object({
  sessionId: z.string().min(1),
  instruction: z.string().min(1).max(500),
  baselineImageUrl: z.string().url().optional(),
});

// ─── AI output schemas ────────────────────────────────────────────────────────

export const GarmentRegionSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  originalColorDescription: z.string(),
  hex: z.string().default("#888888"),
  confidence: z.number().min(0).max(1),
});

export const LinkedRegionSchema = z.object({
  regionIds: z.array(z.string()),
  yarnDescription: z.string(),
});

export const GarmentAnalysisSchema = z.object({
  regions: z.array(GarmentRegionSchema).min(1),
  linkedRegions: z.array(LinkedRegionSchema),
  colorworkType: z.enum([
    "none",
    "stripes",
    "fair-isle",
    "nordic",
    "colorblock",
    "intarsia",
  ]),
  ambiguities: z.array(z.string()),
  garmentNotes: z.string(),
});

export const YarnAnalysisSchema = z.object({
  dominantColor: z.object({
    description: z.string(),
    hex: z.string(),
  }),
  isVariegated: z.boolean(),
  variationType: z.enum([
    "marled",
    "heathered",
    "speckled",
    "gradient",
    "self-striping",
    "solid",
  ]),
  confidence: z.number().min(0).max(1),
  notes: z.string(),
});

export type GarmentAnalysisOutput = z.infer<typeof GarmentAnalysisSchema>;
export type YarnAnalysisOutput = z.infer<typeof YarnAnalysisSchema>;
