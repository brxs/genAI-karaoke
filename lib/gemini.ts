import { GoogleGenAI } from "@google/genai";

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function generateText(
  client: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text response from Gemini");
  }
  return text;
}

export async function generateImage(
  client: GoogleGenAI,
  prompt: string
): Promise<string> {
  const response = await client.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No response from Nano Banana");
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      return part.inlineData.data;
    }
  }

  throw new Error("No image data in response");
}

export function parseJsonResponse<T>(text: string): T {
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
