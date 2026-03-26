import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

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

// Scheduled mode: days + hourly grid. Impulse mode: empty days, null blocks.
const availabilitySchema = z.object({
  timezone: z.string({ error: "Please select a timezone" }).min(1, "Please select a timezone"),
  availableDays: z.array(
    z.enum(VALID_DAYS, { error: "Invalid day selected" })
  ),
  timeBlocks: z
    .record(z.string(), z.array(z.number().int().min(0).max(23)))
    .nullable(),
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

    const { timezone, availableDays, timeBlocks } = parsed.data;

    // Scheduled mode: must have at least one hour selected.
    if (availableDays.length > 0) {
      const hasHour = availableDays.some(
        (d) => (timeBlocks?.[d] ?? []).length > 0
      );
      if (!hasHour) {
        return NextResponse.json(
          { error: "Please select at least one available hour" },
          { status: 400 }
        );
      }
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
        timezone,
        availableDays: availableDays,
        timeBlocks: timeBlocks ?? Prisma.DbNull,
        maxSessionMinutes: null,
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
