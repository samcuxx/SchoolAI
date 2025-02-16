"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const YEAR_LEVELS = [
  { value: "1", label: "1st Year" },
  { value: "2", label: "2nd Year" },
  { value: "3", label: "3rd Year" },
  { value: "4", label: "4th Year" },
  { value: "5", label: "5th Year" },
  { value: "graduate", label: "Graduate" },
] as const;

type Field = {
  name: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  value: string;
  options?: typeof YEAR_LEVELS;
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [schoolDetails, setSchoolDetails] = useState({
    school_name: "",
    student_number: "",
    program: "",
    year_level: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSchoolDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          school_details: schoolDetails,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: "School Information",
      fields: [
        {
          name: "school_name",
          label: "School Name",
          type: "text",
          placeholder: "e.g. University of Technology",
          value: schoolDetails.school_name,
        },
        {
          name: "student_number",
          label: "Student Number",
          type: "text",
          placeholder: "e.g. 2023-12345",
          value: schoolDetails.student_number,
        },
      ] as Field[],
    },
    {
      title: "Program Details",
      fields: [
        {
          name: "program",
          label: "Program/Course",
          type: "text",
          placeholder: "e.g. Computer Science",
          value: schoolDetails.program,
        },
        {
          name: "year_level",
          label: "Year Level",
          type: "select",
          options: YEAR_LEVELS,
          value: schoolDetails.year_level,
        },
      ] as Field[],
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
    >
      <div className="card px-4 py-8 sm:px-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {currentStepData.title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 relative">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {currentStepData.fields.map((field) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {field.label}
                </label>
                <div className="mt-1">
                  {field.type === "select" ? (
                    <select
                      id={field.name}
                      name={field.name}
                      required
                      value={field.value}
                      onChange={handleChange}
                      className="input-primary"
                    >
                      <option value="">Select year level</option>
                      {field.type === "select" &&
                        field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      required
                      value={field.value}
                      onChange={handleChange}
                      className="input-primary"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary ml-auto"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
