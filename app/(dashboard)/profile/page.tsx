"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { User, SchoolDetails } from "@/types";

export default function ProfilePage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    school_details: SchoolDetails;
  }>({
    full_name: "",
    email: "",
    school_details: {
      school_name: "",
      student_number: "",
      program: "",
      class: "",
      department: "",
    },
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          setUser(user);
          setFormData({
            full_name: profile.full_name || "",
            email: user.email || "",
            school_details: profile.school_details || {
              school_name: "",
              student_number: "",
              program: "",
              class: "",
              department: "",
            },
          });
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("school_")) {
      const schoolField = name.replace("school_", "");
      setFormData((prev) => ({
        ...prev,
        school_details: {
          ...prev.school_details,
          [schoolField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          school_details: formData.school_details,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Show success message or notification
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Profile Settings
          </h2>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              School Details
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="school_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  School/Institution Name
                </label>
                <input
                  type="text"
                  name="school_name"
                  id="school_name"
                  value={formData.school_details.school_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="school_student_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Student Number
                </label>
                <input
                  type="text"
                  name="school_student_number"
                  id="school_student_number"
                  value={formData.school_details.student_number}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="school_program"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Program
                </label>
                <input
                  type="text"
                  name="school_program"
                  id="school_program"
                  value={formData.school_details.program}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="school_class"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Class
                </label>
                <input
                  type="text"
                  name="school_class"
                  id="school_class"
                  value={formData.school_details.class}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="school_department"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Department (Optional)
                </label>
                <input
                  type="text"
                  name="school_department"
                  id="school_department"
                  value={formData.school_details.department}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
