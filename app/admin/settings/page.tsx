"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoBackButton } from "@/components/go-back-button"
import { Settings, Shield, Bell, Database, AlertCircle, LogOut, Loader2 } from 'lucide-react'
import { getCurrentAdmin, signOut } from "@/lib/supabase"

export default function AdminSettingsPage() {
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
          <p className="text-gray-600">Loading settings...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h2>
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
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage platform configuration and preferences</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure general platform settings and preferences.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  General Configuration
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Email Templates
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Approval Workflow
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage security policies and access controls.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  Access Policies
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Password Requirements
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Two-Factor Auth
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure notification preferences and alerts.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  Email Notifications
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Alert Preferences
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Notification Templates
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Database maintenance and backup settings.
              </p>
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  Backup Settings
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Data Retention
                </Button>
                <Button variant="outline" className="w-full" disabled>
                  Migration Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Settings Coming Soon</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on building comprehensive admin settings. You'll be able to configure platform behavior, security policies, and notification preferences.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
