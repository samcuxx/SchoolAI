"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="School AI Logo"
              width={48}
              height={48}
              className="mx-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Student School AI
          </h2>
        </div>
        {children}
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative flex-1">
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="/auth-background.jpg"
          alt="Students studying"
          width={1000}
          height={1000}
          priority
        />
      </div>
    </div>
  );
}
