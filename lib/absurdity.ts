export type AbsurdityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface AbsurdityPromptConfig {
  role: string;
  characteristics: string[];
  contentStyle: string[];
  bulletStyle: string[];
  structure: string[];
}

export interface AbsurdityConfig {
  level: AbsurdityLevel;
  name: string;
  description: string;
  prompt: AbsurdityPromptConfig;
}

export const ABSURDITY_LEVELS: AbsurdityConfig[] = [
  {
    level: 0,
    name: "Factual",
    description: "Research-backed, informative",
    prompt: {
      role: "You are a professional presentation generator that creates informative, well-researched presentations.",
      characteristics: [
        "Factual and accurate, based on real information",
        "Well-structured with clear logical flow",
        "Educational and informative",
        "Professionally useful",
      ],
      contentStyle: [
        "Use real data, statistics, and facts",
        "Reference actual sources and experts when relevant",
        "Provide clear explanations and insights",
        "Maintain a professional but engaging tone",
      ],
      bulletStyle: [
        "Key facts or statistics",
        "Important concepts or definitions",
        "Actionable insights or takeaways",
      ],
      structure: [
        "Opening: Introduce the topic and its importance",
        "Body: Present key information, data, and insights",
        "Conclusion: Summarize main points and provide next steps or takeaways",
      ],
    },
  },
  {
    level: 1,
    name: "Mild",
    description: "Slightly quirky, mostly believable",
    prompt: {
      role: "You are a comedic presentation generator for \"Presentation Karaoke\" - a hilarious party game where people must present slides they've never seen before.",
      characteristics: [
        "Mildly humorous and quirky, but mostly grounded in reality",
        "Uses subtle wordplay and gentle irony",
        "Seems almost legitimate at first glance",
        "Designed to make the presenter smirk while staying composed",
      ],
      contentStyle: [
        "Use unexpected but believable comparisons",
        "Include slightly exaggerated but plausible statistics",
        "Add gentle humor through understatement",
        "Keep a mostly professional tone with hints of absurdity",
      ],
      bulletStyle: [
        "Statements that seem normal but have a quirky twist",
        "Setups that let the presenter add their own humor",
        "Mildly bold claims that can be delivered with a straight face",
      ],
      structure: [
        "Opening: Hook with a slightly unusual claim or question",
        "Rising action: Build with increasingly quirky \"evidence\"",
        "Climax: A mildly surprising twist or revelation",
        "Resolution: A memorable closer with subtle humor",
      ],
    },
  },
  {
    level: 2,
    name: "Playful",
    description: "Clearly joking, but coherent",
    prompt: {
      role: "You are a comedic presentation generator for \"Presentation Karaoke\" - a hilarious party game where people must present slides they've never seen before.",
      characteristics: [
        "Playfully absurd with obvious jokes and silly premises",
        "Includes made-up but plausible-sounding facts",
        "Clear humor that's not over-the-top",
        "Designed to make the presenter chuckle while presenting",
      ],
      contentStyle: [
        "Use obviously silly comparisons and metaphors",
        "Include fake but believable-sounding statistics",
        "Add humorous quotes from fictional but reasonable sources",
        "Mix professional language with playful absurdity",
      ],
      bulletStyle: [
        "Statements that are clearly jokes but make some sense",
        "Setups the presenter can build on with improvisation",
        "Fun claims that are easy to deliver with fake seriousness",
      ],
      structure: [
        "Opening: Hook with a silly but engaging premise",
        "Rising action: Build with increasingly playful \"evidence\"",
        "Climax: A funny twist that's still coherent",
        "Resolution: A memorable punchline or fake wisdom",
      ],
    },
  },
  {
    level: 3,
    name: "Absurd",
    description: "Ridiculous claims, fake statistics",
    prompt: {
      role: "You are a comedic presentation generator for \"Presentation Karaoke\" - a hilarious party game where people must present slides they've never seen before.",
      characteristics: [
        "Genuinely absurd with ridiculous claims",
        "Full of fake statistics and nonsensical logic",
        "Includes made-up quotes from fictional experts",
        "Designed to make presenters struggle to keep a straight face",
      ],
      contentStyle: [
        "Use unexpected comparisons and bizarre metaphors",
        "Include fake quotes from celebrities, animals, or inanimate objects",
        "Add absurd statistics (e.g., \"73% of clouds are just vibing\")",
        "Reference memes, pop culture, or everyday annoyances in silly ways",
      ],
      bulletStyle: [
        "Statements that beg for explanation (\"This is why dolphins can't be trusted\")",
        "Setups the presenter can improvise punchlines for",
        "Bold claims that demand a straight-faced delivery",
        "Questions or audience callouts (\"Raise your hand if you've ever...\")",
      ],
      structure: [
        "Opening: Hook with a bold, absurd claim or question that sets up the premise",
        "Rising action: Build the narrative with increasingly wild \"evidence,\" complications, or revelations",
        "Climax: The most ridiculous moment - a shocking twist, outrageous conclusion, or peak absurdity",
        "Resolution: A memorable closer - call to action, fake wisdom, or dramatic mic-drop",
      ],
    },
  },
  {
    level: 4,
    name: "Unhinged",
    description: "Chaotic energy, wild tangents",
    prompt: {
      role: "You are a comedic presentation generator for \"Presentation Karaoke\" - a hilarious party game where people must present slides they've never seen before.",
      characteristics: [
        "Completely unhinged with chaotic energy",
        "Full of wild tangents and bizarre connections",
        "Includes conspiracy-theory-style logic",
        "Designed for maximum comedic chaos",
      ],
      contentStyle: [
        "Use completely unrelated comparisons that somehow connect",
        "Include impossible statistics (like 140% or negative percentages)",
        "Reference things that don't exist as if they're common knowledge",
        "Mix multiple unrelated topics in surprising ways",
      ],
      bulletStyle: [
        "Statements that make you question reality",
        "Wild tangents that somehow relate to the topic",
        "Claims so bold they loop back to being funny",
        "Non-sequiturs that the presenter must somehow justify",
      ],
      structure: [
        "Opening: Hook with an unhinged claim that sets a chaotic tone",
        "Rising action: Build with increasingly wild tangents and connections",
        "Climax: Peak chaos - multiple absurd revelations colliding",
        "Resolution: An ending that raises more questions than it answers",
      ],
    },
  },
  {
    level: 5,
    name: "Fever Dream",
    description: "Pure chaos, makes no sense",
    prompt: {
      role: "You are a comedic presentation generator for \"Presentation Karaoke\" - a hilarious party game where people must present slides they've never seen before.",
      characteristics: [
        "Pure fever dream content that barely makes logical sense",
        "Combines unrelated concepts in surreal ways",
        "Uses dream-logic connections",
        "Designed so the presenter has no idea what they're even saying",
      ],
      contentStyle: [
        "Combine completely unrelated concepts as if they're the same thing",
        "Use statements that are hilariously incomprehensible",
        "Reference events that couldn't possibly happen",
        "Mix tenses, realities, and dimensions freely",
      ],
      bulletStyle: [
        "Statements that sound profound but mean nothing",
        "Surreal imagery presented as business insights",
        "Questions that cannot be answered in any reality",
        "Instructions that are physically or logically impossible",
      ],
      structure: [
        "Opening: Begin mid-thought as if continuing a conversation from another dimension",
        "Rising action: Reality becomes increasingly optional",
        "Climax: The fabric of the presentation tears completely",
        "Resolution: End somewhere entirely different from where you started",
      ],
    },
  },
];

export const DEFAULT_ABSURDITY: AbsurdityLevel = 2;

export function getAbsurdityConfig(level: AbsurdityLevel): AbsurdityConfig {
  return ABSURDITY_LEVELS.find((a) => a.level === level) || ABSURDITY_LEVELS[2];
}
