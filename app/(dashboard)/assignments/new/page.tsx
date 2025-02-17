"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generateWithOpenAI, generateWithGemini } from "@/lib/ai/config";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";

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
        status: "completed",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          New Assignment
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new assignment and get AI-powered assistance
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="input-primary"
                placeholder="Enter assignment title"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="input-primary"
                placeholder="Enter your question or assignment prompt"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-48">
              <label
                htmlFor="ai-model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                AI Model
              </label>
              <select
                id="ai-model"
                value={aiModel}
                onChange={(e) =>
                  setAiModel(e.target.value as "openai" | "gemini")
                }
                className="input-primary mt-1"
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
              className="btn-primary sm:mt-7"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Generating...
                </>
              ) : (
                "Generate Answer"
              )}
            </button>
          </div>

          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label
                htmlFor="ai-response"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                  className="input-primary font-mono text-sm"
                />
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || !formData.title || !formData.content || !aiResponse
              }
              className="btn-primary"
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
    </motion.div>
  );
}
