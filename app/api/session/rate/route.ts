// POST: Submit a rating for a session participant.
// Creates Rating record. If both ratings exist, sets revealedAt.
// Below-5 with freeText triggers AI analysis (async, non-blocking).

import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RateSchema = z.object({
  helpSessionId: z.string().min(1),
  ratedUserId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  reasons: z.array(z.string()).optional(),
  freeText: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { helpSessionId, ratedUserId, score, reasons, freeText } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    // Create rating (unique constraint prevents duplicates)
    const rating = await prisma.rating.create({
      data: {
        helpSessionId,
        raterId: session.user.id,
        ratedUserId,
        score,
        reasons: reasons ?? undefined,
        freeText,
      },
    });

    // Check if both ratings now exist for blind reveal
    const allRatings = await prisma.rating.findMany({
      where: { helpSessionId },
      select: { id: true, revealedAt: true },
    });

    if (allRatings.length >= 2 && allRatings.some((r) => !r.revealedAt)) {
      const now = new Date();
      await prisma.rating.updateMany({
        where: { helpSessionId },
        data: { revealedAt: now },
      });
    }

    // AI analysis of free text (async, non-blocking)
    if (score < 5 && freeText?.trim()) {
      after(async () => {
        try {
          const { chatCompletion } = await import("@/lib/openrouter");
          const model =
            process.env.TRIAGE_MODEL ?? process.env.OPENROUTER_MODEL;
          const raw = await chatCompletion({
            model,
            messages: [
              {
                role: "system",
                content:
                  "Analyze this session feedback. Extract key themes, sentiment, and actionable insights. Output a brief JSON: { \"analysis\": \"your analysis\" }",
              },
              { role: "user", content: freeText },
            ],
            response_format: { type: "json_object" },
            max_tokens: 400,
          });

          const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
          const data = JSON.parse(cleaned) as { analysis?: string };

          if (data.analysis) {
            const { prisma: p } = await import("@/lib/prisma");
            await p.rating.update({
              where: { id: rating.id },
              data: { aiAnalysis: data.analysis },
            });
          }
        } catch (err) {
          console.error("[rate] AI analysis failed:", err);
        }
      });
    }

    return NextResponse.json({ ok: true, ratingId: rating.id });
  } catch (err) {
    console.error("Rating submit error:", err);
    // Unique constraint violation = already rated
    if (String(err).includes("Unique constraint")) {
      return NextResponse.json(
        { error: "You have already rated this session" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 },
    );
  }
}
