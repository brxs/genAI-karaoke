export type AbsurdityLevel = 1 | 2 | 3 | 4 | 5;

export interface AbsurdityConfig {
  level: AbsurdityLevel;
  name: string;
  description: string;
  promptModifier: string;
}

export const ABSURDITY_LEVELS: AbsurdityConfig[] = [
  {
    level: 1,
    name: "Mild",
    description: "Slightly quirky, mostly believable",
    promptModifier: "Keep the content mildly humorous and quirky, but mostly grounded in reality. Use subtle wordplay and gentle irony. The slides should seem almost legitimate at first glance.",
  },
  {
    level: 2,
    name: "Playful",
    description: "Clearly joking, but coherent",
    promptModifier: "Make the content playfully absurd with obvious jokes and silly premises. Include some made-up but plausible-sounding facts. The humor should be clear but not over-the-top.",
  },
  {
    level: 3,
    name: "Absurd",
    description: "Ridiculous claims, fake statistics",
    promptModifier: "Create genuinely absurd content with ridiculous claims, fake statistics, and nonsensical logic. Include made-up quotes from fictional experts. The slides should make presenters struggle to keep a straight face.",
  },
  {
    level: 4,
    name: "Unhinged",
    description: "Chaotic energy, wild tangents",
    promptModifier: "Go completely unhinged with chaotic energy, wild tangents, and bizarre connections. Include conspiracy-theory-style logic, impossible statistics (like 140%), and references to things that don't exist. Maximum comedic chaos.",
  },
  {
    level: 5,
    name: "Fever Dream",
    description: "Pure chaos, makes no sense",
    promptModifier: "Create pure fever dream content that barely makes logical sense. Combine unrelated concepts in surreal ways, use dream-logic connections, and include statements that are hilariously incomprehensible. The presenter should have no idea what they're even saying.",
  },
];

export const DEFAULT_ABSURDITY: AbsurdityLevel = 3;

export function getAbsurdityConfig(level: AbsurdityLevel): AbsurdityConfig {
  return ABSURDITY_LEVELS.find((a) => a.level === level) || ABSURDITY_LEVELS[2];
}
