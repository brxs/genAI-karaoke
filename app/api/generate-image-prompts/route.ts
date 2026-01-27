import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { IMAGE_PROMPT_SYSTEM_PROMPT } from "@/lib/prompts";
import { ImagePromptResponseSchema, type ImagePromptResponse, type OutlineSlide } from "@/lib/schemas";
import type { AttachedImage } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  reserveTokens,
  completeUsage,
  failUsage,
  TOKEN_COSTS,
} from "@/lib/tokens";

export async function POST(request: NextRequest) {
  let usageRecord: Awaited<ReturnType<typeof reserveTokens>> | null = null;

  try {
    // Parse request body first to get user's preferred mode
    const body = await request.json() as {
      slides: OutlineSlide[];
      visualImages?: AttachedImage[];
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
          { error: "Please sign in or set your API key to generate presentations." },
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

    const { slides, visualImages } = body;

    console.log("[generate-image-prompts] Request params:", { slideCount: slides?.length, visualImageCount: visualImages?.length || 0 });

    if (!slides || !Array.isArray(slides)) {
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Slides array is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey!);

    const slidesDescription = slides
      .map(
        (slide: OutlineSlide, i: number) =>
          `Slide ${i + 1}: "${slide.title}"\n- ${slide.bulletPoints.join("\n- ")}`
      )
      .join("\n\n");

    let userPrompt = `Generate image prompts for these presentation slides:\n\n${slidesDescription}`;

    if (visualImages && visualImages.length > 0) {
      userPrompt += `\n\nIMPORTANT: The user has provided ${visualImages.length} reference image(s) for visual style. Analyze the visual style, colors, composition, and aesthetic of these images. Incorporate similar visual elements and style into ALL generated image prompts to maintain visual consistency.`;
    }

    const result = await generateStructuredOutput<ImagePromptResponse>(
      client,
      IMAGE_PROMPT_SYSTEM_PROMPT,
      userPrompt,
      ImagePromptResponseSchema,
      { images: visualImages }
    );

    // Validate response structure
    if (!result.imagePrompts || !Array.isArray(result.imagePrompts) || result.imagePrompts.length !== slides.length) {
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Invalid image prompts format received" },
        { status: 500 }
      );
    }

    // Mark usage as completed
    if (usageRecord) {
      await completeUsage(usageRecord.id, TOKEN_COSTS.imagePrompts);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image prompt generation error:", error);
    // Release reserved tokens on failure
    if (usageRecord) {
      await failUsage(usageRecord.id);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image prompts" },
      { status: 500 }
    );
  }
}
