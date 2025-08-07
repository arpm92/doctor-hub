import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Clock, Languages, GraduationCap, Award, ArrowLeft, Star, Phone, Mail, Globe, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"
import { supabase } from "@/lib/supabase"
import { LeafletMap } from "@/components/leaflet-map"

interface DoctorProfilePageProps {
  params: {
    slug: string
  }
}

async function getDoctorBySlug(slug: string) {
  try {
    console.log("Looking for doctor with slug:", slug)
    
    // First try to find by slug if the column exists
    let { data: doctor, error } = await supabase
      .from("doctors")
      .select(`
        *,
        doctor_locations (*),
        doctor_articles (*)
      `)
      .eq("slug", slug)
      .eq("status", "approved")
      .single()

    // If slug column doesn't exist or no result, try name-based lookup
    if (error && (error.code === "42703" || error.code === "PGRST116")) {
      console.log("Trying name-based lookup")
      const nameParts = slug.split("-")
      if (nameParts.length >= 2) {
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join("-")
        
        const { data: doctorByName, error: nameError } = await supabase
          .from("doctors")
          .select(`
            *,
            doctor_locations (*),
            doctor_articles (*)
          `)
          .ilike("first_name", firstName)
          .ilike("last_name", lastName)
          .eq("status", "approved")
          .single()

        if (nameError) {
          console.error("Error fetching doctor by name:", nameError)
          return null
        }

        doctor = doctorByName
      }
    } else if (error) {
      console.error("Error fetching doctor:", error)
      return null
    }

    return doctor
  } catch (error) {
    console.error("Unexpected error:", error)
    return null
  }
}

