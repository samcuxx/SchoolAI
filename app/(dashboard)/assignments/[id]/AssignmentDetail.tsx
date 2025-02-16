"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generatePDF } from "@/lib/pdf/generator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Assignment, SchoolDetails, PDFOptions } from "@/types";
import PDFSettings from "@/components/ui/PDFSettings";

const DEFAULT_PDF_OPTIONS: PDFOptions = {
  includeSchoolDetails: true,
  fontSize: 12,
  fontFamily: "Times-Roman",
  lineHeight: 1.5,
};

interface AssignmentDetailProps {
  id: string;
}

export default function AssignmentDetail({ id }: AssignmentDetailProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPDFSettings, setShowPDFSettings] = useState(false);
  const [pdfSettings, setPDFSettings] =
    useState<PDFOptions>(DEFAULT_PDF_OPTIONS);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch assignment
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("assignments")
          .select("*")
          .eq("id", id)
          .single();

        if (assignmentError) throw assignmentError;

        setAssignment(assignmentData);

        // Fetch user's school details
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("school_details")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          setSchoolDetails(profileData.school_details);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, supabase]);

  const handleUpdate = async (newData: Partial<Assignment>) => {
    if (!assignment) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("assignments")
        .update(newData)
        .eq("id", assignment.id);

      if (error) throw error;

      setAssignment({ ...assignment, ...newData });
      setIsEditing(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!assignment) return;

    try {
      setLoading(true);
      const content = `
Title: ${assignment.title}

Question:
${assignment.content}

Answer:
${assignment.ai_response}
      `;

      const pdfBytes = await generatePDF(
        content,
        pdfSettings.includeSchoolDetails
          ? schoolDetails || undefined
          : undefined,
        pdfSettings
      );

      // Create a blob and download the PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${assignment.title.replace(/\s+/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setShowPDFSettings(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center">
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Assignment not found
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div>
              <label htmlFor="title" className="sr-only">
                Assignment title
              </label>
              <input
                id="title"
                type="text"
                value={assignment.title}
                onChange={(e) =>
                  setAssignment({ ...assignment, title: e.target.value })
                }
                placeholder="Enter assignment title"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-2xl font-bold sm:text-3xl border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          ) : (
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              {assignment.title}
            </h2>
          )}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            onClick={() => setShowPDFSettings(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Export PDF
          </button>
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(assignment)}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </button>
          )}
        </div>
      </div>

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

      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Question or Prompt
              </h3>
              {isEditing ? (
                <div className="mt-2">
                  <label htmlFor="content" className="sr-only">
                    Question or prompt content
                  </label>
                  <textarea
                    id="content"
                    rows={4}
                    value={assignment.content}
                    onChange={(e) =>
                      setAssignment({ ...assignment, content: e.target.value })
                    }
                    placeholder="Enter your question or prompt"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                  {assignment.content}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                AI Response
              </h3>
              {isEditing ? (
                <div className="mt-2">
                  <label htmlFor="ai-response" className="sr-only">
                    AI response content
                  </label>
                  <textarea
                    id="ai-response"
                    rows={8}
                    value={assignment.ai_response}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        ai_response: e.target.value,
                      })
                    }
                    placeholder="Enter AI response"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                  {assignment.ai_response}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Status
                  </h3>
                </div>
                <div className="ml-3">
                  <label htmlFor="status" className="sr-only">
                    Assignment status
                  </label>
                  <select
                    id="status"
                    value={assignment.status}
                    onChange={(e) =>
                      handleUpdate({
                        status: e.target.value as "draft" | "completed",
                      })
                    }
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/assignments")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Assignments
        </button>
      </div>

      {showPDFSettings && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Export PDF
                    </h3>
                    <div className="mt-4">
                      <PDFSettings
                        initialSettings={pdfSettings}
                        onSettingsChange={setPDFSettings}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Generating PDF...
                      </>
                    ) : (
                      "Generate & Download"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPDFSettings(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
