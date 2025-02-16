"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import type { Assignment } from "@/types";

export default function AssignmentsPage() {
  const supabase = createClientComponentClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const { data, error } = await supabase
          .from("assignments")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAssignments(data || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .match({ id });

      if (error) throw error;
      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== id)
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assignments
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your assignments and track your progress
            </p>
          </div>
          <Link href="/assignments/new" className="btn-primary">
            New Assignment
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No assignments yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new assignment.
          </p>
          <div className="mt-6">
            <Link href="/assignments/new" className="btn-primary">
              New Assignment
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card divide-y divide-gray-200 dark:divide-gray-700"
        >
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/assignments/${assignment.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-primary-500 dark:text-primary-400 truncate">
                        {assignment.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {assignment.content}
                      </p>
                    </div>
                    <div className="ml-6 flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          assignment.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200"
                        }`}
                      >
                        {assignment.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (
                            window.confirm(
                              "Are you sure you want to delete this assignment?"
                            )
                          ) {
                            handleDelete(assignment.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        aria-label={`Delete assignment: ${assignment.title}`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created on{" "}
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
