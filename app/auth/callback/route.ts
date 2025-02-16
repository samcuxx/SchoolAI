import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the user to check if they need to complete onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_details")
        .eq("id", user.id)
        .single();

      // If user hasn't set school details, redirect to onboarding
      if (!profile?.school_details) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }
    }
  }

  // Redirect to the dashboard by default
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
