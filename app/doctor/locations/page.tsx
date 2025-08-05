"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { MapPin, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import {
  getCurrentUser,
  getCurrentDoctor,
  getDoctorLocations,
  deleteDoctorLocation,
  signOut,
  type Doctor,
  type DoctorLocation,
} from "@/lib/supabase"

export default function DoctorLocationsPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [locations, setLocations] = useState<DoctorLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<DoctorLocation | null>(null)

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

        // Load locations
        const { locations: locationsData, error: locationsError } = await getDoctorLocations(doctorData.id)

        if (locationsError) {
          setError("Failed to load locations")
          return
        }

        setLocations(locationsData || [])
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

  const handleDeleteLocation = async (locationId: string) => {
    setIsUpdating(true)
    try {
      const { error } = await deleteDoctorLocation(locationId)
      if (error) {
        alert("Failed to delete location: " + error.message)
        return
      }

      // Update local state
      setLocations((prev) => prev.filter((location) => location.id !== locationId))
      setSelectedLocation(null)
    } catch (err) {
      console.error("Error deleting location:", err)
      alert("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading your locations...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Error: {error}
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Doctor profile not found.
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle>Manage Locations</CardTitle>
              <Button asChild>
                <Link href="/doctor/locations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {locations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location.id}>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.address}</TableCell>
                        <TableCell>{location.city}</TableCell>
                        <TableCell>{location.state}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/doctor/locations/${location.id}`}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Location</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {location.name}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteLocation(location.id)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete"}
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
      </div>
    </div>
  )
}
