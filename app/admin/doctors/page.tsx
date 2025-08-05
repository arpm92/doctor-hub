"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Star,
  Crown,
  Shield,
  AlertCircle,
  Database,
  ExternalLink,
} from "lucide-react"
import { getAllDoctors, updateDoctorStatus, updateDoctorProfile, getCurrentUser, getCurrentAdmin } from "@/lib/supabase"
import type { Doctor } from "@/lib/supabase"

export default function AdminDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState<string | null>(null)
  const [tierFeatureAvailable, setTierFeatureAvailable] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push("/admin/login")
        return
      }

      const { admin } = await getCurrentAdmin()
      if (!admin) {
        setError("Access denied. Admin privileges required.")
        return
      }

      await fetchDoctors()
    } catch (err) {
      console.error("Error checking admin access:", err)
      setError("Failed to verify admin access")
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      const { doctors, error } = await getAllDoctors()

      if (error) {
        throw new Error(error.message)
      }

      setDoctors(doctors || [])
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setError(err instanceof Error ? err.message : "Failed to load doctors")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor["status"]) => {
    try {
      setIsUpdating(true)
      setUpdateMessage(null)

      const { error } = await updateDoctorStatus(doctorId, newStatus)

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor)))
      setUpdateMessage(`Doctor status updated to ${newStatus}`)

      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000)
    } catch (err) {
      console.error("Error updating doctor status:", err)
      setUpdateMessage(`Failed to update doctor status: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTierUpdate = async (doctorId: string, newTier: Doctor["tier"]) => {
    try {
      setIsUpdating(true)
      setUpdateMessage(null)

      const { data, error } = await updateDoctorProfile(doctorId, { tier: newTier })

      if (error) {
        // Check if it's a tier column missing error
        if (error.code === "TIER_COLUMN_MISSING" || error.message.includes("tier")) {
          setTierFeatureAvailable(false)
          setUpdateMessage("Tier feature is not yet available. Please run the database migration first.")
        } else {
          throw new Error(error.message)
        }
      } else {
        // Update local state
        setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, tier: newTier } : doctor)))
        setUpdateMessage(`Doctor tier updated to ${newTier}`)

        // Clear message after 3 seconds
        setTimeout(() => setUpdateMessage(null), 3000)
      }
    } catch (err) {
      console.error("Error updating doctor tier:", err)
      setUpdateMessage(`Failed to update doctor tier: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDoctor = (doctor: Doctor) => {
    // Generate slug if not available
    const slug =
      doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}-${doctor.id.slice(0, 8)}`
    window.open(`/doctors/${slug}`, "_blank")
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || doctor.status === statusFilter
    const matchesTier = tierFilter === "all" || (doctor.tier || "basic") === tierFilter
    const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter

    return matchesSearch && matchesStatus && matchesTier && matchesSpecialty
  })

  const uniqueSpecialties = Array.from(new Set(doctors.map((d) => d.specialty))).sort()

  const getStatusIcon = (status: Doctor["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "suspended":
        return <Pause className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getTierIcon = (tier: Doctor["tier"]) => {
    switch (tier) {
      case "premium":
        return <Crown className="h-4 w-4 text-purple-600" />
      case "medium":
        return <Star className="h-4 w-4 text-blue-600" />
      default:
        return <Shield className="h-4 w-4 text-gray-600" />
    }
  }

  const getTierBadgeVariant = (tier: Doctor["tier"]) => {
    switch (tier) {
      case "premium":
        return "default"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <div className="text-red-600 mb-2 font-semibold">Error loading doctors</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Doctor Management
          </h1>
          <div className="text-sm text-gray-600">
            {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </div>

        {/* Tier Feature Warning */}
        {!tierFeatureAvailable && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <span>
                  The tier management feature requires a database migration. Please run the migration to enable tier
                  functionality.
                </span>
                <Button variant="outline" size="sm" onClick={() => setTierFeatureAvailable(true)} className="ml-4">
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Update Message */}
        {updateMessage && (
          <Alert
            className={
              updateMessage.includes("Failed") || updateMessage.includes("not yet available")
                ? "border-red-200 bg-red-50"
                : "border-green-200 bg-green-50"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription
              className={
                updateMessage.includes("Failed") || updateMessage.includes("not yet available")
                  ? "text-red-800"
                  : "text-green-800"
              }
            >
              {updateMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subscription Tier</Label>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Specialty</Label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setTierFilter("all")
                    setSpecialtyFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor List */}
        <Card>
          <CardHeader>
            <CardTitle>Doctors ({filteredDoctors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{doctor.email}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>{doctor.specialty}</span>
                      <span>{doctor.years_experience} years experience</span>
                      {doctor.phone && <span>{doctor.phone}</span>}
                      <span>Joined {new Date(doctor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1">
                      {getStatusIcon(doctor.status)}
                      <Badge
                        variant={
                          doctor.status === "approved"
                            ? "default"
                            : doctor.status === "pending"
                              ? "secondary"
                              : doctor.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {doctor.status}
                      </Badge>
                    </div>

                    {/* Tier Display and Selector */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getTierIcon(doctor.tier || "basic")}
                        <Badge variant={getTierBadgeVariant(doctor.tier || "basic")}>
                          {(doctor.tier || "basic").charAt(0).toUpperCase() + (doctor.tier || "basic").slice(1)}
                        </Badge>
                      </div>
                      <Select
                        value={doctor.tier || "basic"}
                        onValueChange={(value: Doctor["tier"]) => handleTierUpdate(doctor.id, value)}
                        disabled={isUpdating || !tierFeatureAvailable}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDoctor(doctor)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>

                      {/* Status Actions */}
                      {doctor.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(doctor.id, "approved")}
                            disabled={isUpdating}
                            className="text-green-600 hover:text-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(doctor.id, "rejected")}
                            disabled={isUpdating}
                            className="text-red-600 hover:text-red-700"
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {doctor.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(doctor.id, "suspended")}
                          disabled={isUpdating}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          Suspend
                        </Button>
                      )}

                      {doctor.status === "suspended" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(doctor.id, "approved")}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-700"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredDoctors.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== "all" || tierFilter !== "all" || specialtyFilter !== "all"
                    ? "No doctors found matching your filters."
                    : "No doctors found."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{doctors.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {doctors.filter((d) => d.status === "approved").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {doctors.filter((d) => d.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Premium Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {doctors.filter((d) => (d.tier || "basic") === "premium").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
