// POST: Check for no-shows. Called by client-side timer after trigger window.
// Authoritative: checks server-side join timestamps. Idempotent.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CheckSchema = z.object({
  helpSessionId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { helpSessionId } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    const helpSession = await prisma.helpSession.findUnique({
      where: { id: helpSessionId },
      select: {
        id: true,
        status: true,
        makerJoinedAt: true,
        guideJoinedAt: true,
        createdAt: true,
        request: { select: { recommendedSession: true } },
      },
    });

    if (!helpSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Only check sessions in WAITING_ROOM (one party joined, not both)
    if (helpSession.status !== "WAITING_ROOM") {
      return NextResponse.json({ ok: true, noshow: false });
    }

    // Both joined means no no-show
    if (helpSession.makerJoinedAt && helpSession.guideJoinedAt) {
      return NextResponse.json({ ok: true, noshow: false });
    }

    // Neither joined — no action yet
    if (!helpSession.makerJoinedAt && !helpSession.guideJoinedAt) {
      return NextResponse.json({ ok: true, noshow: false });
    }

    // One party joined. Check if trigger window has passed.
    const sessionMinutes =
      helpSession.request.recommendedSession === "15" ? 15 : 45;
    const triggerMinutes = sessionMinutes === 15 ? 3 : 7;
    const firstJoinAt = helpSession.makerJoinedAt ?? helpSession.guideJoinedAt;
    if (!firstJoinAt) {
      return NextResponse.json({ ok: true, noshow: false });
    }

    const elapsed = Date.now() - firstJoinAt.getTime();
    if (elapsed < triggerMinutes * 60_000) {
      return NextResponse.json({ ok: true, noshow: false });
    }

    // Trigger window passed. Fire appropriate no-show handler.
    const makerMissing = !helpSession.makerJoinedAt;

    if (makerMissing) {
      const { handleMakerNoShow } = await import("@/lib/no-show");
      await handleMakerNoShow(helpSessionId);
    } else {
      const { handleGuideNoShow } = await import("@/lib/no-show");
      await handleGuideNoShow(helpSessionId);
    }

    return NextResponse.json({ ok: true, noshow: true, party: makerMissing ? "maker" : "guide" });
  } catch (err) {
    console.error("No-show check error:", err);
    return NextResponse.json(
      { error: "No-show check failed" },
      { status: 500 },
    );
  }
}
