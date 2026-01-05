"use client";

import { AbsurdityLevel, ABSURDITY_LEVELS } from "@/lib/absurdity";

interface AbsurditySliderProps {
  value: AbsurdityLevel;
  onChange: (level: AbsurdityLevel) => void;
  disabled?: boolean;
}

export default function AbsurditySlider({ value, onChange, disabled }: AbsurditySliderProps) {
  const currentConfig = ABSURDITY_LEVELS.find((a) => a.level === value);

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/30">Absurdity level</p>
        <p className="text-sm text-white/60">
          <span className="font-medium text-white">{currentConfig?.name}</span>
          <span className="text-white/40 ml-2">— {currentConfig?.description}</span>
        </p>
      </div>

      <div className="relative">
        <div className="flex justify-between mb-2">
          {ABSURDITY_LEVELS.map((level) => (
            <button
              key={level.level}
              type="button"
              onClick={() => onChange(level.level)}
              disabled={disabled}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                value === level.level
                  ? "bg-white text-black"
                  : "bg-white/[0.03] text-white/40 hover:bg-white/[0.08] hover:text-white/70 border border-white/5"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {level.level}
            </button>
          ))}
        </div>

        <div className="relative h-1 bg-white/5 rounded-full mt-1">
          <div
            className="absolute h-full bg-gradient-to-r from-white/20 to-white/60 rounded-full transition-all"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>Factual</span>
          <span>Fever Dream</span>
        </div>
      </div>
    </div>
  );
}
