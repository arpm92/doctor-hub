"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, Phone, Navigation, Layers } from "lucide-react"
import { getAllDoctors, getAllSpecialties } from "@/lib/doctors"
import { LeafletMap } from "@/components/leaflet-map"
import type { Doctor } from "@/lib/types"

export default function MapPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [mapView, setMapView] = useState<"street" | "satellite">("street")
  const doctors = getAllDoctors()
  const specialties = getAllSpecialties()

  const filteredDoctors = useMemo(() => {
    if (selectedSpecialty === "all") return doctors
    return doctors.filter((doctor) => doctor.specialty === selectedSpecialty)
  }, [doctors, selectedSpecialty])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Doctors Near You</h1>
          <p className="text-xl text-gray-600 mb-6">
            Locate healthcare professionals in your area using our interactive map powered by OpenStreetMap.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-64">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="text-sm">
              {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} found
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Map */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Doctor Locations
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Layers className="h-4 w-4" />
                  OpenStreetMap
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LeafletMap
                doctors={filteredDoctors}
                selectedDoctor={selectedDoctor}
                onDoctorSelect={setSelectedDoctor}
                height="500px"
                zoom={6}
              />

              {/* Map Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-3">Specialty Legend</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from(new Set(filteredDoctors.map((d) => d.specialty))).map((specialty) => {
                    const colors: Record<string, string> = {
                      Cardiologist: "#ef4444",
                      Neurologist: "#8b5cf6",
                      Pediatrician: "#06b6d4",
                      "Orthopedic Surgeon": "#f59e0b",
                      Dermatologist: "#ec4899",
                      Psychiatrist: "#10b981",
                    }
                    return (
                      <div key={specialty} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: colors[specialty] || "#6b7280" }}
                        />
                        <span className="truncate">{specialty}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selectedDoctor && (
                <Card className="mt-4 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={selectedDoctor.image || "/placeholder.svg"}
                          alt={selectedDoctor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{selectedDoctor.name}</h3>
                        <Badge variant="secondary" className="mb-2">
                          {selectedDoctor.specialty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <span>⭐ {selectedDoctor.averageRating.toFixed(1)}</span>
                          <span>({selectedDoctor.totalReviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{selectedDoctor.location.address}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/doctors/${selectedDoctor.slug}`}>View Profile</Link>
                          </Button>
                          {(selectedDoctor.tier === "medium" || selectedDoctor.tier === "premium") && (
                            <Button size="sm" asChild>
                              <Link href={`/booking?doctor=${selectedDoctor.slug}`}>
                                <Calendar className="h-3 w-3 mr-1" />
                                Book
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Doctor List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Nearby Doctors</h2>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Navigation className="h-4 w-4" />
                Sort by Distance
              </Button>
            </div>

            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedDoctor?.id === doctor.id ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={doctor.image || "/placeholder.svg"} alt={doctor.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {doctor.specialty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span>⭐ {doctor.averageRating.toFixed(1)}</span>
                          <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Navigation className="h-4 w-4" />
                          <span>{Math.round(Math.random() * 10 + 1)} miles away</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                          <div className="text-sm">
                            <div>{doctor.location.address}</div>
                            <div>
                              {doctor.location.city}, {doctor.location.state}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
                        </Button>

                        {(doctor.tier === "medium" || doctor.tier === "premium") && (
                          <Button size="sm" asChild className="flex items-center gap-2">
                            <Link href={`/booking?doctor=${doctor.slug}`}>
                              <Calendar className="h-4 w-4" />
                              Book Appointment
                            </Link>
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredDoctors.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600">Try adjusting your specialty filter to see more results.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
