import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { TOKEN_PACKS, type PackType } from "@/lib/tokens";

// POST /api/stripe/checkout - Create a Stripe checkout session
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packType } = await request.json();

    // Validate pack type
    if (!packType || !(packType in TOKEN_PACKS)) {
      return NextResponse.json(
        { error: "Invalid pack type" },
        { status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get("origin") || "https://banana.fyi";
    const successUrl = `${origin}?purchase=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}?purchase=cancelled`;

    const session = await createCheckoutSession(
      user.id,
      packType as PackType,
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
