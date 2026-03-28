import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SKILL_TAG_VALUES = [
  "garments", "fitSizing", "socks", "lace", "colorwork",
  "cables", "patternMod", "yarnSub", "repair", "machine",
] as const;

const emotionalProfileSchema = z.object({
  frustrationLevel: z.number().min(1).max(5),
  confidenceLevel: z.number().min(1).max(5),
  socialComfort: z.number().min(1).max(5),
  urgency: z.number().min(1).max(5),
  learningIntent: z.number().min(1).max(5),
});

const submitSchema = z.object({
  description: z.string().min(1).max(5000),
  imageUrls: z.array(z.string()).max(5).default([]),
  followUpAnswers: z.array(z.string()).max(4).default([]),
  sophisticationScore: z.number().int().min(1).max(5),
  triageSummary: z.string().min(1),
  sessionType: z.enum(["15", "45"]),
  matchCriteria: z.array(z.string()).max(6).default([]),
  skillTags: z.array(z.enum(SKILL_TAG_VALUES)).min(1).max(4),
  makerEmotionalProfile: emotionalProfileSchema,
  encouragement: z.string().optional(),
  paymentIntentId: z.string().min(1),
});

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = submitSchema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const data = result.data;
  const { prisma } = await import("@/lib/prisma");
  const { stripe } = await import("@/lib/stripe");

  // Create Request record
  const req = await prisma.request.create({
    data: {
      userId: session.user.id,
      title: data.description.slice(0, 100),
      description: data.description,
      imageUrls: data.imageUrls,
      sophisticationScore: data.sophisticationScore,
      followUpAnswers: data.followUpAnswers,
      triageSummary: data.triageSummary,
      recommendedSession: data.sessionType,
      matchCriteria: data.matchCriteria,
      skillsRequired: data.skillTags,
      status: "SUBMITTED",
    },
  });

  // Create HelpSession placeholder (Guide assigned later during matching)
  const helpSession = await prisma.helpSession.create({
    data: {
      requestId: req.id,
      guideProfileId: "", // Placeholder until Guide accepts
      type: "LIVE",
      status: "NOTIFYING_GUIDES",
      amount: data.sessionType === "45" ? 6000 : 3000,
      duration: parseInt(data.sessionType, 10),
      stripePaymentIntentId: data.paymentIntentId,
    },
  });

  // Update PI metadata with helpSessionId (webhook depends on it)
  await stripe.paymentIntents.update(data.paymentIntentId, {
    metadata: { helpSessionId: helpSession.id },
  });

  // Run matching + packing + notify Guides (fire and forget)
  const { notifyMatchedGuides } = await import("@/lib/notify-guides");
  const sessionLength = data.sessionType === "45" ? 45 : 15;

  const notifyResult = await notifyMatchedGuides({
    requestId: req.id,
    matchingInput: {
      skillTags: [...data.skillTags],
      matchCriteria: data.matchCriteria,
      makerEmotionalProfile: data.makerEmotionalProfile,
      sophisticationScore: data.sophisticationScore,
      recommendedSession: data.sessionType,
    },
    sessionLength: sessionLength as 15 | 45,
  });

  return NextResponse.json({
    requestId: req.id,
    helpSessionId: helpSession.id,
    notifiedGuides: notifyResult.notifiedCount,
    hasAlternatives: notifyResult.hasAlternatives,
  });
}
