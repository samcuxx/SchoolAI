import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Initialize OpenAI
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Initialize Gemini
export const gemini = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY!
);

// Helper function to generate content using OpenAI
export const generateWithOpenAI = async (prompt: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw error;
  }
};

// Helper function to generate content using Gemini
export const generateWithGemini = async (prompt: string) => {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
