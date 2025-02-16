"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("No user data");

      router.push("/onboarding");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="card px-4 py-8 sm:px-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <div className="mt-1">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="input-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-primary"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignUp}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.367,1.456-1.454,2.607-2.91,3.029 C13.5,17.757,11.667,17.757,10.087,17.089C8.508,16.421,7.275,15.153,6.607,13.574C6.27,12.784,6.101,11.951,6.101,11.101 c0-0.85,0.169-1.683,0.506-2.473c0.668-1.579,1.901-2.847,3.48-3.515c1.579-0.668,3.412-0.668,4.991,0 c1.456,0.422,2.543,1.573,2.91,3.029h-3.536C13.4,8.142,12.545,8.997,12.545,10.051L12.545,12.151z M21.818,11.101 c0,0.85-0.169,1.683-0.506,2.473c-0.668,1.579-1.901,2.847-3.48,3.515c-1.579,0.668-3.412,0.668-4.991,0 c-1.456-0.422-2.543-1.573-2.91-3.029h3.536c1.054,0,1.909-0.855,1.909-1.909v0c0-1.054-0.855-1.909-1.909-1.909h-3.536 c0.367-1.456,1.454-2.607,2.91-3.029c1.579-0.668,3.412-0.668,4.991,0c1.579,0.668,2.812,1.936,3.48,3.515 C21.649,9.418,21.818,10.251,21.818,11.101z" />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
