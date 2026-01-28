import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, generateStructuredOutput } from "@/lib/gemini";
import { Type, type Static } from "@sinclair/typebox";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  reserveTokens,
  completeUsage,
  failUsage,
  TOKEN_COSTS,
} from "@/lib/tokens";

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
  let usageRecord: Awaited<ReturnType<typeof reserveTokens>> | null = null;

  try {
    // Parse request body first to get user's preferred mode
    const body = await request.json() as {
      topic: string;
      existingTitles?: string[];
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
          { error: "Please sign in or set your API key to generate slides." },
          { status: 401 }
        );
      }

      const available = await getAvailableBalance(user.id);
      const estimatedCost = TOKEN_COSTS.slideSuggestions;

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
        "slideSuggestions"
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

    const { topic, existingTitles } = body;

    console.log("[generate-slide-suggestions] Request params:", {
      topic,
      existingTitlesCount: existingTitles?.length || 0
    });

    if (!topic) {
      console.log("[generate-slide-suggestions] Missing topic");
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // At this point apiKey is guaranteed to be defined (either from cookie or env)
    const client = createGeminiClient(apiKey!);

    const existingContext = existingTitles && existingTitles.length > 0
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
      if (usageRecord) {
        await failUsage(usageRecord.id);
      }
      return NextResponse.json(
        { error: "Invalid suggestions format received" },
        { status: 500 }
      );
    }

    // Complete usage record
    if (usageRecord) {
      await completeUsage(usageRecord.id, TOKEN_COSTS.slideSuggestions);
    }

    console.log("[generate-slide-suggestions] Successfully generated suggestions:",
      result.suggestions.map(s => s.title)
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[generate-slide-suggestions] Error:", error);
    if (usageRecord) {
      await failUsage(usageRecord.id);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
