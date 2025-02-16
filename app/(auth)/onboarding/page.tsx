"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { SchoolDetails } from "@/supabase/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails>({
    school_name: "",
    institution_name: "",
    index_number: "",
    address: "",
    class: "",
    program: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSchoolDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("No user found");
      }

      // Update user profile with school details
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        school_details: schoolDetails,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Please provide your school details to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="school_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                School Name
              </label>
              <div className="mt-1">
                <input
                  id="school_name"
                  name="school_name"
                  type="text"
                  required
                  value={schoolDetails.school_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="institution_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Institution Name
              </label>
              <div className="mt-1">
                <input
                  id="institution_name"
                  name="institution_name"
                  type="text"
                  required
                  value={schoolDetails.institution_name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="index_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Index Number
              </label>
              <div className="mt-1">
                <input
                  id="index_number"
                  name="index_number"
                  type="text"
                  required
                  value={schoolDetails.index_number}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                School Address
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={schoolDetails.address}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Class
              </label>
              <div className="mt-1">
                <input
                  id="class"
                  name="class"
                  type="text"
                  required
                  value={schoolDetails.class}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="program"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Program
              </label>
              <div className="mt-1">
                <input
                  id="program"
                  name="program"
                  type="text"
                  required
                  value={schoolDetails.program}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
