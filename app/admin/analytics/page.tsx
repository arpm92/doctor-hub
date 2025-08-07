"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { BarChart3, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { getCurrentAdmin, getAdminStats, type AdminStats } from "@/lib/supabase"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check admin access
        const { admin: adminData, error: adminError } = await getCurrentAdmin()
        if (adminError || !adminData) {
          router.push("/admin/login")
          return
        }
        setAdmin(adminData)

        // Load analytics stats
        const { stats: statsData, error: statsError } = await getAdminStats()
        if (statsError) {
          setError("Error al cargar estadísticas")
          return
        }

        setStats(statsData)
      } catch (err) {
        console.error("Error loading analytics data:", err)
        setError("Ocurrió un error inesperado")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Cargando análisis...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Try Again
            </button>
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
            <button onClick={() => router.push("/admin/login")} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Sign In
            </button>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600">
                  Platform insights and performance metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Registered healthcare professionals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.approved_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recent_registrations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Specialties Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Specialties Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.specialties && Object.keys(stats.specialties).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.specialties).map(([specialty, count]) => (
                  <div key={specialty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{specialty}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600">
                  Specialty data will appear here once doctors register
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Approved</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{stats?.approved_doctors || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Pending</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">{stats?.pending_doctors || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Rejected</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">{stats?.rejected_doctors || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Suspended</span>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">{stats?.suspended_doctors || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Approval Rate</span>
                    <span className="text-sm text-gray-500">
                      {stats?.total_doctors ? Math.round((stats.approved_doctors / stats.total_doctors) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.total_doctors ? (stats.approved_doctors / stats.total_doctors) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Recent Activity</span>
                    <span className="text-sm text-gray-500">
                      {stats?.recent_registrations || 0} new this month
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((stats?.recent_registrations || 0) * 10, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    {stats?.pending_doctors && stats.pending_doctors > 0 
                      ? `You have ${stats.pending_doctors} doctor${stats.pending_doctors > 1 ? 's' : ''} waiting for review.`
                      : "All doctor applications have been reviewed. Great job!"
                    }
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
