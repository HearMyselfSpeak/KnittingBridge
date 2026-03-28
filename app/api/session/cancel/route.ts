// POST /api/session/cancel
// Auth required. Body: { sessionId, reason? }
// Determines caller role on the session and delegates to cancelByMaker or cancelByGuide.

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessionId?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, reason } = body;
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/prisma");
  const userId = session.user.id;

  // Look up the HelpSession to determine caller's role
  const helpSession = await prisma.helpSession.findUnique({
    where: { id: sessionId },
    select: {
      request: { select: { userId: true, status: true } },
      guideProfile: { select: { userId: true } },
    },
  });

  if (!helpSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const reqStatus = helpSession.request.status;
  if (reqStatus === "CANCELLED" || reqStatus === "COMPLETED") {
    return NextResponse.json(
      { error: "Session is already cancelled or completed" },
      { status: 400 },
    );
  }

  const isMaker = helpSession.request.userId === userId;
  const isGuide = helpSession.guideProfile.userId === userId;

  if (!isMaker && !isGuide) {
    return NextResponse.json({ error: "Not authorized for this session" }, { status: 403 });
  }

  if (isMaker) {
    const { cancelByMaker } = await import("@/lib/cancellation");
    const result = await cancelByMaker(sessionId, userId, reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      refundAmountCents: result.refundAmountCents,
      copy: result.copy,
      status: "cancelled",
    });
  }

  const { cancelByGuide } = await import("@/lib/cancellation");
  const result = await cancelByGuide(sessionId, userId, reason);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    refundAmountCents: result.refundAmountCents,
    copy: result.copy,
    status: "cancelled",
  });
}
