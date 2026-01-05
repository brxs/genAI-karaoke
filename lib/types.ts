export type { SlideStyle } from "./styles";
export type { AbsurdityLevel } from "./absurdity";
export type { ImageSize, AspectRatio } from "./gemini";

export interface Slide {
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
