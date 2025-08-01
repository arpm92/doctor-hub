import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlogPostCard } from "@/components/blog-post-card"
import {
  ArrowLeft,
  Calendar,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  GraduationCap,
  Award,
  BookOpen,
  Star,
} from "lucide-react"
import { getDoctorBySlug, getAllDoctors } from "@/lib/doctors"
import { DoctorLocationMap } from "@/components/doctor-location-map"
import { ReviewsSection } from "@/components/reviews-section"

interface DoctorProfilePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const doctors = getAllDoctors()
  return doctors.map((doctor) => ({
    slug: doctor.slug,
  }))
}

export default function DoctorProfilePage({ params }: DoctorProfilePageProps) {
  const doctor = getDoctorBySlug(params.slug)

  if (!doctor) {
    notFound()
  }

  const socialIcons = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
  }

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

        {/* Header Section */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:w-1/3">
                <div className="aspect-square relative">
                  <Image
                    src={doctor.image || "/placeholder.svg"}
                    alt={`${doctor.name} - ${doctor.specialty}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="md:w-2/3 p-8">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
                    <Badge variant="secondary" className="text-lg px-3 py-1 mb-4">
                      {doctor.specialty}
                    </Badge>
                    <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">Experience</div>
                      <div className="text-gray-600">{doctor.experience}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Languages</div>
                      <div className="text-gray-600">{doctor.languages.join(", ")}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Articles</div>
                      <div className="text-gray-600">{doctor.blogPosts.length} published</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {Object.entries(doctor.socialMedia).map(([platform, url]) => {
                      const Icon = socialIcons[platform as keyof typeof socialIcons]
                      return (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize">
                            <Icon className="h-4 w-4" />
                            {platform}
                          </a>
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    size="lg"
                    asChild
                    className="w-full md:w-auto flex items-center gap-2"
                    disabled={doctor.tier === "basic"}
                  >
                    <Link href={doctor.tier === "basic" ? "#" : `/booking?doctor=${doctor.slug}`}>
                      <Calendar className="h-5 w-5" />
                      {doctor.tier === "basic" ? "Booking Not Available" : "Book Appointment"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="about" className="space-y-8">
          <TabsList className={`grid w-full ${doctor.tier === "premium" ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews ({doctor.totalReviews})
            </TabsTrigger>
            {doctor.tier === "premium" && (
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Articles ({doctor.blogPosts.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Dr. {doctor.name.split(" ").pop()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Specializations</h3>
                  <Badge variant="outline" className="text-sm">
                    {doctor.specialty}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((language) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {doctor.education.map((edu, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{edu}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {doctor.certifications.map((cert, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <DoctorLocationMap doctor={doctor} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsSection doctor={doctor} />
          </TabsContent>

          {doctor.tier === "premium" && (
            <TabsContent value="articles">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Articles</h2>
                  <p className="text-gray-600">Insights and expertise from Dr. {doctor.name.split(" ").pop()}</p>
                </div>

                {doctor.blogPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctor.blogPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} doctorSlug={doctor.slug} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No articles published yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
