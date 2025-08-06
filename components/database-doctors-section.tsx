import { supabase } from "@/lib/supabase"
import { DoctorCard } from "./doctor-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Users } from 'lucide-react'
import type { Doctor } from "@/lib/supabase"

interface DatabaseDoctor extends Doctor {
  doctor_locations?: Array<{
    id: string
    name: string
    city: string
    state: string
    country: string
    is_primary: boolean
  }>
}

async function getDatabaseDoctors(): Promise<DatabaseDoctor[]> {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations (
          id,
          name,
          city,
          state,
          country,
          is_primary
        )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching doctors:", error)
      return []
    }

    return doctors || []
  } catch (error) {
    console.error("Unexpected error fetching doctors:", error)
    return []
  }
}

// Convert database doctor to display format
function convertDatabaseDoctor(dbDoctor: DatabaseDoctor) {
  const primaryLocation = dbDoctor.doctor_locations?.find(loc => loc.is_primary) || dbDoctor.doctor_locations?.[0]
  
  return {
    id: dbDoctor.id,
    name: `${dbDoctor.first_name} ${dbDoctor.last_name}`,
    specialty: dbDoctor.specialty,
    bio: dbDoctor.bio || "",
    experience: `${dbDoctor.years_experience} years`,
    languages: dbDoctor.languages || ["English"],
    image: dbDoctor.profile_image || "/placeholder.svg?height=400&width=400&text=Doctor",
    location: {
      city: primaryLocation?.city || "Location TBD",
      state: primaryLocation?.state || "",
      country: primaryLocation?.country || "USA"
    },
    tier: dbDoctor.tier as "basic" | "medium" | "premium",
    slug: dbDoctor.slug || `${dbDoctor.first_name.toLowerCase()}-${dbDoctor.last_name.toLowerCase()}`,
    averageRating: 4.5, // Default rating - you can implement a reviews system later
    totalReviews: 0, // Default - you can implement a reviews system later
    blogPosts: [], // Default - you can link to doctor_articles later
    education: dbDoctor.education || [],
    certifications: dbDoctor.certifications || [],
    socialMedia: {
      linkedin: "",
      instagram: "",
      twitter: "",
      facebook: ""
    }
  }
}

export async function DatabaseDoctorsSection() {
  const doctors = await getDatabaseDoctors()

  if (doctors.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Doctors Available Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          We're currently building our network of healthcare professionals. Check back soon to see our amazing doctors!
        </p>
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Are you a healthcare professional? <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">Join our network</a> to get started.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Group doctors by specialty
  const doctorsBySpecialty = doctors.reduce((acc, doctor) => {
    const specialty = doctor.specialty || "General Practice"
    if (!acc[specialty]) {
      acc[specialty] = []
    }
    acc[specialty].push(convertDatabaseDoctor(doctor))
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-16">
      {Object.entries(doctorsBySpecialty).map(([specialty, specialtyDoctors]) => (
        <div key={specialty} className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{specialty}</h3>
            <p className="text-gray-600">
              {specialtyDoctors.length} {specialtyDoctors.length === 1 ? "specialist" : "specialists"} available
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specialtyDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
