import { z } from "zod";

import { geminiConfigured } from "../config/env.js";
import { getGeminiModel } from "../config/gemini.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseOrThrow } from "../utils/validate.js";

const generateSchema = z.object({
  prompt: z.string().min(1, "Prompt required").max(8000),
});

/**
 * Proxies a prompt to Gemini. Preserves the behaviour of the original
 * /api/generate endpoint while adding validation and graceful degradation when
 * the API key is not configured.
 */
export const generate = asyncHandler(async (req, res) => {
  if (!geminiConfigured) {
    throw ApiError.serviceUnavailable(
      "AI is not configured. Set GEMINI_API_KEY to enable this endpoint.",
    );
  }

  const { prompt } = parseOrThrow(generateSchema, req.body);

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  res.status(200).json({ result: text });
});
