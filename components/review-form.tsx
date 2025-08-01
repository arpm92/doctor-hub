"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Star, Shield } from "lucide-react"

interface ReviewFormProps {
  doctorName: string
  onSubmit: (rating: number, comment: string) => void
  isLoggedIn: boolean
  onLoginRequired: () => void
}

export function ReviewForm({ doctorName }: ReviewFormProps) {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Write a Review for {doctorName}
          <Badge variant="secondary" className="text-xs">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            The review system is currently under development. You can contact the doctor directly for now.
          </AlertDescription>
        </Alert>

        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Review System Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We're working on a comprehensive review system that will allow patients to share their experiences.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Planned Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Star ratings and detailed reviews</li>
              <li>• Verified patient reviews</li>
              <li>• Photo uploads</li>
              <li>• Review moderation</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
