// Session page — server component.
// Auth required. Verifies caller is the Maker or matched Guide.
// Generates Daily.co meeting token and renders SessionRoom.

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { generateMeetingToken } from "@/lib/daily";
import SessionRoom from "./SessionRoom";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { prisma } = await import("@/lib/prisma");

  const helpSession = await prisma.helpSession.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      videoRoomName: true,
      videoRoomUrl: true,
      makerJoinedAt: true,
      guideJoinedAt: true,
      request: {
        select: {
          userId: true,
          recommendedSession: true,
          sophisticationScore: true,
          triageSummary: true,
          imageUrls: true,
          title: true,
        },
      },
      guideProfile: {
        select: { userId: true },
      },
    },
  });

  if (!helpSession) redirect("/");

  const userId = session.user.id;
  const isMaker = helpSession.request.userId === userId;
  const isGuide = helpSession.guideProfile.userId === userId;
  if (!isMaker && !isGuide) redirect("/");

  // Redirect completed/cancelled sessions to post-session page
  const terminalStatuses = ["COMPLETED", "CANCELLED", "REFUNDED", "DISPUTED"];
  if (terminalStatuses.includes(helpSession.status)) {
    redirect(`/session/${id}/complete`);
  }

  if (!helpSession.videoRoomName) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Session room is being prepared. Please refresh in a moment.
        </p>
      </div>
    );
  }

  const role = isMaker ? "maker" : "guide";
  const participantName = session.user.name ?? (isMaker ? "Maker" : "Guide");
  const sessionMinutes =
    helpSession.request.recommendedSession === "15" ? 15 : 45;

  // Token valid for session length + 11 min (matches room expiry)
  const token = await generateMeetingToken(
    helpSession.videoRoomName,
    participantName,
    (sessionMinutes + 11) * 60,
  );

  return (
    <SessionRoom
      helpSessionId={helpSession.id}
      roomUrl={helpSession.videoRoomUrl ?? ""}
      token={token}
      role={role}
      sessionMinutes={sessionMinutes}
      participantName={participantName}
      triageSummary={role === "guide" ? helpSession.request.triageSummary : null}
      imageUrls={role === "guide" ? helpSession.request.imageUrls : []}
      requestTitle={helpSession.request.title}
    />
  );
}
