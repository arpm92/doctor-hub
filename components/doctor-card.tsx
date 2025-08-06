import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Star, Clock, Languages } from 'lucide-react'

interface DoctorCardProps {
  id: string
  name: string
  specialty: string
  image: string
  location: {
    address: string
    city: string
    state: string
  }
  averageRating: number
  totalReviews: number
  yearsExperience: number
  languages: string[]
  tier: "basic" | "medium" | "premium"
  slug: string
}

export function DoctorCard({
  id,
  name,
  specialty,
  image,
  location,
  averageRating,
  totalReviews,
  yearsExperience,
  languages,
  tier,
  slug
}: DoctorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={image || "/placeholder.svg?height=300&width=400&text=Doctor"}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={tier === "premium" ? "default" : tier === "medium" ? "secondary" : "outline"}
              className="capitalize bg-white/90 backdrop-blur-sm"
            >
              {tier}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-emerald-600 font-medium">{specialty}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600 text-sm">({totalReviews} reseñas)</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{location.city}, {location.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{yearsExperience} años de experiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{languages.join(", ")}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/doctors/${slug}`}>
                Ver Perfil
              </Link>
            </Button>
            <Button 
              asChild 
              className="flex-1"
              disabled={tier === "basic"}
            >
              <Link href={tier === "basic" ? "#" : `/booking?doctor=${slug}`}>
                <Calendar className="h-4 w-4 mr-2" />
                {tier === "basic" ? "No Disponible" : "Próximamente"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
