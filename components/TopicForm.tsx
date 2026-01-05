"use client";

import { useState, useCallback, useRef } from "react";
import { SlideStyle, DEFAULT_STYLE, STYLE_LIST } from "@/lib/styles";
import { AbsurdityLevel, DEFAULT_ABSURDITY } from "@/lib/absurdity";
import StylePicker from "./StylePicker";
import AbsurditySlider from "./AbsurditySlider";
import BulletPointsSlider, { BulletPointsCount, DEFAULT_BULLET_POINTS } from "./BulletPointsSlider";
import SlideCountSlider, { SlideCount, DEFAULT_SLIDE_COUNT } from "./SlideCountSlider";

interface TopicFormProps {
  onSubmit: (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: BulletPointsCount, slideCount: SlideCount, customStylePrompt?: string) => void;
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
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      if (style === "custom" && !customPrompt.trim()) {
        return; // Don't submit if custom style is selected but no prompt provided
      }
      onSubmit(topic.trim(), style, absurdity, bulletPoints, slideCount, style === "custom" ? customPrompt.trim() : undefined);
    }
  };

  const handleExampleClick = (example: string) => {
    setTopic(example);
  };

  const handleRandomTopic = () => {
    setTopic(generateRandomTopic());
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
          maxLength={200}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </button>
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
