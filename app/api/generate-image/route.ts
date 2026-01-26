import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateImage, ImageSize, AspectRatio } from "@/lib/gemini";
import { STYLES, SlideStyle } from "@/lib/styles";

const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";
const DEFAULT_IMAGE_SIZE: ImageSize = "1K";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { prompt, slideId, style, customStylePrompt } = await request.json();

    console.log("[generate-image] Request params:", { slideId, style, customStylePrompt: customStylePrompt?.slice(0, 50) });

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Image prompt is required" },
        { status: 400 }
      );
    }

    if (typeof slideId !== "string") {
      return NextResponse.json(
        { error: "Slide ID is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey);

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

    return NextResponse.json({
      imageBase64,
      slideId,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
