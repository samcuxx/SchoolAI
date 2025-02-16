import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}
