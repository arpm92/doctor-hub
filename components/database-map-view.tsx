"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { supabase } from "@/lib/supabase"
import { Loader2, MapPin } from 'lucide-react'

// Dynamically import the map component to avoid SSR issues
const LeafletMap = dynamic(() => import("./leaflet-map").then(mod => mod.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

interface DatabaseMapViewProps {
  height?: string
  className?: string
}

interface DoctorWithLocation {
  id: string
  first_name: string
  last_name: string
  specialty: string
  profile_image?: string
  slug?: string
  tier: "basic" | "medium" | "premium"
  doctor_locations: Array<{
    id: string
    name: string
    address: string
    city: string
    state: string
    latitude?: number
    longitude?: number
    is_primary: boolean
  }>
}

export function DatabaseMapView({ height = "400px", className = "" }: DatabaseMapViewProps) {
  const [doctors, setDoctors] = useState<DoctorWithLocation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctorsWithLocations = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Fetching doctors with locations...")

        // First, let's check if we have any doctors at all
        const { data: allDoctors, error: allDoctorsError } = await supabase
          .from("doctors")
          .select("id, first_name, last_name, specialty, status")
          .eq("status", "approved")

        console.log("All approved doctors:", allDoctors?.length || 0)

        // Then check locations
        const { data: allLocations, error: allLocationsError } = await supabase
          .from("doctor_locations")
          .select("*")

        console.log("All locations:", allLocations?.length || 0)

        // Now fetch doctors with their locations
        const { data: doctorsData, error: doctorsError } = await supabase
          .from("doctors")
          .select(`
            id,
            first_name,
            last_name,
            specialty,
            profile_image,
            slug,
            tier,
            doctor_locations (
              id,
              name,
              address,
              city,
              state,
              latitude,
              longitude,
              is_primary
            )
          `)
          .eq("status", "approved")

        if (doctorsError) {
          console.error("Error fetching doctors:", doctorsError)
          setError("Error al cargar doctores: " + doctorsError.message)
          return
        }

        console.log("Doctors with locations query result:", doctorsData?.length || 0)
        console.log("Sample doctor data:", doctorsData?.[0])

        if (!doctorsData || doctorsData.length === 0) {
          console.log("No doctors found")
          setDoctors([])
          return
        }

        // Filter doctors that have locations with coordinates
        const doctorsWithValidLocations = doctorsData.filter(doctor => {
          const hasLocations = doctor.doctor_locations && doctor.doctor_locations.length > 0
          const hasCoordinates = hasLocations && doctor.doctor_locations.some(location => 
            location.latitude !== null && 
            location.longitude !== null &&
            typeof location.latitude === 'number' &&
            typeof location.longitude === 'number'
          )
          
          console.log(`Doctor ${doctor.first_name} ${doctor.last_name}:`, {
            hasLocations,
            locationCount: doctor.doctor_locations?.length || 0,
            hasCoordinates,
            locations: doctor.doctor_locations?.map(l => ({ lat: l.latitude, lng: l.longitude }))
          })
          
          return hasCoordinates
        })

        console.log("Doctors with valid locations:", doctorsWithValidLocations.length)
        setDoctors(doctorsWithValidLocations)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Error inesperado al cargar el mapa")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctorsWithLocations()
  }, [])

  // Convert doctors to the format expected by LeafletMap
  const mapDoctors = doctors.flatMap(doctor => 
    doctor.doctor_locations
      .filter(location => location.latitude && location.longitude)
      .map(location => ({
        id: doctor.id,
        name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        image: doctor.profile_image || "/placeholder.svg?height=100&width=100&text=Doctor",
        location: {
          lat: location.latitude!,
          lng: location.longitude!,
          address: `${location.address}, ${location.city}, ${location.state}`,
          name: location.name
        },
        tier: doctor.tier || "basic",
        slug: doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}`
      }))
  )

  console.log("Map doctors:", mapDoctors.length)

  if (isLoading) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-gray-600">Cargando ubicaciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mapDoctors.length === 0) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">No hay ubicaciones con coordenadas disponibles</p>
            <p className="text-sm text-gray-500 mt-1">
              Los doctores necesitan agregar coordenadas a sus ubicaciones
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <LeafletMap
        doctors={mapDoctors}
        height={height}
        zoom={6}
        center={[10.4806, -66.9036]} // Caracas, Venezuela as default center
      />
    </div>
  )
}
