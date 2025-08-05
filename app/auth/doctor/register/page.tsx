"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Stethoscope,
  FileText,
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { doctorSignUp } from "@/lib/supabase"

const specialties = [
  "General Practice",
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Anesthesiology",
  "Emergency Medicine",
  "Family Medicine",
  "Other",
]

export default function DoctorRegisterPage() {
  const router = useRouter()
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required"
    if (!formData.lastName.trim()) return "Last name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.password) return "Password is required"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (!formData.specialty) return "Medical specialty is required"
    if (!formData.yearsExperience) return "Years of experience is required"

    const experience = Number.parseInt(formData.yearsExperience)
    if (isNaN(experience) || experience < 0) return "Years of experience must be a valid number"

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const validationError = validateForm()
    if (validationError) {
      setSubmitError(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      const { data, error } = await doctorSignUp(formData.email.trim(), formData.password, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        specialty: formData.specialty,
        yearsExperience: Number.parseInt(formData.yearsExperience),
        bio: formData.bio.trim() || undefined,
      })

      if (error) {
        setSubmitError(error.message)
      } else if (data?.user) {
        setIsSuccess(true)
        // Redirect to verification page after a short delay
        setTimeout(() => {
          router.push("/auth/verify-email")
        }, 2000)
      }
    } catch (err) {
      console.error("Registration error:", err)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-emerald-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your doctor account has been created successfully. Please check your email to verify your account.
            </p>
            <p className="text-sm text-gray-500">
              Your profile is pending approval. You'll be notified once it's reviewed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link
          href="/auth/doctor/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctor Login
        </Link>

        <Card className="border-emerald-200 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <div className="mx-auto mb-4 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">Join Our Medical Network</CardTitle>
            <p className="text-emerald-100">Create your professional doctor account</p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="flex items-center gap-2 text-gray-700">
                      <User className="h-4 w-4 text-emerald-600" />
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="flex items-center gap-2 text-gray-700">
                      <User className="h-4 w-4 text-emerald-600" />
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    Professional Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Account Security</h3>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-gray-700">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-700">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Professional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="specialty" className="flex items-center gap-2 text-gray-700">
                    <Stethoscope className="h-4 w-4 text-emerald-600" />
                    Medical Specialty *
                  </Label>
                  <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                    <SelectTrigger className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience" className="flex items-center gap-2 text-gray-700">
                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                    Years of Experience *
                  </Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="5"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2 text-gray-700">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your background, expertise, and approach to patient care..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    rows={4}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Doctor Account"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link href="/auth/doctor/login" className="text-emerald-600 hover:text-emerald-800 font-medium">
                  Sign in here
                </Link>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-medium text-emerald-900 mb-2">Account Review Process</h3>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Your credentials will be verified</li>
                  <li>• Account approval typically takes 1-2 business days</li>
                  <li>• You'll receive email updates on your status</li>
                  <li>• Contact support if you have questions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
