import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { Type, type Static } from "@sinclair/typebox";

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
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { title, bulletPoints, isTitleSlide, topic } = await request.json();

    console.log("[generate-single-image-prompt] Request params:", { title, isTitleSlide });

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // For title slides, generate a special prompt
    if (isTitleSlide) {
      const imagePrompt = `A bold, eye-catching title slide for a presentation called "${title}". The title "${title}" should be prominently displayed in large, clear text. Professional presentation design with dramatic visual impact.`;
      return NextResponse.json({ imagePrompt });
    }

    const client = createGeminiClient(apiKey);

    const slideDescription = `Slide: "${title}"\n- ${(bulletPoints || []).join("\n- ")}`;
    const userPrompt = `Generate an image prompt for this presentation slide:\n\n${slideDescription}`;

    const result = await generateStructuredOutput<SingleImagePromptResponse>(
      client,
      SINGLE_IMAGE_PROMPT_SYSTEM,
      userPrompt,
      SingleImagePromptResponseSchema
    );

    if (!result.imagePrompt) {
      return NextResponse.json(
        { error: "Invalid image prompt format received" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Single image prompt generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image prompt" },
      { status: 500 }
    );
  }
}
