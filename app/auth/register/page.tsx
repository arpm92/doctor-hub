"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Mail,
  Lock,
  Chrome,
  Phone,
  Calendar,
  User,
  AlertCircle,
  Heart,
  Shield,
} from "lucide-react"
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDateOfBirth,
  validatePassword,
} from "@/lib/validation"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1) Collect errors
    const errors: Record<string, string> = {}

    if (!validateName(formData.firstName, "First name") && formData.firstName.trim().length < 2)
      errors.firstName = "First name must be 2–50 letters"
    if (!validateName(formData.lastName, "Last name") && formData.lastName.trim().length < 2)
      errors.lastName = "Last name must be 2–50 letters"
    if (validateEmail(formData.email))
      errors.email = validateEmail(formData.email)!
    if (validatePhone(formData.phone))
      errors.phone = validatePhone(formData.phone)!
    if (validateDateOfBirth(formData.dateOfBirth))
      errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth)!
    if (validatePassword(formData.password))
      errors.password = validatePassword(formData.password)!
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords do not match"
    if (!formData.agreeToTerms)
      errors.agreeToTerms = "You must agree to the terms"

    console.log("Validation errors:", errors)

    // 2) If any, show first and abort
    if (Object.keys(errors).length > 0) {
      setSubmitError(Object.values(errors)[0])
      return
    }

    // 3) Otherwise, proceed with your signup logic
    try {
      // TODO: await supabase.auth.signUp(...) or your RPC
      console.log("All validations passed – now call signup!")
    } catch (_err) {
      setSubmitError("Registration failed — please try again.")
    }
  }

  const handleGoogleSignup = () => {
    setSubmitError("Patient registration is currently under development. Please check back soon!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-blue-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              Create Account
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            </CardTitle>
            <p className="text-gray-600">Join our community to leave reviews and book appointments</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Patient registration is currently under development. You can still browse doctor profiles and contact
                them directly.
              </AlertDescription>
            </Alert>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleSignup}
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent"
              size="lg"
              disabled
            >
              <Chrome className="h-5 w-5" />
              Sign up with Google (Coming Soon)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date" // you can use date picker
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Create Account
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign in (Coming Soon)
              </Link>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Coming Soon Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Secure patient registration</li>
                <li>• Profile management</li>
                <li>• Appointment booking system</li>
                <li>• Review and rating system</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
