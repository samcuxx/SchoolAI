"use client";

import { useState } from "react";
import { generateWithOpenAI, generateWithGemini } from "@/lib/ai/config";
import { formatAIResponse } from "@/lib/utils/textFormatter";

interface AssignmentInputProps {
  onResponse: (response: string) => void;
}

const PROMPT_PREFIX = `Please provide a clear and detailed answer to the following question. Write your response in plain text format, using simple titles followed by colons and regular paragraph breaks to organize the information. For any lists, use simple numbers (1., 2., 3.) or dashes (-).

Question to answer:

`;

export default function AssignmentInput({ onResponse }: AssignmentInputProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiModel, setAiModel] = useState<"gemini" | "openai">("gemini");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullPrompt = PROMPT_PREFIX + prompt;
      const response =
        aiModel === "openai"
          ? await generateWithOpenAI(fullPrompt)
          : await generateWithGemini(fullPrompt);

      // Format and clean the response
      const formattedResponse = formatAIResponse(response || "");
      onResponse(formattedResponse);
    } catch (error) {
      console.error("Error generating response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Enter your assignment question
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          placeholder="Type your question here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <label
            htmlFor="ai-model"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Select AI Model
          </label>
          <select
            id="ai-model"
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value as "gemini" | "openai")}
            className="mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="gemini">Gemini</option>
            <option value="openai" disabled>
              OpenAI (Out of Credit)
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !prompt}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Answer"}
        </button>
      </div>
    </form>
  );
}
