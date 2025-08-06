import { supabase } from "@/lib/supabase"
import { LeafletMap } from "./leaflet-map"

interface DatabaseMapViewProps {
  height?: string
  zoom?: number
  center?: [number, number]
}

async function getDoctorsWithLocations() {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations!inner(*)
      `)
      .eq("status", "approved")
      .not("doctor_locations.latitude", "is", null)
      .not("doctor_locations.longitude", "is", null)

    if (error) {
      console.error("Error fetching doctors with locations:", error)
      return []
    }

    // Transform to the format expected by LeafletMap
    const transformedDoctors = doctors?.map(doctor => {
      const primaryLocation = doctor.doctor_locations?.find(loc => loc.is_primary) || doctor.doctor_locations?.[0]
      
      return {
        id: doctor.id,
        slug: doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}`,
        name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        tier: doctor.tier || "basic",
        averageRating: 4.8, // Mock data
        totalReviews: 127, // Mock data
        location: {
          address: primaryLocation?.address || "",
          city: primaryLocation?.city || "",
          state: primaryLocation?.state || "",
          coordinates: {
            lat: primaryLocation?.latitude || 0,
            lng: primaryLocation?.longitude || 0
          }
        }
      }
    }) || []

    return transformedDoctors.filter(doctor => 
      doctor.location.coordinates.lat !== 0 && doctor.location.coordinates.lng !== 0
    )
  } catch (error) {
    console.error("Unexpected error fetching doctors:", error)
    return []
  }
}

export async function DatabaseMapView({ height = "400px", zoom = 4, center }: DatabaseMapViewProps) {
  const doctors = await getDoctorsWithLocations()

  if (!doctors || doctors.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600">No hay ubicaciones de doctores disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <LeafletMap
      doctors={doctors}
      height={height}
      zoom={zoom}
      center={center}
    />
  )
}
