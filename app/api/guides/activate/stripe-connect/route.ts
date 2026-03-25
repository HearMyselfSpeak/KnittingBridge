import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Check whether the Guide's Stripe Connect account is fully onboarded.
// Updates stripeOnboarded in the DB if charges and payouts are enabled.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, stripeAccountId: true, stripeOnboarded: true },
    });

    if (!profile?.stripeAccountId) {
      return NextResponse.json({ onboarded: false, hasAccount: false });
    }

    if (profile.stripeOnboarded) {
      return NextResponse.json({ onboarded: true, hasAccount: true });
    }

    const { isAccountOnboarded } = await import("@/lib/stripe");
    const onboarded = await isAccountOnboarded(profile.stripeAccountId);

    if (onboarded) {
      await prisma.guideProfile.update({
        where: { id: profile.id },
        data: { stripeOnboarded: true },
      });
    }

    return NextResponse.json({ onboarded, hasAccount: true });
  } catch (error) {
    console.error("Stripe status check error:", error);
    return NextResponse.json(
      { error: "Failed to check Stripe status" },
      { status: 500 }
    );
  }
}

// POST: Create or resume Stripe Connect onboarding for the authenticated Guide.
// If the Guide already has a stripeAccountId, creates a new account link for it.
// Otherwise, creates a new Connect account first.
export async function POST(req: NextRequest) {
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
        stripeAccountId: true,
        user: { select: { email: true } },
      },
    });

    if (!profile || profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Guide profile not approved" },
        { status: 403 }
      );
    }

    const { createConnectAccount, createAccountLink } = await import(
      "@/lib/stripe"
    );

    // Use existing account or create a new one.
    let accountId = profile.stripeAccountId;

    if (!accountId) {
      accountId = await createConnectAccount(profile.user.email);
      await prisma.guideProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Build return/refresh URLs pointing back to activation step 3.
    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "";
    const returnUrl = `${origin}/dashboard/guide/activate?step=3`;
    const refreshUrl = `${origin}/dashboard/guide/activate?step=3`;

    const url = await createAccountLink(accountId, returnUrl, refreshUrl);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json(
      { error: "Failed to start Stripe onboarding" },
      { status: 500 }
    );
  }
}
