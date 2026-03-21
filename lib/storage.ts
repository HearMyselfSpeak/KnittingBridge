// Supabase Storage helpers — color preview images only.

import { createClient } from "@supabase/supabase-js";

const BUCKET = "color-previews";

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY not set");
  return createClient(url, key);
}

/** Server-side client using the service role key — bypasses RLS. Only use in API routes. */
function serviceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, key);
}

/** Upload a buffer to Supabase Storage. Returns the storage key. */
export async function uploadFile(
  storageKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(storageKey, buffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return storageKey;
}

/** Get the public URL for a stored file. */
export function getPublicUrl(storageKey: string): string {
  const { data } = client().storage.from(BUCKET).getPublicUrl(storageKey);
  return data.publicUrl;
}

/** Get a short-lived signed URL for a private storage file. */
export async function getSignedUrl(
  storageKey: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await client()
    .storage.from(BUCKET)
    .createSignedUrl(storageKey, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? "unknown"}`);
  }
  return data.signedUrl;
}

/** Delete a stored file. */
export async function deleteFile(storageKey: string): Promise<void> {
  const { error } = await client().storage.from(BUCKET).remove([storageKey]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/** Derive a unique storage key for an uploaded asset. */
export function makeStorageKey(
  sessionId: string,
  assetId: string,
  ext: string
): string {
  return `sessions/${sessionId}/${assetId}.${ext}`;
}

/** Upload to an arbitrary bucket (e.g. "guide-applications").
 *  Uses the service role key to bypass RLS — only call from server-side API routes. */
export async function uploadFileToBucket(
  bucket: string,
  storageKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const { error } = await serviceClient()
    .storage.from(bucket)
    .upload(storageKey, buffer, { contentType: mimeType, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return storageKey;
}

/** Get a public URL from an arbitrary bucket. */
export function getPublicUrlFromBucket(bucket: string, storageKey: string): string {
  const { data } = client().storage.from(bucket).getPublicUrl(storageKey);
  return data.publicUrl;
}

/**
 * Decode a base64-encoded PNG returned by an AI image edit API and persist it
 * to Supabase Storage. Returns the public URL of the stored file.
 */
export async function storeGeneratedImage(
  sessionId: string,
  b64: string
): Promise<string> {
  const { randomUUID } = await import("crypto");
  const buffer = Buffer.from(b64, "base64");
  const key = `sessions/${sessionId}/preview-${randomUUID()}.png`;
  await uploadFile(key, buffer, "image/png");
  return getPublicUrl(key);
}
