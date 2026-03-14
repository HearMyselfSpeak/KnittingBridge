export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { RefineInput } from "@/lib/validation";
import { buildRefinementPrompt, generatePreview } from "@/lib/ai/preview-generator";
import { getPublicUrl } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();
    const cookieStore = await cookies();

    const body: unknown = await req.json();
    const parsed = RefineInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { sessionId, instruction, baselineImageUrl } = parsed.data;

    // Load and authorize
    const colorSession = await prisma.colorPreviewSession.findUnique({
      where: { id: sessionId },
      include: {
        previews: { orderBy: { generatedAt: "desc" }, take: 1 },
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

    const lastPreview = colorSession.previews[0];
    if (!lastPreview) {
      return NextResponse.json(
        { error: "No preview to refine. Generate a preview first." },
        { status: 400 }
      );
    }

    // One-at-a-time: block if already generating
    if (colorSession.status === "GENERATING_PREVIEW") {
      return NextResponse.json(
        { error: "A preview is already being generated." },
        { status: 409 }
      );
    }

    // Resolve the original garment image for the edit reference
    const garmentAsset = colorSession.uploadedAssets.find(
      (a) => a.kind === "GARMENT_SCREENSHOT" || a.kind === "GARMENT_CLOSEUP"
    );
    if (!garmentAsset) {
      return NextResponse.json({ error: "No garment image found" }, { status: 400 });
    }
    const garmentImageUrl = getPublicUrl(garmentAsset.storageKey);
    const resolvedImageUrl = baselineImageUrl ?? garmentImageUrl;

    console.log("[refine] baselineImageUrl received:", baselineImageUrl);
    console.log("[refine] resolvedImageUrl:", resolvedImageUrl);

    // Use the selected baseline tile's prompt so the refinement applies to
    // that tile's color scheme, not the most recently generated tile's.
    let baselinePrompt = lastPreview.prompt;
    if (baselineImageUrl) {
      const matchedPreview = await prisma.colorPreview.findFirst({
        where: { colorSessionId: sessionId, imageUrl: baselineImageUrl },
        select: { prompt: true },
      });
      if (matchedPreview) {
        baselinePrompt = matchedPreview.prompt;
        console.log("[refine] matched baseline preview prompt");
      } else {
        console.log("[refine] baselineImageUrl not found in previews (original garment?), using last preview prompt");
      }
    }

    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "GENERATING_PREVIEW" },
    });

    const refinedPrompt = buildRefinementPrompt(baselinePrompt, instruction);
    const imageUrl = await generatePreview(refinedPrompt, resolvedImageUrl, sessionId);

    const preview = await prisma.colorPreview.create({
      data: {
        colorSessionId: sessionId,
        prompt: refinedPrompt,
        imageUrl,
        modelUsed: process.env.OPENROUTER_IMAGE_MODEL ?? "openai/gpt-image-1.5",
        refinementOf: lastPreview.id,
      },
    });

    await prisma.colorPreviewSession.update({
      where: { id: sessionId },
      data: { status: "PREVIEW_READY" },
    });

    return NextResponse.json({ previewId: preview.id, imageUrl });
  } catch (error) {
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json().catch(() => ({}));
    if (typeof body === "object" && body !== null && "sessionId" in body) {
      await prisma.colorPreviewSession
        .update({ where: { id: body.sessionId as string }, data: { status: "FAILED" } })
        .catch(() => {});
    }
    console.error("[color-preview/refine]", error);
    return NextResponse.json({ error: "Refinement failed" }, { status: 500 });
  }
}
