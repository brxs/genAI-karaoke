"use client";

import { useState, useCallback, useRef } from "react";
import { Slide, Presentation, GenerationState, OutlineResponse, ImagePromptResponse, SlideStyle, AbsurdityLevel } from "@/lib/types";

const CONCURRENT_IMAGE_REQUESTS = 4;

export function usePresentation() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    totalSlides: 7,
  });

  // AbortController ref to cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePresentation = useCallback(async (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: number, slideCount: number, customStylePrompt?: string) => {
    // Abort any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this generation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    const totalSlides = slideCount + 1; // +1 for title slide
    setGenerationState({ status: "generating-outline", totalSlides });
    setPresentation(null);

    try {
      // Step 1: Generate outline
      const outlineRes = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, absurdity, maxBulletPoints, slideCount }),
        signal,
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
        signal,
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
        // Check if aborted before starting
        if (signal.aborted) return;

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
            signal,
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to generate image");
          }

          const { imageBase64 } = await res.json();

          // Don't update state if aborted
          if (signal.aborted) return;

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
          // Ignore abort errors
          if (err instanceof Error && err.name === "AbortError") return;

          // Don't update state if aborted
          if (signal.aborted) return;

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
          while (queue.length > 0 && !signal.aborted) {
            const index = queue.shift();
            if (index === undefined) break;

            await generateImageForSlide(index);

            // Don't update state if aborted
            if (signal.aborted) break;

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

      // Only set complete if not aborted
      if (!signal.aborted) {
        setGenerationState({ status: "complete", totalSlides });
      }
    } catch (err) {
      // Ignore abort errors - they're expected when user cancels
      if (err instanceof Error && err.name === "AbortError") return;

      setGenerationState({
        status: "error",
        totalSlides,
        error: err instanceof Error ? err.message : "An error occurred",
      });
    }
  }, []);

  const resetPresentation = useCallback(() => {
    // Abort any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

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
