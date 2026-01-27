import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { createPurchase, type PackType } from "@/lib/tokens";
import type Stripe from "stripe";

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, packType } = session.metadata || {};

  if (!userId || !packType) {
    console.error("Missing metadata in checkout session:", session.id);
    return;
  }

  // Check if this session was already processed (idempotency)
  // The createPurchase function will fail on duplicate stripeSessionId
  try {
    await createPurchase(
      userId,
      packType as PackType,
      session.id,
      session.payment_intent as string | undefined
    );
    console.log(
      `Successfully credited ${packType} tokens to user ${userId} from session ${session.id}`
    );
  } catch (error) {
    // Check if it's a unique constraint violation (already processed)
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      console.log(`Session ${session.id} already processed, skipping`);
    } else {
      throw error;
    }
  }
}
