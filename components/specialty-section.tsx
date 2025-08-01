"use client"

import { useState } from "react"
import { DoctorCard } from "./doctor-card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { Doctor } from "@/lib/types"

interface SpecialtySectionProps {
  specialty: string
  doctors: Doctor[]
}

export function SpecialtySection({ specialty, doctors }: SpecialtySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{specialty}</h2>
          <p className="text-gray-600">
            {doctors.length} expert{doctors.length !== 1 ? "s" : ""} in {specialty.toLowerCase()}
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
          {isExpanded ? (
            <>
              Hide Doctors <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Doctors <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-4 duration-300">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </section>
  )
}
