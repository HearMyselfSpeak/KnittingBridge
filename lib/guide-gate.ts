// Activation gate for Guide-facing routes.
// Redirects approved-but-not-activated Guides to /dashboard/guide/activate.
//
// Usage:
//   Option A (structural): Place pages inside app/dashboard/guide/(activated)/
//            The layout there calls this gate automatically.
//   Option B (manual): Call requireActivatedGuide() at the top of any
//            server component that requires a fully activated Guide.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Checks whether the current user is a Guide who still needs to complete
 * the activation flow. If so, redirects to /dashboard/guide/activate.
 *
 * Non-Guide users and fully activated Guides pass through unchanged.
 * Returns the session for downstream use.
 */
export async function requireActivatedGuide() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Only Guides need the activation check.
  if (session.user.role !== "GUIDE") {
    return session;
  }

  const profile = await prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    select: { activationComplete: true, status: true },
  });

  // Approved Guides who have not finished activation get redirected.
  if (profile?.status === "APPROVED" && !profile.activationComplete) {
    redirect("/dashboard/guide/activate");
  }

  return session;
}
