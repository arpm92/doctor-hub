import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Clock, Languages, GraduationCap, Award, ArrowLeft, Star } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"
import { supabase } from "@/lib/supabase"

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
    if (error && error.code === "42703") {
      console.log("Slug column doesn't exist, trying name-based lookup")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <GoBackButton />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 relative rounded-full overflow-hidden">
                      <Image
                        src={doctor.profile_image || "/placeholder.svg?height=200&width=200&text=Doctor"}
                        alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </h1>
                        <Badge
                          variant={doctor.tier === "premium" ? "default" : doctor.tier === "medium" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {doctor.tier || "basic"}
                        </Badge>
                      </div>
                      <p className="text-xl text-emerald-600 font-medium">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">4.8</span>
                        </div>
                        <span className="text-gray-600">(127 reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.years_experience} years experience</span>
                      </div>
                      {primaryLocation && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{primaryLocation.city}, {primaryLocation.state}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Languages className="h-4 w-4" />
                        <span>{(doctor.languages || ["English"]).join(", ")}</span>
                      </div>
                    </div>

                    {doctor.bio && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                        <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education & Certifications */}
            {(doctor.education?.length > 0 || doctor.certifications?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.education?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                      <ul className="space-y-1">
                        {doctor.education.map((edu, index) => (
                          <li key={index} className="text-gray-600">{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {doctor.certifications?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                      <ul className="space-y-1">
                        {doctor.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-600">
                            <Award className="h-4 w-4" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Articles */}
            {publishedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {publishedArticles.slice(0, 3).map((article) => (
                      <div key={article.id} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
                        <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm mb-2">{article.excerpt}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(article.published_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Book an Appointment</h3>
                  
                  {(doctor.tier === "medium" || doctor.tier === "premium") ? (
                    <Button asChild className="w-full">
                      <Link href={`/booking?doctor=${doctor.slug || params.slug}`}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Consultation
                      </Link>
                    </Button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 text-sm mb-3">
                        This doctor is not currently accepting online bookings.
                      </p>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/contact">
                          Contact Us
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            {doctor.doctor_locations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.doctor_locations.map((location) => (
                    <div key={location.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{location.name}</h4>
                          <p className="text-gray-600 text-sm">
                            {location.address && `${location.address}, `}
                            {location.city}, {location.state}
                          </p>
                        </div>
                        {location.is_primary && (
                          <Badge variant="outline" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
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
