"use client";

import { usePresentations, PresentationSummary } from "@/hooks/usePresentations";
import { formatDistanceToNow } from "date-fns";

interface PresentationsListProps {
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onCreate?: () => void;
}

export default function PresentationsList({
  onSelect,
  onDelete,
  onCreate,
}: PresentationsListProps) {
  const { presentations, loading, removeFromList } = usePresentations();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this presentation? This cannot be undone.")) return;

    try {
      await onDelete(id);
      removeFromList(id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="mt-12 w-full max-w-4xl">
        <h3 className="text-lg font-medium text-white/70 mb-4">
          Your Presentations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {onCreate && <CreateCard onClick={onCreate} />}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-video bg-white/5 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show section if there are presentations OR if onCreate is provided
  if (presentations.length === 0 && !onCreate) {
    return null;
  }

  return (
    <div className="mt-12 w-full max-w-4xl">
      <h3 className="text-lg font-medium text-white/70 mb-4">
        Your Presentations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {onCreate && <CreateCard onClick={onCreate} />}
        {presentations.map((presentation) => (
          <PresentationCard
            key={presentation.id}
            presentation={presentation}
            onSelect={() => onSelect(presentation.id)}
            onDelete={(e) => handleDelete(e, presentation.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CreateCard({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900/30 border border-dashed border-white/20 rounded-xl overflow-hidden cursor-pointer hover:border-white/40 hover:bg-zinc-900/50 transition-all flex flex-col"
    >
      <div className="aspect-video flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all group-hover:scale-110">
          <svg
            className="w-8 h-8 text-white/40 group-hover:text-white/70 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-white/50 group-hover:text-white/70 font-medium transition-colors">
          New Presentation
        </h4>
        <p className="text-white/30 text-sm">Start from scratch</p>
      </div>
    </div>
  );
}

function PresentationCard({
  presentation,
  onSelect,
  onDelete,
}: {
  presentation: PresentationSummary;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-white/20 transition-all hover:bg-zinc-900"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-black/50 relative">
        {presentation.thumbnailUrl ? (
          <img
            src={presentation.thumbnailUrl}
            alt={presentation.topic}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="Delete presentation"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        {/* Slide count badge */}
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 bg-black/60 text-white/70 text-xs rounded-lg">
            {presentation.slideCount} slides
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-white font-medium truncate">{presentation.topic}</h4>
        <p className="text-white/40 text-sm">
          {formatDistanceToNow(presentation.updatedAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
