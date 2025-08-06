"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updatePassword } from "@/lib/supabase"
import { validatePassword } from "@/lib/validation"
import { Lock, CheckCircle, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the required URL parameters for password reset
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const type = searchParams.get("type")

    if (type === "recovery" && accessToken && refreshToken) {
      setValidSession(true)
    } else {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate password
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(password)

      if (error) {
        setError(error.message || "Failed to update password")
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Password update error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!validSession && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Invalid Reset Link</CardTitle>
            <CardDescription className="text-red-700">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Password reset links expire after 1 hour for security reasons. Please request a new password reset if
                you need to change your password.
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/auth/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-900">Password Updated!</CardTitle>
            <CardDescription className="text-emerald-700">
              Your password has been successfully updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                You will be automatically redirected to the sign in page in a few seconds.
              </p>
            </div>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/login">Sign In Now</Link>
            </Button>
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
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Set New Password
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your new password below. Make sure it's strong and secure.
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
              <Label htmlFor="password" className="text-gray-700 font-medium">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Enter your new password"
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Confirm your new password"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
