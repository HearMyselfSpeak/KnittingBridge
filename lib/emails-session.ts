// Post-session email templates via Resend.
// Follows the same pattern as lib/emails.ts.

const FROM = "KnittingBridge <no-reply@knittingbridge.com>";

function getFrom(): string {
  return process.env.EMAIL_FROM ?? FROM;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[emails-session] RESEND_API_KEY not set, skipping email to", to);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    await resend.emails.send({ from: getFrom(), to, subject, html });
  } catch (err) {
    console.error("[emails-session] Failed to send email:", err);
  }
}

// ─── Maker post-session email ───────────────────────────────────────────────

interface MakerSessionEmailOpts {
  email: string;
  makerName: string;
  sessionLabel: string;
  amountFormatted: string;
  notes: string | null;
  rateUrl: string;
  tipUrl: string;
}

export async function sendMakerSessionEmail(opts: MakerSessionEmailOpts) {
  const notesBlock = opts.notes
    ? `<h3 style="margin-top: 24px;">Your Session Notes</h3><p>${opts.notes.replace(/\n/g, "<br/>")}</p>`
    : `<p style="color: #666; margin-top: 24px;"><em>Your session notes are being prepared and will appear when you visit the session summary page.</em></p>`;

  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>Your session summary</h2>
  <p>Hi ${opts.makerName},</p>
  <p>Thank you for your KnittingBridge session. Here is your summary:</p>
  <p><strong>Session type:</strong> ${opts.sessionLabel}</p>
  <p><strong>Amount charged:</strong> ${opts.amountFormatted}</p>
  ${notesBlock}
  <p style="margin-top: 24px;">
    <a href="${opts.rateUrl}" style="display: inline-block; padding: 10px 20px; background: #1B2A4A; color: #fff; text-decoration: none; border-radius: 6px;">Rate your session</a>
  </p>
  <p style="margin-top: 16px;">
    Want to say thanks? <a href="${opts.tipUrl}">Leave a tip for your Guide.</a>
  </p>
  <p style="margin-top: 24px;">Happy knitting,<br/>The KnittingBridge Team</p>
</div>`;

  await send(opts.email, "Your session summary", html);
}

// ─── Guide post-session email ───────────────────────────────────────────────

interface GuideSessionEmailOpts {
  email: string;
  guideName: string;
  sessionLabel: string;
  takeHomeFormatted: string;
  notes: string | null;
  rateUrl: string;
}

export async function sendGuideSessionEmail(opts: GuideSessionEmailOpts) {
  const notesBlock = opts.notes
    ? `<h3 style="margin-top: 24px;">Session Notes</h3><p>${opts.notes.replace(/\n/g, "<br/>")}</p>`
    : `<p style="color: #666; margin-top: 24px;"><em>Session notes are being prepared.</em></p>`;

  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>Session summary and your earnings</h2>
  <p>Hi ${opts.guideName},</p>
  <p>Here is the summary from your completed session:</p>
  <p><strong>Session type:</strong> ${opts.sessionLabel}</p>
  <p><strong>Your take-home:</strong> ${opts.takeHomeFormatted}</p>
  ${notesBlock}
  <p style="margin-top: 24px;">
    <a href="${opts.rateUrl}" style="display: inline-block; padding: 10px 20px; background: #1B2A4A; color: #fff; text-decoration: none; border-radius: 6px;">Rate your Maker</a>
  </p>
  <p style="margin-top: 24px;">Thank you for guiding on KnittingBridge.</p>
</div>`;

  await send(opts.email, "Session summary and your earnings", html);
}
