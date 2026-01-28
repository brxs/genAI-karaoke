import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { Type, type Static } from "@sinclair/typebox";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  reserveTokens,
  completeUsage,
  failUsage,
  TOKEN_COSTS,
} from "@/lib/tokens";

const SingleImagePromptResponseSchema = Type.Object({
  imagePrompt: Type.String(),
});

type SingleImagePromptResponse = Static<typeof SingleImagePromptResponseSchema>;

const SINGLE_IMAGE_PROMPT_SYSTEM = `Generate an image prompt for a presentation slide. You will receive a slide with a title and bullet points.

Create a prompt that generates an ACTUAL PRESENTATION SLIDE with:
- The slide title displayed prominently at the top
- The bullet points displayed as text on the slide
- A fun, eye-catching background image or graphic that matches the topic
- Bold, readable typography with personality
- Vibrant colors and playful visual elements

The prompt should instruct the AI to render the EXACT text provided on a visually striking slide.

Return a single image prompt for the slide provided.`;

export async function POST(request: NextRequest) {
  console.log("[generate-single-image-prompt] POST request received");
  let usageRecord: Awaited<ReturnType<typeof reserveTokens>> | null = null;

  try {
    // Parse request body first to get user's preferred mode
    const body = await request.json() as {
      title: string;
      bulletPoints?: string[];
      isTitleSlide?: boolean;
      topic?: string;
      preferredMode?: "tokens" | "byok";
    };

    // Check for BYOK cookie
    const cookieApiKey = request.cookies.get("google_ai_api_key")?.value;

    // Use BYOK if user prefers it AND has a key, or if no preference specified and has a key
    const prefersBYOK = body.preferredMode === "byok" || (body.preferredMode === undefined && !!cookieApiKey);
    let apiKey = prefersBYOK ? cookieApiKey : undefined;
    const useBYOK = !!apiKey;

    if (!useBYOK) {
      // Token mode - check for authenticated user with balance
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Please sign in or set your API key to generate image prompts." },
          { status: 401 }
        );
      }

      const available = await getAvailableBalance(user.id);
      const estimatedCost = TOKEN_COSTS.imagePrompts;

      if (available < estimatedCost) {
        return NextResponse.json(
          {
            error: "Insufficient tokens",
            code: "INSUFFICIENT_TOKENS",
            available,
            required: estimatedCost,
          },
          { status: 402 }
        );
      }

      // Reserve tokens before execution
      usageRecord = await reserveTokens(
        user.id,
        estimatedCost,
        "imagePrompts"
      );

      // Use server-side API key
      apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        await failUsage(usageRecord.id);
        return NextResponse.json(
          { error: "Server API key not configured" },
          { status: 500 }
        );
      }
    }

    const { title, bulletPoints, isTitleSlide, topic } = body;

    console.log("[generate-single-image-prompt] Request params:", {
      title,
      isTitleSlide,
      topic,
      bulletPointsCount: bulletPoints?.length || 0
    });

    if (!title) {
      console.log("[generate-single-image-prompt] Missing title");
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // For title slides, generate a special prompt (no API call needed)
    if (isTitleSlide) {
      if (usageRecord) {
        await completeUsage(usageRecord.id, TOKEN_COSTS.imagePrompts);
      }
      const imagePrompt = `A bold, eye-catching title slide for a presentation called "${title}". The title "${title}" should be prominently displayed in large, clear text. Professional presentation design with dramatic visual impact.`;
      console.log("[generate-single-image-prompt] Generated title slide prompt");
      return NextResponse.json({ imagePrompt });
    }

    // At this point apiKey is guaranteed to be defined (either from cookie or env)
    const client = createGeminiClient(apiKey!);

    const slideDescription = `Slide: "${title}"\n- ${(bulletPoints || []).join("\n- ")}`;
    const userPrompt = `Generate an image prompt for this presentation slide:\n\n${slideDescription}`;

    console.log("[generate-single-image-prompt] Calling Gemini API...");
    const result = await generateStructuredOutput<SingleImagePromptResponse>(
      client,
      SINGLE_IMAGE_PROMPT_SYSTEM,
      userPrompt,
      SingleImagePromptResponseSchema
    );

    if (!result.imagePrompt) {
      console.log("[generate-single-image-prompt] Invalid response format:", result);
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Invalid image prompt format received" },
        { status: 500 }
      );
    }

    // Complete usage record
    if (usageRecord) {
      await completeUsage(usageRecord.id, TOKEN_COSTS.imagePrompts);
    }

    console.log("[generate-single-image-prompt] Successfully generated prompt:", result.imagePrompt.substring(0, 100) + "...");
    return NextResponse.json(result);
  } catch (error) {
    console.error("[generate-single-image-prompt] Error:", error);
    if (usageRecord) {
      await failUsage(usageRecord.id);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image prompt" },
      { status: 500 }
    );
  }
}
