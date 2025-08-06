import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Search } from 'lucide-react'
import { GoBackButton } from "@/components/go-back-button"

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoBackButton fallbackUrl="/" className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Doctor Locations Map</h1>
          <p className="text-gray-600 mt-2">Find healthcare providers near you with our interactive map</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="border-emerald-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">Interactive Map</CardTitle>
              <CardDescription className="text-gray-600">
                Explore doctor locations and find the perfect healthcare provider for your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Coming Soon!</h3>
                </div>
                <p className="text-blue-800 mb-4">
                  We're currently developing our interactive map feature that will allow you to:
                </p>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>View all doctor locations on an interactive map</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Filter by specialty, distance, and availability</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Get directions to your chosen healthcare provider</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>View practice hours and contact information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Book appointments directly from the map</span>
                  </li>
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Search Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Search by location, ZIP code, or address</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Filter by medical specialty</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Sort by distance or rating</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">View available appointment times</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Map Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Interactive markers with doctor info</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Cluster view for dense areas</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Satellite and street view options</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">Turn-by-turn directions</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-emerald-900 mb-2">In the meantime...</h3>
                <p className="text-emerald-800 mb-4">
                  Browse our doctor listings on the main page to find healthcare providers in your area.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="/#doctors-section"
                    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Browse Doctors
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    Get Notified When Available
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
