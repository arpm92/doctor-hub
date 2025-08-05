import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

export interface Doctor {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  specialty: string
  years_experience: number
  bio?: string
  education?: string[]
  certifications?: string[]
  languages?: string[]
  profile_image?: string
  status: "pending" | "approved" | "rejected" | "suspended"
  tier: "basic" | "medium" | "premium"
  slug?: string
  created_at: string
  updated_at: string
}

export interface DoctorLocation {
  id: string
  doctor_id: string
  name: string
  address: string
  city: string
  state: string
  postal_code?: string
  country: string
  phone?: string
  email?: string
  website?: string
  is_primary: boolean
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface DoctorArticle {
  id: string
  doctor_id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  status: "draft" | "published" | "archived"
  tags?: string[]
  read_time?: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "super_admin"
  permissions: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface AdminStats {
  total_doctors: number
  pending_doctors: number
  approved_doctors: number
  rejected_doctors: number
  suspended_doctors: number
  specialties: Record<string, number>
  recent_registrations: number
}

// Auth helper functions for patients
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
    console.log("=== PATIENT SIGNUP ATTEMPT ===")
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

    // Get the current origin for redirect URL
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

    const signupData = {
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          user_type: "patient",
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

// Doctor signup function
export const doctorSignUp = async (
  email: string,
  password: string,
  doctorData: {
    firstName: string
    lastName: string
    phone?: string
    specialty: string
    yearsExperience: number
    bio?: string
  },
) => {
  try {
    console.log("=== DOCTOR SIGNUP ATTEMPT ===")
    console.log("Email:", email)
    console.log("Doctor data:", doctorData)

    // Validate required fields
    if (!doctorData.firstName || !doctorData.lastName) {
      return { data: null, error: { message: "First name and last name are required" } }
    }

    if (!doctorData.specialty) {
      return { data: null, error: { message: "Medical specialty is required" } }
    }

    // Clean phone number - remove if empty
    const cleanPhone = doctorData.phone?.trim() || undefined

    console.log("Attempting doctor signup with cleaned data...")

    // Get the current origin for redirect URL
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

    const signupData = {
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          user_type: "doctor",
          first_name: doctorData.firstName.trim(),
          last_name: doctorData.lastName.trim(),
          phone: cleanPhone || null,
          specialty: doctorData.specialty.trim(),
          years_experience: doctorData.yearsExperience,
          bio: doctorData.bio?.trim() || null,
        },
      },
    }

    console.log("Doctor signup payload:", signupData)

    const { data, error } = await supabase.auth.signUp(signupData)

    console.log("=== DOCTOR SIGNUP RESPONSE ===")
    console.log("Success:", !!data.user)
    console.log("User ID:", data.user?.id)
    console.log("Email confirmed:", data.user?.email_confirmed_at ? "Yes" : "No")
    console.log("Error:", error)

    if (error) {
      console.error("Supabase auth error:", error.message)

      // Handle specific database errors
      if (error.message.includes("Database error saving new user")) {
        console.log("Database trigger failed, attempting manual doctor creation...")

        // The user might still have been created in auth.users
        if (data.user) {
          console.log("User was created despite database error, attempting manual doctor creation via RPC...")

          try {
            // Use the RPC function to create the doctor profile
            const { data: doctorProfile, error: rpcError } = await supabase.rpc("create_doctor_profile", {
              user_id: data.user.id,
              user_email: data.user.email!,
              first_name: doctorData.firstName.trim(),
              last_name: doctorData.lastName.trim(),
              phone: cleanPhone || null,
              specialty: doctorData.specialty.trim(),
              years_experience: doctorData.yearsExperience,
              bio: doctorData.bio?.trim() || null,
              tier: "basic",
            })

            if (rpcError) {
              console.error("Manual doctor creation via RPC failed:", rpcError)
              return {
                data: null,
                error: {
                  message: "Account created but profile setup failed. Please contact support or try signing in.",
                },
              }
            } else {
              console.log("Manual doctor creation via RPC successful!")
              return { data, error: null }
            }
          } catch (rpcErr) {
            console.error("RPC exception:", rpcErr)
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
      console.log("Doctor registration successful!")

      // Wait a moment for the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Verify doctor record was created
      console.log("Verifying doctor record...")
      const { data: doctorRecord, error: doctorError } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (doctorError) {
        console.log("Doctor record verification failed:", doctorError)
        console.log("Attempting to create doctor record manually via RPC...")

        try {
          // Use the RPC function to create the doctor profile
          const { data: doctorProfile, error: rpcError } = await supabase.rpc("create_doctor_profile", {
            user_id: data.user.id,
            user_email: data.user.email!,
            first_name: doctorData.firstName.trim(),
            last_name: doctorData.lastName.trim(),
            phone: cleanPhone || null,
            specialty: doctorData.specialty.trim(),
            years_experience: doctorData.yearsExperience,
            bio: doctorData.bio?.trim() || null,
            tier: "basic",
          })

          if (rpcError) {
            console.error("Manual doctor creation via RPC failed:", rpcError)
            // Don't fail the registration, user can complete profile later
          } else {
            console.log("Manual doctor creation via RPC successful!")
          }
        } catch (rpcErr) {
          console.error("RPC creation exception:", rpcErr)
          // Don't fail the registration
        }
      } else {
        console.log("Doctor record verified:", doctorRecord.id)
      }
    }

    console.log("=== DOCTOR SIGNUP COMPLETE ===")
    return { data, error: null }
  } catch (err) {
    console.error("=== DOCTOR SIGNUP EXCEPTION ===")
    console.error("Error:", err)

    return {
      data: null,
      error: {
        message: `Doctor registration failed: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
      },
    }
  }
}

// Admin signup function
export const adminSignUp = async (
  email: string,
  password: string,
  adminData: {
    firstName: string
    lastName: string
    role?: "admin" | "super_admin"
  },
) => {
  try {
    console.log("=== ADMIN SIGNUP ATTEMPT ===")
    console.log("Email:", email)
    console.log("Admin data:", adminData)

    // Get the current origin for redirect URL
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

    const signupData = {
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          user_type: "admin",
          first_name: adminData.firstName.trim(),
          last_name: adminData.lastName.trim(),
          role: adminData.role || "admin",
        },
      },
    }

    const { data, error } = await supabase.auth.signUp(signupData)

    if (error) {
      console.error("Admin signup error:", error)
      return { data: null, error }
    }

    console.log("=== ADMIN SIGNUP COMPLETE ===")
    return { data, error: null }
  } catch (err) {
    console.error("=== ADMIN SIGNUP EXCEPTION ===")
    console.error("Error:", err)

    return {
      data: null,
      error: {
        message: `Admin registration failed: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
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

// Helper function to get current doctor profile
export const getCurrentDoctor = async () => {
  try {
    const { user } = await getCurrentUser()

    if (!user) {
      return { doctor: null, error: null }
    }

    const { data: doctor, error } = await supabase.from("doctors").select("*").eq("id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching doctor profile:", error)
      return { doctor: null, error }
    }

    return { doctor, error: null }
  } catch (err) {
    console.error("Unexpected error getting doctor:", err)
    return { doctor: null, error: { message: "Failed to get doctor profile" } }
  }
}

// Helper function to get current admin profile
export const getCurrentAdmin = async () => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) return { admin: null, error: userError }

    const { data: admin, error } = await supabase.from("admins").select("*").eq("id", user.id).maybeSingle()

    if (error) {
      console.error("Error fetching admin profile:", error)
      return { admin: null, error }
    }
    return { admin, error: null }
  } catch (err) {
    console.error("Unexpected error getting admin:", err)
    return { admin: null, error: { message: "Failed to get admin profile" } }
  }
}

// Admin functions
export const getAdminStats = async (): Promise<{ stats: AdminStats | null; error: any }> => {
  try {
    const { data: stats, error } = await supabase.rpc("get_admin_stats")

    if (error) {
      console.error("Error fetching admin stats:", error)
      return { stats: null, error }
    }

    return { stats, error: null }
  } catch (err) {
    console.error("Unexpected error getting admin stats:", err)
    return { stats: null, error: { message: "Failed to get admin stats" } }
  }
}

export const getAllDoctors = async () => {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching doctors:", error)
      return { doctors: null, error }
    }

    // Ensure all doctors have a tier (fallback to basic)
    const doctorsWithTier =
      doctors?.map((doctor) => ({
        ...doctor,
        tier: doctor.tier || ("basic" as Doctor["tier"]),
      })) || []

    return { doctors: doctorsWithTier, error: null }
  } catch (err) {
    console.error("Unexpected error getting doctors:", err)
    return { doctors: null, error: { message: "Failed to get doctors" } }
  }
}

export const updateDoctorStatus = async (doctorId: string, status: Doctor["status"]) => {
  try {
    const { data, error } = await supabase
      .from("doctors")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", doctorId)
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor status:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error updating doctor status:", err)
    return { data: null, error: { message: "Failed to update doctor status" } }
  }
}

// Updated function to handle tier column gracefully
export const updateDoctorProfile = async (doctorId: string, updates: Partial<Doctor>) => {
  try {
    console.log("Updating doctor profile:", doctorId, updates)

    // If we're trying to update the tier, handle it separately
    if (updates.tier) {
      // First, try to check if the tier column exists by doing a simple select
      try {
        const { data: testDoctor, error: testError } = await supabase
          .from("doctors")
          .select("tier")
          .eq("id", doctorId)
          .limit(1)
          .single()

        if (testError && testError.message.includes("tier")) {
          // Tier column doesn't exist, return an informative error
          return {
            data: null,
            error: {
              message:
                "The tier feature is not yet available. Please run the database migration to add the tier column.",
              code: "TIER_COLUMN_MISSING",
            },
          }
        }
      } catch (testErr) {
        console.log("Could not test tier column, proceeding with update...")
      }
    }

    // Proceed with the update
    const { data, error } = await supabase
      .from("doctors")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", doctorId)
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor profile:", error)

      // Check if it's a tier column error
      if (error.message.includes("tier") || error.message.includes("column")) {
        return {
          data: null,
          error: {
            message: "The tier feature is not yet available. Please run the database migration to add the tier column.",
            code: "TIER_COLUMN_MISSING",
          },
        }
      }

      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error updating doctor profile:", err)
    return { data: null, error: { message: "Failed to update doctor profile" } }
  }
}

// Doctor location functions
export const getDoctorLocations = async (doctorId: string) => {
  try {
    const { data: locations, error } = await supabase
      .from("doctor_locations")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("is_primary", { ascending: false })

    if (error) {
      console.error("Error fetching doctor locations:", error)
      return { locations: null, error }
    }

    return { locations, error: null }
  } catch (err) {
    console.error("Unexpected error getting doctor locations:", err)
    return { locations: null, error: { message: "Failed to get doctor locations" } }
  }
}

export const createDoctorLocation = async (location: Omit<DoctorLocation, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("doctor_locations").insert(location).select().single()

    if (error) {
      console.error("Error creating doctor location:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error creating doctor location:", err)
    return { data: null, error: { message: "Failed to create doctor location" } }
  }
}

export const updateDoctorLocation = async (locationId: string, updates: Partial<DoctorLocation>) => {
  try {
    const { data, error } = await supabase
      .from("doctor_locations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", locationId)
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor location:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error updating doctor location:", err)
    return { data: null, error: { message: "Failed to update doctor location" } }
  }
}

export const deleteDoctorLocation = async (locationId: string) => {
  try {
    const { error } = await supabase.from("doctor_locations").delete().eq("id", locationId)

    if (error) {
      console.error("Error deleting doctor location:", error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error("Unexpected error deleting doctor location:", err)
    return { error: { message: "Failed to delete doctor location" } }
  }
}

// Doctor article functions
export const getDoctorArticles = async (doctorId: string) => {
  try {
    const { data: articles, error } = await supabase
      .from("doctor_articles")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching doctor articles:", error)
      return { articles: null, error }
    }

    return { articles, error: null }
  } catch (err) {
    console.error("Unexpected error getting doctor articles:", err)
    return { articles: null, error: { message: "Failed to get doctor articles" } }
  }
}

export const createDoctorArticle = async (article: Omit<DoctorArticle, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("doctor_articles").insert(article).select().single()

    if (error) {
      console.error("Error creating doctor article:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error creating doctor article:", err)
    return { data: null, error: { message: "Failed to create doctor article" } }
  }
}

export const updateDoctorArticle = async (articleId: string, updates: Partial<DoctorArticle>) => {
  try {
    const { data, error } = await supabase
      .from("doctor_articles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", articleId)
      .select()
      .single()

    if (error) {
      console.error("Error updating doctor article:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected error updating doctor article:", err)
    return { data: null, error: { message: "Failed to update doctor article" } }
  }
}

export const deleteDoctorArticle = async (articleId: string) => {
  try {
    const { error } = await supabase.from("doctor_articles").delete().eq("id", articleId)

    if (error) {
      console.error("Error deleting doctor article:", error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error("Unexpected error deleting doctor article:", err)
    return { error: { message: "Failed to delete doctor article" } }
  }
}

// File upload function
export const uploadFile = async (file: File, bucket: string, path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return { data: null, error }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return { data: { ...data, publicUrl }, error: null }
  } catch (err) {
    console.error("Unexpected error uploading file:", err)
    return { data: null, error: { message: "Failed to upload file" } }
  }
}

// Get public doctors (approved only)
export const getPublicDoctors = async () => {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(
        `
        *,
        doctor_locations(*),
        doctor_articles!inner(*)
      `,
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching public doctors:", error)
      return { doctors: null, error }
    }

    return { doctors, error: null }
  } catch (err) {
    console.error("Unexpected error getting public doctors:", err)
    return { doctors: null, error: { message: "Failed to get public doctors" } }
  }
}

/**
 * Sign in with email/password, then verify there's an admins.id = your user.id.
 * Returns { data: { user, admin }, error }.
 */
export const adminLogin = async (email: string, password: string) => {
  // 1) Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
  console.log("🔐 adminLogin – signInData:", signInData, "signInError:", signInError)
  if (signInError || !signInData.user) {
    return { data: null, error: signInError || new Error("Invalid credentials") }
  }

  // 2) Check the admins table
  const userId = signInData.user.id
  console.log("🔍 adminLogin – looking up admin with id =", userId)
  const { data: admin, error: adminError } = await supabase.from("admins").select("*").eq("id", userId).maybeSingle()
  console.log("🏷️ adminLogin – admin row:", admin, "adminError:", adminError)

  if (adminError) {
    return { data: null, error: new Error("Error verifying admin account") }
  }
  if (!admin) {
    return { data: null, error: new Error("Access denied. Not an admin.") }
  }

  // 3) Success
  return { data: { user: signInData.user, admin }, error: null }
}
