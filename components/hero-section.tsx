"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Heart, Award, Calendar } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const stats = [
    { icon: Users, label: "Expert Doctors", value: "50+" },
    { icon: Heart, label: "Patients Served", value: "10,000+" },
    { icon: Award, label: "Years Experience", value: "15+" },
    { icon: Calendar, label: "Appointments Daily", value: "200+" },
  ]

  const scrollToDoctors = () => {
    const doctorsSection = document.getElementById("doctors-section")
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Health, Our <span className="text-blue-200">Expertise</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            Connect with world-class healthcare professionals who are passionate about your well-being. Discover
            specialized care tailored to your unique needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-3"
              onClick={scrollToDoctors}
            >
              Find Your Doctor
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700 text-lg px-8 py-3 bg-transparent"
              asChild
            >
              <Link href="/pricing">Join Our Network</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
