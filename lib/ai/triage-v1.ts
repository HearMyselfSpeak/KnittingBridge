// AI Triage Service — v1
// Orchestrates sophistication evaluation, follow-up generation, and triage result.
// All outputs are Zod-validated. All AI calls go through OpenRouter.

import { z } from "zod";
import { chatCompletion } from "@/lib/openrouter";

const TRIAGE_MODEL =
  process.env.TRIAGE_MODEL ?? process.env.OPENROUTER_MODEL;
import { SOPHISTICATION_SYSTEM_PROMPT } from "./prompts/sophistication-prompt-v1";
import { buildFollowUpSystemPrompt } from "./prompts/followup-prompt-v1";
import { buildTriageSystemPrompt } from "./prompts/triage-prompt-v1";

// ─── Zod Schemas ────────────────────────────────────────────────────────────

export const SophisticationResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  signals: z.array(z.string()),
  suggestedFollowUps: z.array(z.string()).max(4),
  sessionRecommendation: z.enum(["15", "45"]),
  isBailOut: z.boolean(),
  bailOutReason: z
    .enum(["nonsense", "hostile", "off_topic", "competitor_probe"])
    .optional(),
});

export const FollowUpSchema = z.array(z.string()).min(1).max(4);

const SKILL_TAG_VALUES = [
  "garments", "fitSizing", "socks", "lace", "colorwork",
  "cables", "patternMod", "yarnSub", "repair", "machine",
] as const;

export const TriageResultSchema = z.object({
  summary: z.string().min(1),
  sessionType: z.enum(["15", "45"]),
  matchCriteria: z.array(z.string()).min(1).max(6),
  skillTags: z.array(z.enum(SKILL_TAG_VALUES)).min(1).max(4),
  makerEmotionalProfile: z.object({
    frustrationLevel: z.number().min(1).max(5),
    confidenceLevel: z.number().min(1).max(5),
    socialComfort: z.number().min(1).max(5),
    urgency: z.number().min(1).max(5),
    learningIntent: z.number().min(1).max(5),
  }),
  encouragement: z.string().min(1),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type SophisticationResult = z.infer<typeof SophisticationResultSchema>;
export type FollowUpResult = z.infer<typeof FollowUpSchema>;
export type TriageResult = z.infer<typeof TriageResultSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseJson(raw: string): unknown {
  // Strip markdown fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function evaluateSophistication(
  input: string,
): Promise<SophisticationResult> {
  const raw = await chatCompletion({
    model: TRIAGE_MODEL,
    messages: [
      { role: "system", content: SOPHISTICATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Evaluate this knitter's message:\n\n${input}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.2,
  });

  const parsed = parseJson(raw);
  if (!(parsed as Record<string, unknown>)?.score) {
    throw new Error('Unexpected AI response shape: ' + JSON.stringify(parsed).slice(0, 500));
  }
  return SophisticationResultSchema.parse(parsed);
}

export async function generateFollowUps(
  input: string,
  sophisticationScore: number,
  photos: boolean,
): Promise<FollowUpResult> {
  const systemPrompt = buildFollowUpSystemPrompt(sophisticationScore, photos);

  const raw = await chatCompletion({
    model: TRIAGE_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate follow-up questions for this knitter's message:\n\n${input}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 400,
    temperature: 0.4,
  });

  // Model may return { questions: [...] } or bare array
  const parsed = parseJson(raw);
  const arr = Array.isArray(parsed)
    ? parsed
    : (parsed as { questions?: unknown }).questions ?? parsed;
  return FollowUpSchema.parse(arr);
}

export async function generateTriageResult(
  input: string,
  followUpAnswers: string[],
  sophisticationScore: number,
): Promise<TriageResult> {
  const systemPrompt = buildTriageSystemPrompt(sophisticationScore);

  const answersBlock = followUpAnswers.length
    ? `\n\nFollow-up answers from the knitter:\n${followUpAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")}`
    : "";

  const raw = await chatCompletion({
    model: TRIAGE_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Original message:\n${input}${answersBlock}\n\nGenerate the triage summary.`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 600,
    temperature: 0.5,
  });

  const parsed = parseJson(raw);
  return TriageResultSchema.parse(parsed);
}
