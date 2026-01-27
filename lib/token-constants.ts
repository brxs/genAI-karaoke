// Token costs per operation (based on Gemini API pricing analysis)
// This file is shared between client and server code
export const TOKEN_COSTS = {
  outline: 5,
  imagePrompts: 5,
  image: 35,
} as const;

export type OperationType = keyof typeof TOKEN_COSTS;

// Token pack definitions
export const TOKEN_PACKS = {
  initial_credit: { tokens: 400, price: 0, name: "Welcome Credit" },
  starter: { tokens: 1000, price: 499, name: "Starter Pack" },
  standard: { tokens: 3000, price: 1299, name: "Standard Pack" },
  pro: { tokens: 10000, price: 3999, name: "Pro Pack" },
} as const;

export type PackType = keyof typeof TOKEN_PACKS;

/**
 * Calculate the estimated token cost for a full presentation
 * slideCount is content slides only; +1 for the title slide
 */
export function estimatePresentationCost(slideCount: number): number {
  const totalSlides = slideCount + 1; // content slides + title slide
  return (
    TOKEN_COSTS.outline +
    TOKEN_COSTS.imagePrompts +
    totalSlides * TOKEN_COSTS.image
  );
}

export function formatTokenPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}
