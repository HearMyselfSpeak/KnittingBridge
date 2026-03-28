import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitSchema = z.object({
  description: z.string().min(1).max(5000),
  imageUrls: z.array(z.string()).max(5).default([]),
  followUpAnswers: z.array(z.string()).max(4).default([]),
  sophisticationScore: z.number().int().min(1).max(5),
  triageSummary: z.string().min(1),
  sessionType: z.enum(["15", "45"]),
  matchCriteria: z.array(z.string()).max(6).default([]),
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
      stripePaymentIntentId: data.paymentIntentId,
    },
  });

  // Update PI metadata with helpSessionId (webhook depends on it)
  await stripe.paymentIntents.update(data.paymentIntentId, {
    metadata: { helpSessionId: helpSession.id },
  });

  return NextResponse.json({
    requestId: req.id,
    helpSessionId: helpSession.id,
  });
}
