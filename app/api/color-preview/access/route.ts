// GET /api/color-preview/access
// Returns current tier, remaining recolors, and gating status.

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const session = await auth();
  const cookieStore = await cookies();
  const cpCookieId = cookieStore.get("kb_cp_id")?.value;

  if (!cpCookieId) {
    return NextResponse.json({
      allowed: true,
      tier: "anonymous",
      remaining: 3,
    });
  }

  const { checkRecolorAccess } = await import("@/lib/color-previews-gate");
  const access = await checkRecolorAccess(cpCookieId, session?.user?.id);

  return NextResponse.json(access);
}
