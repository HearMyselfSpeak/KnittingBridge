// Transcript retrieval and processing.
// Fetches Daily.co transcript, generates AI notes and bypass screening.
// Sends post-session emails after processing.

import { z } from "zod";

const NotesSchema = z.object({
  notes: z.string().min(1),
});

const BypassSchema = z.object({
  flagged: z.boolean(),
  party: z.enum(["MAKER", "GUIDE", "BOTH"]).nullable(),
  evidence: z.string().nullable(),
});

function parseJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

/**
 * Orchestrate transcript processing for a completed session.
 * Runs notes generation and bypass screening in parallel.
 */
export async function processTranscript(helpSessionId: string): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  const helpSession = await prisma.helpSession.findUnique({
    where: { id: helpSessionId },
    select: {
      id: true,
      videoRoomName: true,
      guideProfileId: true,
      request: {
        select: {
          sophisticationScore: true,
          recommendedSession: true,
          userId: true,
          user: { select: { email: true, name: true } },
        },
      },
      guideProfile: {
        select: { user: { select: { email: true, name: true } } },
      },
      amount: true,
      guideEarnings: true,
    },
  });

  if (!helpSession?.videoRoomName) {
    console.warn("[transcript] No room name for session", helpSessionId);
    await sendEmailsWithoutNotes(helpSession, helpSessionId);
    return;
  }

  // Fetch transcript from Daily.co
  const { getTranscript } = await import("@/lib/daily");
  const transcriptText = await getTranscript(helpSession.videoRoomName);

  if (!transcriptText) {
    console.warn("[transcript] Transcript unavailable, sending emails without notes");
    await sendEmailsWithoutNotes(helpSession, helpSessionId);
    return;
  }

  // Run notes generation and bypass screening in parallel
  const score = helpSession.request.sophisticationScore ?? 3;
  const [makerNotes, guideNotes, bypassResult] = await Promise.all([
    generateMakerNotes(transcriptText, score),
    generateGuideNotes(transcriptText),
    screenForBypass(transcriptText),
  ]);

  // Store results
  await prisma.helpSession.update({
    where: { id: helpSessionId },
    data: {
      transcript: { text: transcriptText },
      makerNotes,
      guideNotes,
      transcriptProcessedAt: new Date(),
    },
  });

  // Create bypass flag if detected
  if (bypassResult?.flagged && bypassResult.party && bypassResult.evidence) {
    await prisma.bypassFlag.create({
      data: {
        helpSessionId,
        flaggedParty: bypassResult.party,
        reason: bypassResult.evidence,
      },
    });
  }

  // Send post-session emails with notes
  await sendSessionEmails(helpSession, helpSessionId, makerNotes, guideNotes);
}

async function generateMakerNotes(
  transcript: string,
  sophisticationScore: number,
): Promise<string | null> {
  try {
    const { chatCompletion } = await import("@/lib/openrouter");
    const { buildMakerNotesPrompt } = await import(
      "@/lib/ai/prompts/session-notes-prompt-v1"
    );
    const model = process.env.TRIAGE_MODEL ?? process.env.OPENROUTER_MODEL;
    const raw = await chatCompletion({
      model,
      messages: [
        { role: "system", content: buildMakerNotesPrompt(sophisticationScore) },
        { role: "user", content: `Session transcript:\n\n${transcript}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });
    const parsed = NotesSchema.parse(parseJson(raw));
    return parsed.notes;
  } catch (err) {
    console.error("[transcript] Maker notes generation failed:", err);
    return null;
  }
}

async function generateGuideNotes(transcript: string): Promise<string | null> {
  try {
    const { chatCompletion } = await import("@/lib/openrouter");
    const { buildGuideNotesPrompt } = await import(
      "@/lib/ai/prompts/session-notes-prompt-v1"
    );
    const model = process.env.TRIAGE_MODEL ?? process.env.OPENROUTER_MODEL;
    const raw = await chatCompletion({
      model,
      messages: [
        { role: "system", content: buildGuideNotesPrompt() },
        { role: "user", content: `Session transcript:\n\n${transcript}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });
    const parsed = NotesSchema.parse(parseJson(raw));
    return parsed.notes;
  } catch (err) {
    console.error("[transcript] Guide notes generation failed:", err);
    return null;
  }
}

async function screenForBypass(
  transcript: string,
): Promise<z.infer<typeof BypassSchema> | null> {
  try {
    const { chatCompletion } = await import("@/lib/openrouter");
    const { BYPASS_SCREEN_PROMPT } = await import(
      "@/lib/ai/prompts/bypass-screen-prompt-v1"
    );
    const model = process.env.TRIAGE_MODEL ?? process.env.OPENROUTER_MODEL;
    const raw = await chatCompletion({
      model,
      messages: [
        { role: "system", content: BYPASS_SCREEN_PROMPT },
        { role: "user", content: `Session transcript:\n\n${transcript}` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
    });
    return BypassSchema.parse(parseJson(raw));
  } catch (err) {
    console.error("[transcript] Bypass screening failed:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendSessionEmails(
  hs: any,
  helpSessionId: string,
  makerNotes: string | null,
  guideNotes: string | null,
): Promise<void> {
  try {
    const { sendMakerSessionEmail, sendGuideSessionEmail } = await import(
      "@/lib/emails-session"
    );
    const base = process.env.NEXTAUTH_URL ?? "https://knittingbridge.vercel.app";
    const sessionLabel =
      hs.request.recommendedSession === "15"
        ? "Quick Look (15 min)"
        : "Deep Dive (45 min)";

    await Promise.allSettled([
      sendMakerSessionEmail({
        email: hs.request.user.email,
        makerName: hs.request.user.name ?? "there",
        sessionLabel,
        amountFormatted: `$${(hs.amount / 100).toFixed(2)}`,
        notes: makerNotes,
        rateUrl: `${base}/session/${helpSessionId}/complete`,
        tipUrl: `${base}/session/${helpSessionId}/complete`,
      }),
      sendGuideSessionEmail({
        email: hs.guideProfile.user.email,
        guideName: hs.guideProfile.user.name ?? "Guide",
        sessionLabel,
        takeHomeFormatted: `$${(hs.guideEarnings / 100).toFixed(2)}`,
        notes: guideNotes,
        rateUrl: `${base}/session/${helpSessionId}/complete`,
      }),
    ]);
  } catch (err) {
    console.error("[transcript] Email send failed:", err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendEmailsWithoutNotes(
  hs: any,
  helpSessionId: string,
): Promise<void> {
  if (!hs) return;
  await sendSessionEmails(hs, helpSessionId, null, null);
}
