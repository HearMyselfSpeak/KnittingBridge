// Web Push Notification Service
// Sends push notifications to all of a user's subscribed devices.
// Cleans up stale subscriptions on 410 (Gone) responses.

import webpush from "web-push";

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL;

  if (!publicKey || !privateKey || !contact) {
    throw new Error(
      "Missing VAPID env vars: NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT_EMAIL",
    );
  }

  webpush.setVapidDetails(`mailto:${contact}`, publicKey, privateKey);
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  configureVapid();
  const { prisma } = await import("@/lib/prisma");

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  });

  if (subscriptions.length === 0) return { sent: 0, failed: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    data: { url: payload.url },
  });

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          await deleteStaleSubscription(sub.id);
        }
        failed++;
      }
    }),
  );

  // Count any unexpected rejections
  for (const r of results) {
    if (r.status === "rejected") failed++;
  }

  return { sent, failed };
}

export async function deleteStaleSubscription(
  subscriptionId: string,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  await prisma.pushSubscription.delete({
    where: { id: subscriptionId },
  });
}
