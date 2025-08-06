"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoBackButton } from "@/components/go-back-button"
import { FileText, Download, Calendar, Users, AlertCircle, LogOut, Loader2 } from 'lucide-react'
import { getCurrentAdmin, signOut } from "@/lib/supabase"

export default function AdminReportsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated as admin
        const { admin: adminData, error: adminError } = await getCurrentAdmin()

        if (adminError || !adminData) {
          router.push("/admin/login")
          return
        }

        setAdmin(adminData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/admin/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Reports</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="w-full bg-transparent">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <GoBackButton fallbackUrl="/admin/dashboard" />
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600">Generate and download platform reports</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Doctor Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Doctor Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate comprehensive reports about registered doctors, their specialties, and status.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  All Doctors Report
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Pending Doctors
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Approved Doctors
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Analytics Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Download detailed analytics and performance metrics for the platform.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Monthly Report
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Quarterly Report
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Annual Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create custom reports with specific date ranges and filters.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Custom Report
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on building comprehensive reporting features. You'll be able to generate detailed reports about doctors, analytics, and platform performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
