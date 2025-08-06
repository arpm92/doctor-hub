import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/"

  console.log("=== AUTH CALLBACK ===")
  console.log("Code:", code ? "present" : "missing")
  console.log("Type:", type)
  console.log("Next:", next)

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: "pkce",
      },
    })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      console.log("Code exchange result:", {
        success: !!data.session,
        user: data.user?.id,
        error: error?.message,
      })

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
      }

      if (data.session && data.user) {
        console.log("Session established for user:", data.user.id)

        // Determine redirect based on user type
        const userType = data.user.user_metadata?.user_type || type

        let redirectPath = "/"

        switch (userType) {
          case "doctor":
            redirectPath = "/doctor/dashboard"
            break
          case "admin":
            redirectPath = "/admin/dashboard"
            break
          case "patient":
            redirectPath = "/profile"
            break
          default:
            redirectPath = "/"
        }

        console.log("Redirecting to:", redirectPath)
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    } catch (err) {
      console.error("Unexpected auth callback error:", err)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }

  // If no code or session establishment failed, redirect to login
  console.log("No code or session failed, redirecting to login")
  return NextResponse.redirect(`${origin}/auth/login`)
}
