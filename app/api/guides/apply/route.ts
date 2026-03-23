export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { uploadFileToBucket, getPublicUrlFromBucket } from "@/lib/storage";

const BUCKET = "guide-applications";
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

const ApplySchema = z.object({
  fullName:          z.string().min(1).max(100),
  email:             z.string().email(),
  location:          z.string().min(1).max(100),
  timezone:          z.string().min(1),
  areas:             z.array(z.string()).min(1),
  yearsKnitting:     z.number().int().min(0).max(80),
  projectTypes:      z.string().min(10).max(200),
  helpContext:       z.array(z.string()).min(1),
  imageCount:        z.number().int().min(1).max(3),
  scenarioOne:       z.string().min(50).max(500),
  scenarioTwo:       z.string().min(50).max(500),
  scenarioThree:     z.string().min(50).max(500),
  availabilityType:  z.enum(["async", "both"]),
  weeklyHours:       z.enum(["5–10", "10–15", "15–20", "20+"]).optional(),
});

const AREA_IDS = [
  "garments", "fitSizing", "socks", "lace", "colorwork",
  "cables", "patternMod", "yarnSub", "repair", "machine",
] as const;

async function normalizeImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  if (mimeType === "image/avif") {
    const sharp = (await import("sharp")).default;
    const converted = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
    return { buffer: converted, mimeType: "image/jpeg", ext: "jpg" };
  }
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  return { buffer, mimeType, ext };
}

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const fd = await req.formData();

    const payloadRaw = fd.get("payload");
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const parsed = ApplySchema.safeParse(JSON.parse(payloadRaw));
    if (!parsed.success) {
      console.error("[guides/apply] schema validation failed", parsed.error.issues);
      return NextResponse.json(
        { error: "Some fields could not be saved", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const p = parsed.data;

    // Upload sample images
    const sampleUrls: string[] = [];
    const sampleCaptions: string[] = [];
    for (let i = 0; i < p.imageCount; i++) {
      const file = fd.get(`image_${i}`) as File | null;
      const caption = (fd.get(`caption_${i}`) as string | null) ?? "";
      if (!file) return NextResponse.json({ error: `Missing image_${i}` }, { status: 400 });
      if (!ALLOWED_MIME.includes(file.type)) {
        return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Image over 5 MB" }, { status: 400 });
      }
      const raw = Buffer.from(await file.arrayBuffer());
      const { buffer, mimeType, ext } = await normalizeImage(raw, file.type);
      const key = `applications/${randomUUID()}.${ext}`;
      await uploadFileToBucket(BUCKET, key, buffer, mimeType);
      sampleUrls.push(getPublicUrlFromBucket(BUCKET, key));
      sampleCaptions.push(caption);
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where:  { email: p.email },
      update: { name: p.fullName, role: "GUIDE" },
      create: { email: p.email, name: p.fullName, role: "GUIDE" },
    });

    // Build area flags
    const areaFlags = Object.fromEntries(AREA_IDS.map((id) => [id, p.areas.includes(id)]));

    // Parse weeklyHours to int (take lower bound)
    const weeklyHoursInt =
      p.availabilityType === "both" && p.weeklyHours
        ? parseInt(p.weeklyHours.split("–")[0], 10)
        : null;

    const profileData = {
      ...areaFlags,
      yearsExperience: p.yearsKnitting,
      location: p.location,
      timezone: p.timezone,
      asyncOnly: p.availabilityType === "async",
      weeklyHours: weeklyHoursInt,
      sampleUrls,
      scenarioResponses: {
        q1: p.scenarioOne, q2: p.scenarioTwo, q3: p.scenarioThree,
        projectTypes: p.projectTypes, helpContext: p.helpContext, sampleCaptions,
      },
      status: "PENDING" as const,
    };

    const profile = await prisma.guideProfile.upsert({
      where:  { userId: user.id },
      update: profileData,
      create: { userId: user.id, ...profileData },
    });

    return NextResponse.json({ profileId: profile.id, status: "PENDING" });
  } catch (error) {
    console.error("[guides/apply]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Submission failed: ${message}` }, { status: 500 });
  }
}
