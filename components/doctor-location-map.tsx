"use client"

import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LeafletMap } from "./leaflet-map"
import type { Doctor } from "@/lib/types"

interface DoctorLocationMapProps {
  doctor: Doctor
}

export function DoctorLocationMap({ doctor }: DoctorLocationMapProps) {
  const getDirectionsUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(doctor.location.address)}`
  }

  const getOpenStreetMapUrl = () => {
    const { lat, lng } = doctor.location.coordinates
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <LeafletMap
          doctors={[doctor]}
          height="300px"
          zoom={15}
          center={[doctor.location.coordinates.lat, doctor.location.coordinates.lng]}
        />

        <div className="space-y-3">
          <div>
            <div className="font-medium text-gray-900">Address</div>
            <div className="text-gray-600 text-sm">{doctor.location.address}</div>
            <div className="text-gray-600 text-sm">
              {doctor.location.city}, {doctor.location.state}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" asChild className="flex items-center gap-2 bg-transparent">
              <a href={getDirectionsUrl()} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" />
                Get Directions
              </a>
            </Button>

            <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
              <a href={getOpenStreetMapUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View on OpenStreetMap
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
