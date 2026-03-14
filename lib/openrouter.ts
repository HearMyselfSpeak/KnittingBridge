// OpenRouter HTTP client. All AI calls go through here.
// Model IDs always read from ENV — never hardcoded in this file.

const BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

type TextPart = { type: "text"; text: string };
type ImagePart = { type: "image_url"; image_url: { url: string } };
type ContentPart = TextPart | ImagePart;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface ChatOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  response_format?: { type: "json_object" };
}

export interface ImageGenOptions {
  prompt: string;
  garmentImageUrl: string; // original garment photo — used as the edit reference image
  model?: string;
  // gpt-image-1 / gpt-image-1.5 accepted sizes — "auto" lets the model match input aspect ratio
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": "https://knittingbridge.com",
    "X-Title": "KnittingBridge",
  };
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: Error = new Error("Unknown error");
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < attempts - 1) {
        await new Promise((res) => setTimeout(res, 500 * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

export async function chatCompletion(opts: ChatOptions): Promise<string> {
  return withRetry(async () => {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        model: opts.model ?? process.env.OPENROUTER_MODEL,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.1,
        max_tokens: opts.max_tokens ?? 1200,
        top_p: opts.top_p ?? 0.9,
        ...(opts.response_format && { response_format: opts.response_format }),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenRouter chat error ${res.status}: ${body}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenRouter");
    return content;
  });
}

/**
 * Edit a garment image by recoloring it with gpt-image-1.5.
 * Calls OpenAI /v1/images/edits with a JSON body, passing the garment as an image_url.
 * Returns the raw base64-encoded PNG — callers are responsible for storage.
 */
export async function generateImage(opts: ImageGenOptions): Promise<string> {
  return withRetry(async () => {
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1.5",
        images: [{ image_url: opts.garmentImageUrl }],
        prompt: opts.prompt,
        size: opts.size ?? "auto",
        quality: "high",
        input_fidelity: "high",
        n: 1,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI image edit error ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data in OpenAI response");
    return b64;
  });
}
