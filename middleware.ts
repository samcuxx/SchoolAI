import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not logged in and trying to access protected routes
  if (!session && req.nextUrl.pathname !== '/login' && req.nextUrl.pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If user is logged in and trying to access auth routes
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If user is logged in and hasn't completed onboarding
  if (session && req.nextUrl.pathname !== '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - auth/callback (auth callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|auth/callback).*)",
  ],
};
