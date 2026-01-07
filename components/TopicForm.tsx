"use client";

import { useState, useCallback, useRef } from "react";
import { SlideStyle, DEFAULT_STYLE, STYLE_LIST } from "@/lib/styles";
import { AbsurdityLevel, DEFAULT_ABSURDITY } from "@/lib/absurdity";
import type { AttachedImage } from "@/lib/types";
import StylePicker from "./StylePicker";
import AbsurditySlider from "./AbsurditySlider";
import BulletPointsSlider, { BulletPointsCount, DEFAULT_BULLET_POINTS } from "./BulletPointsSlider";
import SlideCountSlider, { SlideCount, DEFAULT_SLIDE_COUNT } from "./SlideCountSlider";
import { MAX_TOPIC_LENGTH, MAX_CONTEXT_LENGTH, MAX_IMAGES, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

interface TopicFormProps {
  onSubmit: (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: BulletPointsCount, slideCount: SlideCount, customStylePrompt?: string, context?: string, attachedImages?: AttachedImage[], useWebSearch?: boolean) => void;
  isLoading: boolean;
  hasApiKey: boolean;
  onSetApiKey: () => void;
}

const EXAMPLE_TOPICS = [
  "Why Your Cat Is Plotting Against You",
  "Conspiracy Theories About Furniture",
  "Dating Advice from a Raccoon",
  "My Grandmother's WiFi Password",
  "Things I've Yelled at Printers",
];

// Random topic generator components
const TEMPLATES = [
  "Why {subject} {verb} {object}",
  "The Secret Life of {object}",
  "{subject}'s Guide to {activity}",
  "What {subject} Doesn't Want You to Know About {object}",
  "How to {verb} {object} Like a {subject}",
  "{activity}: A {subject} Perspective",
  "Things {subject} Would Say About {object}",
  "If {subject} Ran {place}",
  "The Real Reason {subject} {verb} {object}",
  "{object}: Friend or Foe?",
];

const SUBJECTS = [
  "Your Cat", "Raccoons", "Grandma", "Pigeons", "Toddlers", "Aliens",
  "My Dentist", "Squirrels", "That One Coworker", "Ghosts", "Ducks",
  "Time Travelers", "Your WiFi Router", "Houseplants", "Seagulls",
];

const VERBS = [
  "Is Secretly Running", "Invented", "Is Afraid of", "Communicates Through",
  "Dreams About", "Is Obsessed With", "Judges You For", "Declared War On",
];

const OBJECTS = [
  "Furniture", "Printers", "Tupperware Lids", "Elevator Buttons",
  "Grocery Store Carts", "USB Cables", "Socks", "Parking Lots",
  "Microwave Beeps", "Shower Thoughts", "Vending Machines", "Traffic Cones",
];

const ACTIVITIES = [
  "Surviving Mondays", "Parallel Parking", "Small Talk", "Folding Fitted Sheets",
  "Understanding Art", "Making Friends", "Time Management", "Looking Busy",
];

const PLACES = [
  "a Coffee Shop", "the DMV", "Your Kitchen", "a Haunted House",
  "NASA", "a Daycare", "the Zoo", "Furniture Store",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomTopic(): string {
  const template = pickRandom(TEMPLATES);
  return template
    .replace("{subject}", pickRandom(SUBJECTS))
    .replace("{verb}", pickRandom(VERBS))
    .replace("{object}", pickRandom(OBJECTS))
    .replace("{activity}", pickRandom(ACTIVITIES))
    .replace("{place}", pickRandom(PLACES));
}

// Available options for roulette (excluding "custom" style)
const ROULETTE_STYLES = STYLE_LIST.filter((s) => s.id !== "custom").map((s) => s.id);
const ABSURDITY_OPTIONS: AbsurdityLevel[] = [1, 2, 3, 4, 5];
const BULLET_OPTIONS: BulletPointsCount[] = [1, 2, 3, 4];
const SLIDE_OPTIONS: SlideCount[] = [5, 6, 7, 8, 9, 10];

export default function TopicForm({ onSubmit, isLoading, hasApiKey, onSetApiKey }: TopicFormProps) {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<SlideStyle>(DEFAULT_STYLE);
  const [absurdity, setAbsurdity] = useState<AbsurdityLevel>(DEFAULT_ABSURDITY);
  const [bulletPoints, setBulletPoints] = useState<BulletPointsCount>(DEFAULT_BULLET_POINTS);
  const [slideCount, setSlideCount] = useState<SlideCount>(DEFAULT_SLIDE_COUNT);
  const [customPrompt, setCustomPrompt] = useState("");
  const [context, setContext] = useState("");
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [isImagesExpanded, setIsImagesExpanded] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      if (style === "custom" && !customPrompt.trim()) {
        return; // Don't submit if custom style is selected but no prompt provided
      }
      onSubmit(
        topic.trim(),
        style,
        absurdity,
        bulletPoints,
        slideCount,
        style === "custom" ? customPrompt.trim() : undefined,
        context.trim() || undefined,
        attachedImages.length > 0 ? attachedImages : undefined,
        useWebSearch
      );
    }
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
  };

  const handleRandomTopic = () => {
    setTopic(generateRandomTopic());
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - attachedImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: AttachedImage[] = [];

    for (const file of filesToProcess) {
      // Validate file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }

      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(file);
      });

      newImages.push({
        data: base64,
        mimeType: file.type,
        useForContent: true,  // Default: use for content guidance
        useForVisual: false,  // Default: don't use for visual style
      });
    }

    setAttachedImages((prev) => [...prev, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleImageOption = (index: number, option: "useForContent" | "useForVisual") => {
    setAttachedImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, [option]: !img[option] } : img
      )
    );
  };

  const handleRoulette = useCallback(() => {
    if (isSpinning || isLoading) return;

    // Pick final values upfront
    const finalStyle = pickRandom(ROULETTE_STYLES);
    const finalAbsurdity = pickRandom(ABSURDITY_OPTIONS);
    const finalBullets = pickRandom(BULLET_OPTIONS);
    const finalSlides = pickRandom(SLIDE_OPTIONS);
    const finalTopic = generateRandomTopic();

    setIsSpinning(true);

    let iteration = 0;
    const totalIterations = 20;
    const baseDelay = 50;

    const spin = () => {
      iteration++;

      // Cycle through random values during spin
      if (iteration < totalIterations) {
        setStyle(pickRandom(ROULETTE_STYLES));
        setAbsurdity(pickRandom(ABSURDITY_OPTIONS));
        setBulletPoints(pickRandom(BULLET_OPTIONS));
        setSlideCount(pickRandom(SLIDE_OPTIONS));

        // Gradually change topic letters for effect
        if (iteration % 3 === 0) {
          setTopic(generateRandomTopic());
        }

        // Ease out: delay increases as we approach the end
        const progress = iteration / totalIterations;
        const delay = baseDelay + Math.pow(progress, 2) * 200;

        spinTimeoutRef.current = setTimeout(spin, delay);
      } else {
        // Set final values
        setStyle(finalStyle);
        setAbsurdity(finalAbsurdity);
        setBulletPoints(finalBullets);
        setSlideCount(finalSlides);
        setTopic(finalTopic);
        setContext("");
        setIsContextExpanded(false);
        setAttachedImages([]);
        setIsImagesExpanded(false);
        setIsSpinning(false);
      }
    };

    spin();
  }, [isSpinning, isLoading]);

  const isCustomMissingPrompt = style === "custom" && !customPrompt.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      {/* Big Lucky Button */}
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={handleRoulette}
          disabled={isLoading || isSpinning}
          className={`
            relative group
            px-8 py-4
            rounded-full
            font-bold text-lg
            transition-all duration-150
            disabled:cursor-not-allowed
            ${isSpinning
              ? "scale-95"
              : "hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(250,204,21,0.5)]"
            }
          `}
          style={{
            background: isSpinning
              ? "linear-gradient(180deg, #facc15 0%, #eab308 100%)"
              : "linear-gradient(180deg, #fef08a 0%, #fde047 100%)",
            boxShadow: isSpinning
              ? "0 4px 0 #a16207, 0 6px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.4)"
              : "0 6px 0 #eab308, 0 8px 25px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.5)",
            transform: isSpinning ? "translateY(4px)" : undefined,
          }}
        >
          <span className={`
            flex items-center gap-3 text-black drop-shadow-sm
            ${isSpinning ? "animate-pulse" : ""}
          `}>
            <img
              src="/banana.svg"
              alt=""
              className={`w-7 h-7 ${isSpinning ? "animate-spin" : "group-hover:rotate-[360deg] transition-transform duration-700"}`}
            />
            {isSpinning ? "Going Bananas..." : "I'm Feeling Lucky"}
          </span>
          {/* Shine effect */}
          {!isSpinning && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          )}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black px-4 text-sm text-white/30">or customize your chaos</span>
        </div>
      </div>

      <StylePicker
        selected={style}
        onChange={setStyle}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
        disabled={isLoading || isSpinning}
      />
      <AbsurditySlider value={absurdity} onChange={setAbsurdity} disabled={isLoading || isSpinning} />
      <div className="grid grid-cols-2 gap-4">
        <BulletPointsSlider value={bulletPoints} onChange={setBulletPoints} disabled={isLoading || isSpinning} />
        <SlideCountSlider value={slideCount} onChange={setSlideCount} disabled={isLoading || isSpinning} />
      </div>

      <div className="relative mb-4 flex gap-3">
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic..."
          disabled={isLoading || isSpinning}
          className="flex-1 px-6 py-5 text-lg bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-1 focus:ring-white/30 focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/30 outline-none transition-all"
          maxLength={MAX_TOPIC_LENGTH}
        />
        <button
          type="button"
          onClick={handleRandomTopic}
          disabled={isLoading || isSpinning}
          className="group px-5 rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
            boxShadow: "0 4px 0 #27272a, 0 6px 15px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.1)",
          }}
          title="Random topic"
        >
          <svg className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setUseWebSearch(!useWebSearch)}
          disabled={isLoading || isSpinning}
          className={`group px-5 rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 ${
            useWebSearch ? "" : "opacity-50"
          }`}
          style={{
            background: useWebSearch
              ? "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)"
              : "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)",
            boxShadow: useWebSearch
              ? "0 4px 0 #1d4ed8, 0 6px 15px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.2)"
              : "0 4px 0 #27272a, 0 6px 15px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.1)",
          }}
          title={useWebSearch ? "Web search enabled" : "Web search disabled"}
        >
          <svg className={`w-6 h-6 transition-colors ${useWebSearch ? "text-white" : "text-white/70 group-hover:text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </button>
      </div>

      {/* Expandable context section */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setIsContextExpanded(!isContextExpanded)}
          disabled={isLoading || isSpinning}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isContextExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Add context (optional)
        </button>
        {isContextExpanded && (
          <div className="mt-3">
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, MAX_CONTEXT_LENGTH))}
              placeholder="Add details about your audience, key points to cover, or specific angle..."
              disabled={isLoading || isSpinning}
              className="w-full px-4 py-3 text-sm bg-white/[0.03] border border-white/10 rounded-xl focus:ring-1 focus:ring-white/30 focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/30 outline-none transition-all resize-none"
              rows={3}
              maxLength={MAX_CONTEXT_LENGTH}
            />
            <div className="mt-1 text-right text-xs text-white/30">
              {context.length} / {MAX_CONTEXT_LENGTH}
            </div>
          </div>
        )}
      </div>

      {/* Image attachments section */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => setIsImagesExpanded(!isImagesExpanded)}
          disabled={isLoading || isSpinning}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isImagesExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Attach images (optional)
          {attachedImages.length > 0 && (
            <span className="text-white/30">
              ({attachedImages.length}/{MAX_IMAGES})
            </span>
          )}
        </button>

        {/* Expanded image section with previews and add button */}
        {isImagesExpanded && (
          <div className="mt-3 flex flex-wrap gap-3">
            {/* Existing image previews with toggles */}
            {attachedImages.map((image, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Toggle buttons */}
                <div className="flex gap-1 justify-center">
                  <button
                    type="button"
                    onClick={() => handleToggleImageOption(index, "useForContent")}
                    disabled={isLoading || isSpinning}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-all disabled:opacity-50 ${
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
                    disabled={isLoading || isSpinning}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition-all disabled:opacity-50 ${
                      image.useForVisual
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/30 border border-white/10 hover:border-white/20"
                    }`}
                    title="Use for visual style"
                  >
                    V
                  </button>
                </div>
              </div>
            ))}

            {/* Add image button */}
            {attachedImages.length < MAX_IMAGES && (
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isSpinning}
                  className="w-16 h-16 rounded-lg border border-dashed border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                {/* Spacer to align with toggle buttons */}
                <div className="h-[18px]" />
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!topic.trim() || isLoading || isSpinning || isCustomMissingPrompt || !hasApiKey}
        className="w-full py-4 px-6 text-black text-lg font-bold rounded-2xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
          boxShadow: "0 4px 0 #a1a1aa, 0 6px 20px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.8)",
        }}
      >
        {isLoading ? "Generating..." : "Generate Slides"}
      </button>

      {!hasApiKey && (
        <p className="mt-3 text-center text-sm text-amber-400/80">
          Please{" "}
          <button
            type="button"
            onClick={onSetApiKey}
            className="underline hover:text-amber-300 transition-colors"
          >
            set your API key
          </button>{" "}
          to generate slides.
        </p>
      )}

      <div className="mt-8">
        <p className="text-sm text-white/30 mb-3 text-center">Or try one of these:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={isLoading || isSpinning}
              className="px-4 py-2 text-sm bg-white/[0.03] text-white/50 rounded-full hover:bg-white/[0.08] hover:text-white/80 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
