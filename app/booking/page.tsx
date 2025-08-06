"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, Mail, Construction } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"

function BookingContent() {
  const searchParams = useSearchParams()
  const doctorSlug = searchParams.get("doctor")

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoBackButton fallbackUrl="/" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Reservar una Cita</h1>
          <p className="text-gray-600 mt-2">Programa tu visita con nuestros profesionales de la salud</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Construction className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Sistema de Reservas</CardTitle>
              <CardDescription className="text-gray-600">
                {doctorSlug ? `Reservando con Dr. ${doctorSlug.replace("-", " ")}` : "Selecciona tu doctor y horario preferido"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Construction className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-900">¡Próximamente!</h3>
                </div>
                <p className="text-orange-800 mb-4">
                  Estamos desarrollando nuestro sistema de reservas en línea. Mientras tanto, por favor contáctanos directamente para programar tu cita.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Llámanos:</span>
                    <a href="tel:+1-555-0123" className="hover:underline">+1 (555) 012-3456</a>
                  </div>
                  <div className="flex items-center gap-2 text-orange-700">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Escríbenos:</span>
                    <a href="mailto:citas@medconnect.com" className="hover:underline">citas@medconnect.com</a>
                  </div>
                  <div className="flex items-center gap-2 text-orange-700">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Visítanos:</span>
                    <span>123 Centro Médico Dr, Ciudad Salud, CS 12345</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">Qué Esperar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Evaluación integral de salud</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Plan de tratamiento personalizado</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Coordinación de atención de seguimiento</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Asistencia con verificación de seguro</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">Prepárate para tu Visita</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Trae tu tarjeta de seguro e identificación</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Lista de medicamentos actuales</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Registros médicos previos</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Llega 15 minutos antes</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <a href="tel:+1-555-0123">Llamar para Programar Ahora</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página de reservas...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
