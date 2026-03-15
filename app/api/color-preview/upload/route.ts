export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { UploadAssetInput } from "@/lib/validation";
import { uploadFile, makeStorageKey, getPublicUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// AVIF is not supported by Supabase Storage public serving or the OpenRouter vision
// model — convert it to PNG server-side before upload and analysis.
async function normalizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  if (mimeType === "image/avif") {
    try {
      const sharp = (await import("sharp")).default;
      const converted = await sharp(buffer).png().toBuffer();
      return { buffer: converted, mimeType: "image/png", ext: "png" };
    } catch (err) {
      console.error("[normalizeImage] sharp AVIF conversion failed:", err);
      throw new Error(
        `AVIF conversion failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  const ext =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/webp"
        ? "webp"
        : "jpg";
  return { buffer, mimeType, ext };
}

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
        { error: "Only JPEG, PNG, WebP, and AVIF images are accepted" },
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

    // Normalize image — AVIF is converted to PNG for storage and vision compatibility
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const { buffer, mimeType: normalizedMime, ext } = await normalizeImage(rawBuffer, file.type);

    // Upload to storage
    const assetId = randomUUID();
    const storageKey = makeStorageKey(parsed.data.sessionId, assetId, ext);
    await uploadFile(storageKey, buffer, normalizedMime);

    // Create asset record
    const asset = await prisma.uploadedAsset.create({
      data: {
        id: assetId,
        colorSessionId: parsed.data.sessionId,
        kind: parsed.data.kind,
        mimeType: normalizedMime,
        storageKey,
        fileSize: buffer.length,
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
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
