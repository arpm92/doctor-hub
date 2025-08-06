import { supabase } from "@/lib/supabase"
import { LeafletMap } from "./leaflet-map"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MapPin } from 'lucide-react'
import type { Doctor } from "@/lib/supabase"

interface DatabaseDoctor extends Doctor {
  doctor_locations?: Array<{
    id: string
    name: string
    address: string
    city: string
    state: string
    country: string
    is_primary: boolean
    latitude?: number
    longitude?: number
  }>
}

async function getDatabaseDoctorsWithLocations(): Promise<any[]> {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations (*)
      `)
      .eq("status", "approved")
      .not("doctor_locations", "is", null)

    if (error) {
      console.error("Error fetching doctors with locations:", error)
      return []
    }

    console.log("Raw doctors data:", doctors?.length || 0)

    // Convert to map format and filter only doctors with valid locations
    const mappedDoctors = (doctors || [])
      .filter(doctor => doctor.doctor_locations && doctor.doctor_locations.length > 0)
      .map(doctor => {
        const primaryLocation = doctor.doctor_locations?.find(loc => loc.is_primary) || doctor.doctor_locations?.[0]
        
        if (!primaryLocation) {
          return null
        }

        // Generate coordinates based on city/state if not available
        const coordinates = {
          lat: primaryLocation.latitude || getDefaultLatForCity(primaryLocation.city, primaryLocation.state),
          lng: primaryLocation.longitude || getDefaultLngForCity(primaryLocation.city, primaryLocation.state)
        }

        return {
          id: doctor.id,
          name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
          specialty: doctor.specialty,
          bio: doctor.bio || "",
          experience: `${doctor.years_experience} years`,
          languages: doctor.languages || ["English"],
          image: doctor.profile_image || "/placeholder.svg?height=400&width=400&text=Doctor",
          location: {
            address: primaryLocation.address || "",
            city: primaryLocation.city || "",
            state: primaryLocation.state || "",
            country: primaryLocation.country || "Venezuela",
            coordinates
          },
          tier: doctor.tier as "basic" | "medium" | "premium",
          slug: doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}`,
          averageRating: 4.5, // Default rating
          totalReviews: Math.floor(Math.random() * 100) + 10, // Random for demo
          blogPosts: [],
          education: doctor.education || [],
          certifications: doctor.certifications || [],
          socialMedia: {
            linkedin: "",
            instagram: "",
            twitter: "",
            facebook: ""
          }
        }
      })
      .filter(Boolean) // Remove null entries

    console.log("Mapped doctors for map:", mappedDoctors.length)
    return mappedDoctors
  } catch (error) {
    console.error("Unexpected error fetching doctors:", error)
    return []
  }
}

// Venezuelan cities coordinates
function getDefaultLatForCity(city: string, state: string): number {
  const cityCoords: Record<string, { lat: number, lng: number }> = {
    "caracas": { lat: 10.4806, lng: -66.9036 },
    "maracaibo": { lat: 10.6666, lng: -71.6333 },
    "valencia": { lat: 10.1621, lng: -68.0077 },
    "barquisimeto": { lat: 10.0647, lng: -69.3570 },
    "maracay": { lat: 10.2353, lng: -67.5911 },
    "ciudad guayana": { lat: 8.3114, lng: -62.7186 },
    "san cristóbal": { lat: 7.7669, lng: -72.2252 },
    "maturín": { lat: 9.7469, lng: -63.1764 },
    "ciudad bolívar": { lat: 8.1292, lng: -63.5497 },
    "cumana": { lat: 10.4630, lng: -64.1664 },
    "puerto ordaz": { lat: 8.2892, lng: -62.7631 },
    "petare": { lat: 10.4806, lng: -66.8011 },
    "turmero": { lat: 10.2286, lng: -67.4739 },
    "merida": { lat: 8.5918, lng: -71.1561 },
    "los teques": { lat: 10.3440, lng: -67.0428 }
  }

  const key = city.toLowerCase()
  return cityCoords[key]?.lat || 10.4806 // Default to Caracas
}

function getDefaultLngForCity(city: string, state: string): number {
  const cityCoords: Record<string, { lat: number, lng: number }> = {
    "caracas": { lat: 10.4806, lng: -66.9036 },
    "maracaibo": { lat: 10.6666, lng: -71.6333 },
    "valencia": { lat: 10.1621, lng: -68.0077 },
    "barquisimeto": { lat: 10.0647, lng: -69.3570 },
    "maracay": { lat: 10.2353, lng: -67.5911 },
    "ciudad guayana": { lat: 8.3114, lng: -62.7186 },
    "san cristóbal": { lat: 7.7669, lng: -72.2252 },
    "maturín": { lat: 9.7469, lng: -63.1764 },
    "ciudad bolívar": { lat: 8.1292, lng: -63.5497 },
    "cumana": { lat: 10.4630, lng: -64.1664 },
    "puerto ordaz": { lat: 8.2892, lng: -62.7631 },
    "petare": { lat: 10.4806, lng: -66.8011 },
    "turmero": { lat: 10.2286, lng: -67.4739 },
    "merida": { lat: 8.5918, lng: -71.1561 },
    "los teques": { lat: 10.3440, lng: -67.0428 }
  }

  const key = city.toLowerCase()
  return cityCoords[key]?.lng || -66.9036 // Default to Caracas
}

export async function DatabaseMapView() {
  const doctors = await getDatabaseDoctorsWithLocations()

  if (doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <MapPin className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Doctors with Locations Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We're currently building our network of healthcare professionals with location data. Check back soon!
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Are you a healthcare professional? <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">Join our network</a> and add your practice locations.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg border border-emerald-200 overflow-hidden">
        <LeafletMap
          doctors={doctors}
          height="600px"
          zoom={6}
        />
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p>Showing {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} with location data</p>
      </div>
    </div>
  )
}
