export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(_req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();

    const colorSession = await prisma.colorPreviewSession.create({
      data: {
        userId: session?.user?.id ?? null,
        status: "AWAITING_GARMENT_UPLOAD",
      },
    });

    // Set cookie for anonymous session ownership
    const cookieStore = await cookies();
    if (!session?.user?.id) {
      cookieStore.set("cp-session-id", colorSession.id, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json({ sessionId: colorSession.id });
  } catch (error) {
    console.error("[color-preview/create]", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
