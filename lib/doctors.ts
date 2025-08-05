import type { Doctor } from "@/lib/types"
import doctors from "./doctors.json"

export function getAllDoctors(): Doctor[] {
  return doctors
}

export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.slug === slug)
}

export function getDoctorsBySpecialty(): { [key: string]: Doctor[] } {
  const doctorsBySpecialty: { [key: string]: Doctor[] } = {}

  doctors.forEach((doctor) => {
    if (doctorsBySpecialty[doctor.specialty]) {
      doctorsBySpecialty[doctor.specialty].push(doctor)
    } else {
      doctorsBySpecialty[doctor.specialty] = [doctor]
    }
  })

  return doctorsBySpecialty
}
