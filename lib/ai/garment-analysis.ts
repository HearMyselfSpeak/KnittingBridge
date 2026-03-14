// Garment color region analysis — vision model prompt + response parser.

import { chatCompletion } from "@/lib/openrouter";
import { GarmentAnalysisSchema, type GarmentAnalysisOutput } from "@/lib/validation";

export function buildPrompt(imageUrls: string[]): Parameters<typeof chatCompletion>[0] {
  const imageContent = imageUrls.map((url) => ({
    type: "image_url" as const,
    image_url: { url },
  }));

  return {
    messages: [
      {
        role: "system",
        content: `You are a knitting expert who analyzes garment photos to identify yarn colors and regions.
You must return ONLY valid JSON. No explanations, no markdown, no commentary.
Focus exclusively on the knitted or crocheted garment. Ignore backgrounds, models, props, and accessories.
Describe colors by where they appear in the garment — never label them generically as "Color A" or "Color B".`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the knitted/crocheted garment in this image. Return JSON with this exact structure:
{
  "regions": [
    {
      "id": "r1",
      "label": "body background stitches",
      "description": "main body area",
      "originalColorDescription": "cream off-white with warm undertone",
      "hex": "#F5F0E8",
      "confidence": 0.9
    }
  ],
  "linkedRegions": [
    {
      "regionIds": ["r1", "r3"],
      "yarnDescription": "same cream yarn used throughout body and cuffs"
    }
  ],
  "colorworkType": "none|stripes|fair-isle|nordic|colorblock|intarsia",
  "ambiguities": ["description of any unclear colors that need clarification"],
  "garmentNotes": "brief structural notes relevant to color mapping"
}

Rules:
- Identify ALL distinct yarn colors (stripes, motifs, colorwork bands, cuffs, collar, hem, yoke, borders)
- Distinguish actual yarn color differences from lighting artifacts
- For Fair Isle/Nordic patterns: identify background, motif fill, outline, accent stitches separately
- Region labels describe WHERE the color appears (not what color it is)
- linkedRegions groups regions using the same yarn
- If a color is unclear, add it to ambiguities`,
          },
          ...imageContent,
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  };
}

export async function analyzeGarment(
  imageUrls: string[]
): Promise<GarmentAnalysisOutput> {
  const opts = buildPrompt(imageUrls);
  const raw = await chatCompletion(opts);

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Garment analysis returned invalid JSON");
  }

  const result = GarmentAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Garment analysis schema invalid: ${result.error.message}`);
  }

  return result.data;
}
