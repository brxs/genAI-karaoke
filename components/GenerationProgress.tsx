"use client";

import { GenerationState } from "@/lib/types";

interface GenerationProgressProps {
  state: GenerationState;
}

const STEPS = [
  { key: "generating-outline", label: "Writing the script" },
  { key: "generating-prompts", label: "Planning visuals" },
  { key: "generating-images", label: "Rendering slides" },
];

export default function GenerationProgress({ state }: GenerationProgressProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.key === state.status);

  const getStepStatus = (index: number) => {
    if (state.status === "complete") return "complete";
    if (state.status === "error") {
      return index <= currentStepIndex ? "error" : "pending";
    }
    if (index < currentStepIndex) return "complete";
    if (index === currentStepIndex) return "active";
    return "pending";
  };

  return (
    <div className="w-full max-w-md">
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const status = getStepStatus(index);
          const isImageStep = step.key === "generating-images";

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border ${
                  status === "complete"
                    ? "bg-white/10 border-white/20 text-white"
                    : status === "active"
                    ? "bg-white/10 border-white/30 text-white"
                    : status === "error"
                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                    : "bg-white/[0.02] border-white/5 text-white/30"
                }`}
              >
                {status === "complete" ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : status === "active" ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    status === "active" ? "text-white" : status === "complete" ? "text-white/70" : "text-white/30"
                  }`}
                >
                  {step.label}
                  {isImageStep && status === "active" && state.currentSlide !== undefined && (
                    <span className="ml-2 text-sm font-normal text-white/40">
                      {state.currentSlide}/{state.totalSlides}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {state.status === "error" && state.error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {state.status === "generating-images" && (
        <div className="mt-6">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 transition-all duration-300"
              style={{
                width: `${((state.currentSlide ?? 0) / state.totalSlides) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
