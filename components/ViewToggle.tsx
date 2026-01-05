"use client";

interface ViewToggleProps {
  currentView: "grid" | "slideshow";
  onToggle: (view: "grid" | "slideshow") => void;
}

export default function ViewToggle({ currentView, onToggle }: ViewToggleProps) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }}>
      <button
        onClick={() => onToggle("grid")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
          currentView === "grid"
            ? "text-black"
            : "text-white/50 hover:text-white hover:scale-105"
        }`}
        style={currentView === "grid" ? {
          background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
          boxShadow: "0 2px 0 #a1a1aa, inset 0 1px 0 rgba(255,255,255,0.8)",
        } : undefined}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Grid
      </button>
      <button
        onClick={() => onToggle("slideshow")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
          currentView === "slideshow"
            ? "text-black"
            : "text-white/50 hover:text-white hover:scale-105"
        }`}
        style={currentView === "slideshow" ? {
          background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
          boxShadow: "0 2px 0 #a1a1aa, inset 0 1px 0 rgba(255,255,255,0.8)",
        } : undefined}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Present
      </button>
    </div>
  );
}
