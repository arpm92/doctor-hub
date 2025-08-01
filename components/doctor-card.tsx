import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, BookOpen } from "lucide-react"
import { StarRating } from "./star-rating"
import type { Doctor } from "@/lib/types"

interface DoctorCardProps {
  doctor: Doctor
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const canBook = doctor.tier === "medium" || doctor.tier === "premium"
  const hasArticles = doctor.tier === "premium" && doctor.blogPosts.length > 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={doctor.image || "/placeholder.svg"}
            alt={`${doctor.name} - ${doctor.specialty}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={doctor.tier === "premium" ? "default" : doctor.tier === "medium" ? "secondary" : "outline"}
              className="text-xs"
            >
              {doctor.tier}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-6">
        <div className="space-y-2 w-full">
          <h3 className="font-semibold text-lg leading-tight">{doctor.name}</h3>
          <Badge variant="secondary" className="text-sm">
            {doctor.specialty}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <StarRating rating={doctor.averageRating} size="sm" />
            <span>({doctor.totalReviews} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>
              {doctor.location.city}, {doctor.location.state}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
            <Link href={`/doctors/${doctor.slug}`}>View Profile</Link>
          </Button>

          {canBook && (
            <Button size="sm" asChild className="w-full flex items-center gap-2">
              <Link href={`/booking?doctor=${doctor.slug}`}>
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          )}

          {hasArticles && (
            <Button variant="ghost" size="sm" asChild className="w-full flex items-center gap-2">
              <Link href={`/doctors/${doctor.slug}#articles`}>
                <BookOpen className="h-4 w-4" />
                Read Articles ({doctor.blogPosts.length})
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
