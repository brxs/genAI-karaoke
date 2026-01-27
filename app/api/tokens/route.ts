import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAvailableBalance,
  getOrCreateUserTokens,
  getUsageHistory,
  getPurchaseHistory,
  TOKEN_COSTS,
  TOKEN_PACKS,
  estimatePresentationCost,
} from "@/lib/tokens";

// GET /api/tokens - Get user's token balance and info
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for optional query params
    const url = new URL(request.url);
    const includeHistory = url.searchParams.get("history") === "true";
    const includePurchases = url.searchParams.get("purchases") === "true";

    // Get userTokens record (for Realtime subscription filtering)
    const userTokens = await getOrCreateUserTokens(user.id);

    // Get balance
    const balance = await getAvailableBalance(user.id);

    // Check if user has BYOK key set
    const apiKeyCookie = request.headers.get("cookie")?.includes("google_ai_api_key");

    const response: {
      balance: number;
      userTokensId: string;
      hasBYOK: boolean;
      costs: typeof TOKEN_COSTS;
      packs: typeof TOKEN_PACKS;
      estimatedPresentationCost: number;
      usage?: Awaited<ReturnType<typeof getUsageHistory>>;
      purchases?: Awaited<ReturnType<typeof getPurchaseHistory>>;
    } = {
      balance,
      userTokensId: userTokens.id,
      hasBYOK: !!apiKeyCookie,
      costs: TOKEN_COSTS,
      packs: TOKEN_PACKS,
      estimatedPresentationCost: estimatePresentationCost(8), // Default 8 slides
    };

    // Optionally include history
    if (includeHistory) {
      response.usage = await getUsageHistory(user.id);
    }

    if (includePurchases) {
      response.purchases = await getPurchaseHistory(user.id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch token balance" },
      { status: 500 }
    );
  }
}
