"use client"
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
  XCircle,
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
    const loadDoctorData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated
        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        // Get doctor profile
        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()

        if (doctorError) {
          setError("Failed to load doctor profile")
          return
        }

        if (!doctorData) {
          setError("Doctor profile not found. Please contact support.")
          return
        }

        setDoctor(doctorData)
      } catch (err) {
        console.error("Error loading doctor data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-4">
              Your doctor profile could not be found. Please contact support for assistance.
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600">Welcome back, Dr. {doctor.last_name}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Status Alert */}
        {doctor.status === "pending" && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your account is currently under review. You'll receive an email notification once your profile is
              approved. This typically takes 1-2 business days.
            </AlertDescription>
          </Alert>
        )}

        {doctor.status === "rejected" && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Your account application was not approved. Please contact support for more information about the review
              process.
            </AlertDescription>
          </Alert>
        )}

        {doctor.status === "suspended" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your account has been suspended. Please contact support for assistance with reactivating your account.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Professional Profile
                  </CardTitle>
                  {getStatusBadge(doctor.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{doctor.email}</p>
                      </div>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{doctor.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Specialty</p>
                        <p className="font-medium">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium">{doctor.license_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Years of Experience</p>
                        <p className="font-medium">{doctor.years_experience} years</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {doctor.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
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
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled={doctor.status !== "approved"}>
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled={doctor.status !== "approved"}>
                  <Mail className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  {getStatusBadge(doctor.status)}
                  <p className="text-sm text-gray-600">
                    {doctor.status === "approved" && "Your account is active and ready to use."}
                    {doctor.status === "pending" && "Your account is being reviewed by our team."}
                    {doctor.status === "rejected" && "Please contact support for assistance."}
                    {doctor.status === "suspended" && "Your account access is temporarily restricted."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Member since {new Date(doctor.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
