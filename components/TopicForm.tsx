"use client";

import { useState } from "react";
import { SlideStyle, DEFAULT_STYLE } from "@/lib/styles";
import { AbsurdityLevel, DEFAULT_ABSURDITY } from "@/lib/absurdity";
import StylePicker from "./StylePicker";
import AbsurditySlider from "./AbsurditySlider";
import BulletPointsSlider, { BulletPointsCount, DEFAULT_BULLET_POINTS } from "./BulletPointsSlider";
import SlideCountSlider, { SlideCount, DEFAULT_SLIDE_COUNT } from "./SlideCountSlider";

interface TopicFormProps {
  onSubmit: (topic: string, style: SlideStyle, absurdity: AbsurdityLevel, maxBulletPoints: BulletPointsCount, slideCount: SlideCount, customStylePrompt?: string) => void;
  isLoading: boolean;
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

export default function TopicForm({ onSubmit, isLoading }: TopicFormProps) {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<SlideStyle>(DEFAULT_STYLE);
  const [absurdity, setAbsurdity] = useState<AbsurdityLevel>(DEFAULT_ABSURDITY);
  const [bulletPoints, setBulletPoints] = useState<BulletPointsCount>(DEFAULT_BULLET_POINTS);
  const [slideCount, setSlideCount] = useState<SlideCount>(DEFAULT_SLIDE_COUNT);
  const [customPrompt, setCustomPrompt] = useState("");

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

  const isCustomMissingPrompt = style === "custom" && !customPrompt.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <StylePicker
        selected={style}
        onChange={setStyle}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
        disabled={isLoading}
      />
      <AbsurditySlider value={absurdity} onChange={setAbsurdity} disabled={isLoading} />
      <div className="grid grid-cols-2 gap-4">
        <BulletPointsSlider value={bulletPoints} onChange={setBulletPoints} disabled={isLoading} />
        <SlideCountSlider value={slideCount} onChange={setSlideCount} disabled={isLoading} />
      </div>

      <div className="relative mb-4 flex gap-3">
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter any topic..."
          disabled={isLoading}
          className="flex-1 px-6 py-5 text-lg bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-1 focus:ring-white/30 focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/30 outline-none transition-all"
          maxLength={200}
        />
        <button
          type="button"
          onClick={handleRandomTopic}
          disabled={isLoading}
          className="px-5 py-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
          title="Surprise me!"
        >
          <svg className="w-6 h-6 text-white/50 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </button>
      </div>

      <button
        type="submit"
        disabled={!topic.trim() || isLoading || isCustomMissingPrompt}
        className="w-full py-4 px-6 bg-white text-black text-lg font-medium rounded-2xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? "Generating..." : "Generate Slides"}
      </button>

      <div className="mt-8">
        <p className="text-sm text-white/30 mb-3 text-center">Or try one of these:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
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
