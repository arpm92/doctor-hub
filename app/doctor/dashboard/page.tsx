"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  FileText,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react"
import { getCurrentUser, getCurrentDoctor, signOut, type Doctor } from "@/lib/supabase"

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorProfile = async () => {
      try {
        const { user } = await getCurrentUser()

        if (!user) {
          router.push("/auth/doctor/login")
          return
        }

        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()

        if (doctorError) {
          setError("Failed to load doctor profile")
        } else if (!doctorData) {
          setError("Doctor profile not found. Please contact support.")
        } else {
          setDoctor(doctorData)
        }
      } catch (err) {
        console.error("Error loading doctor profile:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorProfile()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
      case "suspended":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find your doctor profile. Please contact support for assistance.
            </p>
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {doctor.last_name}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Status Alert */}
        {doctor.status !== "approved" && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {doctor.status === "pending" && (
                <>
                  Your account is pending approval. Our team is reviewing your credentials and will notify you once
                  approved.
                </>
              )}
              {doctor.status === "rejected" && (
                <>Your account application was not approved. Please contact support for more information.</>
              )}
              {doctor.status === "suspended" && (
                <>Your account has been suspended. Please contact support for assistance.</>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-lg font-medium">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                    <Badge className={`${getStatusColor(doctor.status)} flex items-center gap-1 w-fit mt-1`}>
                      {getStatusIcon(doctor.status)}
                      {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-gray-900">{doctor.email}</p>
                  </div>
                  {doctor.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="text-gray-900">{doctor.phone}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" />
                      Specialty
                    </Label>
                    <p className="text-gray-900">{doctor.specialty}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      Years of Experience
                    </Label>
                    <p className="text-gray-900">{doctor.years_experience} years</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    License Number
                  </Label>
                  <p className="text-gray-900 font-mono">{doctor.license_number}</p>
                </div>

                {doctor.bio && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Professional Bio</Label>
                    <p className="text-gray-900 mt-1">{doctor.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" disabled={doctor.status !== "approved"}>
                  View Appointments
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled={doctor.status !== "approved"}>
                  Manage Schedule
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member Since:</span>
                  <span>{new Date(doctor.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(doctor.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Languages:</span>
                  <span>{doctor.languages?.join(", ") || "English"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`block text-sm font-medium ${className}`}>{children}</div>
}
