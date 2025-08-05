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
    const signupData = {
      email,
      password,
      options: {
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
    const signupData = {
      email,
      password,
      options: {
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

    const signupData = {
      email,
      password,
      options: {
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

/**
 * Sign in with email/password, then verify there’s an admins.id = your user.id.
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
