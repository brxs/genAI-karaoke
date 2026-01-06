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
  try {
    const apiKey = request.cookies.get("google_ai_api_key")?.value;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found. Please set your API key first." },
        { status: 401 }
      );
    }

    const { topic, existingTitles } = await request.json();

    if (!topic) {
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

    const result = await generateStructuredOutput<SlideSuggestionsResponse>(
      client,
      SLIDE_SUGGESTIONS_SYSTEM_PROMPT,
      userPrompt,
      SlideSuggestionsResponseSchema
    );

    if (!result.suggestions || result.suggestions.length !== 3) {
      return NextResponse.json(
        { error: "Invalid suggestions format received" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Slide suggestions generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
