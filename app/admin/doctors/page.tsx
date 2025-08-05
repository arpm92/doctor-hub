"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Ban,
  Eye,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import {
  getCurrentUser,
  getCurrentAdmin,
  getAllDoctors,
  updateDoctorStatus,
  updateDoctorProfile,
  type Doctor,
} from "@/lib/supabase"

export default function AdminDoctorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status")

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilterValue, setStatusFilterValue] = useState(statusFilter || "all")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check admin access
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

        // Load doctors
        const { doctors: doctorsData, error: doctorsError } = await getAllDoctors()
        if (doctorsError) {
          setError("Failed to load doctors")
          return
        }

        setDoctors(doctorsData || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  useEffect(() => {
    let filtered = doctors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilterValue !== "all") {
      filtered = filtered.filter((doctor) => doctor.status === statusFilterValue)
    }

    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, statusFilterValue])

  const handleStatusUpdate = async (doctorId: string, newStatus: Doctor["status"]) => {
    setIsUpdating(true)
    try {
      const { data, error } = await updateDoctorStatus(doctorId, newStatus)
      if (error) {
        alert("Failed to update doctor status: " + error.message)
        return
      }

      // Update local state
      setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor)))

      setSelectedDoctor(null)
    } catch (err) {
      console.error("Error updating status:", err)
      alert("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTierUpdate = async (doctorId: string, newTier: Doctor["tier"]) => {
    setIsUpdating(true)
    try {
      const { data, error } = await updateDoctorProfile(doctorId, { tier: newTier })
      if (error) {
        alert("Failed to update doctor tier: " + error.message)
        return
      }

      // Update local state
      setDoctors((prev) => prev.map((doctor) => (doctor.id === doctorId ? { ...doctor, tier: newTier } : doctor)))

      setSelectedDoctor(null)
    } catch (err) {
      console.error("Error updating tier:", err)
      alert("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: Doctor["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Ban className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
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
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
                <p className="text-gray-600">{filteredDoctors.length} doctors found</p>
              </div>
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                <SelectTrigger className="w-full md:w-48">
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
                    <TableHead>Subscription</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                          {doctor.phone && <div className="text-sm text-gray-500">{doctor.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.years_experience} years</TableCell>
                      <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={doctor.tier}
                          onValueChange={(value) => handleTierUpdate(doctor.id, value as Doctor["tier"])}
                        >
                          <SelectTrigger className="w-full md:w-32">
                            <SelectValue placeholder={doctor.tier} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(doctor.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctors/${doctor.slug}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(doctor)}>
                                <Edit className="h-3 w-3 mr-1" />
                                Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Doctor Status</DialogTitle>
                                <DialogDescription>
                                  Change the status for Dr. {doctor.first_name} {doctor.last_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                                  {getStatusBadge(doctor.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant={doctor.status === "approved" ? "default" : "outline"}
                                    onClick={() => handleStatusUpdate(doctor.id, "approved")}
                                    disabled={isUpdating || doctor.status === "approved"}
                                    className="flex items-center gap-2"
                                  >
                                    <UserCheck className="h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant={doctor.status === "rejected" ? "destructive" : "outline"}
                                    onClick={() => handleStatusUpdate(doctor.id, "rejected")}
                                    disabled={isUpdating || doctor.status === "rejected"}
                                    className="flex items-center gap-2"
                                  >
                                    <UserX className="h-4 w-4" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant={doctor.status === "suspended" ? "destructive" : "outline"}
                                    onClick={() => handleStatusUpdate(doctor.id, "suspended")}
                                    disabled={isUpdating || doctor.status === "suspended"}
                                    className="flex items-center gap-2"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Suspend
                                  </Button>
                                  <Button
                                    variant={doctor.status === "pending" ? "secondary" : "outline"}
                                    onClick={() => handleStatusUpdate(doctor.id, "pending")}
                                    disabled={isUpdating || doctor.status === "pending"}
                                    className="flex items-center gap-2"
                                  >
                                    <Clock className="h-4 w-4" />
                                    Pending
                                  </Button>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedDoctor(null)} disabled={isUpdating}>
                                  Cancel
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No doctors found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
