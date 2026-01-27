"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GENERATION_MODE_KEY,
  getPreferredMode,
  setPreferredMode as savePreferredMode,
  type GenerationMode,
} from "@/lib/generationMode";

interface UsePreferredModeReturn {
  preferredMode: GenerationMode;
  setPreferredMode: (mode: GenerationMode) => void;
}

/**
 * Hook to manage generation mode preference (tokens vs BYOK)
 * Handles localStorage persistence and cross-component/cross-tab sync
 */
export function usePreferredMode(): UsePreferredModeReturn {
  const [preferredMode, setPreferredModeState] = useState<GenerationMode>("tokens");

  // Load from localStorage on mount and listen for changes
  useEffect(() => {
    const loadPreference = () => setPreferredModeState(getPreferredMode());

    loadPreference();

    // Listen for storage changes (cross-tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === GENERATION_MODE_KEY) {
        loadPreference();
      }
    };

    // Listen for custom event (same-tab, from other components)
    window.addEventListener("storage", handleStorage);
    window.addEventListener("generationModeChanged", loadPreference);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("generationModeChanged", loadPreference);
    };
  }, []);

  const setPreferredMode = useCallback((mode: GenerationMode) => {
    setPreferredModeState(mode);
    savePreferredMode(mode); // Saves to localStorage and dispatches event
  }, []);

  return { preferredMode, setPreferredMode };
}
