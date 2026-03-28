// Transactional email helpers via Resend.
// Lazy-loaded, safe to call even when RESEND_API_KEY is unset (logs and returns).

const FROM = "KnittingBridge <no-reply@knittingbridge.com>";

function getFrom(): string {
  return process.env.EMAIL_FROM ?? FROM;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[emails] RESEND_API_KEY not set, skipping email to", to);
    return;
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    await resend.emails.send({ from: getFrom(), to, subject, html });
  } catch (err) {
    console.error("[emails] Failed to send email:", err);
  }
}

// ─── Session confirmation: Maker ──────────────────────────────────────────

interface MakerConfirmOpts {
  email: string;
  sessionLabel: string;
  amountFormatted: string;
  cardLast4?: string;
}

export async function sendMakerConfirmation(opts: MakerConfirmOpts) {
  const cardLine = opts.cardLast4
    ? `<p>Card ending in ${opts.cardLast4} was charged ${opts.amountFormatted}.</p>`
    : `<p>Your card was charged ${opts.amountFormatted}.</p>`;

  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>Your KnittingBridge session is confirmed</h2>
  <p>Great news! A Guide has accepted your request.</p>
  <p><strong>Session type:</strong> ${opts.sessionLabel}</p>
  ${cardLine}
  <p>We will be in touch with details about your upcoming session. If you have any questions, reply to this email.</p>
  <p>Happy knitting,<br/>The KnittingBridge Team</p>
</div>`;

  await send(opts.email, "Your KnittingBridge session is confirmed", html);
}

// ─── Session confirmation: Guide ──────────────────────────────────────────

interface GuideConfirmOpts {
  email: string;
  sessionLabel: string;
  takeHomeFormatted: string;
  triageSummary: string;
  requestUrl: string;
}

export async function sendGuideConfirmation(opts: GuideConfirmOpts) {
  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>You have a session</h2>
  <p>You accepted a request. Here are the details:</p>
  <p><strong>Session type:</strong> ${opts.sessionLabel}</p>
  <p><strong>Your take-home:</strong> ${opts.takeHomeFormatted}</p>
  <p><strong>Summary:</strong> ${opts.triageSummary}</p>
  <p><a href="${opts.requestUrl}">View session details</a></p>
  <p>Thank you for guiding on KnittingBridge.</p>
</div>`;

  await send(opts.email, "You have a session", html);
}
