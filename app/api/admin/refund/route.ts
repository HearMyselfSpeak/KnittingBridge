// POST: Admin-only route to refund a captured Payment.
// Calls Stripe refunds.create(), updates Payment + HelpSession records.
// No UI -- will be wired to admin dashboard button in Phase 7.

import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RefundSchema = z.object({
  paymentId: z.string().min(1),
});

export async function POST(req: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin role check
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = RefundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed" },
      { status: 400 },
    );
  }

  const { processRefund } = await import("@/lib/refund");
  const result = await processRefund(parsed.data.paymentId);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Refund failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    stripeRefundId: result.stripeRefundId,
  });
}
