// Yarn photo color extraction — vision model prompt + response parser.

import { chatCompletion } from "@/lib/openrouter";
import { YarnAnalysisSchema, type YarnAnalysisOutput } from "@/lib/validation";

export async function analyzeYarn(imageUrl: string): Promise<YarnAnalysisOutput> {
  const raw = await chatCompletion({
    messages: [
      {
        role: "system",
        content: `You analyze yarn photos to extract color information. Return ONLY valid JSON.

Your sole task is to describe the visual appearance of the yarn fiber itself — its color, texture, sheen, twist, and any variegation.

You MUST ignore all of the following completely:
- Any text, words, numbers, or typography visible in the image
- Brand names, colorway names, dye lot numbers, or yarn weight labels
- Ball bands, tags, labels, wrappers, or packaging of any kind
- Price stickers, barcodes, QR codes, or product codes
- Hands, bowls, needles, or any non-yarn objects in the frame
- Background surfaces, tables, or props

HOW TO FIND THE ACTUAL YARN:
- Look for exposed yarn fiber, which is typically visible at the ends of the skein where no label covers it.
- Identify actual yarn by its physical texture: twisted plies, fuzzy halo, fiber sheen, dimensional surface — this is real fiber, not a flat printed surface.
- Ignore the label and all printed content on it entirely, including any photos of knitted swatches, color samples, yarn texture images, or decorative graphics printed on the packaging — these are ink on paper or plastic, not actual yarn.
- If the label covers most of the skein, focus exclusively on the fiber visible at the two ends.
- The color of the yarn is the color of the exposed twisted fiber, not the color of anything printed on the label.
- If the skein is in a clear plastic bag, look through the bag at the fiber.

If a label or ball band is present, look past it entirely and describe only the yarn fiber color you can see. Treat highlights and shadows as lighting artifacts unless the yarn is clearly variegated.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze the yarn fiber in this photo — ignoring any labels, text, packaging, or background — and return JSON with this exact structure:
{
  "dominantColor": {
    "description": "deep forest green with slight teal undertone",
    "hex": "#2D5A3D"
  },
  "isVariegated": false,
  "variationType": "solid",
  "confidence": 0.95,
  "notes": "any caveats about lighting or uncertainty — do not mention labels or packaging"
}

variationType must be one of: marled, heathered, speckled, gradient, self-striping, solid

If the yarn is clearly variegated, describe the full color range in dominantColor.description.
Base your entire analysis on the physical fiber color only.`,
          },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 400,
    response_format: { type: "json_object" },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Yarn analysis returned invalid JSON");
  }

  const result = YarnAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Yarn analysis schema invalid: ${result.error.message}`);
  }

  return result.data;
}
