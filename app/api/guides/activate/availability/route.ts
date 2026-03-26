import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const VALID_BLOCKS = ["morning", "afternoon", "evening"] as const;

const VALID_MINUTES = [20, 30, 45, 60] as const;

const availabilitySchema = z.object({
  availableDays: z
    .array(z.enum(VALID_DAYS, { error: "Invalid day selected" }), {
      error: "Please select at least one day",
    })
    .min(1, "Please select at least one day"),
  timeBlocks: z.record(
    z.string(),
    z.array(z.enum(VALID_BLOCKS, { error: "Invalid time block" }))
  ),
  maxSessionMinutes: z.enum(
    VALID_MINUTES.map(String) as [string, ...string[]],
    { error: "Please select a valid session length" }
  ).transform(Number),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = availabilitySchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { availableDays, timeBlocks, maxSessionMinutes } = parsed.data;

    // Validate that at least one selected day has a time block.
    const hasBlock = availableDays.some(
      (d) => (timeBlocks[d] ?? []).length > 0
    );
    if (!hasBlock) {
      return NextResponse.json(
        { error: "Please select at least one time block for your available days" },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    });

    if (!profile || profile.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Guide profile not approved" },
        { status: 403 }
      );
    }

    await prisma.guideProfile.update({
      where: { id: profile.id },
      data: {
        availableDays: availableDays,
        timeBlocks: timeBlocks,
        maxSessionMinutes: maxSessionMinutes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability save error:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
