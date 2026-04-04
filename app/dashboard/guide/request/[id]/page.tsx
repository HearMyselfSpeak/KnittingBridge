// Guide request detail page. Shows AI triage summary, session info,
// take-home pay, countdown timer, and Accept/Decline buttons.

import { redirect } from "next/navigation";
import { requireActivatedGuide } from "@/lib/guide-gate";
import { getEffectiveFee } from "@/lib/fees";
import { getSessionPrice, SESSION_LABELS } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import RequestActions from "./RequestActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GuideRequestPage({ params }: Props) {
  const session = await requireActivatedGuide();
  const { id } = await params;

  const guide = await prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!guide) redirect("/dashboard/guide");

  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      triageSummary: true,
      recommendedSession: true,
    },
  });

  if (!request || request.status !== "SUBMITTED") {
    redirect("/dashboard/guide");
  }

  // Verify this Guide has a pending notification for this request
  const notification = await prisma.guideNotification.findFirst({
    where: {
      guideProfileId: guide.id,
      requestId: id,
      status: "PENDING",
    },
  });

  if (!notification) redirect("/dashboard/guide");

  const sessionType = request.recommendedSession ?? "15";
  const grossCents = getSessionPrice(sessionType);
  const fee = await getEffectiveFee(guide.id);
  const takeHomeCents = Math.round(grossCents * (1 - fee));
  const takeHome = `$${(takeHomeCents / 100).toFixed(2)}`;
  const label = SESSION_LABELS[sessionType] ?? sessionType;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-lora text-2xl font-semibold text-[#1B2A4A]">
        New Request
      </h1>

      <section className="mt-6 rounded-lg border border-[oklch(0.22_0.045_253/0.1)] bg-white p-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-[#1B2A4A]/60">
          Maker&apos;s Situation
        </h2>
        <p className="mt-2 text-[#1B2A4A]">
          {request.triageSummary ?? "No summary available."}
        </p>
      </section>

      <section className="mt-4 flex items-center justify-between rounded-lg border border-[oklch(0.22_0.045_253/0.1)] bg-white p-6">
        <div>
          <p className="text-sm text-[#1B2A4A]/60">Session</p>
          <p className="mt-1 font-medium text-[#1B2A4A]">{label}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#1B2A4A]/60">Your take-home</p>
          <p className="mt-1 text-xl font-semibold text-[#1B2A4A]">
            {takeHome}
          </p>
        </div>
      </section>

      <RequestActions requestId={request.id} />
    </main>
  );
}
