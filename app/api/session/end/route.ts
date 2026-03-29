// POST: End a live session. Calculates duration, marks COMPLETED,
// triggers transcript processing via after().

import { NextResponse } from "next/server";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const EndSchema = z.object({
  helpSessionId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = EndSchema.safeParse(body);
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
        startedAt: true,
        requestId: true,
        guideProfileId: true,
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

    const endableStatuses = ["IN_PROGRESS", "WAITING_ROOM"];
    if (!endableStatuses.includes(helpSession.status)) {
      return NextResponse.json({ error: "Session not active" }, { status: 400 });
    }

    const now = new Date();
    const duration = helpSession.startedAt
      ? Math.ceil((now.getTime() - helpSession.startedAt.getTime()) / 60_000)
      : 0;

    // Update session
    await prisma.helpSession.update({
      where: { id: helpSessionId },
      data: {
        status: "COMPLETED",
        endedAt: now,
        endedBy: userId,
        completedAt: now,
        duration,
      },
    });

    // Update request status
    await prisma.request.update({
      where: { id: helpSession.requestId },
      data: { status: "COMPLETED" },
    });

    // Decrement Guide active sessions
    await prisma.guideProfile.update({
      where: { id: helpSession.guideProfileId },
      data: { activeSessions: { decrement: 1 } },
    });

    // Trigger transcript processing after response
    after(async () => {
      try {
        const { processTranscript } = await import("@/lib/transcript");
        await processTranscript(helpSessionId);
      } catch (err) {
        console.error("[end-session] Transcript processing failed:", err);
      }
    });

    return NextResponse.json({
      ok: true,
      redirectUrl: `/session/${helpSessionId}/complete`,
    });
  } catch (err) {
    console.error("End session error:", err);
    return NextResponse.json(
      { error: "Failed to end session" },
      { status: 500 },
    );
  }
}
