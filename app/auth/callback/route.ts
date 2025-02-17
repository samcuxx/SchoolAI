import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      throw new Error('No code provided')
    }

    // Create a new supabase client using route handler
    const supabase = createRouteHandlerClient({
      cookies,
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Exchange error:', exchangeError)
      throw exchangeError
    }

    // Get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Session error:', sessionError)
      throw sessionError || new Error('No session found')
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('school_details')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
    }

    // Redirect based on profile completion
    if (!profile?.school_details) {
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
    }

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`, request.url)
    )
  }
}