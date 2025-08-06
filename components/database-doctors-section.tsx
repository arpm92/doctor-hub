import { supabase } from "@/lib/supabase"
import { DoctorCard } from "./doctor-card"

async function getDoctors() {
  try {
    const { data: doctors, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations!inner(*)
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching doctors:", error)
      return []
    }

    console.log("Fetched doctors:", doctors?.length || 0)
    return doctors || []
  } catch (error) {
    console.error("Unexpected error fetching doctors:", error)
    return []
  }
}

export async function DatabaseDoctorsSection() {
  const doctors = await getDoctors()

  if (!doctors || doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay doctores disponibles</h3>
        <p className="text-gray-600">Estamos trabajando para agregar más profesionales de la salud.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map((doctor) => {
        const primaryLocation = doctor.doctor_locations?.find(loc => loc.is_primary) || doctor.doctor_locations?.[0]
        
        return (
          <DoctorCard
            key={doctor.id}
            id={doctor.id}
            name={`Dr. ${doctor.first_name} ${doctor.last_name}`}
            specialty={doctor.specialty}
            image={doctor.profile_image}
            location={{
              address: primaryLocation?.address || "",
              city: primaryLocation?.city || "Ciudad",
              state: primaryLocation?.state || "Estado"
            }}
            averageRating={4.8} // Mock data for now
            totalReviews={127} // Mock data for now
            yearsExperience={doctor.years_experience || 0}
            languages={doctor.languages || ["Español"]}
            tier={doctor.tier || "basic"}
            slug={doctor.slug || `${doctor.first_name.toLowerCase()}-${doctor.last_name.toLowerCase()}`}
          />
        )
      })}
    </div>
  )
}
