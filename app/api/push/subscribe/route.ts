// POST: Register a web push subscription for the authenticated user.
// Upserts by endpoint to avoid duplicates if the same browser re-subscribes.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  deviceLabel: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { endpoint, p256dh, auth: authKey, deviceLabel } = parsed.data;
    const { prisma } = await import("@/lib/prisma");

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
        deviceLabel: deviceLabel ?? null,
      },
      update: {
        userId: session.user.id,
        p256dh,
        auth: authKey,
        deviceLabel: deviceLabel ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Push subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to register subscription" },
      { status: 500 },
    );
  }
}
