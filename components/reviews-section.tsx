"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ReviewCard } from "./review-card"
import { ReviewForm } from "./review-form"
import { StarRating } from "./star-rating"
import { Star, MessageSquare, TrendingUp } from "lucide-react"
import type { Doctor, Review } from "@/lib/types"

interface ReviewsSectionProps {
  doctor: Doctor
}

export function ReviewsSection({ doctor }: ReviewsSectionProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Mock auth state
  const [reviews, setReviews] = useState<Review[]>(doctor.reviews)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const handleLoginRequired = () => {
    window.location.href = "/auth/login"
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    // Mock review submission
    const newReview: Review = {
      id: `review-${Date.now()}`,
      patientId: "current-user",
      patientName: "Current User", // In real app, get from auth
      rating,
      comment,
      createdAt: new Date().toISOString().split("T")[0],
      verified: false, // New reviews start unverified
    }

    setReviews((prev) => [newReview, ...prev])
  }

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3)

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <div className="space-y-8">
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Patient Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900">{doctor.averageRating.toFixed(1)}</div>
                <StarRating rating={doctor.averageRating} size="lg" />
                <div className="text-gray-600">
                  Based on {doctor.totalReviews} review{doctor.totalReviews !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100)}% Positive
                </Badge>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-3">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 w-8">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <ReviewForm
        doctorName={doctor.name}
        onSubmit={handleReviewSubmit}
        isLoggedIn={isLoggedIn}
        onLoginRequired={handleLoginRequired}
      />

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Patient Reviews ({reviews.length})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to share your experience with {doctor.name}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviews.length > 3 && (
              <div className="text-center">
                <Button variant="outline" onClick={() => setShowAllReviews(!showAllReviews)}>
                  {showAllReviews ? "Show Less" : `Show All ${reviews.length} Reviews`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
