"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { GoBackButton } from "@/components/go-back-button"
import { Plus, X } from 'lucide-react'
import { 
  getCurrentUser, 
  getCurrentDoctor, 
  updateDoctorProfile, 
  signOut, 
  type Doctor 
} from "@/lib/supabase"

const profileSchema = z.object({
  first_name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  last_name: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  phone: z.string().min(10, { message: "El teléfono debe tener al menos 10 caracteres." }),
  specialty: z.string().min(3, { message: "La especialidad debe tener al menos 3 caracteres." }),
  years_experience: z.number().min(0, { message: "Los años de experiencia deben ser un número positivo." }),
  bio: z.string().optional(),
  education: z.array(z.string().min(1, "La educación no puede estar vacía")).optional(),
  certifications: z.array(z.string().min(1, "La certificación no puede estar vacía")).optional(),
  languages: z.array(z.string().min(1, "El idioma no puede estar vacío")).optional(),
  social_media: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
})

export default function DoctorProfileEditPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()

        if (doctorError) {
          setError("Error al cargar el perfil del doctor")
          return
        }

        if (!doctorData) {
          setError("Perfil de doctor no encontrado. Por favor contacta soporte.")
          return
        }

        setDoctor(doctorData)
      } catch (err) {
        console.error("Error loading doctor data:", err)
        setError("Ocurrió un error inesperado")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      specialty: "",
      years_experience: 0,
      bio: "",
      education: [],
      certifications: [],
      languages: [],
      social_media: {
        instagram: "",
        twitter: "",
        facebook: "",
        linkedin: "",
      },
    },
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education",
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications",
  })

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: "languages",
  })

  useEffect(() => {
    if (doctor) {
      form.reset({
        first_name: doctor.first_name || "",
        last_name: doctor.last_name || "",
        phone: doctor.phone || "",
        specialty: doctor.specialty || "",
        years_experience: doctor.years_experience || 0,
        bio: doctor.bio || "",
        education: doctor.education || [],
        certifications: doctor.certifications || [],
        languages: doctor.languages || [],
        social_media: {
          instagram: doctor.social_media?.instagram || "",
          twitter: doctor.social_media?.twitter || "",
          facebook: doctor.social_media?.facebook || "",
          linkedin: doctor.social_media?.linkedin || "",
        },
      })
    }
  }, [doctor, form])

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!doctor) {
      setError("Perfil de doctor no cargado")
      return
    }

    try {
      const cleanedValues = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        specialty: values.specialty,
        years_experience: values.years_experience,
        bio: values.bio || null,
        education: values.education?.filter(e => e.trim() !== "") || [],
        certifications: values.certifications?.filter(c => c.trim() !== "") || [],
        languages: values.languages?.filter(l => l.trim() !== "") || [],
        social_media: {
          instagram: values.social_media?.instagram || null,
          twitter: values.social_media?.twitter || null,
          facebook: values.social_media?.facebook || null,
          linkedin: values.social_media?.linkedin || null,
        },
      }

      const { data, error } = await updateDoctorProfile(doctor.id, cleanedValues)

      if (error) {
        setError("Error al actualizar el perfil: " + error.message)
        return
      }

      toast({
        title: "¡Perfil actualizado exitosamente!",
        description: "Tus cambios han sido guardados.",
      })
      
      // Refresh doctor data
      const { doctor: updatedDoctor } = await getCurrentDoctor()
      if (updatedDoctor) {
        setDoctor(updatedDoctor)
      }

      // Redirect back to profile
      router.push("/doctor/profile")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Ocurrió un error inesperado")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
            <Button onClick={handleSignOut}>Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Perfil de doctor no encontrado.</p>
          <Button onClick={handleSignOut}>Cerrar Sesión</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GoBackButton fallbackUrl="/doctor/profile" />
                <CardTitle>Editar Perfil</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Pérez" value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+58 212 123-4567" value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="years_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Años de Experiencia</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad</FormLabel>
                        <FormControl>
                          <Input placeholder="Cardiología" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos sobre ti, tu experiencia y tu enfoque médico..." 
                            className="min-h-[100px]"
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Educación</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEducation("")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Educación
                    </Button>
                  </div>
                  
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`education.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Ej: Médico Cirujano - Universidad Central de Venezuela (2015)"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Certificaciones</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCertification("")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Certificación
                    </Button>
                  </div>
                  
                  {certificationFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`certifications.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Ej: Especialista en Cardiología - Colegio de Médicos (2018)"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Idiomas</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendLanguage("")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Idioma
                    </Button>
                  </div>
                  
                  {languageFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`languages.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Ej: Español (Nativo), Inglés (Avanzado)"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLanguage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Redes Sociales</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="social_media.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="@tu_usuario" 
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="social_media.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="@tu_usuario" 
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="social_media.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="tu.perfil" 
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="social_media.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="tu-perfil" 
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                    {form.formState.isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/doctor/profile")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
