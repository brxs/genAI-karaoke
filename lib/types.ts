export type { SlideStyle } from "./styles";
export type { AbsurdityLevel } from "./absurdity";
export type { ImageSize, AspectRatio } from "./gemini";

export interface AttachedImage {
  data: string;      // base64 encoded
  mimeType: string;  // e.g., "image/jpeg", "image/png"
  useForContent: boolean;  // Use image to inform presentation content
  useForVisual: boolean;   // Use image as visual style reference
}

export interface Slide {
  id: string;  // Unique identifier for React keys
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  imagePrompt?: string;
  imageBase64?: string;  // Local state during generation
  imageUrl?: string;     // Persisted URL from Supabase Storage
  imageError?: string;
  isTitleSlide?: boolean;
}

export interface Presentation {
  id?: string;  // Database ID (undefined for new/unsaved)
  topic: string;
  style: import("./styles").SlideStyle;
  absurdity: import("./absurdity").AbsurdityLevel;
  slides: Slide[];
  customStylePrompt?: string;
  context?: string;
  attachedImages?: AttachedImage[];
  createdAt: Date;
  updatedAt?: Date;
  isSaved?: boolean;  // Track save state
}

export type GenerationStatus =
  | "idle"
  | "generating-outline"
  | "generating-prompts"
  | "generating-images"
  | "complete"
  | "error";

export interface GenerationState {
  status: GenerationStatus;
  currentSlide?: number;
  totalSlides: number;
  error?: string;
}

// Re-export schema types for backward compatibility
export type { OutlineSlide, OutlineResponse, ImagePromptResponse } from "./schemas";
