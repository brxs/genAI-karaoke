// Gemini API pricing (as of 2025)
// https://ai.google.dev/gemini-api/docs/pricing

// gemini-3-pro-preview pricing
const TEXT_INPUT_PRICE_PER_TOKEN = 0.000002; // $2.00 / 1M tokens
const TEXT_OUTPUT_PRICE_PER_TOKEN = 0.000012; // $12.00 / 1M tokens
const GOOGLE_SEARCH_PRICE = 0.014; // $0.014 per request

// gemini-3-pro-image-preview pricing
const IMAGE_BASE_PRICE_2K = 0.134; // $0.134 per 1K/2K image
const IMAGE_BASE_PRICE_4K = 0.24; // $0.24 per 4K image
const IMAGE_INPUT_PRICE_PER_TOKEN = 0.000002; // $2.00 / 1M tokens

export type ImageSize = "1K" | "2K" | "4K";

export interface TextGenerationUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  googleSearchEnabled?: boolean;
}

export interface ImageGenerationUsage {
  promptTokenCount: number;
  imageSize: ImageSize;
}

export function calculateTextCost(usage: TextGenerationUsage): number {
  const inputCost = usage.promptTokenCount * TEXT_INPUT_PRICE_PER_TOKEN;
  const outputCost = usage.candidatesTokenCount * TEXT_OUTPUT_PRICE_PER_TOKEN;
  const searchCost = usage.googleSearchEnabled ? GOOGLE_SEARCH_PRICE : 0;
  return inputCost + outputCost + searchCost;
}

export function calculateImageCost(usage: ImageGenerationUsage): number {
  const baseCost = usage.imageSize === "4K" ? IMAGE_BASE_PRICE_4K : IMAGE_BASE_PRICE_2K;
  const inputCost = usage.promptTokenCount * IMAGE_INPUT_PRICE_PER_TOKEN;
  return baseCost + inputCost;
}

export function formatCost(cost: number): string {
  return `$${cost.toFixed(6)}`;
}
