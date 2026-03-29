// PATCH: Mark a bypass flag as reviewed. Admin-only.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ReviewSchema = z.object({
  resolution: z.string().max(2000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    const updated = await prisma.bypassFlag.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        resolution: parsed.success ? parsed.data.resolution : undefined,
      },
    });

    return NextResponse.json({ ok: true, flag: updated });
  } catch (err) {
    console.error("Bypass flag review error:", err);
    return NextResponse.json(
      { error: "Failed to review bypass flag" },
      { status: 500 },
    );
  }
}
