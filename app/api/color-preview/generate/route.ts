export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { GenerateInput } from "@/lib/validation";
import { checkReadiness } from "@/lib/ai/readiness-gate";
import { buildPreviewPrompt, generatePreview } from "@/lib/ai/preview-generator";
import { getPublicUrl } from "@/lib/storage";
import type { PaletteAssignmentInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();
    const cookieStore = await cookies();

    const body: unknown = await req.json();
    const parsed = GenerateInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { sessionId } = parsed.data;

    // Load and authorize
    const colorSession = await prisma.colorPreviewSession.findUnique({
      where: { id: sessionId },
      include: {
        garmentAnalysis: true,
        paletteAssignments: true,
        uploadedAssets: { orderBy: { createdAt: "asc" } },
      },
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
      return NextResponse.json({ error: "No analysis found" }, { status: 400 });
    }

    // Tier gate: check before spending $0.19 on AI
    const cpCookieId = cookieStore.get("kb_cp_id")?.value;
    if (cpCookieId) {
      const { checkRecolorAccess } = await import("@/lib/color-previews-gate");
      const access = await checkRecolorAccess(cpCookieId, session?.user?.id, sessionId);
      if (!access.allowed) {
        return NextResponse.json(
          { error: "limit_reached", tier: access.tier, remaining: access.remaining, daysUntilReset: access.daysUntilReset },
          { status: 403 },
        );
      }
    }

    // Resolve the original garment image URL for the edit reference
    const garmentAsset = colorSession.uploadedAssets.find(
      (a) => a.kind === "GARMENT_SCREENSHOT" || a.kind === "GARMENT_CLOSEUP"
    );
    if (!garmentAsset) {
      return NextResponse.json({ error: "No garment image found" }, { status: 400 });
    }
    const garmentImageUrl = getPublicUrl(garmentAsset.storageKey);

    const analysis = colorSession.garmentAnalysis.rawAnalysisJson as Parameters<
      typeof checkReadiness
    >[0]["analysis"];

    const assignments: PaletteAssignmentInput[] = colorSession.paletteAssignments.map(
      (a) => ({
        regionId: a.regionId,
        regionLabel: a.regionLabel,
        targetColorDescription: a.targetColorDescription,
        source: a.source as PaletteAssignmentInput["source"],
        sourceAssetId: a.sourceAssetId ?? undefined,
      })
    );

    // Enforce one-at-a-time server-side
    const readiness = checkReadiness({
      analysis,
      assignments,
      activeGenerationInProgress: colorSession.status === "GENERATING_PREVIEW",
    });
    if (!readiness.ready) {
      return NextResponse.json({ error: readiness.missingConditions[0] }, { status: 400 });
    }

    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "GENERATING_PREVIEW" },
    });

    const prompt = buildPreviewPrompt(analysis, assignments);
    const imageUrl = await generatePreview(prompt, garmentImageUrl, sessionId);

    const preview = await prisma.colorPreview.create({
      data: {
        colorSessionId: sessionId,
        prompt,
        imageUrl,
        modelUsed: process.env.OPENROUTER_IMAGE_MODEL ?? "openai/gpt-image-1.5",
      },
    });

    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "PREVIEW_READY" },
    });

    // Record usage after successful generation
    if (cpCookieId) {
      const { recordRecolorUsage } = await import("@/lib/color-previews-gate");
      await recordRecolorUsage(cpCookieId, sessionId, session?.user?.id);
    }

    // Return updated access info for client counter
    let accessInfo = null;
    if (cpCookieId) {
      const { checkRecolorAccess } = await import("@/lib/color-previews-gate");
      accessInfo = await checkRecolorAccess(cpCookieId, session?.user?.id, sessionId);
    }

    return NextResponse.json({ previewId: preview.id, imageUrl, access: accessInfo });
  } catch (error) {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json().catch(() => ({}));
    if (typeof body === "object" && body !== null && "sessionId" in body) {
      await prisma.colorPreviewSession
        .update({ where: { id: body.sessionId as string }, data: { status: "FAILED" } })
        .catch(() => {});
    }
    console.error("[color-preview/generate]", error);
    return NextResponse.json({ error: "Preview generation failed" }, { status: 500 });
  }
}
