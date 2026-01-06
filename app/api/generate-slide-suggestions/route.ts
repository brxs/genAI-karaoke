import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { Type, type Static } from "@sinclair/typebox";

const SlideSuggestionSchema = Type.Object({
  title: Type.String(),
  bulletPoints: Type.Array(Type.String()),
});

const SlideSuggestionsResponseSchema = Type.Object({
  suggestions: Type.Array(SlideSuggestionSchema),
});

type SlideSuggestionsResponse = Static<typeof SlideSuggestionsResponseSchema>;

const SLIDE_SUGGESTIONS_SYSTEM_PROMPT = `You are helping create slides for a fun, engaging presentation. Generate exactly 3 different slide suggestions that would fit well in this presentation.

Each suggestion should have:
- A catchy, punchy title (5-10 words)
- 3-4 bullet points (each 5-15 words)

Make the suggestions varied - offer different angles, perspectives, or subtopics that would complement the existing presentation. Keep the tone fun and engaging.`;

export async function POST(request: NextRequest) {
  console.log("[generate-slide-suggestions] POST request received");

  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      console.log("[generate-slide-suggestions] No API key found");
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { topic, existingTitles } = await request.json();

    console.log("[generate-slide-suggestions] Request params:", {
      topic,
      existingTitlesCount: existingTitles?.length || 0
    });

    if (!topic) {
      console.log("[generate-slide-suggestions] Missing topic");
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const client = createGeminiClient(apiKey);

    const existingContext = existingTitles?.length > 0
      ? `\n\nExisting slides in the presentation:\n${existingTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}\n\nGenerate new slides that complement these but don't repeat them.`
      : "";

    const userPrompt = `Generate 3 slide suggestions for a presentation about: "${topic}"${existingContext}`;

    console.log("[generate-slide-suggestions] Calling Gemini API...");
    const result = await generateStructuredOutput<SlideSuggestionsResponse>(
      client,
      SLIDE_SUGGESTIONS_SYSTEM_PROMPT,
      userPrompt,
      SlideSuggestionsResponseSchema
    );

    if (!result.suggestions || result.suggestions.length !== 3) {
      console.log("[generate-slide-suggestions] Invalid response format:", {
        hasSuggestions: !!result.suggestions,
        count: result.suggestions?.length
      });
      return NextResponse.json(
        { error: "Invalid suggestions format received" },
        { status: 500 }
      );
    }

    console.log("[generate-slide-suggestions] Successfully generated suggestions:",
      result.suggestions.map(s => s.title)
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[generate-slide-suggestions] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
