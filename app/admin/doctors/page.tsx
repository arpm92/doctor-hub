"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { Users, Search, Filter, UserCheck, UserX, Clock, AlertCircle, CheckCircle, XCircle, Loader2, Eye, Edit } from 'lucide-react'
import { 
  getCurrentAdmin, 
  getAllDoctors, 
  updateDoctorStatus, 
  updateDoctorProfile,
  type Doctor 
} from "@/lib/supabase"

export default function AdminDoctorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [admin, setAdmin] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || "all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check admin access
        const { admin: adminData, error: adminError } = await getCurrentAdmin()
        if (adminError || !adminData) {
          router.push("/admin/login")
          return
        }
        setAdmin(adminData)

        // Load doctors
        const { doctors: doctorsData, error: doctorsError } = await getAllDoctors()
        if (doctorsError) {
          setError("Failed to load doctors")
          return
        }

        setDoctors(doctorsData || [])
        setFilteredDoctors(doctorsData || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = doctors

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(doctor => doctor.status === statusFilter)
    }

    // Specialty filter
    if (specialtyFilter !== "all") {
      filtered = filtered.filter(doctor => doctor.specialty === specialtyFilter)
    }

    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, statusFilter, specialtyFilter])

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor["status"]) => {
    try {
      setIsUpdating(doctorId)
      const { data, error } = await updateDoctorStatus(doctorId, newStatus)
      
      if (error) {
        alert(`Failed to update status: ${error.message}`)
        return
      }

      // Update local state
      setDoctors(prev => prev.map(doctor => 
        doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor
      ))
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Failed to update doctor status")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleTierUpdate = async (doctorId: string, newTier: Doctor["tier"]) => {
    try {
      setIsUpdating(doctorId)
      const { data, error } = await updateDoctorProfile(doctorId, { tier: newTier })
      
      if (error) {
        if (error.code === "TIER_COLUMN_MISSING") {
          alert("The tier feature is not yet available. Please run the database migration to add the tier column.")
        } else {
          alert(`Failed to update tier: ${error.message}`)
        }
        return
      }

      // Update local state
      setDoctors(prev => prev.map(doctor => 
        doctor.id === doctorId ? { ...doctor, tier: newTier } : doctor
      ))
    } catch (err) {
      console.error("Error updating tier:", err)
      alert("Failed to update doctor tier")
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusBadge = (status: Doctor["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><UserCheck className="h-3 w-3 mr-1" />Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><UserX className="h-3 w-3 mr-1" />Rejected</Badge>
      case "suspended":
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTierBadge = (tier: Doctor["tier"]) => {
    switch (tier) {
      case "premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>
      case "basic":
        return <Badge className="bg-gray-100 text-gray-800">Basic</Badge>
      default:
        return <Badge variant="outline">Basic</Badge>
    }
  }

  const uniqueSpecialties = Array.from(new Set(doctors.map(d => d.specialty))).sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      
          <p className="text-gray-600">Loading doctors...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Doctors</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <Button onClick={() => router.push("/admin/login")} className="w-full">
              Sign In
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
              <GoBackButton fallbackUrl="/admin/dashboard" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
                <p className="text-gray-600">
                  Manage doctor registrations and profiles
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {filteredDoctors.length} doctors
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {uniqueSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || specialtyFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No doctors have registered yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Profile Image */}
                    <div className="w-20 h-20 relative rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                      {doctor.profile_image ? (
                        <Image
                          src={doctor.profile_image || "/placeholder.svg"}
                          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h3>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          <p className="text-sm text-gray-500">{doctor.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doctor.status)}
                          {getTierBadge(doctor.tier)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Experience:</span>
                          <span className="text-gray-600 ml-1">{doctor.years_experience} years</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Phone:</span>
                          <span className="text-gray-600 ml-1">{doctor.phone || "Not provided"}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Languages:</span>
                          <span className="text-gray-600 ml-1">
                            {doctor.languages?.join(", ") || "English"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Registered:</span>
                          <span className="text-gray-600 ml-1">
                            {new Date(doctor.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">{doctor.bio}</p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                        {/* Status Actions */}
                        {doctor.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(doctor.id, "approved")}
                              disabled={isUpdating === doctor.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating === doctor.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(doctor.id, "rejected")}
                              disabled={isUpdating === doctor.id}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {isUpdating === doctor.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </Button>
                          </>
                        )}

                        {doctor.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(doctor.id, "suspended")}
                            disabled={isUpdating === doctor.id}
                            className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                          >
                            {isUpdating === doctor.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Suspend
                          </Button>
                        )}

                        {(doctor.status === "rejected" || doctor.status === "suspended") && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(doctor.id, "approved")}
                            disabled={isUpdating === doctor.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isUpdating === doctor.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            Reactivate
                          </Button>
                        )}

                        {/* Tier Actions */}
                        <Select
                          value={doctor.tier}
                          onValueChange={(value) => handleTierUpdate(doctor.id, value as Doctor["tier"])}
                          disabled={isUpdating === doctor.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* View Profile */}
                        {doctor.slug && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="bg-transparent"
                          >
                            <a href={`/doctors/${doctor.slug}`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3 mr-1" />
                              View Profile
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
