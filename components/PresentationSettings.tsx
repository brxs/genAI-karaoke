"use client";

import { useRef } from "react";
import { SlideStyle, STYLE_LIST } from "@/lib/styles";
import { AbsurdityLevel, ABSURDITY_LEVELS } from "@/lib/absurdity";
import type { AttachedImage } from "@/lib/types";

const MAX_CONTEXT_LENGTH = 3000;
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PresentationSettingsProps {
  style: SlideStyle;
  absurdity: AbsurdityLevel;
  customStylePrompt?: string;
  context?: string;
  attachedImages?: AttachedImage[];
  onStyleChange: (style: SlideStyle) => void;
  onAbsurdityChange: (absurdity: AbsurdityLevel) => void;
  onCustomStylePromptChange: (prompt: string) => void;
  onContextChange?: (context: string | undefined) => void;
  onAttachedImagesChange?: (images: AttachedImage[] | undefined) => void;
}

export default function PresentationSettings({
  style,
  absurdity,
  customStylePrompt = "",
  context,
  attachedImages,
  onStyleChange,
  onAbsurdityChange,
  onCustomStylePromptChange,
  onContextChange,
  onAttachedImagesChange,
}: PresentationSettingsProps) {
  const currentAbsurdity = ABSURDITY_LEVELS.find((a) => a.level === absurdity);
  const currentStyle = STYLE_LIST.find((s) => s.id === style);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onAttachedImagesChange) return;

    const currentImages = attachedImages || [];
    const remainingSlots = MAX_IMAGES - currentImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: AttachedImage[] = [];

    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Max size is 10MB.`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });

      newImages.push({
        data: base64,
        mimeType: file.type,
        useForContent: true,
        useForVisual: false,
      });
    }

    onAttachedImagesChange([...currentImages, ...newImages]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!onAttachedImagesChange || !attachedImages) return;
    const updated = attachedImages.filter((_, i) => i !== index);
    onAttachedImagesChange(updated.length > 0 ? updated : undefined);
  };

  const handleToggleImageOption = (index: number, option: "useForContent" | "useForVisual") => {
    if (!onAttachedImagesChange || !attachedImages) return;
    const updated = attachedImages.map((img, i) =>
      i === index ? { ...img, [option]: !img[option] } : img
    );
    onAttachedImagesChange(updated);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8">
      <div className="border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white/70 font-medium">Presentation Settings</span>
            <span className="text-xs text-white/30 ml-2">Changes apply when you regenerate slides</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Style Picker - Compact Grid */}
          <div className="mb-6">
            <p className="text-sm text-white/40 mb-3">Visual Style</p>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {STYLE_LIST.map((styleOption) => {
                const isSelected = style === styleOption.id;
                return (
                  <button
                    key={styleOption.id}
                    type="button"
                    onClick={() => onStyleChange(styleOption.id)}
                    className={`relative flex flex-col items-center p-2 rounded-xl border backdrop-blur-sm transition-all ${
                      isSelected
                        ? "border-white/30 bg-white/10"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                    title={styleOption.name}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${styleOption.gradient} flex items-center justify-center text-white`}
                    >
                      <StyleIcon icon={styleOption.icon} />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/30 mt-2">
              Selected: <span className="text-white/50">{currentStyle?.name}</span>
            </p>

            {/* Custom style prompt input */}
            {style === "custom" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customStylePrompt}
                  onChange={(e) => onCustomStylePromptChange(e.target.value)}
                  placeholder="Describe your style (e.g., 'Watercolor painting with soft pastels')"
                  className="w-full px-4 py-2.5 text-sm bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all"
                  maxLength={200}
                />
              </div>
            )}
          </div>

          {/* Absurdity Level - Compact */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Absurdity Level</p>
              <p className="text-sm">
                <span className="font-medium text-white">{currentAbsurdity?.name}</span>
                <span className="text-white/40 ml-2">— {currentAbsurdity?.description}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {ABSURDITY_LEVELS.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => onAbsurdityChange(level.level)}
                  className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    absurdity === level.level
                      ? "bg-white text-black"
                      : "bg-white/[0.03] text-white/40 hover:bg-white/[0.08] hover:text-white/70 border border-white/5"
                  }`}
                >
                  {level.level}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/30">
              <span>Factual</span>
              <span>Fever Dream</span>
            </div>
          </div>

          {/* Context - Editable */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/40">Context</p>
              {onContextChange && context && (
                <span className="text-xs text-white/30">
                  {context.length} / {MAX_CONTEXT_LENGTH}
                </span>
              )}
            </div>
            {onContextChange ? (
              <textarea
                value={context || ""}
                onChange={(e) => onContextChange(e.target.value || undefined)}
                placeholder="Add details about your audience, key points to cover, or specific angle..."
                className="w-full px-3 py-2 text-sm bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 text-white placeholder-white/30 outline-none transition-all resize-none"
                rows={3}
                maxLength={MAX_CONTEXT_LENGTH}
              />
            ) : context ? (
              <p className="text-sm text-white/60 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                {context.length > 200 ? `${context.slice(0, 200)}...` : context}
              </p>
            ) : (
              <p className="text-sm text-white/30 italic">None provided</p>
            )}
          </div>

          {/* Attached Images - Editable */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/40">Reference Images</p>
              {onAttachedImagesChange && (
                <span className="text-xs text-white/30">
                  {attachedImages?.length || 0} / {MAX_IMAGES}
                </span>
              )}
            </div>

            {/* Hidden file input */}
            {onAttachedImagesChange && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            )}

            <div className="flex flex-wrap gap-2">
              {attachedImages && attachedImages.length > 0 && attachedImages.map((image, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={`data:${image.mimeType};base64,${image.data}`}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {onAttachedImagesChange && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {onAttachedImagesChange ? (
                    <div className="flex gap-0.5 justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleImageOption(index, "useForContent")}
                        className={`px-1 py-0.5 text-[8px] rounded transition-all ${
                          image.useForContent
                            ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                            : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                        }`}
                        title="Use for content guidance"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleImageOption(index, "useForVisual")}
                        className={`px-1 py-0.5 text-[8px] rounded transition-all ${
                          image.useForVisual
                            ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                            : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                        }`}
                        title="Use for visual style"
                      >
                        V
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-0.5 justify-center">
                      {image.useForContent && (
                        <span className="px-1 py-0.5 text-[8px] rounded bg-blue-500/30 text-blue-300 border border-blue-500/50">C</span>
                      )}
                      {image.useForVisual && (
                        <span className="px-1 py-0.5 text-[8px] rounded bg-purple-500/30 text-purple-300 border border-purple-500/50">V</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add image button */}
              {onAttachedImagesChange && (!attachedImages || attachedImages.length < MAX_IMAGES) && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-12 h-12 rounded-lg border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}

              {/* Empty state */}
              {(!attachedImages || attachedImages.length === 0) && !onAttachedImagesChange && (
                <p className="text-sm text-white/30 italic">None attached</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact icon component - reusing the same icons from StylePicker
function StyleIcon({ icon }: { icon: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    briefcase: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    sunset: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    pencil: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    rocket: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    scroll: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    sparkles: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    zap: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    cloud: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
    gamepad: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    minus: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14" />
      </svg>
    ),
    leaf: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-4-4-8-7-8-11a8 8 0 1116 0c0 4-4 7-8 11z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 13V7m0 0l-2 2m2-2l2 2" />
      </svg>
    ),
    newspaper: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    eye: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    heart: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    cpu: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
    droplet: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-4.5 0-7.5-3.5-7.5-7.5 0-5 7.5-11.5 7.5-11.5s7.5 6.5 7.5 11.5c0 4-3 7.5-7.5 7.5z" />
      </svg>
    ),
    crown: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L4.5 6l5.25 4.5L12 3l2.25 7.5L19.5 6l2.25 12H2.25z" />
      </svg>
    ),
    skull: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5c-4.5 0-7.5 3-7.5 7 0 2.5 1 4.5 3 5.5v2.5a1 1 0 001 1h7a1 1 0 001-1V17c2-1 3-3 3-5.5 0-4-3-7-7.5-7z" />
        <circle cx="9" cy="10" r="1.5" strokeWidth={1.5} />
        <circle cx="15" cy="10" r="1.5" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19.5v-2m4 2v-2" />
      </svg>
    ),
  };

  return iconMap[icon] || null;
}
