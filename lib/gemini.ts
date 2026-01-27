import { GoogleGenAI, Tool, Part } from "@google/genai";
import type { TObject } from "@sinclair/typebox";
import type { AttachedImage } from "./types";

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on network/transient errors
      const isRetryable =
        lastError.message.includes("fetch failed") ||
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("network");

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey });
}

export async function generateText(
  client: GoogleGenAI,
  systemPrompt: string,
  userPrompt: string,
  options?: { tools?: Tool[] }
): Promise<string> {
  const response = await client.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
    ],
    config: {
      tools: options?.tools,
    },
  });

  // Log usage metadata for token cost analysis
  if (response.usageMetadata) {
    console.log("[GEMINI_USAGE] generateText:", {
      model: "gemini-3-pro-preview",
      promptTokenCount: response.usageMetadata.promptTokenCount,
      candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
      totalTokenCount: response.usageMetadata.totalTokenCount,
    });
  }

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
  schema: TObject,
  options?: { tools?: Tool[]; images?: AttachedImage[] }
): Promise<T> {
  // Build parts array - images first (if any), then text
  const parts: Part[] = [];

  if (options?.images && options.images.length > 0) {
    for (const image of options.images) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }
  }

  parts.push({ text: `${systemPrompt}\n\n${userPrompt}` });

  const response = await client.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      { role: "user", parts },
    ],
    config: {
      tools: options?.tools,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  // Log usage metadata for token cost analysis
  if (response.usageMetadata) {
    console.log("[GEMINI_USAGE] generateStructuredOutput:", {
      model: "gemini-3-pro-preview",
      promptTokenCount: response.usageMetadata.promptTokenCount,
      candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
      totalTokenCount: response.usageMetadata.totalTokenCount,
      imageCount: options?.images?.length || 0,
    });
  }

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
  return withRetry(async () => {
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

    // Log usage metadata for token cost analysis
    if (response.usageMetadata) {
      console.log("[GEMINI_USAGE] generateImage:", {
        model: "gemini-3-pro-image-preview",
        promptTokenCount: response.usageMetadata.promptTokenCount,
        candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
        totalTokenCount: response.usageMetadata.totalTokenCount,
        aspectRatio,
        imageSize,
      });
    }

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
  });
}

export function parseJsonResponse<T>(text: string): T {
  // Remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
