"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard",
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  { 
    name: "Assignments", 
    href: "/assignments",
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  { 
    name: "Profile", 
    href: "/profile",
    icon: (props: any) => (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      setIsSigningOut(false);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  School AI
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition duration-200 ${
                    pathname === item.href
                      ? "border-b-2 border-primary-500 text-primary-500 dark:text-primary-400"
                      : "border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Sign Out Button */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="btn-primary"
            >
              {isSigningOut ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Signing out...
                </>
              ) : (
                "Sign out"
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className={`sm:hidden overflow-hidden`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-base font-medium transition duration-200 ${
                pathname === item.href
                  ? "bg-primary-50 dark:bg-primary-900/10 text-primary-500 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
