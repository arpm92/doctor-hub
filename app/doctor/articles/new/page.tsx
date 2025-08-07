"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser, getCurrentDoctor, createDoctorArticle, signOut, type Doctor } from "@/lib/supabase"
import { GoBackButton } from "@/components/go-back-button"
import { RichTextEditor } from "@/components/rich-text-editor"

const articleSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres." }),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, { message: "El slug debe estar en minúsculas y contener solo letras, números y guiones." }),
  content: z.string().min(20, { message: "El contenido debe tener al menos 20 caracteres." }),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export default function DoctorArticleNewPage() {
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

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
    },
  })

  // Auto-generate slug from title
  const watchTitle = form.watch("title")
  useEffect(() => {
    if (watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      form.setValue("slug", slug)
    }
  }, [watchTitle, form])

  const onSubmit = async (values: z.infer<typeof articleSchema>) => {
    if (!doctor) {
      setError("Perfil de doctor no cargado")
      return
    }

    try {
      const newArticle = {
        doctor_id: doctor.id,
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt || null,
        status: values.status,
      }

      const { data, error } = await createDoctorArticle(newArticle)

      if (error) {
        setError("Error al crear el artículo: " + error.message)
        toast({
          title: "Error al crear el artículo",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "¡Artículo creado exitosamente!",
        description: "Tu nuevo artículo ha sido guardado.",
      })
      router.push(`/doctor/articles`)
    } catch (err) {
      console.error("Error creating article:", err)
      setError("Ocurrió un error inesperado")
      toast({
        title: "Ocurrió un error inesperado",
        description: "Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
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
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GoBackButton fallbackUrl="/doctor/articles" />
                <CardTitle>Escribir Nuevo Artículo</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título del Artículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="slug-del-articulo" {...field} />
                        </FormControl>
                        <FormDescription>Se genera automáticamente desde el título. Se usa en la URL.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumen</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Breve resumen del artículo" className="min-h-[100px]" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Un resumen corto que aparecerá en las listas de artículos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenido</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          doctorId={doctor.id}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="archived">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Los borradores no son visibles para el público.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                    {form.formState.isSubmitting ? "Creando..." : "Crear Artículo"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/doctor/articles")}>
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
