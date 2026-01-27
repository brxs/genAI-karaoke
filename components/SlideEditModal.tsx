"use client";

import { useState, useEffect, useCallback } from "react";
import { Slide } from "@/lib/types";
import SlideCard from "./SlideCard";
import { getPreferredMode } from "@/lib/generationMode";
import { TOKEN_COSTS } from "@/hooks/useTokens";

interface SlideSuggestion {
  title: string;
  bulletPoints: string[];
}

interface SlideEditModalProps {
  isOpen: boolean;
  slide: Slide | null;
  slideId: string | null;
  isRegenerating: boolean;
  topic?: string;
  existingTitles?: string[];
  onClose: () => void;
  onSave: (slideId: string, updates: { title: string; bulletPoints: string[] }) => void;
  onRegenerate: (slideId: string, updatedContent?: { title: string; bulletPoints: string[] }) => void;
  onDelete?: (slideId: string) => void;
}

export default function SlideEditModal({
  isOpen,
  slide,
  slideId,
  isRegenerating,
  topic,
  existingTitles,
  onClose,
  onSave,
  onRegenerate,
  onDelete,
}: SlideEditModalProps) {
  const [title, setTitle] = useState("");
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [suggestions, setSuggestions] = useState<SlideSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  // Check if this is a new slide (default title)
  const isNewSlide = slide?.title === "New Slide" && !slide?.imagePrompt;

  // Initialize form when slide changes
  useEffect(() => {
    if (slide) {
      setTitle(slide.title);
      setBulletPoints(slide.bulletPoints.length > 0 ? [...slide.bulletPoints] : [""]);
      setIsDirty(false);
    }
  }, [slide]);


  // Reset suggestions when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setSuggestionsError(null);
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    if (!topic) return;

    setIsLoadingSuggestions(true);
    setSuggestionsError(null);

    try {
      const res = await fetch("/api/generate-slide-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, existingTitles, preferredMode: getPreferredMode() }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate suggestions");
      }

      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setSuggestionsError(err instanceof Error ? err.message : "Failed to load suggestions");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: SlideSuggestion) => {
    setTitle(suggestion.title);
    setBulletPoints(suggestion.bulletPoints);
  };

  // Track changes
  useEffect(() => {
    if (slide) {
      const titleChanged = title !== slide.title;
      const bulletsChanged = JSON.stringify(bulletPoints.filter(b => b.trim())) !== JSON.stringify(slide.bulletPoints);
      setIsDirty(titleChanged || bulletsChanged);
    }
  }, [title, bulletPoints, slide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, title, bulletPoints, slideId]);

  const handleSave = useCallback(() => {
    if (!slideId) return;
    // Filter out empty bullet points
    const filteredBullets = bulletPoints.filter(b => b.trim());
    onSave(slideId, {
      title: title.trim(),
      bulletPoints: filteredBullets.length > 0 ? filteredBullets : [""]
    });
    onClose();
  }, [slideId, title, bulletPoints, onSave, onClose]);

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...bulletPoints];
    newBullets[index] = value;
    setBulletPoints(newBullets);
  };

  const addBullet = () => {
    setBulletPoints([...bulletPoints, ""]);
  };

  const removeBullet = (index: number) => {
    if (bulletPoints.length > 1) {
      setBulletPoints(bulletPoints.filter((_, i) => i !== index));
    }
  };

  const handleRegenerate = () => {
    if (!slideId) return;
    const filteredBullets = bulletPoints.filter(b => b.trim());
    const content = {
      title: title.trim(),
      bulletPoints: filteredBullets.length > 0 ? filteredBullets : [""]
    };
    // Pass content directly to avoid stale state issues
    onRegenerate(slideId, content);
  };

  if (!isOpen || !slide) return null;

  // Create preview slide with current edits
  const previewSlide: Slide = {
    ...slide,
    title,
    bulletPoints: bulletPoints.filter(b => b.trim()),
  };

  const isTitleSlide = slide.isTitleSlide;
  const canDelete = !isTitleSlide && onDelete;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isNewSlide ? "Add New Slide" : isTitleSlide ? "Edit Title Slide" : `Edit Slide ${slide.slideNumber}`}
          </h2>
          <div className="flex items-center gap-2">
            {canDelete && slideId && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(slideId);
                }}
                className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
              >
                Delete Slide
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Edit Form - Left Panel */}
          <div className="flex-1 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-6">
              {/* Suggestions for new slides */}
              {isNewSlide && !isTitleSlide && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-white/70">
                      Suggested Slides
                    </label>
                    {suggestions.length === 0 && !isLoadingSuggestions && (
                      <button
                        onClick={fetchSuggestions}
                        disabled={!topic}
                        className="px-3 py-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate Ideas ({TOKEN_COSTS.outline} tokens)
                      </button>
                    )}
                  </div>
                  {isLoadingSuggestions && (
                    <div className="flex items-center gap-3 text-white/50 text-sm py-4">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      Generating suggestions...
                    </div>
                  )}
                  {suggestionsError && (
                    <div className="text-red-400 text-sm py-2">
                      {suggestionsError}
                      <button
                        onClick={fetchSuggestions}
                        className="ml-2 text-white/50 hover:text-white underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  {suggestions.length === 0 && !isLoadingSuggestions && !suggestionsError && (
                    <p className="text-white/40 text-sm py-2">
                      Click &quot;Generate Ideas&quot; to get AI-powered slide suggestions, or create your own below.
                    </p>
                  )}
                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full text-left p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-xl transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {suggestion.title}
                              </p>
                              <p className="text-white/40 text-xs mt-1 line-clamp-2">
                                {suggestion.bulletPoints.slice(0, 2).join(" • ")}
                                {suggestion.bulletPoints.length > 2 && " •••"}
                              </p>
                            </div>
                            <span className="text-white/30 group-hover:text-white/60 text-xs flex-shrink-0">
                              Use this
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/40 mb-2">Or create your own:</p>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="slideTitle" className="block text-sm font-medium text-white/70 mb-2">
                  {isTitleSlide ? "Presentation Title" : "Slide Title"}
                </label>
                <input
                  id="slideTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all"
                  placeholder="Enter slide title..."
                />
              </div>

              {/* Bullet Points - Only for non-title slides */}
              {!isTitleSlide && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Bullet Points
                  </label>
                  <div className="space-y-3">
                    {bulletPoints.map((bullet, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="px-3 py-3 text-white/40">•</span>
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleBulletChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all"
                          placeholder="Enter bullet point..."
                        />
                        {bulletPoints.length > 1 && (
                          <button
                            onClick={() => removeBullet(index)}
                            className="p-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Remove bullet point"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addBullet}
                    className="mt-3 flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add bullet point
                  </button>
                </div>
              )}

              {/* Regenerate Button - only show here if slide has an image */}
              {(slide.imageBase64 || slide.imageUrl) && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: "linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)",
                      boxShadow: "0 3px 0 #4c1d95, 0 4px 12px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    {isRegenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isDirty ? "Save & Regenerate Image" : "Regenerate Image"}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-white/40 text-center mt-2">
                    This will generate a new image based on your content
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview - Right Panel */}
          <div className="flex-1 p-6 bg-black/30 flex flex-col">
            <p className="text-sm text-white/50 mb-4">Preview</p>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <SlideCard slide={previewSlide} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
              boxShadow: "0 3px 0 #27272a, 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            Cancel
          </button>
          {/* Show Generate Image button in footer when no image exists */}
          {!slide.imageBase64 && !slide.imageUrl && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: "0 3px 0 #4c1d95, 0 4px 12px rgba(124, 58, 237, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              {isRegenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isDirty ? "Save & Generate Image" : "Generate Image"}
                </>
              )}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2.5 text-black rounded-xl font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
              boxShadow: "0 3px 0 #a1a1aa, 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
