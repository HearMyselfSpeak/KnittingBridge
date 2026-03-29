// POST: Send a chat message via Pusher during a session.
// Messages are not persisted to DB (captured in Daily.co transcript).

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ChatSchema = z.object({
  helpSessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { helpSessionId, message } = parsed.data;
    const { pusher } = await import("@/lib/pusher");

    const senderName = session.user.name ?? "Participant";
    const now = new Date();

    await pusher.trigger(`session-${helpSessionId}`, "message", {
      id: `${session.user.id}-${now.getTime()}`,
      sender: senderName,
      text: message,
      timestamp: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Session chat error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
