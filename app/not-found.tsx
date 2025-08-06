import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft, Heart } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-emerald-200 shadow-xl">
        <CardContent className="text-center p-8">
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-emerald-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
              <Link href="/#doctors-section">
                <Search className="h-4 w-4 mr-2" />
                Find Doctors
              </Link>
            </Button>
            
            <Button 
              onClick={() => window.history.back()} 
              variant="ghost" 
              className="w-full text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-emerald-200">
            <p className="text-sm text-gray-500">
              Need help? <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact our support team</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
