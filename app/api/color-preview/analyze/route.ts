export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { AnalyzeInput } from "@/lib/validation";
import { analyzeGarment } from "@/lib/ai/garment-analysis";
import { getPublicUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();
    const cookieStore = await cookies();

    const body: unknown = await req.json();
    const parsed = AnalyzeInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { sessionId } = parsed.data;

    // Load and authorize session
    const colorSession = await prisma.colorPreviewSession.findUnique({
      where: { id: sessionId },
      include: { uploadedAssets: true },
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

    // Get garment image assets
    const garmentAssets = colorSession.uploadedAssets.filter(
      (a) => a.kind === "GARMENT_SCREENSHOT" || a.kind === "GARMENT_CLOSEUP"
    );
    if (garmentAssets.length === 0) {
      return NextResponse.json(
        { error: "No garment images to analyze" },
        { status: 400 }
      );
    }

    // Mark as analyzing
    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "ANALYZING_GARMENT" },
    });

    const imageUrls = garmentAssets.map((a) => getPublicUrl(a.storageKey));
    const analysis = await analyzeGarment(imageUrls);

    // Persist analysis
    await prisma.garmentAnalysis.upsert({
      where: { colorSessionId: sessionId },
      create: {
        colorSessionId: sessionId,
        rawAnalysisJson: analysis,
        regions: analysis.regions,
        detectedColors: analysis.regions.map((r) => ({
          label: r.label,
          hex: r.hex,
          description: r.originalColorDescription,
        })),
        linkedRegions: analysis.linkedRegions,
        confidence:
          analysis.regions.reduce((s, r) => s + r.confidence, 0) /
          analysis.regions.length,
      },
      update: {
        rawAnalysisJson: analysis,
        regions: analysis.regions,
        detectedColors: analysis.regions.map((r) => ({
          label: r.label,
          hex: r.hex,
          description: r.originalColorDescription,
        })),
        linkedRegions: analysis.linkedRegions,
        confidence:
          analysis.regions.reduce((s, r) => s + r.confidence, 0) /
          analysis.regions.length,
      },
    });

    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "AWAITING_COLOR_DIRECTION" },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json().catch(() => ({}));
    if (typeof body === "object" && body !== null && "sessionId" in body) {
      await prisma.colorPreviewSession
        .update({
          where: { id: body.sessionId as string },
          data: { status: "FAILED" },
        })
        .catch(() => {});
    }
    console.error("[color-preview/analyze]", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
