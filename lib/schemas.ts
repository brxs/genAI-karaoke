import { Type, type Static } from "@sinclair/typebox";

export const OutlineSlideSchema = Type.Object({
  title: Type.String(),
  bulletPoints: Type.Array(Type.String()),
});

export const OutlineResponseSchema = Type.Object({
  slides: Type.Array(OutlineSlideSchema),
});

export const ImagePromptResponseSchema = Type.Object({
  imagePrompts: Type.Array(Type.String()),
});

// TypeScript types derived from schemas
export type OutlineSlide = Static<typeof OutlineSlideSchema>;
export type OutlineResponse = Static<typeof OutlineResponseSchema>;
export type ImagePromptResponse = Static<typeof ImagePromptResponseSchema>;
