"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doctorSignUp } from "@/lib/supabase"
import { validateEmail, validatePassword, validatePhone } from "@/lib/validation"

const specialties = [
  "General Practice",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Gastroenterology",
  "Neurology",
  "Obstetrics and Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Surgery",
  "Urology",
  "Other",
]

export default function DoctorRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialty: "",
    yearsExperience: "",
    bio: "",
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Basic validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    // Email validation
    const emailError = validateEmail(formData.email)
    if (emailError) {
      errors.email = emailError
    }

    // Phone validation
    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      errors.phone = phoneError
    }

    // Password validation
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      errors.password = passwordError
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (!formData.specialty) {
      errors.specialty = "Medical specialty is required"
    }

    const yearsExp = parseInt(formData.yearsExperience)
    if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 70) {
      errors.yearsExperience = "Please enter valid years of experience (0-70)"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("=== FORM SUBMISSION STARTED ===")
    console.log("Form data:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      specialty: formData.specialty,
      yearsExperience: formData.yearsExperience,
      bio: formData.bio ? `${formData.bio.substring(0, 50)}...` : "none"
    })

    if (!validateForm()) {
      console.log("Form validation failed:", validationErrors)
      setError("Please fix the validation errors above")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Calling doctorSignUp...")
      const { data, error: signUpError } = await doctorSignUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          specialty: formData.specialty,
          yearsExperience: parseInt(formData.yearsExperience),
          bio: formData.bio || undefined,
        }
      )

      console.log("doctorSignUp response:", { data: !!data, error: signUpError })

      if (signUpError) {
        console.error("Registration error:", signUpError.message)
        setError(signUpError.message)
        return
      }

      if (data?.user) {
        console.log("Registration successful!")
        setSuccess(
          "Registration successful! Please check your email to verify your account. Once verified, your profile will be reviewed by our team."
        )
        
        // Clear the form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          specialty: "",
          yearsExperience: "",
          bio: "",
        })

        // Redirect after a delay
        setTimeout(() => {
          router.push("/auth/doctor/login?message=registration-success")
        }, 3000)
      } else {
        console.error("No user data returned")
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Registration exception:", err)
      setError(`Registration failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Doctor Registration</CardTitle>
          <CardDescription className="text-center">
            Join our platform to connect with patients and grow your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={validationErrors.firstName ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.firstName && (
                  <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={validationErrors.lastName ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.lastName && (
                  <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={validationErrors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className={validationErrors.phone ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {validationErrors.phone && (
                <p className="text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={validationErrors.password ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Medical Specialty *</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => handleInputChange("specialty", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={validationErrors.specialty ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.specialty && (
                  <p className="text-sm text-red-600">{validationErrors.specialty}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="70"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                  className={validationErrors.yearsExperience ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {validationErrors.yearsExperience && (
                  <p className="text-sm text-red-600">{validationErrors.yearsExperience}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell patients about your background, experience, and approach to healthcare..."
                className="min-h-[100px]"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                This will be displayed on your public profile to help patients learn about you.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Doctor Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/doctor/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By registering, you agree to our terms of service and privacy policy.
              Your account will be reviewed before activation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
