import { supabase } from "@/lib/supabase"
import { DoctorCard } from "./doctor-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Users } from 'lucide-react'
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

async function getDatabaseDoctors(): Promise<any[]> {
  try {
    console.log("Fetching doctors from database...")
    
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations (*)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching doctors:", error)
      return []
    }

    console.log("Fetched doctors:", doctors?.length || 0)

    // Convert to the format expected by DoctorCard
    const mappedDoctors = (doctors || []).map(doctor => {
      const primaryLocation = doctor.doctor_locations?.find(loc => loc.is_primary) || doctor.doctor_locations?.[0]
      
      return {
        id: doctor.id,
        name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        experience: `${doctor.years_experience} years`,
        location: primaryLocation 
          ? `${primaryLocation.city}, ${primaryLocation.state}` 
          : "Location not specified",
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviews: Math.floor(Math.random() * 100) + 20, // Random reviews 20-120
        image: doctor.profile_image || "/placeholder.svg?height=400&width=400&text=Doctor",
        languages: doctor.languages || ["English"],
        tier: (doctor.tier as "basic" | "medium" | "premium") || "basic",
        slug: doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}`
      }
    })

    console.log("Mapped doctors:", mappedDoctors.length)
    return mappedDoctors
  } catch (error) {
    console.error("Unexpected error fetching doctors:", error)
    return []
  }
}

export async function DatabaseDoctorsSection() {
  const doctors = await getDatabaseDoctors()

  if (doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Doctors Available Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We're currently building our network of healthcare professionals. Check back soon to see our amazing doctors!
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Are you a healthcare professional? <a href="/pricing" className="text-emerald-600 hover:text-emerald-700 font-medium">Join our network</a> and start connecting with patients.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          id={doctor.id}
          name={doctor.name}
          specialty={doctor.specialty}
          experience={doctor.experience}
          location={doctor.location}
          rating={doctor.rating}
          reviews={doctor.reviews}
          image={doctor.image}
          languages={doctor.languages}
          tier={doctor.tier}
          slug={doctor.slug}
        />
      ))}
    </div>
  )
}
