import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        status: true,
        icAgreementAccepted: true,
        stripeOnboarded: true,
        availableDays: true,
      },
    });

    if (!profile || profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Guide profile not approved" },
        { status: 403 }
      );
    }

    // Verify all prior steps are complete before activating.
    if (!profile.icAgreementAccepted) {
      return NextResponse.json(
        { error: "Please complete the IC agreement first" },
        { status: 400 }
      );
    }

    if (!profile.stripeOnboarded) {
      return NextResponse.json(
        { error: "Please complete Stripe setup first" },
        { status: 400 }
      );
    }

    if (profile.availableDays === null) {
      return NextResponse.json(
        { error: "Please set your availability first" },
        { status: 400 }
      );
    }

    await prisma.guideProfile.update({
      where: { id: profile.id },
      data: { activationComplete: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Activation confirm error:", error);
    return NextResponse.json(
      { error: "Failed to activate account" },
      { status: 500 }
    );
  }
}
