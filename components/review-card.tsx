import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "./star-rating"
import { CheckCircle, User } from "lucide-react"
import type { Review } from "@/lib/types"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
            {review.patientAvatar ? (
              <Image
                src={review.patientAvatar || "/placeholder.svg"}
                alt={review.patientName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{review.patientName}</h4>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified Patient
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
            </div>

            <StarRating rating={review.rating} size="sm" />

            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
