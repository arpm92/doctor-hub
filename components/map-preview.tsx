import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { DatabaseMapView } from "./database-map-view"

export function MapPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Encuentra Doctores Cerca de Ti
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explora nuestra red de profesionales de la salud en tu área. 
            Utiliza nuestro mapa interactivo para encontrar el especialista perfecto.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[16/10] relative">
              <Suspense 
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Cargando mapa...</p>
                    </div>
                  </div>
                }
              >
                <DatabaseMapView height="100%" />
              </Suspense>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/map" className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ver Mapa Completo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
