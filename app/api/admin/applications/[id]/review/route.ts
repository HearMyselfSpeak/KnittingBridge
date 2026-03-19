export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ReviewSchema = z.object({
  action: z.enum(["approve", "decline"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.guideProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const newStatus = parsed.data.action === "approve" ? "APPROVED" : "DECLINED";
    await prisma.guideProfile.update({
      where: { id },
      data: { status: newStatus },
    });

    // Send email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.EMAIL_FROM ?? "KnittingBridge <no-reply@knittingbridge.com>";
        const to = profile.user.email!;

        if (parsed.data.action === "approve") {
          await resend.emails.send({
            from,
            to,
            subject: "You're approved to become a KnittingBridge Guide",
            text: `Hi ${profile.user.name ?? "there"},\n\nYour application has been reviewed and approved. Welcome to the KnittingBridge Guide community.\n\nWe'll send you onboarding details shortly.\n\nKnittingBridge`,
          });
        } else {
          await resend.emails.send({
            from,
            to,
            subject: "KnittingBridge Guide Application — Update",
            text: `Hi ${profile.user.name ?? "there"},\n\nThank you for applying. After review, we've decided not to move forward at this time. You're welcome to apply again in six months.\n\nKnittingBridge`,
          });
        }
      } catch (emailErr) {
        console.error("[review] email send failed:", emailErr);
      }
    }

    return NextResponse.json({ profileId: id, status: newStatus });
  } catch (error) {
    console.error("[admin/applications/review]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Review failed: ${message}` }, { status: 500 });
  }
}
