import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ActivationFlow from "./ActivationFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Activate Your Guide Account -- KnittingBridge",
};

export default async function GuideActivatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { prisma } = await import("@/lib/prisma");

  const profile = await prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      status: true,
      icAgreementAccepted: true,
      stripeAccountId: true,
      stripeOnboarded: true,
      timezone: true,
      availableDays: true,
      timeBlocks: true,
      activationComplete: true,
    },
  });

  if (!profile || profile.status !== "APPROVED") {
    redirect("/");
  }

  if (profile.activationComplete) {
    redirect("/dashboard/guide");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-xs text-muted-foreground mb-2">Guide Setup</p>
        <h1
          className="text-3xl font-semibold text-primary mb-2"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Activate Your Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete these steps to start receiving session requests.
        </p>
      </div>

      <ActivationFlow
        initialState={{
          icAgreementAccepted: profile.icAgreementAccepted,
          hasStripeAccount: profile.stripeAccountId != null,
          stripeOnboarded: profile.stripeOnboarded,
          timezone: profile.timezone,
          availableDays: profile.availableDays as string[] | null,
          timeBlocks: profile.timeBlocks as Record<string, number[]> | null,
          activationComplete: profile.activationComplete,
        }}
      />
    </div>
  );
}
