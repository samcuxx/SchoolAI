import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
  console.warn('Missing Gemini API key, will use fallback key');
}

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyAlxoqxcVwUtLZf0-uPCUoBNt2qu2EPeao";

export const gemini = new GoogleGenerativeAI(API_KEY); 