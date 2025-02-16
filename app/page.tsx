import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", session.user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
