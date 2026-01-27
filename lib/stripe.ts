import Stripe from "stripe";
import { TOKEN_PACKS, type PackType } from "./tokens";

// Initialize Stripe client (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

/**
 * Create a Stripe checkout session for purchasing a token pack
 */
export async function createCheckoutSession(
  userId: string,
  packType: PackType,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const pack = TOKEN_PACKS[packType];

  if (!pack) {
    throw new Error(`Invalid pack type: ${packType}`);
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: pack.name,
            description: `${pack.tokens.toLocaleString()} tokens for banana.fyi`,
          },
          unit_amount: pack.price, // Price is already in cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      packType,
      tokensAmount: pack.tokens.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Verify and construct a Stripe webhook event
 */
export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Retrieve a checkout session by ID
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId);
}
