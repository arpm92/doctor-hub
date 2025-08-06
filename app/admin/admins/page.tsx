"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoBackButton } from "@/components/go-back-button"
import { Shield, Users, Plus, AlertCircle, LogOut, Loader2 } from 'lucide-react'
import { getCurrentAdmin, signOut } from "@/lib/supabase"

export default function AdminAdminsPage() {
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
          <p className="text-gray-600">Loading admin management...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Admin Management</h2>
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
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
                <p className="text-gray-600">Manage administrator accounts and permissions</p>
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
        {/* Current Admin Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">{admin.first_name} {admin.last_name}</h3>
                <p className="text-gray-600">{admin.email}</p>
                <p className="text-sm text-gray-500">Role: {admin.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Admins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                View and manage all administrator accounts on the platform.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  View All Admins
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Admin
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions & Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure admin roles and permission levels.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Shield className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Permission Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Management Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on building comprehensive admin management features. You'll be able to add new admins, manage roles, and configure permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
