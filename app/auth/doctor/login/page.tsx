"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Lock, Chrome, AlertCircle, Loader2, Stethoscope, Shield } from "lucide-react"

export default function DoctorLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    // Mock doctor login - in a real app, this would authenticate with backend
    setTimeout(() => {
      setSubmitError("Doctor portal is coming soon! Please use the contact form to join our network.")
      setIsSubmitting(false)
    }, 1000)
  }

  const handleGoogleLogin = () => {
    setSubmitError("Doctor portal is coming soon! Please use the contact form to join our network.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              Doctor Portal
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            </CardTitle>
            <p className="text-gray-600">Secure access for healthcare professionals</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                The doctor portal is currently under development. If you're a healthcare professional interested in
                joining our network, please use our contact form.
              </AlertDescription>
            </Alert>

            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full flex items-center gap-2 bg-transparent"
              size="lg"
              disabled
            >
              <Chrome className="h-5 w-5" />
              Continue with Google (Coming Soon)
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Professional Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In (Coming Soon)"
                )}
              </Button>
            </form>

            <div className="text-center space-y-4">
              <div className="text-sm">
                <span className="text-gray-600">Want to join our network? </span>
                <Link href="/contact" className="text-green-600 hover:text-green-800 font-medium">
                  Apply here
                </Link>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">For Healthcare Professionals</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Secure patient management</li>
                  <li>• Online appointment booking</li>
                  <li>• Professional profile showcase</li>
                  <li>• Revenue tracking & analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
