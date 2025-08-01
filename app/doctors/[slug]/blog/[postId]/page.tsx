import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import { getDoctorBySlug, getAllDoctors } from "@/lib/doctors"

interface BlogPostPageProps {
  params: {
    slug: string
    postId: string
  }
}

export async function generateStaticParams() {
  const doctors = getAllDoctors()
  const params = []

  for (const doctor of doctors) {
    for (const post of doctor.blogPosts) {
      params.push({
        slug: doctor.slug,
        postId: post.id,
      })
    }
  }

  return params
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const doctor = getDoctorBySlug(params.slug)

  if (!doctor) {
    notFound()
  }

  const post = doctor.blogPosts.find((p) => p.id === params.postId)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/doctors/${doctor.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {doctor.name}
        </Link>

        <article className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video relative">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>

              <div className="p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {doctor.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.excerpt}</p>

                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden">
                      <Image src={doctor.image || "/placeholder.svg"} alt={doctor.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
                        <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}
