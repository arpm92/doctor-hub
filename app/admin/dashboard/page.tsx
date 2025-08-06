"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { Users, UserCheck, UserX, Clock, TrendingUp, Stethoscope, BarChart3, Settings, LogOut, Shield, AlertCircle, Loader2 } from 'lucide-react'
import { getCurrentUser, getCurrentAdmin, getAdminStats, signOut, type Admin, type AdminStats } from "@/lib/supabase"

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated
        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/admin/login")
          return
        }

        // Get admin profile
        const { admin: adminData, error: adminError } = await getCurrentAdmin()

        if (adminError) {
          setError("Failed to load admin profile")
          return
        }

        if (!adminData) {
          setError("Access denied. Admin privileges required.")
          return
        }

        setAdmin(adminData)

        // Get admin stats
        const { stats: statsData, error: statsError } = await getAdminStats()

        if (statsError) {
          console.error("Failed to load admin stats:", statsError)
          // Don't fail the whole page for stats error
        } else {
          setStats(statsData)
        }
      } catch (err) {
        console.error("Error loading admin data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading admin dashboard...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
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
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You do not have admin privileges to access this dashboard.</p>
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
              <GoBackButton fallbackUrl="/" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {admin.first_name} {admin.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {admin.role}
              </Badge>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_doctors}</div>
                <p className="text-xs text-muted-foreground">{stats.recent_registrations} new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_doctors}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved_doctors}</div>
                <p className="text-xs text-muted-foreground">Active on platform</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected/Suspended</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected_doctors + stats.suspended_doctors}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.rejected_doctors} rejected, {stats.suspended_doctors} suspended
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Doctor Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/admin/doctors">
                  <Users className="h-4 w-4 mr-2" />
                  Manage All Doctors
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/doctors?status=pending">
                  <Clock className="h-4 w-4 mr-2" />
                  Review Pending ({stats?.pending_doctors || 0})
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Platform Settings
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/admins">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Admins
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Top Specialties */}
        {stats?.specialties && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Top Medical Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.specialties)
                  .slice(0, 6)
                  .map(([specialty, count]) => (
                    <div key={specialty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{specialty}</span>
                      <Badge variant="secondary">{count} doctors</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {stats && stats.pending_doctors > 0 && (
          <Alert className="mt-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have {stats.pending_doctors} doctor{stats.pending_doctors !== 1 ? "s" : ""} pending approval.{" "}
              <Link href="/admin/doctors?status=pending" className="font-medium underline">
                Review now
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
