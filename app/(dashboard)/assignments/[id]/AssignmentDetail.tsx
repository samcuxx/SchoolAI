"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generatePDF } from "@/lib/pdf/generator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Assignment, SchoolDetails, PDFOptions } from "@/types";
import PDFSettings from "@/components/ui/PDFSettings";
import { motion } from "framer-motion";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="card p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Assignment not found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          The assignment you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push("/assignments")}
            className="btn-secondary"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={assignment.title}
                onChange={(e) =>
                  setAssignment({ ...assignment, title: e.target.value })
                }
                className="input-primary text-2xl font-bold"
                placeholder="Enter assignment title"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {assignment.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPDFSettings(true)}
              className="btn-secondary"
            >
              Export PDF
            </button>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdate(assignment)}
                  disabled={saving}
                  className="btn-primary"
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
                className="btn-primary"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Content Card */}
      <div className="card p-6 space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Question or Prompt
          </h3>
          {isEditing ? (
            <textarea
              rows={4}
              value={assignment.content}
              onChange={(e) =>
                setAssignment({ ...assignment, content: e.target.value })
              }
              className="input-primary"
              placeholder="Enter your question or prompt"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {assignment.content}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            AI Response
          </h3>
          {isEditing ? (
            <textarea
              rows={8}
              value={assignment.ai_response}
              onChange={(e) =>
                setAssignment({ ...assignment, ai_response: e.target.value })
              }
              className="input-primary font-mono text-sm"
              placeholder="AI response content"
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 font-mono text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {assignment.ai_response}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Status
          </h3>
          <select
            value={assignment.status}
            onChange={(e) =>
              handleUpdate({
                status: e.target.value as "draft" | "completed",
              })
            }
            className="input-primary max-w-[200px]"
            aria-label="Assignment status"
          >
            <option value="draft">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* PDF Settings Modal */}
      {showPDFSettings && (
        <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card w-full max-w-2xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Export PDF
                </h3>
                <PDFSettings
                  initialSettings={pdfSettings}
                  onSettingsChange={setPDFSettings}
                />
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowPDFSettings(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={loading}
                    className="btn-primary"
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
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
