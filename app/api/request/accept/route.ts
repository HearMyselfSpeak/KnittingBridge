// POST: Guide accepts a request. First-to-accept wins via optimistic lock.
// Returns 409 if another Guide already accepted.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AcceptSchema = z.object({
  requestId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = AcceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { requestId } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    // Find the Guide's profile
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
    }

    // Verify this Guide was notified about this request
    const notification = await prisma.guideNotification.findFirst({
      where: {
        guideProfileId: guide.id,
        requestId,
        status: "PENDING",
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "No pending notification for this request" },
        { status: 403 },
      );
    }

    // Atomic accept: check status + update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { id: requestId },
        select: { status: true },
      });

      if (!request || request.status !== "SUBMITTED") {
        return { conflict: true };
      }

      await tx.request.update({
        where: { id: requestId },
        data: { status: "MATCHED", matchedGuideId: guide.id },
      });

      await tx.guideNotification.update({
        where: { id: notification.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });

      await tx.guideProfile.update({
        where: { id: guide.id },
        data: { activeSessions: { increment: 1 } },
      });

      return { conflict: false };
    });

    if (result.conflict) {
      return NextResponse.json(
        { error: "Another Guide has already accepted this request." },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request accept error:", err);
    return NextResponse.json(
      { error: "Failed to accept request" },
      { status: 500 },
    );
  }
}
