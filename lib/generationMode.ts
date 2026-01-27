export const GENERATION_MODE_KEY = "generationMode";
export type GenerationMode = "tokens" | "byok";

/**
 * Get user's preferred generation mode from localStorage
 * Defaults to "tokens" if not set or on server
 */
export function getPreferredMode(): GenerationMode {
  if (typeof window === "undefined") return "tokens";
  const stored = localStorage.getItem(GENERATION_MODE_KEY);
  return stored === "byok" ? "byok" : "tokens";
}

/**
 * Set user's preferred generation mode in localStorage
 * Also dispatches an event to notify other components
 */
export function setPreferredMode(mode: GenerationMode): void {
  localStorage.setItem(GENERATION_MODE_KEY, mode);
  window.dispatchEvent(new Event("generationModeChanged"));
}
