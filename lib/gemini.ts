import { GoogleGenAI } from "@google/genai";
import type { TObject } from "@sinclair/typebox";

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

export async function generateStructuredOutput<T>(
  client: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string,
  schema: TObject
): Promise<T> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text response from Gemini");
  }

  return JSON.parse(text) as T;
}

export type ImageSize = "1K" | "2K" | "4K";
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";

export async function generateImage(
  client: GoogleGenAI,
  prompt: string,
  aspectRatio: AspectRatio = "16:9",
  imageSize: ImageSize = "2K"
): Promise<string> {
  const response = await client.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio,
        imageSize,
      },
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
