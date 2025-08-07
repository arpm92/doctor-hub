"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Users, Calendar, MapPin, TrendingUp, Shield, Headphones } from 'lucide-react'
import Link from "next/link"
import { GoBackButton } from "@/components/go-back-button"

export default function PricingPage() {
  const plans = [
    {
      name: "Básico",
      tier: "basic",
      price: "Gratis",
      description: "Perfecto para comenzar tu presencia en línea",
      features: [
        "Perfil básico de doctor",
        "Información de contacto",
        "Hasta 2 ubicaciones",
        "Listado en directorio",
        "Soporte por email"
      ],
      limitations: [
        "Sin sistema de reservas",
        "Sin artículos de blog",
        "Visibilidad limitada"
      ],
      popular: false,
      cta: "Comenzar Gratis"
    },
    {
      name: "Profesional",
      tier: "medium",
      price: "€29",
      period: "/mes",
      description: "Ideal para doctores establecidos que buscan más visibilidad",
      features: [
        "Todo lo del plan Básico",
        "Sistema de reservas en línea",
        "Hasta 5 ubicaciones",
        "Blog personal",
        "Estadísticas básicas",
        "Prioridad en búsquedas",
        "Soporte prioritario"
      ],
      limitations: [
        "Funciones premium limitadas"
      ],
      popular: true,
      cta: "Comenzar Prueba Gratuita"
    },
    {
      name: "Premium",
      tier: "premium",
      price: "€79",
      period: "/mes",
      description: "Para doctores que quieren maximizar su alcance y eficiencia",
      features: [
        "Todo lo del plan Profesional",
        "Ubicaciones ilimitadas",
        "Análisis avanzados",
        "Integración con redes sociales",
        "Gestión de reputación",
        "API personalizada",
        "Soporte telefónico 24/7",
        "Consultor dedicado"
      ],
      limitations: [],
      popular: false,
      cta: "Contactar Ventas"
    }
  ]

  const features = [
    {
      icon: Users,
      title: "Red de Pacientes",
      description: "Accede a miles de pacientes que buscan especialistas como tú"
    },
    {
      icon: Calendar,
      title: "Gestión de Citas",
      description: "Sistema completo para manejar tus citas y horarios"
    },
    {
      icon: MapPin,
      title: "Múltiples Ubicaciones",
      description: "Gestiona todas tus clínicas desde una sola plataforma"
    },
    {
      icon: TrendingUp,
      title: "Análisis Detallados",
      description: "Comprende mejor a tus pacientes con estadísticas avanzadas"
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Cumplimiento total con regulaciones de privacidad médica"
    },
    {
      icon: Headphones,
      title: "Soporte Experto",
      description: "Equipo especializado en tecnología médica disponible siempre"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <GoBackButton />
        
        {/* Header */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Únete a Nuestra Red de
            <span className="text-emerald-600 block">Profesionales de la Salud</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Conecta con más pacientes, gestiona tu práctica de manera eficiente y haz crecer tu carrera médica con nuestras herramientas especializadas.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Más de 500+ doctores confían en nosotros
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card key={plan.tier} className={`relative ${plan.popular ? 'ring-2 ring-emerald-500 shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Más Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Incluye:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitaciones:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-4 w-4 rounded-full bg-gray-300 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button 
                  asChild 
                  className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link href="/auth/doctor/register">
                    {plan.cta}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir MedConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ofrecemos las herramientas más avanzadas para que puedas enfocarte en lo que mejor sabes hacer: cuidar a tus pacientes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">¿Hay período de prueba gratuito?</h3>
                <p className="text-gray-600">
                  Sí, ofrecemos 14 días de prueba gratuita para todos nuestros planes de pago. No se requiere tarjeta de crédito.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
                <p className="text-gray-600">
                  Absolutamente. Puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">¿Qué métodos de pago aceptan?</h3>
                <p className="text-gray-600">
                  Aceptamos todas las tarjetas de crédito principales, PayPal y transferencias bancarias para planes anuales.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">¿Ofrecen soporte técnico?</h3>
                <p className="text-gray-600">
                  Sí, todos nuestros planes incluyen soporte técnico. Los planes Premium incluyen soporte telefónico 24/7.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-emerald-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para hacer crecer tu práctica médica?
          </h2>
          <p className="text-xl mb-8 text-emerald-100">
            Únete a cientos de doctores que ya están conectando con más pacientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              <Link href="/auth/doctor/register">
                Comenzar Ahora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
              <Link href="/contact">
                Hablar con Ventas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
