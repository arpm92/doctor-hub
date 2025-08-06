import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Search, ArrowLeft, Loader2 } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"
import Link from "next/link"
import { DatabaseMapView } from "@/components/database-map-view"
import { Suspense } from "react"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Doctors Near You</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our network of healthcare professionals and find the right doctor for your needs.
          </p>
        </div>

        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading map...</span>
            </div>
          }
        >
          <DatabaseMapView />
        </Suspense>
      </div>
    </div>
  )
}
