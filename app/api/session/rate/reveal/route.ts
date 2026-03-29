// GET: Check if blind reveal is ready (both parties have rated).
// Returns both scores if revealed, otherwise { revealed: false }.

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const helpSessionId = req.nextUrl.searchParams.get("helpSessionId");
    if (!helpSessionId) {
      return NextResponse.json({ error: "Missing helpSessionId" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");

    const ratings = await prisma.rating.findMany({
      where: { helpSessionId },
      select: { raterId: true, score: true, revealedAt: true },
    });

    if (ratings.length < 2 || ratings.some((r) => !r.revealedAt)) {
      return NextResponse.json({ revealed: false });
    }

    const mine = ratings.find((r) => r.raterId === session.user?.id);
    const theirs = ratings.find((r) => r.raterId !== session.user?.id);

    return NextResponse.json({
      revealed: true,
      yours: mine?.score ?? 0,
      theirs: theirs?.score ?? 0,
    });
  } catch (err) {
    console.error("Rating reveal error:", err);
    return NextResponse.json(
      { error: "Failed to check reveal" },
      { status: 500 },
    );
  }
}
