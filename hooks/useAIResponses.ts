import { useState, useEffect } from "react";
import { supabase } from "../services/auth/supabase";
import { openai } from "../services/ai/openai";
import { gemini } from "../services/ai/gemini";

type AIResponse = {
  id: string;
  assignment_id: string;
  prompt: string;
  response: string;
  created_at: string;
  provider?: "openai" | "gemini";
};

export function useAIResponses(assignmentId: string) {
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, [assignmentId]);

  async function fetchResponses() {
    try {
      const { data, error } = await supabase
        .from("ai_responses")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error("Error fetching AI responses:", error);
    } finally {
      setLoading(false);
    }
  }

  async function generateWithOpenAI(prompt: string) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful academic assistant. Provide detailed, well-structured responses with academic citations where relevant. Format your response in markdown for better readability.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error("No response from OpenAI");

      const { data, error } = await saveResponse(prompt, response, "openai");
      if (error) throw error;

      setResponses((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error with OpenAI:", error);
      throw error;
    }
  }

  async function generateWithGemini(prompt: string) {
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(`
        You are a helpful academic assistant. Provide detailed, well-structured responses with academic citations where relevant.
        Format your response in markdown for better readability.
        
        ${prompt}
      `);

      const response = result.response.text();
      if (!response) throw new Error("No response from Gemini");

      const { data, error } = await saveResponse(prompt, response, "gemini");
      if (error) throw error;

      setResponses((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error with Gemini:", error);
      throw error;
    }
  }

  async function saveResponse(
    prompt: string,
    response: string,
    provider: "openai" | "gemini"
  ) {
    return await supabase
      .from("ai_responses")
      .insert({
        assignment_id: assignmentId,
        prompt,
        response,
        provider,
      })
      .select()
      .single();
  }

  async function generateResponse(prompt: string) {
    try {
      return await generateWithOpenAI(prompt);
    } catch (openAIError) {
      console.log("OpenAI failed, falling back to Gemini:", openAIError);
      return await generateWithGemini(prompt);
    }
  }

  async function deleteResponse(responseId: string) {
    try {
      const { error } = await supabase
        .from("ai_responses")
        .delete()
        .eq("id", responseId);

      if (error) throw error;

      // Update local state after successful deletion
      setResponses((prev) =>
        prev.filter((response) => response.id !== responseId)
      );
      return true;
    } catch (error) {
      console.error("Error deleting AI response:", error);
      throw error;
    }
  }

  return {
    responses,
    loading,
    generateResponse,
    generateWithOpenAI,
    generateWithGemini,
    refreshResponses: fetchResponses,
    deleteResponse,
  };
}
