"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoBackButton } from "@/components/go-back-button"
import { BarChart3, Users, TrendingUp, Clock, Star } from 'lucide-react'
import { getAdminStats, getAllDoctors } from "@/lib/supabase"
import type { AdminStats, Doctor } from "@/lib/supabase"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [statsResult, doctorsResult] = await Promise.all([getAdminStats(), getAllDoctors()])

        if (statsResult.error) {
          throw new Error(statsResult.error.message)
        }
        if (doctorsResult.error) {
          throw new Error(doctorsResult.error.message)
        }

        setStats(statsResult.stats)
        setDoctors(doctorsResult.doctors || [])
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 mb-2">Error loading analytics</div>
                <p className="text-gray-600">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const tierCounts = doctors.reduce(
    (acc, doctor) => {
      const tier = doctor.tier || "basic"
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recentDoctors = doctors
    .filter((d) => d.status === "approved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GoBackButton fallbackUrl="/admin/dashboard" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">+{stats?.recent_registrations || 0} this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.approved_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_doctors ? Math.round((stats.approved_doctors / stats.total_doctors) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending_doctors || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Premium Tier</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{tierCounts.premium || 0}</div>
              <p className="text-xs text-muted-foreground">Premium subscriptions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specialties">Specialties</TabsTrigger>
            <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approved</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats?.approved_doctors || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stats?.pending_doctors || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rejected</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {stats?.rejected_doctors || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Suspended</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      {stats?.suspended_doctors || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Tiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic</span>
                    <Badge variant="outline">{tierCounts.basic || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {tierCounts.medium || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Premium</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {tierCounts.premium || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="specialties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats?.specialties &&
                    Object.entries(stats.specialties).map(([specialty, count]) => (
                      <div key={specialty} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium capitalize">{specialty}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{tierCounts.basic || 0}</div>
                  <p className="text-sm text-gray-600">Standard listing features</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600">Medium Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-blue-600">{tierCounts.medium || 0}</div>
                  <p className="text-sm text-gray-600">Enhanced visibility</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-600">Premium Tier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2 text-purple-600">{tierCounts.premium || 0}</div>
                  <p className="text-sm text-gray-600">Priority placement</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recently Approved Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">
                          Dr. {doctor.first_name} {doctor.last_name}
                        </div>
                        <div className="text-sm text-gray-600">{doctor.specialty}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className={
                            doctor.tier === "premium"
                              ? "bg-purple-100 text-purple-800"
                              : doctor.tier === "medium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {doctor.tier || "basic"}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(doctor.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
