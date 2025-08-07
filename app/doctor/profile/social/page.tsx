"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Instagram, Twitter, Facebook, Linkedin, Save, ArrowLeft } from 'lucide-react'
import { getCurrentUser, getCurrentDoctor, updateDoctorProfile, type Doctor } from "@/lib/supabase"
import { GoBackButton } from "@/components/go-back-button"

export default function DoctorSocialMediaPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: ""
  })

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setIsLoading(true)

        const { user, error: userError } = await getCurrentUser()
        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()
        if (doctorError || !doctorData) {
          router.push("/doctor/dashboard")
          return
        }

        setDoctor(doctorData)
        
        // Load existing social media data
        const existingSocialMedia = doctorData.social_media || {}
        setSocialMedia({
          instagram: existingSocialMedia.instagram || "",
          twitter: existingSocialMedia.twitter || "",
          facebook: existingSocialMedia.facebook || "",
          linkedin: existingSocialMedia.linkedin || ""
        })
      } catch (err) {
        console.error("Error loading doctor data:", err)
        router.push("/doctor/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorData()
  }, [router])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!doctor) return

    setIsUpdating(true)

    try {
      const { data, error } = await updateDoctorProfile(doctor.id, {
        social_media: socialMedia
      })

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar las redes sociales: " + error.message,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "¡Redes sociales actualizadas!",
        description: "Tus enlaces de redes sociales han sido guardados exitosamente.",
      })

      // Update local state
      setDoctor({ ...doctor, social_media: socialMedia })
    } catch (err) {
      console.error("Error updating social media:", err)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (platform: string, value: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <GoBackButton fallbackUrl="/doctor/dashboard" />
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Configurar Redes Sociales
              </CardTitle>
            </div>
            <p className="text-gray-600">
              Agrega tus enlaces de redes sociales para que los pacientes puedan seguirte y conocer más sobre tu trabajo.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Instagram className="h-6 w-6 text-pink-600" />
                  <div className="flex-1">
                    <Label htmlFor="instagram" className="text-base font-medium">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      placeholder="https://instagram.com/tu_usuario"
                      value={socialMedia.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Twitter className="h-6 w-6 text-blue-500" />
                  <div className="flex-1">
                    <Label htmlFor="twitter" className="text-base font-medium">Twitter</Label>
                    <Input
                      id="twitter"
                      type="url"
                      placeholder="https://twitter.com/tu_usuario"
                      value={socialMedia.twitter}
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Facebook className="h-6 w-6 text-blue-600" />
                  <div className="flex-1">
                    <Label htmlFor="facebook" className="text-base font-medium">Facebook</Label>
                    <Input
                      id="facebook"
                      type="url"
                      placeholder="https://facebook.com/tu_pagina"
                      value={socialMedia.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Linkedin className="h-6 w-6 text-blue-700" />
                  <div className="flex-1">
                    <Label htmlFor="linkedin" className="text-base font-medium">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/tu_perfil"
                      value={socialMedia.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Consejos para tus redes sociales:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Asegúrate de que tus perfiles sean profesionales</li>
                  <li>• Incluye información sobre tu especialidad médica</li>
                  <li>• Comparte contenido educativo y de valor para tus pacientes</li>
                  <li>• Mantén la privacidad de la información médica</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isUpdating} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/doctor/dashboard">
                    Cancelar
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
