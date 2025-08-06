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

// Add Venezuelan cities to the coordinate helper functions
function getDefaultLatForCity(city: string, state: string): number {
  const cityCoords: Record<string, { lat: number, lng: number }> = {
    // Venezuelan cities
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
    // US cities (existing)
    "new york": { lat: 40.7128, lng: -74.0060 },
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "chicago": { lat: 41.8781, lng: -87.6298 },
    "houston": { lat: 29.7604, lng: -95.3698 },
    "phoenix": { lat: 33.4484, lng: -112.0740 },
    "philadelphia": { lat: 39.9526, lng: -75.1652 },
    "san antonio": { lat: 29.4241, lng: -98.4936 },
    "san diego": { lat: 32.7157, lng: -117.1611 },
    "dallas": { lat: 32.7767, lng: -96.7970 },
    "san jose": { lat: 37.3382, lng: -121.8863 },
    "austin": { lat: 30.2672, lng: -97.7431 },
    "jacksonville": { lat: 30.3322, lng: -81.6557 },
    "fort worth": { lat: 32.7555, lng: -97.3308 },
    "columbus": { lat: 39.9612, lng: -82.9988 },
    "charlotte": { lat: 35.2271, lng: -80.8431 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "indianapolis": { lat: 39.7684, lng: -86.1581 },
    "seattle": { lat: 47.6062, lng: -122.3321 },
    "denver": { lat: 39.7392, lng: -104.9903 },
    "washington": { lat: 38.9072, lng: -77.0369 },
    "boston": { lat: 42.3601, lng: -71.0589 },
    "el paso": { lat: 31.7619, lng: -106.4850 },
    "detroit": { lat: 42.3314, lng: -83.0458 },
    "nashville": { lat: 36.1627, lng: -86.7816 },
    "portland": { lat: 45.5152, lng: -122.6784 },
    "memphis": { lat: 35.1495, lng: -90.0490 },
    "oklahoma city": { lat: 35.4676, lng: -97.5164 },
    "las vegas": { lat: 36.1699, lng: -115.1398 },
    "louisville": { lat: 38.2527, lng: -85.7585 },
    "baltimore": { lat: 39.2904, lng: -76.6122 },
    "milwaukee": { lat: 43.0389, lng: -87.9065 },
    "albuquerque": { lat: 35.0844, lng: -106.6504 },
    "tucson": { lat: 32.2226, lng: -110.9747 },
    "fresno": { lat: 36.7378, lng: -119.7871 },
    "sacramento": { lat: 38.5816, lng: -121.4944 },
    "mesa": { lat: 33.4152, lng: -111.8315 },
    "kansas city": { lat: 39.0997, lng: -94.5786 },
    "atlanta": { lat: 33.7490, lng: -84.3880 },
    "long beach": { lat: 33.7701, lng: -118.1937 },
    "colorado springs": { lat: 38.8339, lng: -104.8214 },
    "raleigh": { lat: 35.7796, lng: -78.6382 },
    "miami": { lat: 25.7617, lng: -80.1918 },
    "virginia beach": { lat: 36.8529, lng: -76.0852 },
    "omaha": { lat: 41.2565, lng: -95.9345 },
    "oakland": { lat: 37.8044, lng: -122.2711 },
    "minneapolis": { lat: 44.9778, lng: -93.2650 },
    "tulsa": { lat: 36.1540, lng: -95.9928 },
    "arlington": { lat: 32.7357, lng: -97.1081 },
    "new orleans": { lat: 29.9511, lng: -90.0715 }
  }

  const key = city.toLowerCase()
  return cityCoords[key]?.lat || 10.4806 // Default to Caracas, Venezuela
}

function getDefaultLngForCity(city: string, state: string): number {
  const cityCoords: Record<string, { lat: number, lng: number }> = {
    // Venezuelan cities
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
    // US cities (existing)
    "new york": { lat: 40.7128, lng: -74.0060 },
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "chicago": { lat: 41.8781, lng: -87.6298 },
    "houston": { lat: 29.7604, lng: -95.3698 },
    "phoenix": { lat: 33.4484, lng: -112.0740 },
    "philadelphia": { lat: 39.9526, lng: -75.1652 },
    "san antonio": { lat: 29.4241, lng: -98.4936 },
    "san diego": { lat: 32.7157, lng: -117.1611 },
    "dallas": { lat: 32.7767, lng: -96.7970 },
    "san jose": { lat: 37.3382, lng: -121.8863 },
    "austin": { lat: 30.2672, lng: -97.7431 },
    "jacksonville": { lat: 30.3322, lng: -81.6557 },
    "fort worth": { lat: 32.7555, lng: -97.3308 },
    "columbus": { lat: 39.9612, lng: -82.9988 },
    "charlotte": { lat: 35.2271, lng: -80.8431 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "indianapolis": { lat: 39.7684, lng: -86.1581 },
    "seattle": { lat: 47.6062, lng: -122.3321 },
    "denver": { lat: 39.7392, lng: -104.9903 },
    "washington": { lat: 38.9072, lng: -77.0369 },
    "boston": { lat: 42.3601, lng: -71.0589 },
    "el paso": { lat: 31.7619, lng: -106.4850 },
    "detroit": { lat: 42.3314, lng: -83.0458 },
    "nashville": { lat: 36.1627, lng: -86.7816 },
    "portland": { lat: 45.5152, lng: -122.6784 },
    "memphis": { lat: 35.1495, lng: -90.0490 },
    "oklahoma city": { lat: 35.4676, lng: -97.5164 },
    "las vegas": { lat: 36.1699, lng: -115.1398 },
    "louisville": { lat: 38.2527, lng: -85.7585 },
    "baltimore": { lat: 39.2904, lng: -76.6122 },
    "milwaukee": { lat: 43.0389, lng: -87.9065 },
    "albuquerque": { lat: 35.0844, lng: -106.6504 },
    "tucson": { lat: 32.2226, lng: -110.9747 },
    "fresno": { lat: 36.7378, lng: -119.7871 },
    "sacramento": { lat: 38.5816, lng: -121.4944 },
    "mesa": { lat: 33.4152, lng: -111.8315 },
    "kansas city": { lat: 39.0997, lng: -94.5786 },
    "atlanta": { lat: 33.7490, lng: -84.3880 },
    "long beach": { lat: 33.7701, lng: -118.1937 },
    "colorado springs": { lat: 38.8339, lng: -104.8214 },
    "raleigh": { lat: 35.7796, lng: -78.6382 },
    "miami": { lat: 25.7617, lng: -80.1918 },
    "virginia beach": { lat: 36.8529, lng: -76.0852 },
    "omaha": { lat: 41.2565, lng: -95.9345 },
    "oakland": { lat: 37.8044, lng: -122.2711 },
    "minneapolis": { lat: 44.9778, lng: -93.2650 },
    "tulsa": { lat: 36.1540, lng: -95.9928 },
    "arlington": { lat: 32.7357, lng: -97.1081 },
    "new orleans": { lat: 29.9511, lng: -90.0715 }
  }

  const key = city.toLowerCase()
  return cityCoords[key]?.lng || -66.9036 // Default to Caracas, Venezuela
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
          zoom={4}
        />
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p>Showing {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"} with location data</p>
      </div>
    </div>
  )
}
