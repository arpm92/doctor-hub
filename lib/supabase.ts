import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://sjrkguyqndbuuivuuqnf.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmtndXlxbmRidXVpdnV1cW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNTMyOTIsImV4cCI6MjA2OTYyOTI5Mn0.7r_gxIGcrxvVBlK1XpGP8F-Knhauy150Oub8wWQQALI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Types for our database
export interface Patient {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth: string
  created_at: string
  updated_at: string
}

// Auth helper functions
export const signUp = async (
  email: string,
  password: string,
  userData: {
    firstName: string
    lastName: string
    phone?: string
    dateOfBirth: string
  },
) => {
  try {
    console.log("=== SIGNUP ATTEMPT ===")
    console.log("Email:", email)
    console.log("User data:", userData)

    // Validate data before sending
    if (!userData.firstName || !userData.lastName) {
      return { data: null, error: { message: "First name and last name are required" } }
    }

    if (!userData.dateOfBirth) {
      return { data: null, error: { message: "Date of birth is required" } }
    }

    // Clean phone number - remove if empty
    const cleanPhone = userData.phone?.trim() || undefined

    console.log("Attempting user signup with cleaned data...")
    const signupData = {
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          phone: cleanPhone || null,
          date_of_birth: userData.dateOfBirth,
        },
      },
    }

    console.log("Signup payload:", signupData)

    const { data, error } = await supabase.auth.signUp(signupData)

    console.log("=== SIGNUP RESPONSE ===")
    console.log("Success:", !!data.user)
    console.log("User ID:", data.user?.id)
    console.log("Email confirmed:", data.user?.email_confirmed_at ? "Yes" : "No")
    console.log("Error:", error)

    if (error) {
      console.error("Supabase auth error:", error.message)

      // Handle specific database errors
      if (error.message.includes("Database error saving new user")) {
        console.log("Database trigger failed, attempting manual patient creation...")

        // The user might still have been created in auth.users
        if (data.user) {
          console.log("User was created despite database error, attempting manual patient insert...")

          // Wait a moment for any async operations
          await new Promise((resolve) => setTimeout(resolve, 1000))

          try {
            const { error: insertError } = await supabase.from("patients").upsert(
              {
                id: data.user.id,
                email: data.user.email!,
                first_name: userData.firstName.trim(),
                last_name: userData.lastName.trim(),
                phone: cleanPhone || null,
                date_of_birth: userData.dateOfBirth,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "id",
              },
            )

            if (insertError) {
              console.error("Manual patient insert failed:", insertError)
              return {
                data: null,
                error: {
                  message: "Account created but profile setup failed. Please contact support or try signing in.",
                },
              }
            } else {
              console.log("Manual patient insert successful!")
              return { data, error: null }
            }
          } catch (insertErr) {
            console.error("Manual insert exception:", insertErr)
            return {
              data: null,
              error: {
                message: "Account created but profile setup failed. Please contact support or try signing in.",
              },
            }
          }
        } else {
          return {
            data: null,
            error: { message: "Failed to create account due to database error. Please try again." },
          }
        }
      }

      // Handle other specific errors
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        return { data: null, error: { message: "An account with this email already exists. Please sign in instead." } }
      }

      if (error.message.includes("Password")) {
        return { data: null, error: { message: "Password does not meet security requirements." } }
      }

      if (error.message.includes("fetch") || error.message.includes("network")) {
        return {
          data: null,
          error: { message: "Network connection error. Please check your internet connection and try again." },
        }
      }

      return { data: null, error }
    }

    if (data.user) {
      console.log("Registration successful!")

      // Verify patient record was created
      console.log("Verifying patient record...")
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (patientError) {
        console.log("Patient record verification failed:", patientError)
        console.log("Attempting to create patient record manually...")

        const { error: insertError } = await supabase.from("patients").insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          phone: cleanPhone || null,
          date_of_birth: userData.dateOfBirth,
        })

        if (insertError) {
          console.error("Manual patient creation failed:", insertError)
          // Don't fail the registration, user can complete profile later
        } else {
          console.log("Manual patient creation successful!")
        }
      } else {
        console.log("Patient record verified:", patientData.id)
      }
    }

    console.log("=== SIGNUP COMPLETE ===")
    return { data, error: null }
  } catch (err) {
    console.error("=== SIGNUP EXCEPTION ===")
    console.error("Error:", err)

    return {
      data: null,
      error: {
        message: `Registration failed: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
      },
    }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log("Attempting to sign in user:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Sign in response:", { data, error })

    if (error) {
      console.error("Sign in error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected sign in error:", err)
    return { data: null, error: { message: "An unexpected error occurred" } }
  }
}

export const signOut = async () => {
  try {
    console.log("Attempting to sign out")
    const { error } = await supabase.auth.signOut()
    console.log("Sign out response:", { error })
    return { error }
  } catch (err) {
    console.error("Sign out error:", err)
    return { error: { message: "Failed to sign out" } }
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Don't treat "no user" as an error - it just means they're not logged in
    if (error && error.message !== "Auth session missing!") {
      console.error("Error getting user:", error)
      return { user: null, error }
    }

    return { user, error: null }
  } catch (err) {
    console.error("Unexpected error getting user:", err)
    return { user: null, error: { message: "Failed to get user" } }
  }
}

export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    return { session, error }
  } catch (err) {
    console.error("Error getting session:", err)
    return { session: null, error: { message: "Failed to get session" } }
  }
}

export const signInWithGoogle = async () => {
  try {
    console.log("Attempting Google sign in")

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    console.log("Google sign in response:", { data, error })
    return { data, error }
  } catch (err) {
    console.error("Google sign in error:", err)
    return { data: null, error: { message: "Google sign in failed" } }
  }
}

// Password recovery functions
export const resetPassword = async (email: string) => {
  try {
    console.log("Attempting password reset for:", email)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    console.log("Password reset response:", { data, error })
    return { data, error }
  } catch (err) {
    console.error("Password reset error:", err)
    return { data: null, error: { message: "Failed to send reset email" } }
  }
}

export const updatePassword = async (newPassword: string) => {
  try {
    console.log("Attempting password update")

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    console.log("Password update response:", { data, error })
    return { data, error }
  } catch (err) {
    console.error("Password update error:", err)
    return { data: null, error: { message: "Failed to update password" } }
  }
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...")
    console.log("URL:", supabaseUrl)
    console.log("Key:", supabaseAnonKey.substring(0, 20) + "...")

    const { data, error } = await supabase.auth.getSession()
    console.log("Connection test result:", { data: !!data, error })

    return { success: !error, error }
  } catch (err) {
    console.error("Connection test failed:", err)
    return { success: false, error: err }
  }
}
