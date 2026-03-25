import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST: Accept the IC agreement for the authenticated Guide.
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true, icAgreementAccepted: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "No Guide profile found" },
        { status: 404 }
      );
    }

    if (profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Guide profile is not approved" },
        { status: 403 }
      );
    }

    if (profile.icAgreementAccepted) {
      return NextResponse.json({ alreadyAccepted: true });
    }

    await prisma.guideProfile.update({
      where: { id: profile.id },
      data: {
        icAgreementAccepted: true,
        icAgreementAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ accepted: true });
  } catch (error) {
    console.error("Agreement accept error:", error);
    return NextResponse.json(
      { error: "Failed to accept agreement" },
      { status: 500 }
    );
  }
}
