"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Slide, Presentation, GenerationState, OutlineResponse, ImagePromptResponse, SlideStyle, AbsurdityLevel, AttachedImage } from "@/lib/types";
import { CONCURRENT_IMAGE_REQUESTS } from "@/lib/constants";

// Generate unique ID for slides
const generateId = () => `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function usePresentation() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    totalSlides: 7,
  });
  const [regeneratingSlide, setRegeneratingSlide] = useState<number | null>(null);

  // AbortController ref to cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePresentation = useCallback(async (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: number, slideCount: number, customStylePrompt?: string, context?: string, attachedImages?: AttachedImage[], useWebSearch?: boolean) => {
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
        body: JSON.stringify({ topic, absurdity, maxBulletPoints, slideCount, context, attachedImages, useWebSearch }),
        signal,
      });

      if (!outlineRes.ok) {
        const error = await outlineRes.json();
        throw new Error(error.error || "Failed to generate outline");
      }

      const outline: OutlineResponse = await outlineRes.json();

      // Create title slide
      const titleSlide: Slide = {
        id: generateId(),
        slideNumber: 0,
        title: topic,
        bulletPoints: [],
        isTitleSlide: true,
      };

      // Initialize content slides with outline data (starting at slide 1)
      const contentSlides: Slide[] = outline.slides.map((s, i) => ({
        id: generateId(),
        slideNumber: i + 1,
        title: s.title,
        bulletPoints: s.bulletPoints,
      }));

      const slides: Slide[] = [titleSlide, ...contentSlides];

      setPresentation({ topic, style, absurdity, slides, customStylePrompt, context, attachedImages, createdAt: new Date() });

      // Step 2: Generate image prompts
      setGenerationState({ status: "generating-prompts", totalSlides });

      // Filter visual images for image prompt generation
      const visualImages = attachedImages?.filter((img) => img.useForVisual);

      const promptsRes = await fetch("/api/generate-image-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: outline.slides,
          visualImages: visualImages && visualImages.length > 0 ? visualImages : undefined,
        }),
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
              customStylePrompt: style === "custom" ? customStylePrompt : undefined,
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

      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error("Failed to generate presentation", {
        description: errorMessage,
      });
      setGenerationState({
        status: "error",
        totalSlides,
        error: errorMessage,
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
          customStylePrompt: presentation.style === "custom" ? presentation.customStylePrompt : undefined,
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
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      toast.error("Failed to regenerate image", {
        description: errorMessage,
      });
      setPresentation((prev) => {
        if (!prev) return null;
        const updatedSlides = [...prev.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imageError: errorMessage,
        };
        return { ...prev, slides: updatedSlides };
      });
    }
  }, [presentation]);

  // Update a slide's content (title and/or bullet points)
  const updateSlide = useCallback((
    slideIndex: number,
    updates: { title?: string; bulletPoints?: string[] }
  ) => {
    setPresentation((prev) => {
      if (!prev) return null;
      const updatedSlides = [...prev.slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        ...updates,
      };
      // Update topic if title slide is edited
      const newTopic = updates.title && slideIndex === 0 ? updates.title : prev.topic;
      return { ...prev, topic: newTopic, slides: updatedSlides };
    });
  }, []);

  // Delete a slide
  const deleteSlide = useCallback((slideIndex: number) => {
    setPresentation((prev) => {
      if (!prev) return null;
      // Don't delete title slide
      if (slideIndex === 0) return prev;
      const updatedSlides = prev.slides.filter((_, i) => i !== slideIndex);
      // Renumber slides
      const renumberedSlides = updatedSlides.map((slide, i) => ({
        ...slide,
        slideNumber: slide.isTitleSlide ? 0 : i,
      }));
      return { ...prev, slides: renumberedSlides };
    });
  }, []);

  // Reorder slides (for drag-and-drop)
  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    setPresentation((prev) => {
      if (!prev) return null;
      // Don't allow moving title slide
      if (fromIndex === 0 || toIndex === 0) return prev;
      const updatedSlides = [...prev.slides];
      const [movedSlide] = updatedSlides.splice(fromIndex, 1);
      updatedSlides.splice(toIndex, 0, movedSlide);
      // Renumber slides (keep title slide as 0)
      const renumberedSlides = updatedSlides.map((slide, i) => ({
        ...slide,
        slideNumber: slide.isTitleSlide ? 0 : i,
      }));
      return { ...prev, slides: renumberedSlides };
    });
  }, []);

  // Add a new slide
  const addSlide = useCallback((): number => {
    let newSlideIndex = -1;
    setPresentation((prev) => {
      if (!prev) return null;
      const newSlide: Slide = {
        id: generateId(),
        slideNumber: prev.slides.length,
        title: "New Slide",
        bulletPoints: ["Add your first point"],
        isTitleSlide: false,
      };
      newSlideIndex = prev.slides.length;
      return { ...prev, slides: [...prev.slides, newSlide] };
    });
    return newSlideIndex;
  }, []);

  // Update presentation settings (style, absurdity, customStylePrompt, context, attachedImages)
  const updateSettings = useCallback((updates: {
    style?: SlideStyle;
    absurdity?: AbsurdityLevel;
    customStylePrompt?: string;
    context?: string;
    attachedImages?: AttachedImage[];
  }) => {
    setPresentation((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  // Create a blank presentation with just a title slide
  const createBlankPresentation = useCallback((title: string) => {
    // Abort any existing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const titleSlide: Slide = {
      id: generateId(),
      slideNumber: 0,
      title,
      bulletPoints: [],
      isTitleSlide: true,
    };

    setPresentation({
      topic: title,
      style: "corporate",
      absurdity: 3,
      slides: [titleSlide],
      createdAt: new Date(),
    });

    setGenerationState({ status: "complete", totalSlides: 1 });
  }, []);

  // Regenerate image prompt and image for a specific slide
  const regenerateSlideWithNewPrompt = useCallback(async (slideIndex: number) => {
    if (!presentation) return;

    const slide = presentation.slides[slideIndex];
    if (!slide) return;

    setRegeneratingSlide(slideIndex);

    // Clear existing image to show loading state
    setPresentation((prev) => {
      if (!prev) return null;
      const updatedSlides = [...prev.slides];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        imagePrompt: undefined,
        imageBase64: undefined,
        imageError: undefined,
      };
      return { ...prev, slides: updatedSlides };
    });

    try {
      // Step 1: Generate new image prompt for this slide
      const promptRes = await fetch("/api/generate-single-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slide.title,
          bulletPoints: slide.bulletPoints,
          isTitleSlide: slide.isTitleSlide,
          topic: presentation.topic,
        }),
      });

      if (!promptRes.ok) {
        const error = await promptRes.json();
        throw new Error(error.error || "Failed to generate image prompt");
      }

      const { imagePrompt } = await promptRes.json();

      // Update slide with new prompt
      setPresentation((prev) => {
        if (!prev) return null;
        const updatedSlides = [...prev.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imagePrompt,
        };
        return { ...prev, slides: updatedSlides };
      });

      // Step 2: Generate new image
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          slideIndex,
          style: presentation.style,
          customStylePrompt: presentation.style === "custom" ? presentation.customStylePrompt : undefined,
        }),
      });

      if (!imageRes.ok) {
        const error = await imageRes.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const { imageBase64 } = await imageRes.json();

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
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate";
      toast.error("Failed to regenerate slide", {
        description: errorMessage,
      });
      setPresentation((prev) => {
        if (!prev) return null;
        const updatedSlides = [...prev.slides];
        updatedSlides[slideIndex] = {
          ...updatedSlides[slideIndex],
          imageError: errorMessage,
        };
        return { ...prev, slides: updatedSlides };
      });
    } finally {
      setRegeneratingSlide(null);
    }
  }, [presentation]);

  return {
    presentation,
    generationState,
    regeneratingSlide,
    generatePresentation,
    resetPresentation,
    regenerateSlideImage,
    updateSlide,
    deleteSlide,
    reorderSlides,
    addSlide,
    updateSettings,
    createBlankPresentation,
    regenerateSlideWithNewPrompt,
  };
}
