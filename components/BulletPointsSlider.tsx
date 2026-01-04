"use client";

export type BulletPointsCount = 1 | 2 | 3 | 4;

interface BulletPointsSliderProps {
  value: BulletPointsCount;
  onChange: (value: BulletPointsCount) => void;
  disabled?: boolean;
}

export const DEFAULT_BULLET_POINTS: BulletPointsCount = 3;

export default function BulletPointsSlider({ value, onChange, disabled }: BulletPointsSliderProps) {
  const options: BulletPointsCount[] = [1, 2, 3, 4];

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/30">Bullet points per slide</p>
        <span className="text-sm text-white/50">{value} {value === 1 ? "point" : "points"}</span>
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
