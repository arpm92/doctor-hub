import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Linkedin, Instagram, Twitter, Facebook, GraduationCap, Award, BookOpen, Star, MapPin, Phone, Mail, Globe } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import type { Doctor } from "@/lib/supabase"

interface DoctorProfilePageProps {
  params: {
    slug: string
  }
}

interface DatabaseDoctor extends Doctor {
  doctor_locations?: Array<{
    id: string
    name: string
    address: string
    city: string
    state: string
    postal_code?: string
    country: string
    phone?: string
    email?: string
    website?: string
    is_primary: boolean
    latitude?: number
    longitude?: number
  }>
  doctor_articles?: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string
    featured_image?: string
    published_at?: string
    read_time?: number
  }>
}

async function getDoctorBySlug(slug: string): Promise<DatabaseDoctor | null> {
  try {
    // Try to find by slug first, then by name-based slug
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

    if (error && error.code === "PGRST116") {
      // Not found by slug, try by name-based slug
      const nameParts = slug.split("-")
      if (nameParts.length >= 2) {
        const firstName = nameParts[0]
        const lastName = nameParts[nameParts.length - 1]
        
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
          return null
        }
        
        doctor = doctorByName
      } else {
        return null
      }
    } else if (error) {
      console.error("Error fetching doctor:", error)
      return null
    }

    return doctor
  } catch (error) {
    console.error("Unexpected error fetching doctor:", error)
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

  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
  }

  // Mock data for demonstration - you can implement these features later
  const mockReviews = {
    averageRating: 4.8,
    totalReviews: 127,
    reviews: [
      {
        id: "1",
        patientName: "Sarah M.",
        rating: 5,
        comment: "Excellent care and very professional. Highly recommend!",
        date: "2024-01-15"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>

        {/* Header Section */}
        <Card className="mb-8 overflow-hidden border-emerald-200 shadow-xl">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={doctor.profile_image || "/placeholder.svg?height=400&width=400&text=Doctor"}
                    alt={`Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="md:w-2/3 p-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h1>
                    <Badge variant="secondary" className="text-lg px-3 py-1 mb-4 bg-emerald-100 text-emerald-800">
                      {doctor.specialty}
                    </Badge>
                    {doctor.bio && (
                      <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">Experience</div>
                      <div className="text-gray-600">{doctor.years_experience} years</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Languages</div>
                      <div className="text-gray-600">{doctor.languages?.join(", ") || "English"}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Articles</div>
                      <div className="text-gray-600">{publishedArticles.length} published</div>
                    </div>
                  </div>

                  {primaryLocation && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{primaryLocation.name}</div>
                        <div className="text-sm">
                          {primaryLocation.address}, {primaryLocation.city}, {primaryLocation.state}
                        </div>
                        {primaryLocation.phone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{primaryLocation.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      asChild
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                      disabled={doctor.tier === "basic"}
                    >
                      <Link href={doctor.tier === "basic" ? "#" : `/booking?doctor=${params.slug}`}>
                        <Calendar className="h-5 w-5" />
                        {doctor.tier === "basic" ? "Booking Not Available" : "Book Appointment"}
                      </Link>
                    </Button>
                    
                    {primaryLocation?.phone && (
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <a href={`tel:${primaryLocation.phone}`}>
                          <Phone className="h-5 w-5" />
                          Call Office
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="about" className="space-y-8">
          <TabsList className={`grid w-full ${doctor.tier === "premium" && publishedArticles.length > 0 ? "grid-cols-4" : "grid-cols-3"} bg-white border border-emerald-200`}>
            <TabsTrigger value="about" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
              <Award className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
              <GraduationCap className="h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
              <Star className="h-4 w-4" />
              Reviews ({mockReviews.totalReviews})
            </TabsTrigger>
            {doctor.tier === "premium" && publishedArticles.length > 0 && (
              <TabsTrigger value="articles" className="flex items-center gap-2 data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800">
                <BookOpen className="h-4 w-4" />
                Articles ({publishedArticles.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="about">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">About Dr. {doctor.last_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {doctor.bio && (
                  <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-emerald-900">Specialization</h3>
                  <Badge variant="outline" className="text-sm border-emerald-200 text-emerald-800">
                    {doctor.specialty}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-emerald-900">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-2">
                    {(doctor.languages || ["English"]).map((language) => (
                      <Badge key={language} variant="outline" className="border-emerald-200 text-emerald-800">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                {doctor.doctor_locations && doctor.doctor_locations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-emerald-900">Practice Locations</h3>
                    <div className="space-y-4">
                      {doctor.doctor_locations.map((location) => (
                        <div key={location.id} className="border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{location.name}</h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {location.address}<br />
                                {location.city}, {location.state} {location.postal_code}
                              </p>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                {location.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{location.phone}</span>
                                  </div>
                                )}
                                {location.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{location.email}</span>
                                  </div>
                                )}
                                {location.website && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    <a href={location.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            {location.is_primary && (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <div className="grid gap-6">
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctor.education && doctor.education.length > 0 ? (
                    <ul className="space-y-3">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{edu}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Education information not available</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctor.certifications && doctor.certifications.length > 0 ? (
                    <ul className="space-y-3">
                      {doctor.certifications.map((cert, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{cert}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Certification information not available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-emerald-900">Patient Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Reviews system coming soon!</p>
                  <p className="text-sm text-gray-500 mt-2">
                    We're working on implementing a comprehensive review system for our doctors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {doctor.tier === "premium" && publishedArticles.length > 0 && (
            <TabsContent value="articles">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Articles</h2>
                  <p className="text-gray-600">Insights and expertise from Dr. {doctor.last_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedArticles.map((article) => (
                    <Card key={article.id} className="border-emerald-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {article.featured_image && (
                          <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">
                            <Image
                              src={article.featured_image || "/placeholder.svg"}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-lg mb-2 text-gray-900">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          {article.published_at && (
                            <span>{new Date(article.published_at).toLocaleDateString()}</span>
                          )}
                          {article.read_time && (
                            <span>{article.read_time} min read</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
