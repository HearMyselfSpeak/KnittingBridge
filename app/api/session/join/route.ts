// POST: Record participant join timestamp.
// If both participants have joined, update session to IN_PROGRESS.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const JoinSchema = z.object({
  helpSessionId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = JoinSchema.safeParse(body);
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
        request: { select: { userId: true } },
        guideProfile: { select: { userId: true } },
      },
    });

    if (!helpSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isMaker = helpSession.request.userId === userId;
    const isGuide = helpSession.guideProfile.userId === userId;
    if (!isMaker && !isGuide) {
      return NextResponse.json({ error: "Not a participant" }, { status: 403 });
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {};

    if (isMaker && !helpSession.makerJoinedAt) {
      updateData.makerJoinedAt = now;
    } else if (isGuide && !helpSession.guideJoinedAt) {
      updateData.guideJoinedAt = now;
    }

    // Check if both are now joined
    const makerIn = isMaker ? true : !!helpSession.makerJoinedAt;
    const guideIn = isGuide ? true : !!helpSession.guideJoinedAt;
    const bothJoined = makerIn && guideIn;

    if (bothJoined && helpSession.status !== "IN_PROGRESS") {
      updateData.status = "IN_PROGRESS";
      updateData.startedAt = now;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.helpSession.update({
        where: { id: helpSessionId },
        data: updateData,
      });
    }

    return NextResponse.json({ ok: true, bothJoined });
  } catch (err) {
    console.error("Session join error:", err);
    return NextResponse.json(
      { error: "Failed to record join" },
      { status: 500 },
    );
  }
}