export default async function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const doctor = await getDoctorBySlug(params.slug)

  if (!doctor) {
    notFound()
  }

  const primaryLocation = doctor.doctor_locations?.find(loc => loc.is_primary) || doctor.doctor_locations?.[0]
  const publishedArticles = doctor.doctor_articles?.filter(article => article.published_at) || []
  const socialMedia = doctor.social_media || {}

  const socialIcons = {
    instagram: Instagram,
    twitter: Twitter, // We'll keep Twitter icon but update the label
    facebook: Facebook,
    linkedin: Linkedin,
  }

  const socialLabels = {
    instagram: "Instagram",
    twitter: "X (Twitter)",
    facebook: "Facebook", 
    linkedin: "LinkedIn",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <GoBackButton />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-emerald-100">
                      <Image
                        src={doctor.profile_image || "/placeholder.svg?height=200&width=200&text=Doctor"}
                        alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-4xl font-bold text-gray-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </h1>
                        <Badge
                          variant={doctor.tier === "premium" ? "default" : doctor.tier === "medium" ? "secondary" : "outline"}
                          className="capitalize text-sm px-3 py-1"
                        >
                          {doctor.tier || "básico"}
                        </Badge>
                      </div>
                      <p className="text-2xl text-emerald-600 font-semibold mb-3">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">4.8</span>
                        </div>
                        <span className="text-gray-600">(127 reseñas)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-5 w-5 text-emerald-600" />
                        <span>{doctor.years_experience} años de experiencia</span>
                      </div>
                      {primaryLocation && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                          <span>{primaryLocation.city}, {primaryLocation.state}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-700">
                        <Languages className="h-5 w-5 text-emerald-600" />
                        <span>{(doctor.languages || ["Español"]).join(", ")}</span>
                      </div>
                      {doctor.phone && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone className="h-5 w-5 text-emerald-600" />
                          <span>{doctor.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Social Media Links */}
                    {Object.entries(socialMedia).some(([_, url]) => url) && (
                      <div className="flex items-center gap-4">
                        <span className="text-base text-gray-700 font-medium">Sígueme:</span>
                        <div className="flex gap-3">
                          {Object.entries(socialMedia).map(([platform, url]) => {
                            const IconComponent = socialIcons[platform as keyof typeof socialIcons]
                            const label = socialLabels[platform as keyof typeof socialLabels]
                            if (!IconComponent || !url) return null
                            
                            return (
                              <a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-gray-100 hover:bg-emerald-100 transition-colors group"
                                title={label}
                              >
                                <IconComponent className="h-5 w-5 text-gray-600 group-hover:text-emerald-600" />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {doctor.bio && (
                      <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">Acerca de mí</h3>
                        <p className="text-gray-700 leading-relaxed text-base">{doctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for additional information */}
            <Tabs defaultValue="education" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="education" className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Educación
                </TabsTrigger>
                {publishedArticles.length > 0 && (
                  <TabsTrigger value="articles" className="flex items-center gap-2 text-base">
                    <Award className="h-5 w-5" />
                    Artículos ({publishedArticles.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="education">
                <Card className="border-emerald-200 shadow-md">
                  <CardHeader className="bg-emerald-50">
                    <CardTitle className="flex items-center gap-3 text-emerald-900 text-xl">
                      <GraduationCap className="h-6 w-6" />
                      Educación y Certificaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {doctor.education && doctor.education.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Educación</h4>
                        <ul className="space-y-3">
                          {doctor.education.map((edu, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <GraduationCap className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{edu}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {doctor.certifications && doctor.certifications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Certificaciones</h4>
                        <ul className="space-y-3">
                          {doctor.certifications.map((cert, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Award className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(!doctor.education || doctor.education.length === 0) && 
                     (!doctor.certifications || doctor.certifications.length === 0) && (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 italic">Información educativa no disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {publishedArticles.length > 0 && (
                <TabsContent value="articles">
                  <Card className="border-emerald-200 shadow-md">
                    <CardHeader className="bg-emerald-50">
                      <CardTitle className="text-xl">Artículos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {publishedArticles.slice(0, 3).map((article) => (
                          <div key={article.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                            <h4 className="font-semibold text-gray-900 mb-2 text-lg">{article.title}</h4>
                            {article.excerpt && (
                              <p className="text-gray-600 mb-3 leading-relaxed">{article.excerpt}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{new Date(article.published_at).toLocaleDateString('es-ES')}</span>
                              {article.read_time && <span>• {article.read_time} min de lectura</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Reservar una Cita</h3>
                  
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-4">
                      El sistema de reservas estará disponible próximamente.
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/contact">
                        Contáctanos
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {doctor.doctor_locations && doctor.doctor_locations.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    Ubicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {doctor.doctor_locations.map((location) => (
                    <div key={location.id} className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{location.name}</h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {location.address && `${location.address}, `}
                            {location.city}, {location.state}
                            {location.country && `, ${location.country}`}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {location.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{location.phone}</span>
                              </div>
                            )}
                            {location.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{location.email}</span>
                              </div>
                            )}
                            {location.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                                  Sitio Web
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        {location.is_primary && (
                          <Badge variant="outline" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      
                      {/* Map for location */}
                      {location.latitude && location.longitude && (
                        <div className="mt-4">
                          <div className="h-48 rounded-lg overflow-hidden border">
                            <LeafletMap
                              doctors={[{
                                id: doctor.id,
                                slug: doctor.slug || `${doctor.first_name}-${doctor.last_name}`.toLowerCase(),
                                name: `${doctor.first_name} ${doctor.last_name}`,
                                specialty: doctor.specialty,
                                tier: doctor.tier,
                                bio: doctor.bio || "",
                                image: doctor.profile_image || "",
                                location: {
                                  address: location.address || "",
                                  city: location.city,
                                  state: location.state,
                                  coordinates: {
                                    lat: location.latitude,
                                    lng: location.longitude
                                  }
                                },
                                education: doctor.education || [],
                                experience: `${doctor.years_experience} años`,
                                languages: doctor.languages || [],
                                certifications: doctor.certifications || [],
                                socialMedia: doctor.social_media || {},
                                blogPosts: [],
                                reviews: [],
                                averageRating: 4.8,
                                totalReviews: 127
                              }]}
                              height="192px"
                              zoom={15}
                              center={[location.latitude, location.longitude]}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
