import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { buildOutlineSystemPrompt } from "@/lib/prompts";
import { OutlineResponseSchema, type OutlineResponse } from "@/lib/schemas";
import { AbsurdityLevel, getAbsurdityConfig } from "@/lib/absurdity";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { topic, absurdity = 3, maxBulletPoints = 3, slideCount = 7 } = await request.json();

    console.log("[generate-outline] Request params:", { topic, absurdity, maxBulletPoints, slideCount });

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

    const userPrompt = absurdity === 0
      ? `Create an informative ${slideCount}-slide presentation about: "${topic}"`
      : `Create a hilarious ${slideCount}-slide presentation about: "${topic}"`;

    const outline = await generateStructuredOutput<OutlineResponse>(
      client,
      enhancedSystemPrompt,
      userPrompt,
      OutlineResponseSchema
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
