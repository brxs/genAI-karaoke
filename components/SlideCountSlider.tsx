"use client";

export type SlideCount = 5 | 6 | 7 | 8 | 9 | 10;

interface SlideCountSliderProps {
  value: SlideCount;
  onChange: (value: SlideCount) => void;
  disabled?: boolean;
}

export const DEFAULT_SLIDE_COUNT: SlideCount = 7;

export default function SlideCountSlider({ value, onChange, disabled }: SlideCountSliderProps) {
  const options: SlideCount[] = [5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/30">Number of slides</p>
        <span className="text-sm text-white/50">{value} slides</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            disabled={disabled}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              value === opt
                ? "bg-white/10 text-white border border-white/30"
                : "bg-white/[0.02] text-white/50 border border-white/5 hover:bg-white/[0.05] hover:border-white/10"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
