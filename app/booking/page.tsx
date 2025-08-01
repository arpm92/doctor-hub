"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, User, Mail, FileText, Shield } from "lucide-react"
import { getAllDoctors } from "@/lib/doctors"
import type { Doctor } from "@/lib/types"

export default function BookingPage() {
  const searchParams = useSearchParams()
  const preselectedDoctor = searchParams.get("doctor")

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [formData, setFormData] = useState({
    doctor: preselectedDoctor || "",
    date: "",
    time: "",
    name: "",
    email: "",
    reason: "",
  })

  useEffect(() => {
    setDoctors(getAllDoctors())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(
      "Online booking is currently under development. Please contact the doctor directly to schedule an appointment.",
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>

        <Card className="max-w-2xl mx-auto border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl text-center flex items-center justify-center gap-2">
              Book an Appointment
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            </CardTitle>
            <p className="text-gray-600 text-center">
              Online booking system is under development. Please contact doctors directly for now.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Our online booking system is currently under development. You can view doctor profiles and contact them
                directly to schedule appointments.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doctor" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Doctor
                </Label>
                <Select value={formData.doctor} onValueChange={(value) => handleInputChange("doctor", value)} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.slug}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Preferred Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Preferred Time
                  </Label>
                  <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reason for Visit
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe the reason for your visit..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  rows={4}
                  disabled
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled>
                Submit Appointment Request (Coming Soon)
              </Button>
            </form>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Coming Soon Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Real-time appointment availability</li>
                <li>• Automatic confirmation emails</li>
                <li>• Calendar integration</li>
                <li>• Appointment reminders</li>
                <li>• Online payment processing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
