"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { GoBackButton } from "@/components/go-back-button"
import { 
  getCurrentUser, 
  getCurrentDoctor, 
  getDoctorLocation, 
  updateDoctorLocation, 
  signOut, 
  type Doctor, 
  type DoctorLocation 
} from "@/lib/supabase"

const locationSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres." }),
  city: z.string().min(3, { message: "La ciudad debe tener al menos 3 caracteres." }),
  state: z.string().min(2, { message: "El estado debe tener al menos 2 caracteres." }),
  postal_code: z.string().optional(),
  country: z.string().min(2, { message: "El país debe tener al menos 2 caracteres." }),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  is_primary: z.boolean().default(false),
})

export default function DoctorLocationEditPage() {
  const router = useRouter()
  const params = useParams()
  const locationId = params.id as string
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [location, setLocation] = useState<DoctorLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if locationId is "new" and redirect
        if (locationId === "new") {
          router.push("/doctor/locations/new")
          return
        }

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

        const { location: locationData, error: locationError } = await getDoctorLocation(locationId)

        if (locationError) {
          setError("Error al cargar la ubicación: " + locationError.message)
          return
        }

        if (!locationData) {
          setError("Ubicación no encontrada")
          return
        }

        if (locationData.doctor_id !== doctorData.id) {
          setError("No tienes permisos para editar esta ubicación")
          return
        }

        setLocation(locationData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Ocurrió un error inesperado")
      } finally {
        setIsLoading(false)
      }
    }

    if (locationId) {
      loadData()
    }
  }, [router, locationId])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Venezuela",
      phone: "",
      email: "",
      website: "",
      latitude: null,
      longitude: null,
      is_primary: false,
    },
  })

  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name || "",
        address: location.address || "",
        city: location.city || "",
        state: location.state || "",
        postal_code: location.postal_code || "",
        country: location.country || "Venezuela",
        phone: location.phone || "",
        email: location.email || "",
        website: location.website || "",
        latitude: location.latitude,
        longitude: location.longitude,
        is_primary: location.is_primary || false,
      })
    }
  }, [location, form])

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    if (!doctor || !location) {
      setError("Datos no cargados")
      return
    }

    try {
      const cleanedValues = {
        name: values.name,
        address: values.address,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code || null,
        country: values.country,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        latitude: values.latitude,
        longitude: values.longitude,
        is_primary: values.is_primary,
      }

      const { data, error } = await updateDoctorLocation(location.id, cleanedValues)

      if (error) {
        setError("Error al actualizar la ubicación: " + error.message)
        return
      }

      toast({
        title: "¡Ubicación actualizada exitosamente!",
        description: "Tus cambios han sido guardados.",
      })
      router.push("/doctor/locations")
    } catch (err) {
      console.error("Error updating location:", err)
      setError("Ocurrió un error inesperado")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ubicación...</p>
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

  if (!doctor || !location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Ubicación no encontrada.</p>
          <Button onClick={handleSignOut}>Cerrar Sesión</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GoBackButton fallbackUrl="/doctor/locations" />
                <CardTitle>Editar Ubicación</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Ubicación</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: Consultorio Principal" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Av. Principal #123" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Caracas" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado/Provincia</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Distrito Capital" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1010" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Venezuela" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+58 212 123-4567" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="email@ejemplo.com" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sitio Web (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://ejemplo.com" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>Opcional - Deja en blanco si no tienes sitio web</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitud (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="10.4806" 
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription>Para mostrar en el mapa</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitud (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="any"
                            placeholder="-66.9036" 
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? null : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormDescription>Para mostrar en el mapa</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="is_primary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Ubicación Principal</FormLabel>
                        <FormDescription>Establecer esta ubicación como tu ubicación principal.</FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting ? "Actualizando..." : "Actualizar Ubicación"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
