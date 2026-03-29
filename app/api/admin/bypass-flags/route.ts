// GET: List bypass flags. Admin-only. Paginated.

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10);
    const skip = (page - 1) * limit;

    const [flags, total] = await Promise.all([
      prisma.bypassFlag.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          helpSessionId: true,
          flaggedParty: true,
          reason: true,
          reviewedAt: true,
          reviewedBy: true,
          resolution: true,
          createdAt: true,
        },
      }),
      prisma.bypassFlag.count(),
    ]);

    return NextResponse.json({ flags, total, page, limit });
  } catch (err) {
    console.error("Bypass flags list error:", err);
    return NextResponse.json(
      { error: "Failed to list bypass flags" },
      { status: 500 },
    );
  }
}
