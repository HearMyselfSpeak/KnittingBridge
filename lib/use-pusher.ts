"use client";

// Client-side Pusher hook for real-time channel subscriptions.
// Uses NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER.

import { useEffect, useRef } from "react";
import PusherClient from "pusher-js";

let pusherInstance: PusherClient | null = null;

function getPusher(): PusherClient {
  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "";
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2";
    pusherInstance = new PusherClient(key, { cluster });
  }
  return pusherInstance;
}

/**
 * Subscribe to a Pusher channel and listen for events.
 * Cleans up subscription on unmount.
 */
export function usePusherChannel(
  channelName: string,
  event: string,
  callback: (data: unknown) => void,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const client = getPusher();
    const channel = client.subscribe(channelName);

    const handler = (data: unknown) => callbackRef.current(data);
    channel.bind(event, handler);

    return () => {
      channel.unbind(event, handler);
      client.unsubscribe(channelName);
    };
  }, [channelName, event]);
}
