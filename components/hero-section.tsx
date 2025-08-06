import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Calendar, Shield } from 'lucide-react'
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Profesionales de la Salud Verificados
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Conecta con los Mejores
              <span className="text-emerald-600 block">Doctores</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Encuentra y conecta con profesionales de la salud experimentados en tu área. 
              Atención médica de calidad con doctores compasivos y altamente calificados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6">
              <Link href="#doctors-section" className="flex items-center gap-2">
                Explorar Doctores
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Link href="/map" className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ver en Mapa
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-600">Doctores Verificados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600">Especialidades</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
              <div className="text-gray-600">Soporte Disponible</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
