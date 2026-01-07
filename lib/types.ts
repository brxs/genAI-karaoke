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
  imageBase64?: string;
  imageError?: string;
  isTitleSlide?: boolean;
}

export interface Presentation {
  topic: string;
  style: import("./styles").SlideStyle;
  absurdity: import("./absurdity").AbsurdityLevel;
  slides: Slide[];
  customStylePrompt?: string;
  context?: string;
  attachedImages?: AttachedImage[];
  createdAt: Date;
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
