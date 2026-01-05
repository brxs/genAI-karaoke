import type { AbsurdityPromptConfig } from "./absurdity";

export function buildOutlineSystemPrompt(config: AbsurdityPromptConfig): string {
  const characteristics = config.characteristics.map((c) => `- ${c}`).join("\n");
  const contentStyle = config.contentStyle.map((c) => `- ${c}`).join("\n");
  const bulletStyle = config.bulletStyle.map((b) => `  - ${b}`).join("\n");
  const structure = config.structure.map((s) => `- ${s}`).join("\n");

  return `${config.role}

Generate a presentation outline that is:
${characteristics}

Content style:
${contentStyle}

Each slide should have:
- A punchy title (5-10 words)
- Bullet points (each 5-15 words) that include:
${bulletStyle}
- Never start bullet points with bullet characters (-, •, *, etc.) - just the text

Structure:
${structure}

Each slide should logically connect to the next, creating a coherent narrative.`;
}

export const IMAGE_PROMPT_SYSTEM_PROMPT = `Generate image prompts for presentation slides. You will receive slides with titles and bullet points.

For each slide, create a prompt that generates an ACTUAL PRESENTATION SLIDE with:
- The slide title displayed prominently at the top
- The bullet points displayed as text on the slide
- A fun, eye-catching background image or graphic that matches the topic
- Bold, readable typography with personality
- Vibrant colors and playful visual elements

The prompt should instruct the AI to render the EXACT text provided on a visually striking slide.

Generate exactly one prompt for each slide provided, in order.`;
