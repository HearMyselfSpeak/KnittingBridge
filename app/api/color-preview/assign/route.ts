export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { AssignPaletteInput } from "@/lib/validation";
import { checkReadiness } from "@/lib/ai/readiness-gate";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();
    const cookieStore = await cookies();

    const body: unknown = await req.json();
    const parsed = AssignPaletteInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { sessionId, assignments } = parsed.data;

    // Load and authorize
    const colorSession = await prisma.colorPreviewSession.findUnique({
      where: { id: sessionId },
      include: { garmentAnalysis: true },
    });
    if (!colorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const cookieSessionId = cookieStore.get("cp-session-id")?.value;
    const ownedByUser = session?.user?.id && colorSession.userId === session.user.id;
    const ownedByCookie = !colorSession.userId && cookieSessionId === colorSession.id;
    if (!ownedByUser && !ownedByCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!colorSession.garmentAnalysis) {
      return NextResponse.json(
        { error: "No analysis found. Analyze the garment first." },
        { status: 400 }
      );
    }

    // Upsert assignments
    for (const a of assignments) {
      await prisma.paletteAssignment.upsert({
        where: {
          id: `${sessionId}_${a.regionId}`,
        },
        create: {
          id: `${sessionId}_${a.regionId}`,
          colorSessionId: sessionId,
          regionId: a.regionId,
          regionLabel: a.regionLabel,
          targetColorDescription: a.targetColorDescription,
          source: a.source,
          sourceAssetId: a.sourceAssetId ?? null,
        },
        update: {
          regionLabel: a.regionLabel,
          targetColorDescription: a.targetColorDescription,
          source: a.source,
          sourceAssetId: a.sourceAssetId ?? null,
        },
      });
    }

    // Run readiness gate
    const analysis = colorSession.garmentAnalysis.rawAnalysisJson as Parameters<
      typeof checkReadiness
    >[0]["analysis"];
    const readiness = checkReadiness({
      analysis,
      assignments,
      activeGenerationInProgress:
        colorSession.status === "GENERATING_PREVIEW",
    });

    if (readiness.ready) {
      await prisma.colorPreviewSession.update({
        where: { id: sessionId },
        data: { status: "READY_FOR_PREVIEW" },
      });
    } else {
      await prisma.colorPreviewSession.update({
        where: { id: sessionId },
        data: { status: "AWAITING_REGION_MAPPING" },
      });
    }

    return NextResponse.json({ readiness });
  } catch (error) {
    console.error("[color-preview/assign]", error);
    return NextResponse.json({ error: "Failed to save assignments" }, { status: 500 });
  }
}
