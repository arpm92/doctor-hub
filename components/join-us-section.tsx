import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Star, TrendingUp, Shield } from 'lucide-react'
import Link from "next/link"

export function JoinUsSection() {
  const benefits = [
    {
      icon: Users,
      title: "Red de Pacientes",
      description: "Accede a miles de pacientes buscando especialistas"
    },
    {
      icon: Star,
      title: "Reputación Online",
      description: "Construye y gestiona tu reputación profesional"
    },
    {
      icon: TrendingUp,
      title: "Crecimiento Garantizado",
      description: "Aumenta tu base de pacientes de manera constante"
    },
    {
      icon: Shield,
      title: "Plataforma Segura",
      description: "Cumplimiento total con regulaciones médicas"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-emerald-700 bg-emerald-100">
              Para Profesionales de la Salud
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              ¿Eres un Profesional de la Salud?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Únete a nuestra plataforma y conecta con pacientes que necesitan tu experiencia. 
              Haz crecer tu práctica con nuestras herramientas especializadas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-emerald-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-gray-600 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      +500
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Más de 500 doctores</p>
                    <p className="text-gray-600 text-sm">ya confían en nuestra plataforma</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">98%</div>
                    <div className="text-xs text-gray-600">Satisfacción</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">24/7</div>
                    <div className="text-xs text-gray-600">Soporte</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">50+</div>
                    <div className="text-xs text-gray-600">Especialidades</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center lg:text-left">
              <Card className="bg-white border-emerald-200 shadow-xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Comienza Tu Viaje Profesional
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Regístrate hoy y comienza a conectar con pacientes que necesitan tu experiencia. 
                      Es rápido, fácil y completamente gratuito para empezar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button asChild size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/auth/doctor/register" className="flex items-center justify-center gap-2">
                        Registrarse como Doctor
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" size="lg" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <Link href="/pricing">
                        Ver Planes y Precios
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>100% Seguro</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>Sin Compromiso</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
