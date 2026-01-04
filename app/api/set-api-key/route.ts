import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Basic validation - Google AI API keys start with "AIza"
    if (!apiKey.startsWith("AIza")) {
      return NextResponse.json(
        { error: "Invalid API key format. Google AI API keys start with 'AIza'" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie for security
    response.cookies.set("google_ai_api_key", apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}
