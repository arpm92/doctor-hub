"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"

function BookingContent() {
  const searchParams = useSearchParams()
  const doctorSlug = searchParams.get("doctor")

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoBackButton fallbackUrl="/" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-600 mt-2">Schedule your visit with our healthcare professionals</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Appointment Booking</CardTitle>
              <CardDescription className="text-gray-600">
                {doctorSlug ? `Booking with Dr. ${doctorSlug.replace("-", " ")}` : "Select your preferred doctor and time"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Coming Soon!</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  We're currently developing our online appointment booking system. In the meantime, please contact us directly to schedule your appointment.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">Call us:</span>
                    <a href="tel:+1-555-0123" className="hover:underline">+1 (555) 012-3456</a>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email us:</span>
                    <a href="mailto:appointments@medconnect.com" className="hover:underline">appointments@medconnect.com</a>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Visit us:</span>
                    <span>123 Medical Center Dr, Healthcare City, HC 12345</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Comprehensive health assessment</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Personalized treatment plan</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Follow-up care coordination</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Insurance verification assistance</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">Prepare for Your Visit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Bring your insurance card and ID</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">List of current medications</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Previous medical records</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Arrive 15 minutes early</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <a href="tel:+1-555-0123">Call to Schedule Now</a>
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
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
