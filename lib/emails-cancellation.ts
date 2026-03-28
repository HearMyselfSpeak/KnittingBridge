// Cancellation-related email helpers via Resend.
// Separated from lib/emails.ts to keep both under 200 lines.

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
    console.error("[emails] Failed to send cancellation email:", err);
  }
}

// ─── Maker cancellation email ──────────────────────────────────────────────

export async function sendMakerCancellationEmail(
  makerEmail: string,
  makerName: string,
  copy: string,
): Promise<void> {
  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>Your KnittingBridge session</h2>
  <p>Hi ${makerName || "there"},</p>
  <p>${copy}</p>
  <p>If you have any questions, reply to this email.</p>
  <p>The KnittingBridge Team</p>
</div>`;

  await send(makerEmail, "Your KnittingBridge session", html);
}

// ─── Guide cancellation email ──────────────────────────────────────────────

export async function sendGuideCancellationEmail(
  guideEmail: string,
  guideName: string,
  makerFirstName: string,
  sessionLabel: string,
): Promise<void> {
  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>A session has been cancelled</h2>
  <p>Hi ${guideName || "there"},</p>
  <p>${makerFirstName} cancelled their ${sessionLabel} session. No action is needed on your end.</p>
  <p>The KnittingBridge Team</p>
</div>`;

  await send(guideEmail, "A session has been cancelled", html);
}

// ─── Admin demerit alert ───────────────────────────────────────────────────

interface AdminAlertOpts {
  userId: string;
  role: string;
  totalWeight: number;
  threshold: number;
  windowDays: number;
}

export async function sendAdminDemeritAlert(
  opts: AdminAlertOpts,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@knittingbridge.com";

  const html = `
<div style="font-family: sans-serif; max-width: 520px;">
  <h2>Demerit threshold reached</h2>
  <p><strong>User ID:</strong> ${opts.userId}</p>
  <p><strong>Role:</strong> ${opts.role}</p>
  <p><strong>Total demerit weight:</strong> ${opts.totalWeight}</p>
  <p><strong>Threshold:</strong> ${opts.threshold} within ${opts.windowDays} days</p>
  <p>This account has been flagged for review.</p>
</div>`;

  await send(adminEmail, "Demerit threshold reached", html);
}
