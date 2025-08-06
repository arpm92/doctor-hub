import { Suspense } from "react"
import { HeroSection } from "@/components/hero-section"
import { JoinUsSection } from "@/components/join-us-section"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from 'lucide-react'
import Link from "next/link"
import { MapPreview } from "@/components/map-preview"
import { DatabaseDoctorsSection } from "@/components/database-doctors-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 py-20" id="doctors-section">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Specialists</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our diverse team of healthcare professionals brings together decades of experience across multiple
            specialties to provide comprehensive care for you and your family.
          </p>

          <Button variant="outline" asChild className="flex items-center gap-2 mx-auto bg-transparent">
            <Link href="/map">
              <MapPin className="h-4 w-4" />
              View on Map
            </Link>
          </Button>
        </div>

        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading doctors...</span>
            </div>
          }
        >
          <DatabaseDoctorsSection />
        </Suspense>
      </div>

      <MapPreview />

      <JoinUsSection />
    </div>
  )
}
