"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Slide, Presentation, GenerationState, OutlineResponse, ImagePromptResponse, SlideStyle, AbsurdityLevel, AttachedImage } from "@/lib/types";
import { CONCURRENT_IMAGE_REQUESTS, IMAGE_REQUEST_STAGGER_MS } from "@/lib/constants";
import { useAuth } from "./useAuth";
import { uploadSlideImage, deletePresentationImages } from "@/lib/supabase/storage";
import { storage } from "@/lib/storage";
import { getPreferredMode } from "@/lib/generationMode";

// Debounce helper
function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  return debounced as T & { cancel: () => void };
}

// Generate unique ID for slides
const generateId = () => `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function usePresentation() {
  const { user } = useAuth();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: "idle",
    totalSlides: 7,
  });
  const [regeneratingSlideId, setRegeneratingSlideId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // AbortController ref to cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track if we should auto-save (only after first manual or auto save)
  const shouldAutoSaveRef = useRef(false);
  // Track content version to avoid re-saving immediately after save completes
  const lastSavedContentRef = useRef<string | null>(null);
  // Track when images need uploading (after regeneration)
  const needsImageUploadRef = useRef(false);
  // Track if we've already attempted to auto-load from localStorage
  const autoLoadAttemptedRef = useRef(false);

  // Generate a content hash to detect actual changes (excludes metadata like imageUrl, isSaved)
  const getContentHash = useCallback((p: Presentation | null) => {
    if (!p) return null;
    return JSON.stringify({
      topic: p.topic,
      style: p.style,
      absurdity: p.absurdity,
      customStylePrompt: p.customStylePrompt,
      context: p.context,
      slides: p.slides.map((s) => ({
        id: s.id,
        slideNumber: s.slideNumber,
        title: s.title,
        bulletPoints: s.bulletPoints,
        imagePrompt: s.imagePrompt,
        isTitleSlide: s.isTitleSlide,
      })),
    });
  }, []);

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
        body: JSON.stringify({ topic, absurdity, maxBulletPoints, slideCount, context, attachedImages, useWebSearch, preferredMode: getPreferredMode() }),
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
          preferredMode: getPreferredMode(),
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

      const generateImageForSlide = async (slide: { id: string; imagePrompt: string }): Promise<void> => {
        // Check if aborted before starting
        if (signal.aborted) return;

        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: slide.imagePrompt,
              slideId: slide.id,
              style,
              customStylePrompt: style === "custom" ? customStylePrompt : undefined,
              preferredMode: getPreferredMode(),
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
            return {
              ...prev,
              slides: prev.slides.map((s) =>
                s.id === slide.id ? { ...s, imageBase64 } : s
              ),
            };
          });
        } catch (err) {
          // Ignore abort errors
          if (err instanceof Error && err.name === "AbortError") return;

          // Don't update state if aborted
          if (signal.aborted) return;

          // Mark individual slide as failed but continue with others
          setPresentation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              slides: prev.slides.map((s) =>
                s.id === slide.id
                  ? { ...s, imageError: err instanceof Error ? err.message : "Failed to generate image" }
                  : s
              ),
            };
          });
        }
      };

      // Process images with concurrency limit - use slides with their IDs and prompts
      const slidesToProcess = slidesWithPrompts.map((s) => ({ id: s.id, imagePrompt: s.imagePrompt! }));
      let completed = 0;

      const processQueue = async () => {
        const queue = [...slidesToProcess];

        const workers = Array.from({ length: CONCURRENT_IMAGE_REQUESTS }, async (_, workerIndex) => {
          // Stagger worker start times to avoid burst of concurrent requests
          if (workerIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, workerIndex * IMAGE_REQUEST_STAGGER_MS));
          }

          while (queue.length > 0 && !signal.aborted) {
            const slide = queue.shift();
            if (!slide) break;

            await generateImageForSlide(slide);

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
    // Clear active presentation from localStorage
    storage.clearActivePresentationId();
  }, []);

  const regenerateSlideImage = useCallback(async (slideId: string) => {
    if (!presentation) return;

    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide?.imagePrompt) return;

    // Clear the error and set loading state
    setPresentation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        slides: prev.slides.map((s) =>
          s.id === slideId
            ? { ...s, imageError: undefined, imageBase64: undefined, imageUrl: undefined }
            : s
        ),
      };
    });

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: slide.imagePrompt,
          slideId,
          style: presentation.style,
          customStylePrompt: presentation.style === "custom" ? presentation.customStylePrompt : undefined,
          preferredMode: getPreferredMode(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const { imageBase64 } = await res.json();

      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === slideId ? { ...s, imageBase64, imageError: undefined } : s
          ),
        };
      });

      // Mark that we need to upload this new image
      needsImageUploadRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      toast.error("Failed to regenerate image", {
        description: errorMessage,
      });
      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === slideId ? { ...s, imageError: errorMessage } : s
          ),
        };
      });
    }
  }, [presentation]);

  // Update a slide's content (title and/or bullet points)
  const updateSlide = useCallback((
    slideId: string,
    updates: { title?: string; bulletPoints?: string[] }
  ) => {
    setPresentation((prev) => {
      if (!prev) return null;
      const slide = prev.slides.find((s) => s.id === slideId);
      if (!slide) return prev;

      return {
        ...prev,
        // Update topic if title slide is edited
        topic: updates.title && slide.isTitleSlide ? updates.title : prev.topic,
        slides: prev.slides.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s
        ),
      };
    });
  }, []);

  // Delete a slide
  const deleteSlide = useCallback((slideId: string) => {
    setPresentation((prev) => {
      if (!prev) return null;
      const slide = prev.slides.find((s) => s.id === slideId);
      // Don't delete title slide
      if (!slide || slide.isTitleSlide) return prev;

      const updatedSlides = prev.slides.filter((s) => s.id !== slideId);
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

  // Add a new slide - returns the new slide's ID
  const addSlide = useCallback((): string | null => {
    const newSlideId = generateId();
    let success = false;
    setPresentation((prev) => {
      if (!prev) return null;
      success = true;
      const newSlide: Slide = {
        id: newSlideId,
        slideNumber: prev.slides.length,
        title: "New Slide",
        bulletPoints: ["Add your first point"],
        isTitleSlide: false,
      };
      return { ...prev, slides: [...prev.slides, newSlide] };
    });
    return success ? newSlideId : null;
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
  // Optional updatedContent parameter allows passing new content directly (avoids stale state issues)
  const regenerateSlideWithNewPrompt = useCallback(async (
    slideId: string,
    updatedContent?: { title: string; bulletPoints: string[] }
  ) => {
    if (!presentation) return;

    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;

    // Use updated content if provided, otherwise use current slide content
    const title = updatedContent?.title ?? slide.title;
    const bulletPoints = updatedContent?.bulletPoints ?? slide.bulletPoints;

    setRegeneratingSlideId(slideId);

    // Clear existing image and update content if new content was provided
    setPresentation((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        // Update topic if title slide is edited
        topic: updatedContent?.title && slide.isTitleSlide ? updatedContent.title : prev.topic,
        slides: prev.slides.map((s) =>
          s.id === slideId
            ? {
                ...s,
                ...(updatedContent && { title, bulletPoints }),
                imagePrompt: undefined,
                imageBase64: undefined,
                imageUrl: undefined, // Clear URL so new image can be uploaded
                imageError: undefined,
              }
            : s
        ),
      };
    });

    try {
      // Step 1: Generate new image prompt for this slide
      const promptRes = await fetch("/api/generate-single-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bulletPoints,
          isTitleSlide: slide.isTitleSlide,
          topic: updatedContent?.title && slide.isTitleSlide ? updatedContent.title : presentation.topic,
          preferredMode: getPreferredMode(),
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
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === slideId ? { ...s, imagePrompt } : s
          ),
        };
      });

      // Step 2: Generate new image
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          slideId,
          style: presentation.style,
          customStylePrompt: presentation.style === "custom" ? presentation.customStylePrompt : undefined,
          preferredMode: getPreferredMode(),
        }),
      });

      if (!imageRes.ok) {
        const error = await imageRes.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const { imageBase64 } = await imageRes.json();

      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === slideId ? { ...s, imageBase64, imageError: undefined } : s
          ),
        };
      });

      // Mark that we need to upload this new image
      needsImageUploadRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate";
      toast.error("Failed to regenerate slide", {
        description: errorMessage,
      });
      setPresentation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          slides: prev.slides.map((s) =>
            s.id === slideId ? { ...s, imageError: errorMessage } : s
          ),
        };
      });
    } finally {
      setRegeneratingSlideId(null);
    }
  }, [presentation]);

  // Save presentation to database
  // silent: true = no toast (for auto-saves after edits)
  const savePresentation = useCallback(async (silent = false) => {
    if (!presentation || !user) return;

    setIsSaving(true);
    try {
      // For new presentations, save first to get an ID
      let presentationId = presentation.id;

      if (!presentationId) {
        // First save - create presentation without images to get ID
        const slidesForApi = presentation.slides.map((s) => ({
          id: s.id,
          slideNumber: s.slideNumber,
          title: s.title,
          bulletPoints: s.bulletPoints,
          imagePrompt: s.imagePrompt,
          imageUrl: undefined,
          imageError: s.imageError,
          isTitleSlide: s.isTitleSlide,
        }));

        const response = await fetch("/api/presentations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: presentation.topic,
            style: presentation.style,
            absurdity: presentation.absurdity,
            customStylePrompt: presentation.customStylePrompt,
            context: presentation.context,
            slides: slidesForApi,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save");
        }

        const saved = await response.json();
        presentationId = saved.id;

        // Update state with the new ID
        setPresentation((prev) => prev ? { ...prev, id: saved.id } : null);

        // Persist active presentation ID to localStorage
        storage.setActivePresentationId(saved.id);
      }

      // Now upload any images that don't have URLs yet
      const slidesWithUrls = await Promise.all(
        presentation.slides.map(async (slide) => {
          // If slide has base64 image but no URL, upload it
          if (slide.imageBase64 && !slide.imageUrl && presentationId) {
            try {
              const imageUrl = await uploadSlideImage(
                user.id,
                presentationId,
                slide.id,
                slide.imageBase64
              );
              return { ...slide, imageUrl };
            } catch (err) {
              console.error("Failed to upload image:", err);
              return slide;
            }
          }
          return slide;
        })
      );

      // Always update existing presentations (slides may have been reordered, edited, etc.)
      const slidesForApi = slidesWithUrls.map((s) => ({
        id: s.id,
        slideNumber: s.slideNumber,
        title: s.title,
        bulletPoints: s.bulletPoints,
        imagePrompt: s.imagePrompt,
        imageUrl: s.imageUrl,
        imageError: s.imageError,
        isTitleSlide: s.isTitleSlide,
      }));

      const response = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: presentationId,
          topic: presentation.topic,
          style: presentation.style,
          absurdity: presentation.absurdity,
          customStylePrompt: presentation.customStylePrompt,
          context: presentation.context,
          slides: slidesForApi,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      // Update local state with saved data
      setPresentation((prev) => {
        if (!prev) return null;

        // Create a map of uploaded image URLs by slide ID
        const uploadedUrls = new Map(
          slidesWithUrls
            .filter((s) => s.imageUrl)
            .map((s) => [s.id, s.imageUrl])
        );

        return {
          ...prev,
          id: presentationId,
          slides: prev.slides.map((slide) => ({
            ...slide,
            // Only update imageUrl if we uploaded one for this slide
            imageUrl: uploadedUrls.get(slide.id) || slide.imageUrl,
          })),
          isSaved: true,
          updatedAt: new Date(),
        };
      });

      setLastSaved(new Date());
      shouldAutoSaveRef.current = true;
      if (!silent) {
        toast.success("Presentation saved");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save presentation");
    } finally {
      setIsSaving(false);
    }
  }, [presentation, user]);

  // Load presentation from database
  const loadPresentation = useCallback(
    async (presentationId: string) => {
      if (!user) return;

      try {
        const response = await fetch(`/api/presentations/${presentationId}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to load");
        }

        const data = await response.json();

        // Transform database format to local format
        const loadedPresentation: Presentation = {
          id: data.id,
          topic: data.topic,
          style: data.style as SlideStyle,
          absurdity: data.absurdity as AbsurdityLevel,
          customStylePrompt: data.customStylePrompt ?? undefined,
          context: data.context ?? undefined,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          isSaved: true,
          slides: data.slides.map(
            (slide: {
              id: string;
              slideNumber: number;
              title: string;
              bulletPoints: string[];
              imagePrompt: string | null;
              imageUrl: string | null;
              imageError: string | null;
              isTitleSlide: boolean;
            }) => ({
              id: slide.id,
              slideNumber: slide.slideNumber,
              title: slide.title,
              bulletPoints: slide.bulletPoints,
              imagePrompt: slide.imagePrompt ?? undefined,
              imageUrl: slide.imageUrl ?? undefined,
              imageError: slide.imageError ?? undefined,
              isTitleSlide: slide.isTitleSlide,
            })
          ),
        };

        setPresentation(loadedPresentation);
        setGenerationState({
          status: "complete",
          totalSlides: loadedPresentation.slides.length,
        });
        setLastSaved(new Date(data.updatedAt));
        // Set content hash so we don't immediately re-save
        lastSavedContentRef.current = getContentHash(loadedPresentation);
        shouldAutoSaveRef.current = true;
        // Persist active presentation ID to localStorage
        storage.setActivePresentationId(presentationId);
      } catch (error) {
        console.error("Load error:", error);
        toast.error("Failed to load presentation");
      }
    },
    [user, getContentHash]
  );

  // Delete presentation from database
  const deletePresentation = useCallback(
    async (presentationId: string) => {
      if (!user) return;

      try {
        // Delete images from storage first
        await deletePresentationImages(user.id, presentationId);

        const response = await fetch(`/api/presentations/${presentationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete");
        }

        // Clear local state if this is the current presentation
        if (presentation?.id === presentationId) {
          setPresentation(null);
          setGenerationState({ status: "idle", totalSlides: 7 });
        }

        toast.success("Presentation deleted");
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete presentation");
      }
    },
    [user, presentation?.id]
  );

  // Debounced save for auto-save after edits (silent - no toast)
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        if (user && presentation?.isSaved && shouldAutoSaveRef.current) {
          // Only save if content actually changed
          const currentHash = getContentHash(presentation);
          if (currentHash && currentHash !== lastSavedContentRef.current) {
            lastSavedContentRef.current = currentHash;
            savePresentation(true); // silent auto-save
          }
        }
      }, 2000),
    [user, presentation, savePresentation, getContentHash]
  );

  // Auto-save after generation completes
  useEffect(() => {
    if (
      generationState.status === "complete" &&
      user &&
      presentation &&
      !presentation.isSaved
    ) {
      // First save after generation - set the content hash
      lastSavedContentRef.current = getContentHash(presentation);
      savePresentation();
    }
  }, [generationState.status, user, presentation?.isSaved, savePresentation, presentation, getContentHash]);

  // Auto-save after edits (debounced)
  useEffect(() => {
    if (presentation?.isSaved && shouldAutoSaveRef.current) {
      debouncedSave();
    }
    return () => debouncedSave.cancel();
  }, [
    presentation?.slides,
    presentation?.topic,
    presentation?.style,
    presentation?.isSaved,
    debouncedSave,
  ]);

  // Save after image regeneration to upload new images
  useEffect(() => {
    if (needsImageUploadRef.current && user && presentation?.isSaved) {
      needsImageUploadRef.current = false;
      savePresentation(true); // silent save to upload images
    }
  }, [presentation?.slides, user, presentation?.isSaved, savePresentation]);

  // Auto-load presentation from localStorage on mount (when user is authenticated)
  useEffect(() => {
    // Only attempt once, skip if no user or already have a presentation
    if (autoLoadAttemptedRef.current || !user || presentation) return;
    autoLoadAttemptedRef.current = true;

    const savedId = storage.getActivePresentationId();
    if (savedId) {
      loadPresentation(savedId);
    }
  }, [user, presentation, loadPresentation]);

  return {
    presentation,
    generationState,
    regeneratingSlideId,
    isSaving,
    lastSaved,
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
    savePresentation,
    loadPresentation,
    deletePresentation,
  };
}
