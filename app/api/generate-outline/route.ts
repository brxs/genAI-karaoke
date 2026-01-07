import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { buildOutlineSystemPrompt } from "@/lib/prompts";
import { OutlineResponseSchema, type OutlineResponse } from "@/lib/schemas";
import { AbsurdityLevel, getAbsurdityConfig } from "@/lib/absurdity";
import type { AttachedImage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { topic, absurdity = 3, maxBulletPoints = 3, slideCount = 7, context, attachedImages } = await request.json() as {
      topic: string;
      absurdity?: number;
      maxBulletPoints?: number;
      slideCount?: number;
      context?: string;
      attachedImages?: AttachedImage[];
    };

    console.log("[generate-outline] Request params:", { topic, absurdity, maxBulletPoints, slideCount, hasContext: !!context, imageCount: attachedImages?.length || 0 });

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const absurdityConfig = getAbsurdityConfig(absurdity as AbsurdityLevel);
    const client = createGeminiClient(apiKey);

    // Build the system prompt dynamically from absurdity config
    const basePrompt = buildOutlineSystemPrompt(absurdityConfig.prompt);
    const bulletPointsInstruction = `\n\nIMPORTANT: Each slide must have exactly ${maxBulletPoints} bullet point${maxBulletPoints === 1 ? "" : "s"}.`;
    const slideCountInstruction = `\n\nIMPORTANT: Generate exactly ${slideCount} slides total.`;
    const enhancedSystemPrompt = `${basePrompt}${bulletPointsInstruction}${slideCountInstruction}`;

    const baseUserPrompt = absurdity === 0
      ? `Create an informative ${slideCount}-slide presentation about: "${topic}"`
      : `Create a hilarious ${slideCount}-slide presentation about: "${topic}"`;

    let userPrompt = baseUserPrompt;

    // Filter images - only content images are used for outline generation
    const contentImages = attachedImages?.filter((img) => img.useForContent) || [];

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
      { tools: [{ googleSearch: {} }], images: imagesToSend }
    );

    // Validate response structure
    if (!outline.slides || !Array.isArray(outline.slides) || outline.slides.length !== slideCount) {
      return NextResponse.json(
        { error: "Invalid outline format received" },
        { status: 500 }
      );
    }

    return NextResponse.json(outline);
  } catch (error) {
    console.error("Outline generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate outline" },
      { status: 500 }
    );
  }
}
