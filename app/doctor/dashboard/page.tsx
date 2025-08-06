"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, FileText, Camera, Edit, Plus, Clock, CheckCircle, AlertCircle, XCircle, Loader2, LogOut, Settings, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react'
import {
  getCurrentUser,
  getCurrentDoctor,
  getDoctorLocations,
  getDoctorArticles,
  signOut,
  type Doctor,
  type DoctorLocation,
  type DoctorArticle,
} from "@/lib/supabase"
import { GoBackButton } from "@/components/go-back-button"

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [locations, setLocations] = useState<DoctorLocation[]>([])
  const [articles, setArticles] = useState<DoctorArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated
        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        // Get doctor profile
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

        // Load locations and articles
        const [locationsResult, articlesResult] = await Promise.all([
          getDoctorLocations(doctorData.id),
          getDoctorArticles(doctorData.id),
        ])

        if (locationsResult.locations) {
          setLocations(locationsResult.locations)
        }

        if (articlesResult.articles) {
          setArticles(articlesResult.articles)
        }
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

  const getStatusBadge = (status: Doctor["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente de Revisión
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Suspendido
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Desconocido
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al Cargar Panel</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Intentar de Nuevo
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Perfil No Encontrado</h2>
            <p className="text-gray-600 mb-4">
              No se pudo encontrar tu perfil de doctor. Por favor contacta soporte para asistencia.
            </p>
            <Button onClick={handleSignOut} className="w-full">
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const socialMedia = doctor.social_media || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <GoBackButton fallbackUrl="/" />
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {doctor.profile_image ? (
                  <img
                    src={doctor.profile_image || "/placeholder.svg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dr. {doctor.first_name} {doctor.last_name}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">{doctor.specialty}</p>
                  {getStatusBadge(doctor.status)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/doctor/profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Link>
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Status Alert */}
        {doctor.status === "pending" && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Tu cuenta está actualmente bajo revisión. Recibirás una notificación por email una vez que tu perfil sea
              aprobado. Esto típicamente toma 1-2 días hábiles.
            </AlertDescription>
          </Alert>
        )}

        {doctor.status === "rejected" && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Tu solicitud de cuenta no fue aprobada. Por favor contacta soporte para más información sobre el proceso
              de revisión.
            </AlertDescription>
          </Alert>
        )}

        {doctor.status === "suspended" && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu cuenta ha sido suspendida. Por favor contacta soporte para asistencia con la reactivación de tu cuenta.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
            <TabsTrigger value="articles">Artículos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estado del Perfil</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{doctor.status === "approved" ? "Activo" : "Inactivo"}</div>
                  <p className="text-xs text-muted-foreground">
                    {doctor.status === "approved" ? "Visible para pacientes" : "No visible para pacientes"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {locations.filter((l) => l.is_primary).length} principal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Artículos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{articles.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {articles.filter((a) => a.status === "published").length} publicados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Gestión de Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/doctor/profile">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/doctor/profile/photo">
                      <Camera className="h-4 w-4 mr-2" />
                      Actualizar Foto
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Gestión de Ubicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/doctor/locations">
                      <MapPin className="h-4 w-4 mr-2" />
                      Gestionar Ubicaciones
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full bg-transparent">
                    <Link href="/doctor/locations/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Ubicación
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            {articles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Artículos Recientes
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/doctor/articles">Ver Todos</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {articles.slice(0, 3).map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-gray-500">
                            {article.status === "published" ? "Publicado" : "Borrador"} •{" "}
                            {new Date(article.created_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctor/articles/${article.id}`}>Editar</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información del Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                        <p className="font-medium">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </p>
                        <p className="text-sm text-gray-500">El nombre no se puede cambiar</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="font-medium">{doctor.email}</p>
                      </div>
                      {doctor.phone && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Teléfono</label>
                          <p className="font-medium">{doctor.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Información Profesional</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Especialidad</label>
                        <p className="font-medium">{doctor.specialty}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Años de Experiencia</label>
                        <p className="font-medium">{doctor.years_experience} años</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Idiomas</label>
                        <p className="font-medium">{doctor.languages?.join(", ") || "Español"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {doctor.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Biografía Profesional</h3>
                    <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/doctor/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/doctor/profile/photo">
                      <Camera className="h-4 w-4 mr-2" />
                      Actualizar Foto
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Instagram className="h-6 w-6 text-pink-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">Instagram</h4>
                        <p className="text-sm text-gray-600">
                          {socialMedia.instagram ? socialMedia.instagram : "No configurado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Twitter className="h-6 w-6 text-blue-500" />
                      <div className="flex-1">
                        <h4 className="font-medium">Twitter</h4>
                        <p className="text-sm text-gray-600">
                          {socialMedia.twitter ? socialMedia.twitter : "No configurado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Facebook className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium">Facebook</h4>
                        <p className="text-sm text-gray-600">
                          {socialMedia.facebook ? socialMedia.facebook : "No configurado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <Linkedin className="h-6 w-6 text-blue-700" />
                      <div className="flex-1">
                        <h4 className="font-medium">LinkedIn</h4>
                        <p className="text-sm text-gray-600">
                          {socialMedia.linkedin ? socialMedia.linkedin : "No configurado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/doctor/profile/social">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Redes Sociales
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ubicaciones de Práctica</CardTitle>
                  <Button asChild>
                    <Link href="/doctor/locations/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Ubicación
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {locations.length > 0 ? (
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <div key={location.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{location.name}</h4>
                              {location.is_primary && <Badge variant="secondary">Principal</Badge>}
                            </div>
                            <p className="text-gray-600">{location.address}</p>
                            <p className="text-gray-600">
                              {location.city}, {location.state} {location.postal_code}
                            </p>
                            {location.phone && <p className="text-gray-600">{location.phone}</p>}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctor/locations/${location.id}`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ubicaciones agregadas</h3>
                    <p className="text-gray-600 mb-4">Agrega las ubicaciones de tu práctica para ayudar a los pacientes a encontrarte.</p>
                    <Button asChild>
                      <Link href="/doctor/locations/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Tu Primera Ubicación
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mis Artículos</CardTitle>
                  <Button asChild>
                    <Link href="/doctor/articles/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Escribir Artículo
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{article.title}</h4>
                              <Badge
                                variant={
                                  article.status === "published"
                                    ? "default"
                                    : article.status === "draft"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {article.status === "published" ? "Publicado" : article.status === "draft" ? "Borrador" : article.status}
                              </Badge>
                            </div>
                            {article.excerpt && <p className="text-gray-600 mb-2">{article.excerpt}</p>}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                {article.status === "published" && article.published_at
                                  ? `Publicado ${new Date(article.published_at).toLocaleDateString('es-ES')}`
                                  : `Creado ${new Date(article.created_at).toLocaleDateString('es-ES')}`}
                              </span>
                              {article.read_time && <span>{article.read_time} min de lectura</span>}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctor/articles/${article.id}`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no hay artículos</h3>
                    <p className="text-gray-600 mb-4">
                      Comparte tu experiencia escribiendo artículos para pacientes y colegas.
                    </p>
                    <Button asChild>
                      <Link href="/doctor/articles/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Escribir Tu Primer Artículo
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
