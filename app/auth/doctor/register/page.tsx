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
import { ArrowLeft, Heart, Stethoscope, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { doctorSignUp } from "@/lib/supabase"
import { validateEmail, validatePassword, validateName, validatePhone } from "@/lib/validation"

const specialties = [
  "Cardiologist",
  "Neurologist", 
  "Pediatrician",
  "Orthopedic Surgeon",
  "Dermatologist",
  "Psychiatrist",
  "General Practice",
  "Internal Medicine",
  "Emergency Medicine",
  "Radiology",
  "Anesthesiology",
  "Pathology",
  "Surgery",
  "Obstetrics and Gynecology",
  "Ophthalmology",
  "Otolaryngology",
  "Urology",
  "Oncology",
  "Endocrinology",
  "Gastroenterology"
]

export default function DoctorRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    yearsExperience: "",
    bio: "",
    password: "",
    confirmPassword: ""
  })

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validate first name
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    } else if (!validateName(formData.firstName)) {
      errors.firstName = "First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    } else if (!validateName(formData.lastName)) {
      errors.lastName = "Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate phone (required)
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone, true)) {
      errors.phone = "Phone number must contain 10-15 digits"
    }

    // Validate specialty
    if (!formData.specialty) {
      errors.specialty = "Please select your medical specialty"
    }

    // Validate years of experience
    if (!formData.yearsExperience.trim()) {
      errors.yearsExperience = "Years of experience is required"
    } else {
      const years = parseInt(formData.yearsExperience)
      if (isNaN(years) || years < 0 || years > 60) {
        errors.yearsExperience = "Years of experience must be between 0 and 60"
      }
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      errors.password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
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
      bioLength: formData.bio.length
    })
    
    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Starting doctor registration...")
      
      const doctorData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        specialty: formData.specialty,
        yearsExperience: parseInt(formData.yearsExperience),
        bio: formData.bio.trim() || undefined
      }

      console.log("Calling doctorSignUp with:", {
        email: formData.email,
        doctorData
      })
      
      const { data, error } = await doctorSignUp(
        formData.email,
        formData.password,
        doctorData
      )

      console.log("doctorSignUp response:", { data: !!data, error })

      if (error) {
        console.error("Registration error:", error)
        setError(error.message || "Registration failed. Please try again.")
        return
      }

      if (data?.user) {
        console.log("Registration successful!")
        setSuccess(true)
        
        // Redirect to verification page after a short delay
        setTimeout(() => {
          router.push("/auth/verify-email?type=doctor")
        }, 2000)
      } else {
        console.error("No user data returned")
        setError("Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Unexpected registration error:", err)
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-emerald-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Please check your email to verify your account. Once verified, our team will review your application.
            </p>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/verify-email?type=doctor">
                Continue to Verification
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Join Our Medical Network</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Connect with patients and grow your practice with MedConnect
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700 font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.firstName ? "border-red-300" : ""
                      }`}
                      placeholder="Enter your first name"
                      required
                    />
                    {validationErrors.firstName && (
                      <p className="text-sm text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700 font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.lastName ? "border-red-300" : ""
                      }`}
                      placeholder="Enter your last name"
                      required
                    />
                    {validationErrors.lastName && (
                      <p className="text-sm text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                      validationErrors.email ? "border-red-300" : ""
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                      validationErrors.phone ? "border-red-300" : ""
                    }`}
                    placeholder="Enter your phone number (10-15 digits)"
                    required
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-red-600">{validationErrors.phone}</p>
                  )}
                  <p className="text-sm text-gray-500">Format: +1234567890 or (123) 456-7890</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-gray-700 font-medium">
                      Medical Specialty *
                    </Label>
                    <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                      <SelectTrigger className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.specialty ? "border-red-300" : ""
                      }`}>
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
                    <Label htmlFor="yearsExperience" className="text-gray-700 font-medium">
                      Years of Experience *
                    </Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      min="0"
                      max="60"
                      value={formData.yearsExperience}
                      onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.yearsExperience ? "border-red-300" : ""
                      }`}
                      placeholder="0"
                      required
                    />
                    {validationErrors.yearsExperience && (
                      <p className="text-sm text-red-600">{validationErrors.yearsExperience}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">
                    Professional Bio <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                    placeholder="Tell us about your background, expertise, and what makes you unique..."
                    maxLength={1000}
                  />
                  <p className="text-sm text-gray-500">{formData.bio.length}/1000 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.password ? "border-red-300" : ""
                      }`}
                      placeholder="Create a strong password"
                      required
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-red-600">{validationErrors.password}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Must include: 8+ chars, uppercase, lowercase, number, special character
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 ${
                        validationErrors.confirmPassword ? "border-red-300" : ""
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" />
                      Join MedConnect
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-emerald-200">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/doctor/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
