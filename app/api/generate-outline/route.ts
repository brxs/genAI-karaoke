import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { buildOutlineSystemPrompt } from "@/lib/prompts";
import { OutlineResponseSchema, type OutlineResponse } from "@/lib/schemas";
import { AbsurdityLevel, getAbsurdityConfig } from "@/lib/absurdity";
import type { AttachedImage } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  reserveTokens,
  completeUsage,
  failUsage,
} from "@/lib/tokens";
import { calculateOutlineCost } from "@/lib/token-constants";

export async function POST(request: NextRequest) {
  let usageRecord: Awaited<ReturnType<typeof reserveTokens>> | null = null;

  try {
    // Parse request body first to get user's preferred mode
    const body = await request.json() as {
      topic: string;
      absurdity?: number;
      maxBulletPoints?: number;
      slideCount?: number;
      context?: string;
      attachedImages?: AttachedImage[];
      useWebSearch?: boolean;
      preferredMode?: "tokens" | "byok";
    };

    const useWebSearch = body.useWebSearch ?? true;
    const contentImages = body.attachedImages?.filter((img) => img.useForContent) || [];
    const attachedImageCount = contentImages.length;

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
      const estimatedCost = calculateOutlineCost(useWebSearch, attachedImageCount);

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
        "outline"
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

    const { topic, absurdity = 3, maxBulletPoints = 3, slideCount = 7, context, attachedImages } = body;

    console.log("[generate-outline] Request params:", { topic, absurdity, maxBulletPoints, slideCount, hasContext: !!context, imageCount: attachedImages?.length || 0, useWebSearch });

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const absurdityConfig = getAbsurdityConfig(absurdity as AbsurdityLevel);
    const client = createGeminiClient(apiKey!);

    // Build the system prompt dynamically from absurdity config
    const basePrompt = buildOutlineSystemPrompt(absurdityConfig.prompt);
    const bulletPointsInstruction = `\n\nIMPORTANT: Each slide must have exactly ${maxBulletPoints} bullet point${maxBulletPoints === 1 ? "" : "s"}.`;
    const slideCountInstruction = `\n\nIMPORTANT: Generate exactly ${slideCount} slides total.`;
    const enhancedSystemPrompt = `${basePrompt}${bulletPointsInstruction}${slideCountInstruction}`;

    const baseUserPrompt = absurdity === 0
      ? `Create an informative ${slideCount}-slide presentation about: "${topic}"`
      : `Create a hilarious ${slideCount}-slide presentation about: "${topic}"`;

    let userPrompt = baseUserPrompt;

    if (contentImages.length > 0) {
      userPrompt += `\n\nThe user has attached ${contentImages.length} reference image(s). Extract information, data, or topics from these images to inform the presentation content.`;
    }

    if (context) {
      userPrompt += `\n\nAdditional context from the user:\n${context}`;
    }

    // Only pass content images to the model for outline generation
    const imagesToSend = contentImages.length > 0 ? contentImages : undefined;

    const outline = await generateStructuredOutput<OutlineResponse>(
      client,
      enhancedSystemPrompt,
      userPrompt,
      OutlineResponseSchema,
      { tools: useWebSearch ? [{ googleSearch: {} }] : undefined, images: imagesToSend }
    );

    // Validate response structure
    if (!outline.slides || !Array.isArray(outline.slides) || outline.slides.length !== slideCount) {
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Invalid outline format received" },
        { status: 500 }
      );
    }

    // Mark usage as completed with actual token cost
    if (usageRecord) {
      const actualCost = calculateOutlineCost(useWebSearch, attachedImageCount);
      await completeUsage(usageRecord.id, actualCost);
    }

    return NextResponse.json(outline);
  } catch (error) {
    console.error("Outline generation error:", error);
    // Release reserved tokens on failure
    if (usageRecord) {
      await failUsage(usageRecord.id);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate outline" },
      { status: 500 }
    );
  }
}
