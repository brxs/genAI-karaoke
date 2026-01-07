"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slide } from "@/lib/types";
import SlideCard from "./SlideCard";

interface SortableSlideCardProps {
  slide: Slide;
  onClick: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onDownload?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export default function SortableSlideCard({
  slide,
  onClick,
  onRetry,
  onDelete,
  onRegenerate,
  onDownload,
  disabled = false,
}: SortableSlideCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slide.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isTitleSlide = slide.isTitleSlide;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "z-50 opacity-80" : ""}`}
    >
      {/* Drag handle - only for non-title slides */}
      {!isTitleSlide && !disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 left-12 z-20 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-black/80 cursor-grab active:cursor-grabbing transition-all opacity-0 group-hover:opacity-100"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}

      {/* Right side action buttons */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
        {/* Delete button - only for non-title slides */}
        {!isTitleSlide && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-all"
            title="Delete slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}

        {/* Regenerate button */}
        {onRegenerate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate();
            }}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/50 hover:text-purple-400 hover:bg-purple-500/20 transition-all"
            title="Regenerate slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        {/* Download button */}
        {slide.imageBase64 && onDownload && (
          <button
            onClick={onDownload}
            className="p-2 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-black/80 transition-all"
            title="Download slide"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </div>

      <SlideCard slide={slide} onClick={onClick} onRetry={onRetry} />
    </div>
  );
}
