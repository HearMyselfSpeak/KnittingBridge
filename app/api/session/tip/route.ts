// POST: Create a tip from Maker to Guide.
// 100% goes to Guide's Connect account (no platform fee).
// Tip cap: $50 (5000 cents). Minimum: $5 (500 cents).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TipSchema = z.object({
  helpSessionId: z.string().min(1),
  guideProfileId: z.string().min(1),
  amountCents: z.number().int().min(500).max(5000),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { helpSessionId, guideProfileId, amountCents } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    // Verify caller is the Maker for this session
    const helpSession = await prisma.helpSession.findUnique({
      where: { id: helpSessionId },
      select: {
        id: true,
        status: true,
        request: { select: { userId: true } },
      },
    });

    if (!helpSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (helpSession.request.userId !== session.user.id) {
      return NextResponse.json({ error: "Only the Maker can tip" }, { status: 403 });
    }

    if (helpSession.status !== "COMPLETED") {
      return NextResponse.json({ error: "Session not completed" }, { status: 400 });
    }

    // Check for existing tip
    const existingTip = await prisma.tip.findFirst({
      where: { helpSessionId, makerId: session.user.id },
    });
    if (existingTip) {
      return NextResponse.json(
        { error: "Tip already submitted for this session" },
        { status: 409 },
      );
    }

    // Get Guide's Stripe account
    const guide = await prisma.guideProfile.findUnique({
      where: { id: guideProfileId },
      select: { stripeAccountId: true },
    });

    if (!guide?.stripeAccountId) {
      return NextResponse.json(
        { error: "Guide payment account not configured" },
        { status: 400 },
      );
    }

    // Create Stripe PaymentIntent for tip (100% to Guide, no platform fee)
    const { stripe } = await import("@/lib/stripe");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      transfer_data: {
        destination: guide.stripeAccountId,
      },
      metadata: {
        type: "tip",
        helpSessionId,
        makerId: session.user.id,
        guideProfileId,
      },
    });

    // Create Tip record
    const tip = await prisma.tip.create({
      data: {
        helpSessionId,
        guideProfileId,
        makerId: session.user.id,
        amountCents,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      ok: true,
      tipId: tip.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Tip submit error:", err);
    return NextResponse.json(
      { error: "Failed to create tip" },
      { status: 500 },
    );
  }
}
