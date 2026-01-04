"use client";

import { useState, useCallback } from "react";
import { Slide, Presentation, GenerationState, OutlineResponse, ImagePromptResponse, SlideStyle, AbsurdityLevel } from "@/lib/types";

const CONCURRENT_IMAGE_REQUESTS = 2;

export function usePresentation() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    totalSlides: 7,
  });

  const generatePresentation = useCallback(async (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: number, slideCount: number, customStylePrompt?: string) => {
    const totalSlides = slideCount + 1; // +1 for title slide
    setGenerationState({ status: "generating-outline", totalSlides });
    setPresentation(null);

    try {
      // Step 1: Generate outline
      const outlineRes = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, absurdity, maxBulletPoints, slideCount }),
      });

      if (!outlineRes.ok) {
        const error = await outlineRes.json();
        throw new Error(error.error || "Failed to generate outline");
      }

      const outline: OutlineResponse = await outlineRes.json();

      // Create title slide
      const titleSlide: Slide = {
        slideNumber: 0,
        title: topic,
        bulletPoints: [],
        isTitleSlide: true,
      };

      // Initialize content slides with outline data (starting at slide 1)
      const contentSlides: Slide[] = outline.slides.map((s, i) => ({
        slideNumber: i + 1,
        title: s.title,
        bulletPoints: s.bulletPoints,
      }));

      const slides: Slide[] = [titleSlide, ...contentSlides];

      setPresentation({ topic, style, absurdity, slides, customStylePrompt, createdAt: new Date() });

      // Step 2: Generate image prompts
      setGenerationState({ status: "generating-prompts", totalSlides });

      const promptsRes = await fetch("/api/generate-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: outline.slides }),
      });

      if (!promptsRes.ok) {
        const error = await promptsRes.json();
        throw new Error(error.error || "Failed to generate image prompts");
      }

      const { imagePrompts }: ImagePromptResponse = await promptsRes.json();

      // Create title slide prompt
      const titleSlidePrompt = `A bold, eye-catching title slide for a presentation called "${topic}". The title "${topic}" should be prominently displayed in large, clear text. Professional presentation design with dramatic visual impact.`;

      // Combine title slide prompt with content slide prompts
      const allImagePrompts = [titleSlidePrompt, ...imagePrompts];

      // Update slides with image prompts
      const slidesWithPrompts = slides.map((slide, i) => ({
        ...slide,
        imagePrompt: allImagePrompts[i],
      }));

      setPresentation((prev) =>
        prev ? { ...prev, slides: slidesWithPrompts } : null
      );

      // Step 3: Generate images (with concurrency limit)
      setGenerationState({
        status: "generating-images",
        currentSlide: 0,
        totalSlides,
      });

      const generateImageForSlide = async (slideIndex: number): Promise<void> => {
        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: allImagePrompts[slideIndex],
              slideIndex,
              style,
              customStylePrompt,
            }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to generate image");
          }

          const { imageBase64 } = await res.json();

          setPresentation((prev) => {
            if (!prev) return null;
            const updatedSlides = [...prev.slides];
            updatedSlides[slideIndex] = {
              ...updatedSlides[slideIndex],
              imageBase64,
            };
            return { ...prev, slides: updatedSlides };
          });
        } catch (err) {
          // Mark individual slide as failed but continue with others
          setPresentation((prev) => {
            if (!prev) return null;
            const updatedSlides = [...prev.slides];
            updatedSlides[slideIndex] = {
              ...updatedSlides[slideIndex],
              imageError: err instanceof Error ? err.message : "Failed to generate image",
            };
            return { ...prev, slides: updatedSlides };
          });
        }
      };

      // Process images with concurrency limit
      const slideIndices = Array.from({ length: totalSlides }, (_, i) => i);
      let completed = 0;

      const processQueue = async () => {
        const queue = [...slideIndices];

        const workers = Array.from({ length: CONCURRENT_IMAGE_REQUESTS }, async () => {
          while (queue.length > 0) {
            const index = queue.shift();
            if (index === undefined) break;

            await generateImageForSlide(index);
            completed++;

            setGenerationState({
              status: "generating-images",
              currentSlide: completed,
              totalSlides,
            });
          }
        });

        await Promise.all(workers);
      };

      await processQueue();

      setGenerationState({ status: "complete", totalSlides });
    } catch (err) {
      setGenerationState({
        status: "error",
        totalSlides,
        error: err instanceof Error ? err.message : "An error occurred",
      });
    }
  }, []);

  const resetPresentation = useCallback(() => {
    setPresentation(null);
    setGenerationState({ status: "idle", totalSlides: 7 });
  }, []);

  const regenerateSlideImage = useCallback(async (slideIndex: number) => {
    if (!presentation) return;

    const slide = presentation.slides[slideIndex];
    if (!slide?.imagePrompt) return;

    // Clear the error and set loading state
    setPresentation((prev) => {
      if (!prev) return null;
      const updatedSlides = [...prev.slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        imageError: undefined,
        imageBase64: undefined,
      };
      return { ...prev, slides: updatedSlides };
    });

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: slide.imagePrompt,
          slideIndex,
          style: presentation.style,
          customStylePrompt: presentation.customStylePrompt,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const { imageBase64 } = await res.json();

      setPresentation((prev) => {
        if (!prev) return null;
        const updatedSlides = [...prev.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imageBase64,
          imageError: undefined,
        };
        return { ...prev, slides: updatedSlides };
      });
    } catch (err) {
      setPresentation((prev) => {
        if (!prev) return null;
        const updatedSlides = [...prev.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imageError: err instanceof Error ? err.message : "Failed to generate image",
        };
        return { ...prev, slides: updatedSlides };
      });
    }
  }, [presentation]);

  return {
    presentation,
    generationState,
    generatePresentation,
    resetPresentation,
    regenerateSlideImage,
  };
}
