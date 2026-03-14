export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { UploadAssetInput } from "@/lib/validation";
import { uploadFile, makeStorageKey, getPublicUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const session = await auth();
    const cookieStore = await cookies();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string | null;
    const kind = formData.get("kind") as string | null;

    const parsed = UploadAssetInput.safeParse({ sessionId, kind });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are accepted" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File must be under 10 MB" },
        { status: 400 }
      );
    }

    // Verify session ownership
    const colorSession = await prisma.colorPreviewSession.findUnique({
      where: { id: parsed.data.sessionId },
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

    // Upload to storage
    const assetId = randomUUID();
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const storageKey = makeStorageKey(parsed.data.sessionId, assetId, ext);
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(storageKey, buffer, file.type);

    // Create asset record
    const asset = await prisma.uploadedAsset.create({
      data: {
        id: assetId,
        colorSessionId: parsed.data.sessionId,
        kind: parsed.data.kind,
        mimeType: file.type,
        storageKey,
        fileSize: file.size,
      },
    });

    const publicUrl = getPublicUrl(storageKey);

    // For yarn photos, extract a color description via vision model.
    // Silently skip if the analysis call fails — the upload is still valid.
    let colorDescription: string | undefined;
    if (parsed.data.kind === "YARN_PHOTO") {
      try {
        const { analyzeYarn } = await import("@/lib/ai/yarn-analysis");
        const yarnResult = await analyzeYarn(publicUrl);
        colorDescription =
          yarnResult.isVariegated && yarnResult.variationType !== "solid"
            ? `${yarnResult.dominantColor.description} (${yarnResult.variationType})`
            : yarnResult.dominantColor.description;
      } catch {
        // Analysis failed — caller falls back to manual description
      }
    }

    return NextResponse.json({ assetId: asset.id, publicUrl, colorDescription });
  } catch (error) {
    console.error("[color-preview/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
