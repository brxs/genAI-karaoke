"use client";

interface AddSlideCardProps {
  onClick: () => void;
}

export default function AddSlideCard({ onClick }: AddSlideCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-3 group"
    >
      <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
        <svg className="w-6 h-6 text-white/50 group-hover:text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-white/50 group-hover:text-white/70 text-sm font-medium transition-colors">
        Add Slide
      </span>
    </button>
  );
}
