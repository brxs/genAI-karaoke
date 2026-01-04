import { NextRequest, NextResponse } from "next/server";

function maskApiKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}${"*".repeat(8)}${key.slice(-4)}`;
}

export async function GET(request: NextRequest) {
  const apiKey = request.cookies.get("google_ai_api_key")?.value;
  const hasApiKey = !!apiKey && apiKey.startsWith("AIza");

  return NextResponse.json({
    hasApiKey,
    maskedKey: hasApiKey ? maskApiKey(apiKey) : null,
  });
}
