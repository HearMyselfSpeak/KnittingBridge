import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const intentSchema = z.object({
  sessionType: z.enum(["15", "45"]),
});

const PRICES: Record<string, number> = {
  "15": 3000, // $30
  "45": 6000, // $60
};

export async function POST(request: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = intentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid session type" },
      { status: 400 },
    );
  }

  const amountCents = PRICES[result.data.sessionType]!;
  const { createPreAuthIntent } = await import("@/lib/stripe");

  const intent = await createPreAuthIntent(amountCents, "usd", {
    userId: session.user.id,
    sessionType: result.data.sessionType,
  });

  return NextResponse.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  });
}
