"use client";

import { Slide } from "@/lib/types";
import { downloadSlide } from "@/lib/download";
import SlideCard from "./SlideCard";

interface GridViewProps {
  slides: Slide[];
  topic: string;
  onSlideClick: (index: number) => void;
  onRetrySlide?: (index: number) => void;
}

export default function GridView({ slides, topic, onSlideClick, onRetrySlide }: GridViewProps) {
  const handleDownload = (e: React.MouseEvent, slide: Slide) => {
    e.stopPropagation();
    downloadSlide(slide, topic);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {slides.map((slide, index) => (
          <div key={slide.slideNumber} className="relative group">
            <SlideCard
              slide={slide}
              onClick={() => onSlideClick(index)}
              onRetry={onRetrySlide ? () => onRetrySlide(index) : undefined}
            />
            {slide.imageBase64 && (
              <button
                onClick={(e) => handleDownload(e, slide)}
                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 z-20"
                title="Download slide"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
