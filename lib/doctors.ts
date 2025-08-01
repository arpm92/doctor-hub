import type { Doctor } from "./types"
import doctorsData from "./doctors.json"

export const doctors: Doctor[] = doctorsData

export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctors.find((doctor) => doctor.slug === slug)
}

export function getAllDoctors(): Doctor[] {
  return doctors
}

export function getDoctorsBySpecialty(): Record<string, Doctor[]> {
  return doctors.reduce(
    (acc, doctor) => {
      if (!acc[doctor.specialty]) {
        acc[doctor.specialty] = []
      }
      acc[doctor.specialty].push(doctor)
      return acc
    },
    {} as Record<string, Doctor[]>,
  )
}

export function getAllSpecialties(): string[] {
  return [...new Set(doctors.map((doctor) => doctor.specialty))]
}
