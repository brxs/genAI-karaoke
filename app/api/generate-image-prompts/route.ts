import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { IMAGE_PROMPT_SYSTEM_PROMPT } from "@/lib/prompts";
import { ImagePromptResponseSchema, type ImagePromptResponse, type OutlineSlide } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { slides } = await request.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Slides array is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey);

    const slidesDescription = slides
      .map(
        (slide: OutlineSlide, i: number) =>
          `Slide ${i + 1}: "${slide.title}"\n- ${slide.bulletPoints.join("\n- ")}`
      )
      .join("\n\n");

    const userPrompt = `Generate image prompts for these presentation slides:\n\n${slidesDescription}`;

    const result = await generateStructuredOutput<ImagePromptResponse>(
      client,
      IMAGE_PROMPT_SYSTEM_PROMPT,
      userPrompt,
      ImagePromptResponseSchema
    );

    // Validate response structure
    if (!result.imagePrompts || !Array.isArray(result.imagePrompts) || result.imagePrompts.length !== slides.length) {
      return NextResponse.json(
        { error: "Invalid image prompts format received" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image prompt generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image prompts" },
      { status: 500 }
    );
  }
}
