"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

interface Assignment {
  id: string;
  title: string;
  status: "draft" | "completed";
  created_at: string;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const [assignmentsResponse, profileResponse] = await Promise.all([
          supabase
            .from('assignments')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user?.id)
            .single()
        ]);

        if (assignmentsResponse.error) throw assignmentsResponse.error;
        if (profileResponse.error) throw profileResponse.error;

        setRecentAssignments(assignmentsResponse.data);
        setProfile(profileResponse.data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const stats = [
    {
      name: "Total Assignments",
      stat: recentAssignments.length,
      icon: (props: any) => (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      name: "Completed",
      stat: recentAssignments.filter((a) => a.status === "completed").length,
      icon: (props: any) => (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      name: "In Progress",
      stat: recentAssignments.filter((a) => a.status === "draft").length,
      icon: (props: any) => (
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's what's happening with your assignments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {item.stat}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Assignments */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Assignments
            </h2>
            <Link
              href="/assignments"
              className="text-sm font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
            >
              View all
            </Link>
          </div>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentAssignments.map((assignment) => (
            <li key={assignment.id}>
              <Link
                href={`/assignments/${assignment.id}`}
                className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {assignment.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {assignment.status === "completed" ? "Completed" : "In Progress"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={assignment.created_at}>
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
