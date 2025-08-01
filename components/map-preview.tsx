"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { getAllDoctors } from "@/lib/doctors"
import { LeafletMap } from "./leaflet-map"
import type { Doctor } from "@/lib/types"

export function MapPreview() {
  const doctors = getAllDoctors()
  const [hoveredDoctor, setHoveredDoctor] = useState<Doctor | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Doctors Nationwide</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our network of healthcare professionals spans across the country. Use our interactive map to find the right
            doctor in your area.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Doctor Map
              </CardTitle>
              <p className="text-gray-600">Powered by OpenStreetMap & Leaflet.js</p>
            </CardHeader>
            <CardContent>
              <LeafletMap
                doctors={doctors}
                selectedDoctor={hoveredDoctor}
                onDoctorSelect={setHoveredDoctor}
                height="400px"
                zoom={4}
              />

              <div className="text-center space-y-4 mt-6">
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {Array.from(new Set(doctors.map((d) => d.specialty)))
                    .slice(0, 6)
                    .map((specialty) => {
                      const colors: Record<string, string> = {
                        Cardiologist: "#ef4444",
                        Neurologist: "#8b5cf6",
                        Pediatrician: "#06b6d4",
                        "Orthopedic Surgeon": "#f59e0b",
                        Dermatologist: "#ec4899",
                        Psychiatrist: "#10b981",
                      }
                      return (
                        <div key={specialty} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: colors[specialty] || "#6b7280" }}
                          />
                          <span>{specialty}</span>
                        </div>
                      )
                    })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Click markers to view doctor details
                  </div>

                  <Button size="lg" asChild className="flex items-center gap-2">
                    <Link href="/map">
                      <ExternalLink className="h-4 w-4" />
                      Explore Full Interactive Map
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
