"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generateWithOpenAI, generateWithGemini } from "@/lib/ai/config";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewAssignmentPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [aiResponse, setAiResponse] = useState("");
  const [aiModel, setAiModel] = useState<"gemini" | "openai">("gemini");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerate = async () => {
    if (!formData.content) {
      setError("Please enter your question or prompt");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        aiModel === "openai"
          ? await generateWithOpenAI(formData.content)
          : await generateWithGemini(formData.content);

      setAiResponse(response || "");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !aiResponse) {
      setError("Please fill in all fields and generate an AI response");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error: insertError } = await supabase.from("assignments").insert({
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        ai_response: aiResponse,
        status: "draft",
      });

      if (insertError) throw insertError;

      router.push("/assignments");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            New Assignment
          </h2>
        </div>
      </div>

      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Question or Prompt
            </label>
            <div className="mt-1">
              <textarea
                id="content"
                name="content"
                rows={4}
                required
                value={formData.content}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <label
                htmlFor="ai-model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                AI Model
              </label>
              <select
                id="ai-model"
                value={aiModel}
                onChange={(e) =>
                  setAiModel(e.target.value as "openai" | "gemini")
                }
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="gemini">Gemini</option>
                <option value="openai" disabled>
                  ChatGPT (Out of Credit)
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !formData.content}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Response"
              )}
            </button>
          </div>

          {aiResponse && (
            <div>
              <label
                htmlFor="ai-response"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                AI Response
              </label>
              <div className="mt-1">
                <textarea
                  id="ai-response"
                  name="ai-response"
                  rows={8}
                  readOnly
                  value={aiResponse}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !formData.title || !formData.content || !aiResponse
              }
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
