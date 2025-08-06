import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Star } from 'lucide-react'

interface DoctorCardProps {
  id: string
  name: string
  specialty: string
  experience: string
  location: string
  rating: number
  reviews: number
  image: string
  languages: string[]
  tier: "basic" | "medium" | "premium"
  slug: string
}

export function DoctorCard({
  id,
  name,
  specialty,
  experience,
  location,
  rating,
  reviews,
  image,
  languages,
  tier,
  slug
}: DoctorCardProps) {
  const canBook = tier === "medium" || tier === "premium"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={image || "/placeholder.svg?height=400&width=400&text=Doctor"}
            alt={`${name} - ${specialty}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={tier === "premium" ? "default" : tier === "medium" ? "secondary" : "outline"}
              className="text-xs capitalize"
            >
              {tier}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 p-6">
        <div className="space-y-2 w-full">
          <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          <Badge variant="secondary" className="text-sm">
            {specialty}
          </Badge>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
            <span>({reviews} reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
          <div className="text-sm text-gray-600">
            {experience} • {languages.join(", ")}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href={`/doctors/${slug}`}>View Profile</Link>
          </Button>

          {canBook && (
            <Button size="sm" asChild className="w-full flex items-center gap-2">
              <Link href={`/booking?doctor=${slug}`}>
                <Calendar className="h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
