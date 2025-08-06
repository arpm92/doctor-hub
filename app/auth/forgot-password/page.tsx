"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/lib/supabase"
import { validateEmail } from "@/lib/validation"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate email
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      setLoading(false)
      return
    }

    try {
      const { error } = await resetPassword(email)

      if (error) {
        setError(error.message || "Failed to send reset email")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password reset error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">Check Your Email</CardTitle>
            <CardDescription className="text-emerald-700">
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Reset email sent</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-emerald-600 mt-2">If you don't see the email, check your spam folder.</p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
              <Button
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Try Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
