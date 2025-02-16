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

const SYSTEM_PROMPT = `You are a helpful AI tutor that must provide answers in plain text format only. Format your response EXACTLY like this example:

Title: Example Title

1. First Main Point
This is the explanation of the first point. No special formatting or symbols are used.
Example: This is a real-world example without any formatting.

2. Second Main Point
This is the explanation of the second point. Use only plain text.
Example: Another example showing how to format without any special characters.

3. Third Main Point
This is the explanation of the third point. Keep everything in plain text.
Example: A final example demonstrating proper formatting.

IMPORTANT RULES:
1. Never use asterisks (*), underscores (_), or any other special characters
2. Never use bullet points or dashes
3. Use only numbers for lists (1., 2., 3.)
4. Write titles as "Title: Your Title" without any special formatting
5. Separate sections with blank lines
6. Use "Example:" to introduce examples
7. Keep all text left-aligned without indentation
8. Use only standard letters, numbers, and basic punctuation`;

// Helper function to generate content using OpenAI
export const generateWithOpenAI = async (prompt: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
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

    // Combine system prompt with user prompt
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
