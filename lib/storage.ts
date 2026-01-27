/**
 * Browser storage utilities with SSR safety
 */

const KEYS = {
  ACTIVE_PRESENTATION_ID: "banana_active_presentation_id",
} as const;

function isClient(): boolean {
  return typeof window !== "undefined";
}

export const storage = {
  getActivePresentationId(): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(KEYS.ACTIVE_PRESENTATION_ID);
  },

  setActivePresentationId(id: string): void {
    if (!isClient()) return;
    localStorage.setItem(KEYS.ACTIVE_PRESENTATION_ID, id);
  },

  clearActivePresentationId(): void {
    if (!isClient()) return;
    localStorage.removeItem(KEYS.ACTIVE_PRESENTATION_ID);
  },
};
