"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Slide } from "@/lib/types";
import { downloadSlide } from "@/lib/download";
import SortableSlideCard from "./SortableSlideCard";
import AddSlideCard from "./AddSlideCard";

interface GridViewProps {
  slides: Slide[];
  topic: string;
  onSlideClick: (index: number) => void;
  onRetrySlide?: (index: number) => void;
  onDeleteSlide?: (index: number) => void;
  onRegenerateSlide?: (index: number) => void;
  onReorderSlides?: (fromIndex: number, toIndex: number) => void;
  onAddSlide?: () => void;
}

export default function GridView({
  slides,
  topic,
  onSlideClick,
  onRetrySlide,
  onDeleteSlide,
  onRegenerateSlide,
  onReorderSlides,
  onAddSlide,
}: GridViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDownload = (e: React.MouseEvent, slide: Slide) => {
    e.stopPropagation();
    downloadSlide(slide, topic);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorderSlides) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);

      // Don't allow reordering to/from title slide position
      if (oldIndex > 0 && newIndex > 0) {
        onReorderSlides(oldIndex, newIndex);
      }
    }
  };

  // Get sortable IDs (use unique slide.id for stable keys)
  const sortableIds = slides.map((s) => s.id);

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {slides.map((slide, index) => (
              <SortableSlideCard
                key={slide.id}
                slide={slide}
                onClick={() => onSlideClick(index)}
                onRetry={onRetrySlide ? () => onRetrySlide(index) : undefined}
                onDelete={onDeleteSlide ? () => onDeleteSlide(index) : undefined}
                onRegenerate={onRegenerateSlide ? () => onRegenerateSlide(index) : undefined}
                onDownload={slide.imageBase64 ? (e) => handleDownload(e, slide) : undefined}
                disabled={slide.isTitleSlide} // Title slide can't be dragged
              />
            ))}
            {onAddSlide && <AddSlideCard onClick={onAddSlide} />}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
