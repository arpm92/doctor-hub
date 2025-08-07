"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Phone, Mail, ArrowLeft, Construction } from 'lucide-react'
import Link from "next/link"
import { GoBackButton } from "@/components/go-back-button"

function BookingContent() {
  const searchParams = useSearchParams()
  const doctorSlug = searchParams.get('doctor')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <GoBackButton />
          
          <Card className="mt-8">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Construction className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Sistema de Reservas
              </CardTitle>
              <Badge variant="secondary" className="mx-auto">
                Próximamente
              </Badge>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-gray-600">
                  Estamos trabajando en nuestro sistema de reservas en línea para hacer que programar citas sea más fácil que nunca.
                </p>
                
                {doctorSlug && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <strong>Doctor seleccionado:</strong> {doctorSlug.replace('-', ' ')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white border rounded-lg p-4">
                    <Calendar className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">Reservas en Línea</h3>
                    <p className="text-sm text-gray-600">Programa citas 24/7 desde cualquier dispositivo</p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">Horarios Flexibles</h3>
                    <p className="text-sm text-gray-600">Encuentra el horario que mejor se adapte a ti</p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <MapPin className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">Múltiples Ubicaciones</h3>
                    <p className="text-sm text-gray-600">Elige la clínica más conveniente para ti</p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <Phone className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">Recordatorios</h3>
                    <p className="text-sm text-gray-600">Recibe notificaciones antes de tu cita</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Mientras tanto, puedes contactarnos directamente:
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="outline" className="flex items-center gap-2">
                    <Link href="/contact">
                      <Mail className="h-4 w-4" />
                      Enviar Mensaje
                    </Link>
                  </Button>
                  
                  <Button asChild className="flex items-center gap-2">
                    <Link href="tel:+34-900-123-456">
                      <Phone className="h-4 w-4" />
                      Llamar Ahora
                    </Link>
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  Horario de atención: Lunes a Viernes, 9:00 AM - 6:00 PM
                </p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
