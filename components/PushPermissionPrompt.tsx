"use client";

// Prompts Guides to enable web push notifications.
// If permission already granted, silently re-subscribes without UI.

import { useEffect, useState } from "react";

function getVapidKey(): Uint8Array | null {
  const raw = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!raw) return null;
  const padding = "=".repeat((4 - (raw.length % 4)) % 4);
  const base64 = (raw + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function registerAndSubscribe(): Promise<boolean> {
  const vapidKey = getVapidKey();
  if (!vapidKey) return false;

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKey.buffer as ArrayBuffer,
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }),
  });

  return res.ok;
}

export default function PushPermissionPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const permission = Notification.permission;

    if (permission === "granted") {
      // Already granted: silently re-subscribe
      registerAndSubscribe().catch(console.error);
      return;
    }

    if (permission === "default") {
      setShowPrompt(true);
    }
    // "denied" — do nothing, browser blocks further requests
  }, []);

  async function handleEnable() {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        await registerAndSubscribe();
      }
      setShowPrompt(false);
    } catch (err) {
      console.error("Push permission error:", err);
    } finally {
      setBusy(false);
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="rounded-lg border border-[oklch(0.22_0.045_253/0.15)] bg-[#FAF8F5] p-4">
      <p className="text-sm text-[#1B2A4A]">
        Get notified when a Maker needs your help
      </p>
      <button
        type="button"
        onClick={handleEnable}
        disabled={busy}
        className="mt-2 rounded-md bg-[#C4704F] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Enabling..." : "Enable notifications"}
      </button>
    </div>
  );
}
