"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage(null)
    setResendError(null)

    try {
      // This would need the user's email - in a real app, you'd store this in state or URL params
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: "user@example.com", // You'd get this from somewhere
      })

      if (error) {
        setResendError("Failed to resend verification email. Please try again.")
      } else {
        setResendMessage("Verification email sent! Please check your inbox.")
      }
    } catch (err) {
      setResendError("An unexpected error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registration
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <p className="text-gray-600">We've sent a verification link to your email address</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {resendMessage && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{resendMessage}</AlertDescription>
              </Alert>
            )}

            {resendError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resendError}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">What's next?</h3>
                <ol className="text-sm text-gray-600 space-y-1 text-left">
                  <li>1. Check your email inbox</li>
                  <li>2. Click the verification link</li>
                  <li>3. Return here to sign in</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>

                <Button asChild className="w-full">
                  <Link href="/auth/login">Continue to Sign In</Link>
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Didn't receive the email? Check your spam folder or try resending.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
