"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { Search, Filter, ExternalLink, AlertTriangle, Crown, Star, Shield, User, Calendar, Award, CheckCircle } from 'lucide-react'
import { getAllDoctors, updateDoctorStatus, updateDoctorProfile, getCurrentAdmin, type Doctor } from "@/lib/supabase"
import Link from "next/link"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  suspended: "bg-gray-100 text-gray-800 border-gray-200",
}

const tierColors = {
  basic: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-blue-100 text-blue-800 border-blue-200",
  premium: "bg-purple-100 text-purple-800 border-purple-200",
}

const tierIcons = {
  basic: Shield,
  medium: Star,
  premium: Crown,
}

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tierFilter, setTierFilter] = useState("all")
  const [updatingDoctors, setUpdatingDoctors] = useState<Set<string>>(new Set())
  const [tierFeatureAvailable, setTierFeatureAvailable] = useState(true)

  useEffect(() => {
    checkAdminAccess()
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm, statusFilter, tierFilter])

  const checkAdminAccess = async () => {
    try {
      const { admin, error } = await getCurrentAdmin()
      if (error || !admin) {
        router.push("/admin/login")
        return
      }
    } catch (err) {
      console.error("Error checking admin access:", err)
      router.push("/admin/login")
    }
  }

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError("")
      const { doctors: doctorsData, error: doctorsError } = await getAllDoctors()

      if (doctorsError) {
        setError("Failed to load doctors")
        console.error("Error loading doctors:", doctorsError)
        return
      }

      setDoctors(doctorsData || [])
    } catch (err) {
      console.error("Unexpected error loading doctors:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (doctor) =>
          doctor.first_name.toLowerCase().includes(term) ||
          doctor.last_name.toLowerCase().includes(term) ||
          doctor.email.toLowerCase().includes(term) ||
          doctor.specialty.toLowerCase().includes(term),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.status === statusFilter)
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter((doctor) => doctor.tier === tierFilter)
    }

    setFilteredDoctors(filtered)
  }

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor["status"]) => {
    try {
      setUpdatingDoctors((prev) => new Set(prev).add(doctorId))
      setError("")
      setSuccess("")

      const { data, error } = await updateDoctorStatus(doctorId, newStatus)

      if (error) {
        setError(`Failed to update doctor status: ${error.message}`)
        return
      }

      // Update local state
      setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor)))
      setSuccess(`Doctor status updated to ${newStatus} successfully!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error updating doctor status:", err)
      setError("Failed to update doctor status")
    } finally {
      setUpdatingDoctors((prev) => {
        const newSet = new Set(prev)
        newSet.delete(doctorId)
        return newSet
      })
    }
  }

  const handleTierUpdate = async (doctorId: string, newTier: Doctor["tier"]) => {
    try {
      setUpdatingDoctors((prev) => new Set(prev).add(doctorId))
      setError("")
      setSuccess("")

      const { data, error } = await updateDoctorProfile(doctorId, { tier: newTier })

      if (error) {
        if (error.code === "TIER_COLUMN_MISSING") {
          setTierFeatureAvailable(false)
          setError("Tier feature is not available. Please run the database migration to add the tier column.")
        } else {
          setError(`Failed to update doctor tier: ${error.message}`)
        }
        return
      }

      // Update local state
      setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, tier: newTier } : doctor)))
      setSuccess(`Doctor tier updated to ${newTier} successfully!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("Error updating doctor tier:", err)
      setError("Failed to update doctor tier")
    } finally {
      setUpdatingDoctors((prev) => {
        const newSet = new Set(prev)
        newSet.delete(doctorId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: Doctor["status"]) => {
    return (
      <Badge className={statusColors[status]} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTierBadge = (tier: Doctor["tier"]) => {
    const TierIcon = tierIcons[tier]
    return (
      <Badge className={tierColors[tier]} variant="outline">
        <TierIcon className="w-3 h-3 mr-1" />
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GoBackButton fallbackUrl="/admin/dashboard" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600 mt-1">Manage doctor registrations and profiles</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">Total: {doctors.length} doctors</div>
      </div>

      {!tierFeatureAvailable && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            The tier management feature is not available. Please run the database migration to enable tier
            functionality.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
            <Select value={tierFilter} onValueChange={setTierFilter} disabled={!tierFeatureAvailable}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors ({filteredDoctors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  {tierFeatureAvailable && <TableHead>Tier</TableHead>}
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No doctors found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                          {doctor.phone && <div className="text-sm text-gray-500">{doctor.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{doctor.specialty}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{doctor.years_experience} years</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(doctor.status)}
                          <Select
                            value={doctor.status}
                            onValueChange={(value: Doctor["status"]) => handleStatusUpdate(doctor.id, value)}
                            disabled={updatingDoctors.has(doctor.id)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      {tierFeatureAvailable && (
                        <TableCell>
                          <div className="space-y-2">
                            {getTierBadge(doctor.tier)}
                            <Select
                              value={doctor.tier}
                              onValueChange={(value: Doctor["tier"]) => handleTierUpdate(doctor.id, value)}
                              disabled={updatingDoctors.has(doctor.id)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(doctor.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {doctor.slug && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/doctors/${doctor.slug}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingDoctors.has(doctor.id)}
                            onClick={() => {
                              // Add view profile functionality here if needed
                              console.log("View profile:", doctor.id)
                            }}
                          >
                            {updatingDoctors.has(doctor.id) ? "..." : "View"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
              <User className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {doctors.filter((d) => d.status === "pending").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {doctors.filter((d) => d.status === "approved").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {doctors.filter((d) => d.status === "rejected").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
