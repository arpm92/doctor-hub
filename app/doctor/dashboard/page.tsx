"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, FileText, Camera, Edit, Plus, Clock, CheckCircle, AlertCircle, XCircle, Loader2, LogOut, Settings } from 'lucide-react'
import {
  getCurrentUser,
  getCurrentDoctor,
  getDoctorLocations,
  getDoctorArticles,
  signOut,
  type Doctor,
  type DoctorLocation,
  type DoctorArticle,
} from "@/lib/supabase"
import { GoBackButton } from "@/components/go-back-button"

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [locations, setLocations] = useState<DoctorLocation[]>([])
  const [articles, setArticles] = useState<DoctorArticle[]>([])
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

        // Load locations and articles
        const [locationsResult, articlesResult] = await Promise.all([
          getDoctorLocations(doctorData.id),
          getDoctorArticles(doctorData.id),
        ])

        if (locationsResult.locations) {
          setLocations(locationsResult.locations)
        }

        if (articlesResult.articles) {
          setArticles(articlesResult.articles)
        }
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

  const getStatusBadge = (status: Doctor["status"]) => {
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
            <div className="flex items-center gap-4">
              <GoBackButton fallbackUrl="/" />
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {doctor.profile_image ? (
                  <img
                    src={doctor.profile_image || "/placeholder.svg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dr. {doctor.first_name} {doctor.last_name}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">{doctor.specialty}</p>
                  {getStatusBadge(doctor.status)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/doctor/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{doctor.status === "approved" ? "Active" : "Inactive"}</div>
                  <p className="text-xs text-muted-foreground">
                    {doctor.status === "approved" ? "Visible to patients" : "Not visible to patients"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Locations</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {locations.filter((l) => l.is_primary).length} primary
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{articles.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {articles.filter((a) => a.status === "published").length} published
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/doctor/profile">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/doctor/profile/photo">
                      <Camera className="h-4 w-4 mr-2" />
                      Update Photo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/doctor/locations">
                      <MapPin className="h-4 w-4 mr-2" />
                      Manage Locations
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/doctor/locations/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            {articles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Recent Articles
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/doctor/articles">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.slice(0, 3).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-gray-500">
                            {article.status === "published" ? "Published" : "Draft"} •{" "}
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctor/articles/${article.id}`}>Edit</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="font-medium">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </p>
                        <p className="text-sm text-gray-500">Name cannot be changed</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="font-medium">{doctor.email}</p>
                      </div>
                      {doctor.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="font-medium">{doctor.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specialty</label>
                        <p className="font-medium">{doctor.specialty}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Years of Experience</label>
                        <p className="font-medium">{doctor.years_experience} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Languages</label>
                        <p className="font-medium">{doctor.languages?.join(", ") || "English"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {doctor.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Professional Bio</h3>
                    <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/doctor/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/doctor/profile/photo">
                      <Camera className="h-4 w-4 mr-2" />
                      Update Photo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Practice Locations</CardTitle>
                  <Button asChild>
                    <Link href="/doctor/locations/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {locations.length > 0 ? (
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <div key={location.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{location.name}</h4>
                              {location.is_primary && <Badge variant="secondary">Primary</Badge>}
                            </div>
                            <p className="text-gray-600">{location.address}</p>
                            <p className="text-gray-600">
                              {location.city}, {location.state} {location.postal_code}
                            </p>
                            {location.phone && <p className="text-gray-600">{location.phone}</p>}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctor/locations/${location.id}`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No locations added</h3>
                    <p className="text-gray-600 mb-4">Add your practice locations to help patients find you.</p>
                    <Button asChild>
                      <Link href="/doctor/locations/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Location
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Articles</CardTitle>
                  <Button asChild>
                    <Link href="/doctor/articles/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Write Article
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{article.title}</h4>
                              <Badge
                                variant={
                                  article.status === "published"
                                    ? "default"
                                    : article.status === "draft"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {article.status}
                              </Badge>
                            </div>
                            {article.excerpt && <p className="text-gray-600 mb-2">{article.excerpt}</p>}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {article.status === "published" && article.published_at
                                  ? `Published ${new Date(article.published_at).toLocaleDateString()}`
                                  : `Created ${new Date(article.created_at).toLocaleDateString()}`}
                              </span>
                              {article.read_time && <span>{article.read_time} min read</span>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctor/articles/${article.id}`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                    <p className="text-gray-600 mb-4">
                      Share your expertise by writing articles for patients and colleagues.
                    </p>
                    <Button asChild>
                      <Link href="/doctor/articles/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Write Your First Article
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
