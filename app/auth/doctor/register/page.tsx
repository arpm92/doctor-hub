"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doctorSignUp } from "@/lib/supabase"
import { Stethoscope, Mail, CheckCircle } from "lucide-react"

const specialties = [
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Neurology",
  "Obstetrics and Gynecology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Urology",
  "Other",
]

export default function DoctorRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialty: "",
    yearsExperience: "",
    bio: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (!formData.specialty) {
      setError("Please select your medical specialty")
      setLoading(false)
      return
    }

    const yearsExp = Number.parseInt(formData.yearsExperience)
    if (isNaN(yearsExp) || yearsExp < 0) {
      setError("Please enter a valid number of years of experience")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await doctorSignUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        specialty: formData.specialty,
        yearsExperience: yearsExp,
        bio: formData.bio,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Don't redirect immediately, show success message
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Registration error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">Registration Successful!</CardTitle>
            <CardDescription className="text-emerald-700">
              Please check your email to verify your account before signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Verification email sent</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                We've sent a verification link to <strong>{formData.email}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/doctor/login">Go to Sign In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Join as a Doctor
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Create your professional profile and connect with patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

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
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter your first name"
                />
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
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Enter your last name"
                />
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
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter your email address"
              />
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
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Create a password"
                />
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
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-gray-700 font-medium">
                  Medical Specialty *
                </Label>
                <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                  <SelectTrigger className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
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
                <Label htmlFor="yearsExperience" className="text-gray-700 font-medium">
                  Years of Experience *
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                  required
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 font-medium">
                Professional Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                placeholder="Tell us about your background, expertise, and what makes you unique as a healthcare provider..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Creating Account..." : "Create Doctor Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/doctor/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Are you a patient?{" "}
              <Link href="/auth/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Register as a patient
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
