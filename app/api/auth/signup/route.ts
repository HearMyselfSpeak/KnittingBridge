import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export async function POST(request: Request) {
  const { prisma } = await import("@/lib/prisma");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = signupSchema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { accounts: true },
  });

  if (existing) {
    // User exists with OAuth account -- direct them to use that provider
    const hasOAuth = existing.accounts.some(
      (a: { provider: string }) => a.provider === "google",
    );
    if (hasOAuth) {
      return NextResponse.json(
        {
          error: "An account with this email already exists. Please sign in with Google.",
          code: "OAUTH_ACCOUNT_EXISTS",
        },
        { status: 409 },
      );
    }

    // User exists with password or magic link -- generic message
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      hashedPassword,
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
