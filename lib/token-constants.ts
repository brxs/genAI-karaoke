// Token costs per operation (based on Gemini API pricing analysis)
// This file is shared between client and server code
export const TOKEN_COSTS = {
  outline: 5,
  outlineWithSearch: 10,
  imagePrompts: 1, // Base cost per slide for image prompt generation
  slideSuggestions: 1, // Simple text generation, no search
  image: 35,
  attachedImage: 0.5,
} as const;

export type OperationType = keyof typeof TOKEN_COSTS;

// Token pack definitions
export const TOKEN_PACKS = {
  starter: { tokens: 1000, price: 499, name: "Starter Pack" },
  standard: { tokens: 3000, price: 1299, name: "Standard Pack" },
  pro: { tokens: 10000, price: 3999, name: "Pro Pack" },
} as const;

export type PackType = keyof typeof TOKEN_PACKS;

/**
 * Calculate the token cost for outline generation
 */
export function calculateOutlineCost(useWebSearch: boolean, attachedImageCount: number): number {
  const baseCost = useWebSearch ? TOKEN_COSTS.outlineWithSearch : TOKEN_COSTS.outline;
  return baseCost + (attachedImageCount * TOKEN_COSTS.attachedImage);
}

/**
 * Calculate the token cost for image prompt generation
 * 1 token per slide + 0.5 per attached visual image
 */
export function calculateImagePromptsCost(slideCount: number, visualImageCount: number): number {
  return (slideCount * TOKEN_COSTS.imagePrompts) + (visualImageCount * TOKEN_COSTS.attachedImage);
}

/**
 * Calculate the estimated token cost for a full presentation
 * slideCount is content slides only; +1 for the title slide
 * contentImageCount: images used for content extraction in outline
 * visualImageCount: images used for visual style in image prompts
 */
export function estimatePresentationCost(
  slideCount: number,
  useWebSearch = true,
  contentImageCount = 0,
  visualImageCount = 0
): number {
  const totalSlides = slideCount + 1; // content slides + title slide
  return (
    calculateOutlineCost(useWebSearch, contentImageCount) +
    calculateImagePromptsCost(totalSlides, visualImageCount) +
    totalSlides * TOKEN_COSTS.image
  );
}

export function formatTokenPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}
