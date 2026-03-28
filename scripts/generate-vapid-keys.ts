// One-time script to generate VAPID keys for web push notifications.
// Run: npx tsx scripts/generate-vapid-keys.ts
// Then add the output values to your environment variables.

import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("VAPID Keys Generated\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("\nAdd these to your .env.local and Vercel environment variables.");
