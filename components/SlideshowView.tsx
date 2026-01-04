"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Slide } from "@/lib/types";
import SlideCard from "./SlideCard";

interface SlideshowViewProps {
  slides: Slide[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
}

const AUTO_HIDE_DELAY = 3000;

export default function SlideshowView({
  slides,
  currentIndex,
  onIndexChange,
  onExit,
}: SlideshowViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < slides.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      onIndexChange(currentIndex - 1);
    }
  }, [canGoPrev, currentIndex, onIndexChange]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      onIndexChange(currentIndex + 1);
    }
  }, [canGoNext, currentIndex, onIndexChange]);

  const goToFirst = useCallback(() => {
    onIndexChange(0);
  }, [onIndexChange]);

  const goToLast = useCallback(() => {
    onIndexChange(slides.length - 1);
  }, [onIndexChange, slides.length]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      onIndexChange(index);
    }
  }, [onIndexChange, slides.length]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, AUTO_HIDE_DELAY);
  }, []);

  // Initialize auto-hide on mount and clean up
  useEffect(() => {
    showControls();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showControls]);

  // Handle mouse movement for auto-hide
  const handleMouseMove = useCallback(() => {
    showControls();
  }, [showControls]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          goToPrev();
          showControls();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goToNext();
          showControls();
          break;
        case "Escape":
          if (isBlackScreen) {
            setIsBlackScreen(false);
          } else if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onExit();
          }
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "Home":
          goToFirst();
          showControls();
          break;
        case "End":
          goToLast();
          showControls();
          break;
        case "b":
        case "B":
          setIsBlackScreen((prev) => !prev);
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          goToSlide(parseInt(e.key) - 1);
          showControls();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext, goToFirst, goToLast, goToSlide, onExit, toggleFullscreen, isFullscreen, isBlackScreen, showControls]);

  const currentSlide = slides[currentIndex];

  // Black screen overlay
  if (isBlackScreen) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
        onClick={() => setIsBlackScreen(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-sm">
          Press B or click to return
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex flex-col ${!controlsVisible ? "cursor-none" : ""}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div className="text-white/60 font-medium">
          {currentIndex + 1} / {slides.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
          <button
            onClick={onExit}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Exit (Escape)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Previous button */}
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed rounded-full text-white border border-white/10 transition-all z-10 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Current slide */}
        <div className="w-full h-full flex items-center justify-center">
          <SlideCard slide={currentSlide} isFullScreen isTrueFullscreen={isFullscreen} />
        </div>

        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed rounded-full text-white border border-white/10 transition-all z-10 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Footer with slide dots */}
      <div
        className={`flex justify-center gap-2 p-4 border-t border-white/5 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              onIndexChange(index);
              showControls();
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white" : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Keyboard shortcuts hint (shown when controls visible) */}
      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 text-white/30 text-xs transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="hidden sm:inline">
          Arrow keys to navigate &bull; F for fullscreen &bull; B for black screen &bull; 1-9 to jump
        </span>
      </div>
    </div>
  );
}
