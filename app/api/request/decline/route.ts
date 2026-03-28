// POST: Guide declines a request.
// If all notified Guides have declined, marks the request as UNMATCHED.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DeclineSchema = z.object({
  requestId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = DeclineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { requestId } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    const guide = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide profile not found" }, { status: 404 });
    }

    // Update this Guide's notification to DECLINED
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
        { status: 404 },
      );
    }

    await prisma.guideNotification.update({
      where: { id: notification.id },
      data: { status: "DECLINED", respondedAt: new Date() },
    });

    // Check if all notifications for this request are resolved (none PENDING)
    const remaining = await prisma.guideNotification.count({
      where: { requestId, status: "PENDING" },
    });

    if (remaining === 0) {
      // Check that no Guide accepted (request still SUBMITTED)
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: { status: true },
      });

      if (request?.status === "SUBMITTED") {
        await prisma.request.update({
          where: { id: requestId },
          data: { status: "UNMATCHED" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request decline error:", err);
    return NextResponse.json(
      { error: "Failed to decline request" },
      { status: 500 },
    );
  }
}
