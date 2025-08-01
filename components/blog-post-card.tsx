import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import type { BlogPost } from "@/lib/types"

interface BlogPostCardProps {
  post: BlogPost
  doctorSlug: string
}

export function BlogPostCard({ post, doctorSlug }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

          <Link
            href={`/doctors/${doctorSlug}/blog/${post.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read More →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
