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

    // Send confirmation email -- non-blocking, never fails the submission
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.EMAIL_FROM ?? "KnittingBridge <no-reply@knittingbridge.com>";
        const firstName = p.fullName.split(" ")[0];
        await resend.emails.send({
          from,
          to: p.email,
          subject: "We received your Guide application",
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Georgia,serif;color:#1B2A4A">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px">
        <tr><td style="padding-bottom:24px;border-bottom:1px solid #e8e3dc">
          <span style="font-size:18px;font-weight:bold;letter-spacing:-0.3px">KnittingBridge</span>
        </td></tr>
        <tr><td style="padding-top:32px;padding-bottom:24px">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Hi ${firstName},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6">We received your application to become a KnittingBridge Guide. Thank you for taking the time to share your experience with us.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Our team will review your application and get back to you within 24 hours.</p>
          <p style="margin:0;font-size:16px;line-height:1.6">The KnittingBridge Team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
      } catch (emailErr) {
        console.error("[guides/apply] confirmation email failed:", emailErr);
      }
    }

    return NextResponse.json({ profileId: profile.id, status: "PENDING" });
  } catch (error) {
    console.error("[guides/apply]", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Submission failed: ${message}` }, { status: 500 });
  }
}
