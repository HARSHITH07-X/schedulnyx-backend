import { GoogleGenerativeAI } from "@google/generative-ai";

import { env, geminiConfigured } from "./env.js";

let client = null;

export function getGeminiClient() {
  if (client) return client;
  if (!geminiConfigured) return null;
  client = new GoogleGenerativeAI(env.geminiApiKey);
  return client;
}

export function getGeminiModel(modelName = env.geminiModel) {
  const genAI = getGeminiClient();
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
}
