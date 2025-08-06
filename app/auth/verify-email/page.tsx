"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email_confirmed_at) {
        setSuccess(true)
      }
    }

    checkVerification()
  }, [])

  const handleResendVerification = async () => {
    if (!email) {
      setError("No email address provided")
      return
    }

    setLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setError("Failed to resend verification email")
      console.error("Resend verification error:", err)
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
            <CardTitle className="text-2xl text-emerald-900">Email Verified!</CardTitle>
            <CardDescription className="text-emerald-700">
              Your email has been successfully verified. You can now access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/login">Continue to Sign In</Link>
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
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify
            your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-emerald-800">
                Verification email sent successfully! Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          {email && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {email}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What to do next:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your email inbox for a verification message</li>
              <li>• Click the verification link in the email</li>
              <li>• If you don't see it, check your spam/junk folder</li>
              <li>• The link will expire in 24 hours</li>
            </ul>
          </div>

          {email && (
            <Button
              onClick={handleResendVerification}
              disabled={loading}
              variant="outline"
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}

          <div className="text-center space-y-2">
            <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700">
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
