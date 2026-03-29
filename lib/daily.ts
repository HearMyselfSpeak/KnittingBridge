// Daily.co REST API integration.
// Room creation, meeting tokens, and transcript retrieval.
// DAILY_API_KEY must be set in environment.

const API_BASE = "https://api.daily.co/v1";

function headers(): Record<string, string> {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw new Error("DAILY_API_KEY not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

function domainUrl(): string {
  return process.env.NEXT_PUBLIC_DAILY_URL ?? "https://knittingbridge.daily.co";
}

interface RoomResult {
  roomName: string;
  roomUrl: string;
}

/**
 * Create a Daily.co room for a live session.
 * Room auto-closes after 10 min empty. Hard wall at sessionMinutes + 11 min.
 */
export async function createSessionRoom(
  helpSessionId: string,
  sessionMinutes: number,
): Promise<RoomResult> {
  // Daily.co room names: max 41 chars, alphanumeric + hyphens
  const roomName = `kb-${helpSessionId}`.slice(0, 41);
  const expSeconds =
    Math.floor(Date.now() / 1000) + (sessionMinutes + 11) * 60;

  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: roomName,
      properties: {
        max_participants: 2,
        enable_transcription: true,
        auto_close_after: 600,
        exp: expSeconds,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Daily.co room creation failed ${res.status}: ${body}`);
  }

  return {
    roomName,
    roomUrl: `${domainUrl()}/${roomName}`,
  };
}

/**
 * Generate a participant-specific meeting token.
 * Called on demand when participants load the session page.
 */
export async function generateMeetingToken(
  roomName: string,
  participantName: string,
  expirySeconds: number,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expirySeconds;

  const res = await fetch(`${API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: participantName,
        exp,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Daily.co token generation failed ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("No token in Daily.co response");
  return data.token;
}

/**
 * Retrieve transcript for a room. Polls with retry since transcripts
 * may not be available immediately after room closes.
 * Returns transcript text or null if unavailable after retries.
 */
export async function getTranscript(
  roomName: string,
  maxAttempts = 3,
  delayMs = 30_000,
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }

    try {
      const res = await fetch(
        `${API_BASE}/transcript?roomName=${encodeURIComponent(roomName)}`,
        { headers: headers() },
      );

      if (res.status === 404) continue;
      if (!res.ok) continue;

      const data = (await res.json()) as { transcript?: string };
      if (data.transcript) return data.transcript;
    } catch (err) {
      console.warn(`[daily] Transcript attempt ${attempt + 1} failed:`, err);
    }
  }

  console.warn(`[daily] Transcript unavailable for room ${roomName}`);
  return null;
}
