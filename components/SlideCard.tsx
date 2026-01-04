"use client";

import { Slide } from "@/lib/types";

interface SlideCardProps {
  slide: Slide;
  isFullScreen?: boolean;
  isTrueFullscreen?: boolean;
  onClick?: () => void;
  onRetry?: () => void;
}

export default function SlideCard({ slide, isFullScreen = false, isTrueFullscreen = false, onClick, onRetry }: SlideCardProps) {
  const cardClasses = isFullScreen
    ? isTrueFullscreen
      ? "w-full h-full max-w-[95vw] max-h-[85vh] mx-auto"
      : "w-full h-full max-w-5xl max-h-[80vh] mx-auto"
    : "w-full aspect-[16/9] cursor-pointer hover:ring-1 hover:ring-white/20 transition-all";

  // When image is available, show full slide image
  if (slide.imageBase64) {
    return (
      <div
        onClick={onClick}
        className={`relative bg-zinc-900 rounded-xl overflow-hidden border border-white/5 ${cardClasses}`}
      >
        {/* Slide number badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/10">
            {slide.isTitleSlide ? "Title" : slide.slideNumber}
          </span>
        </div>
        <img
          src={`data:image/png;base64,${slide.imageBase64}`}
          alt={slide.title}
          className="w-full h-full object-contain bg-black"
        />
      </div>
    );
  }

  // Loading or error state - show text content as preview
  return (
    <div
      onClick={onClick}
      className={`relative bg-zinc-900 rounded-xl overflow-hidden flex flex-col border border-white/5 ${cardClasses}`}
    >
      {/* Slide number badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-white/10">
          {slide.isTitleSlide ? "Title" : slide.slideNumber}
        </span>
      </div>

      {/* Loading indicator or error */}
      {!slide.imageError && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}

      {slide.imageError && (
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg border border-red-500/20">
            Failed
          </span>
          {onRetry && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg border border-white/20 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Slide content preview */}
      {slide.isTitleSlide ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h3
            className={`font-bold text-white text-center ${
              isFullScreen ? "text-5xl" : "text-2xl"
            }`}
          >
            {slide.title}
          </h3>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center p-6 pt-12">
          <h3
            className={`font-semibold text-white mb-4 ${
              isFullScreen ? "text-4xl" : "text-lg line-clamp-2"
            }`}
          >
            {slide.title}
          </h3>
          <ul className={`space-y-2 ${isFullScreen ? "text-xl" : "text-sm"}`}>
            {slide.bulletPoints.map((point, index) => (
              <li key={index} className="flex gap-2 text-white/70">
                <span className="text-white/40 flex-shrink-0">•</span>
                <span className={isFullScreen ? "" : "line-clamp-1"}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
