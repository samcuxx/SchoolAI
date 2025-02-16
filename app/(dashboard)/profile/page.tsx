"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information and school details
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Card */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-primary mt-1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                disabled
                className="input-primary mt-1 bg-gray-50 dark:bg-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>
          </div>
        </div>

        {/* School Details Card */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            School Details
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="school_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                School/Institution Name
              </label>
              <input
                type="text"
                name="school_name"
                id="school_name"
                value={formData.school_details.school_name}
                onChange={handleChange}
                className="input-primary mt-1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="school_student_number"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Student Number
              </label>
              <input
                type="text"
                name="school_student_number"
                id="school_student_number"
                value={formData.school_details.student_number}
                onChange={handleChange}
                className="input-primary mt-1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="school_program"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Program
              </label>
              <input
                type="text"
                name="school_program"
                id="school_program"
                value={formData.school_details.program}
                onChange={handleChange}
                className="input-primary mt-1"
                required
              />
            </div>

            <div>
              <label
                htmlFor="school_class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Class
              </label>
              <input
                type="text"
                name="school_class"
                id="school_class"
                value={formData.school_details.class}
                onChange={handleChange}
                className="input-primary mt-1"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="school_department"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Department (Optional)
              </label>
              <input
                type="text"
                name="school_department"
                id="school_department"
                value={formData.school_details.department}
                onChange={handleChange}
                className="input-primary mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
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
    </motion.div>
  );
}
