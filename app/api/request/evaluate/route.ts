import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const evaluateSchema = z.object({
  input: z.string().min(1).max(5000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = evaluateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const { evaluateSophistication } = await import("@/lib/ai/triage-v1");
  const evaluation = await evaluateSophistication(result.data.input);

  // Log bail-out if triggered
  if (evaluation.isBailOut) {
    const { prisma } = await import("@/lib/prisma");
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null;

    await prisma.bailOutLog.create({
      data: {
        inputText: result.data.input,
        ip,
        reason: evaluation.bailOutReason ?? "unknown",
      },
    });
  }

  return NextResponse.json({
    score: evaluation.score,
    signals: evaluation.signals,
    suggestedFollowUps: evaluation.suggestedFollowUps,
    sessionRecommendation: evaluation.sessionRecommendation,
    isBailOut: evaluation.isBailOut,
    bailOutReason: evaluation.bailOutReason,
  });
}
