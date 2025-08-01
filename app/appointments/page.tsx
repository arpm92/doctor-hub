"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, User, Plus } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"

// Mock appointments data - in a real app, this would come from your database
const mockAppointments = [
  {
    id: "1",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "2024-02-15",
    time: "10:00 AM",
    status: "confirmed",
    location: "123 Heart Center Dr, New York, NY",
    reason: "Annual checkup",
  },
  {
    id: "2",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurologist",
    date: "2024-02-20",
    time: "2:30 PM",
    status: "pending",
    location: "456 Brain Institute Ave, Los Angeles, CA",
    reason: "Follow-up consultation",
  },
]

export default function AppointmentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">Manage your upcoming and past appointments</p>
            </div>
            <Button asChild className="flex items-center gap-2">
              <Link href="/booking">
                <Plus className="h-4 w-4" />
                Book New Appointment
              </Link>
            </Button>
          </div>

          {mockAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p className="text-gray-600 mb-6">Book your first appointment with one of our doctors</p>
                <Button asChild>
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {mockAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-gray-600">{appointment.specialty}</p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)} variant="secondary">
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(appointment.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>

                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{appointment.location}</span>
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="text-gray-500">Reason: </span>
                          <span className="text-gray-900">{appointment.reason}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:w-auto w-full">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          View Details
                        </Button>
                        {appointment.status === "confirmed" && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel
                          </Button>
                        )}
                        {appointment.status === "pending" && (
                          <Button variant="ghost" size="sm">
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
