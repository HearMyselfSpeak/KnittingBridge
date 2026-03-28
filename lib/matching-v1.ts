// Matching Algorithm — v1
// Ranks eligible Guides for a Maker request using skill, temperament, and quality signals.
// No AI calls. Pure database query + scoring logic.

import { z } from "zod";

// ─── Constants ─────────────────────────────────────────────────────────────

const SKILL_TAG_VALUES = [
  "garments", "fitSizing", "socks", "lace", "colorwork",
  "cables", "patternMod", "yarnSub", "repair", "machine",
] as const;

type SkillTag = (typeof SKILL_TAG_VALUES)[number];

// ─── Input Schema ──────────────────────────────────────────────────────────

export const MatchingInputSchema = z.object({
  skillTags: z.array(z.enum(SKILL_TAG_VALUES)).min(1).max(4),
  matchCriteria: z.array(z.string()).min(1).max(6),
  makerEmotionalProfile: z.object({
    frustrationLevel: z.number().min(1).max(5),
    confidenceLevel: z.number().min(1).max(5),
    socialComfort: z.number().min(1).max(5),
    urgency: z.number().min(1).max(5),
    learningIntent: z.number().min(1).max(5),
  }),
  sophisticationScore: z.number().int().min(1).max(5),
  recommendedSession: z.enum(["15", "45"]),
});

export type MatchingInput = z.infer<typeof MatchingInputSchema>;

export interface MatchResult {
  guideId: string;
  score: number;
  breakdown: { skill: number; temperament: number; quality: number };
}

// Guide shape from Prisma (only fields we need)
interface GuideCandidate {
  id: string; activeSessions: number; currentCapacity: number;
  garments: boolean; fitSizing: boolean; socks: boolean; lace: boolean;
  colorwork: boolean; cables: boolean; patternMod: boolean;
  yarnSub: boolean; repair: boolean; machine: boolean;
  directnessScore: number; technicality: number; verbosity: number;
  empathy: number; patience: number; encouragement: number;
  processOriented: boolean; fixVsTeach: number;
  avgRating: number; totalSessions: number; avgResponseTime: number;
}

// ─── Step 1: Database filter ───────────────────────────────────────────────

async function fetchEligibleGuides(skillTags: SkillTag[]): Promise<GuideCandidate[]> {
  const { prisma } = await import("@/lib/prisma");

  const guides = await prisma.guideProfile.findMany({
    where: {
      status: "APPROVED",
      activationComplete: true,
      stripeOnboarded: true,
    },
    select: {
      id: true, activeSessions: true, currentCapacity: true,
      garments: true, fitSizing: true, socks: true, lace: true,
      colorwork: true, cables: true, patternMod: true,
      yarnSub: true, repair: true, machine: true,
      directnessScore: true, technicality: true, verbosity: true,
      empathy: true, patience: true, encouragement: true,
      processOriented: true, fixVsTeach: true,
      avgRating: true, totalSessions: true, avgResponseTime: true,
    },
  });

  return guides.filter((g) => {
    if (g.activeSessions >= g.currentCapacity) return false;
    return skillTags.some((tag) => g[tag] === true);
  });
}

// ─── Step 2: Temperament compatibility (0-1) ──────────────────────────────

function scoreTemperament(
  guide: GuideCandidate,
  input: MatchingInput,
): number {
  const { frustrationLevel, confidenceLevel, socialComfort, learningIntent } =
    input.makerEmotionalProfile;
  const soph = input.sophisticationScore;

  // Build dynamic weights for 6 traits
  const w = { directness: 0.1, technicality: 0.1, verbosity: 0.1,
    empathy: 0.1, patience: 0.1, encouragement: 0.1 };

  // Frustration
  if (frustrationLevel >= 4) {
    w.empathy += 0.3; w.patience += 0.3; w.encouragement += 0.2;
  } else if (frustrationLevel <= 2) {
    w.empathy += 0.15; w.patience += 0.15; w.encouragement += 0.1;
  } else {
    w.empathy += 0.2; w.patience += 0.2; w.encouragement += 0.15;
  }

  // Confidence
  if (confidenceLevel <= 2) {
    w.encouragement += 0.2; w.patience += 0.2;
  } else if (confidenceLevel >= 4) {
    w.directness += 0.3;
  } else {
    w.encouragement += 0.1; w.directness += 0.1;
  }

  // Social comfort -> verbosity preference
  if (socialComfort <= 2) {
    w.verbosity += 0.2; // weight it, but we invert the score below
  }

  // Learning intent
  if (learningIntent >= 4) {
    w.technicality += 0.2;
  } else if (learningIntent <= 2) {
    // fixVsTeach handled as bonus below
  }

  // Sophistication
  if (soph >= 4) {
    w.technicality += 0.2; w.directness += 0.1;
  } else if (soph <= 2) {
    w.technicality -= 0.05; // slight penalty for high technicality
  }

  // Normalize weights
  const total = Object.values(w).reduce((s, v) => s + Math.max(v, 0), 0);
  if (total === 0) return 0.5;

  // Compute weighted score
  let score = 0;
  score += (Math.max(w.directness, 0) / total) * (guide.directnessScore / 5);
  score += (Math.max(w.technicality, 0) / total) * (guide.technicality / 5);
  score += (Math.max(w.empathy, 0) / total) * (guide.empathy / 5);
  score += (Math.max(w.patience, 0) / total) * (guide.patience / 5);
  score += (Math.max(w.encouragement, 0) / total) * (guide.encouragement / 5);

  // Verbosity: low socialComfort favors lower verbosity
  const verbNorm = socialComfort <= 2
    ? 1 - guide.verbosity / 5
    : guide.verbosity / 5;
  score += (Math.max(w.verbosity, 0) / total) * verbNorm;

  // Teaching style bonuses (outside weight system, small adjustments)
  if (learningIntent >= 4 && guide.processOriented) score += 0.05;
  if (learningIntent <= 2) score += 0.05 * guide.fixVsTeach;

  return Math.max(0, Math.min(1, score));
}

// ─── Step 3: Skill depth (0-1) ────────────────────────────────────────────

function scoreSkillDepth(guide: GuideCandidate, skillTags: SkillTag[]): number {
  const matches = skillTags.filter((tag) => guide[tag] === true).length;
  return matches / skillTags.length;
}

// ─── Step 4: Quality bonus (0-0.2) ────────────────────────────────────────

function scoreQuality(guide: GuideCandidate): number {
  const rating = guide.avgRating / 5;
  const sessions = Math.min(guide.totalSessions / 50, 1);
  const response = Math.max(1 - guide.avgResponseTime / 600, 0);
  return (rating * 0.5 + sessions * 0.25 + response * 0.25) * 0.2;
}

// ─── Main: rankGuides ──────────────────────────────────────────────────────

export async function rankGuides(raw: unknown): Promise<MatchResult[]> {
  const input = MatchingInputSchema.parse(raw);
  const candidates = await fetchEligibleGuides(input.skillTags);

  const results: MatchResult[] = candidates.map((guide) => {
    const skill = scoreSkillDepth(guide, input.skillTags);
    const temperament = scoreTemperament(guide, input);
    const quality = scoreQuality(guide);
    const score = skill * 0.35 + temperament * 0.45 + quality;
    return {
      guideId: guide.id,
      score: Math.round(score * 1000) / 1000,
      breakdown: {
        skill: Math.round(skill * 1000) / 1000,
        temperament: Math.round(temperament * 1000) / 1000,
        quality: Math.round(quality * 1000) / 1000,
      },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
