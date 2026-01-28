import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateImage, ImageSize, AspectRatio } from "@/lib/gemini";
import { STYLES, SlideStyle } from "@/lib/styles";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  reserveTokens,
  completeUsage,
  failUsage,
  TOKEN_COSTS,
} from "@/lib/tokens";

const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";
const DEFAULT_IMAGE_SIZE: ImageSize = "2K";

export async function POST(request: NextRequest) {
  let usageRecord: Awaited<ReturnType<typeof reserveTokens>> | null = null;

  try {
    // Parse request body first to get user's preferred mode
    const body = await request.json() as {
      prompt: string;
      slideId: string;
      style?: SlideStyle;
      customStylePrompt?: string;
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
      const estimatedCost = TOKEN_COSTS.image;

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
        "image"
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

    const { prompt, slideId, style, customStylePrompt } = body;

    console.log("[generate-image] Request params:", { slideId, style, customStylePrompt: customStylePrompt?.slice(0, 50) });

    if (!prompt || typeof prompt !== "string") {
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Image prompt is required" },
        { status: 400 }
      );
    }

    if (typeof slideId !== "string") {
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Slide ID is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey!);

    // Get style prompt - use custom prompt if style is "custom", otherwise use predefined style
    let stylePrompt: string;
    if (style === "custom" && customStylePrompt) {
      stylePrompt = `${customStylePrompt}, high quality text rendering`;
    } else {
      const styleConfig = STYLES[style as SlideStyle] || STYLES.corporate;
      stylePrompt = styleConfig.prompt;
    }

    // Enhance prompt with the selected style
    const enhancedPrompt = `${prompt}. ${stylePrompt}`;

    const imageBase64 = await generateImage(
      client,
      enhancedPrompt,
      DEFAULT_ASPECT_RATIO,
      DEFAULT_IMAGE_SIZE
    );

    // Mark usage as completed
    if (usageRecord) {
      await completeUsage(usageRecord.id, TOKEN_COSTS.image);
    }

    return NextResponse.json({
      imageBase64,
      slideId,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    // Release reserved tokens on failure
    if (usageRecord) {
      await failUsage(usageRecord.id);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
