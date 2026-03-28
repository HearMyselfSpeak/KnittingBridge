import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const triageSchema = z.object({
  input: z.string().min(1).max(5000),
  followUpAnswers: z.array(z.string()).max(4),
  sophisticationScore: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const result = triageSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid triage input" },
      { status: 400 },
    );
  }

  const { generateTriageResult } = await import("@/lib/ai/triage-v1");
  const triage = await generateTriageResult(
    result.data.input,
    result.data.followUpAnswers,
    result.data.sophisticationScore,
  );

  return NextResponse.json(triage);
}
