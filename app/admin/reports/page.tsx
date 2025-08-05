"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Filter, Search, Users, TrendingUp, MapPin } from "lucide-react"
import { getAllDoctors, getAdminStats } from "@/lib/supabase"
import type { Doctor, AdminStats } from "@/lib/supabase"

export default function AdminReportsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [doctorsResult, statsResult] = await Promise.all([getAllDoctors(), getAdminStats()])

        if (doctorsResult.error) {
          throw new Error(doctorsResult.error.message)
        }
        if (statsResult.error) {
          throw new Error(statsResult.error.message)
        }

        setDoctors(doctorsResult.doctors || [])
        setStats(statsResult.stats)
      } catch (err) {
        console.error("Error fetching reports data:", err)
        setError(err instanceof Error ? err.message : "Failed to load reports")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || doctor.status === statusFilter
    const matchesTier = tierFilter === "all" || (doctor.tier || "basic") === tierFilter
    const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter

    return matchesSearch && matchesStatus && matchesTier && matchesSpecialty
  })

  const uniqueSpecialties = Array.from(new Set(doctors.map((d) => d.specialty))).sort()

  const exportToCSV = (data: Doctor[], filename: string) => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Specialty",
      "Years Experience",
      "Status",
      "Tier",
      "Created At",
    ]

    const csvContent = [
      headers.join(","),
      ...data.map((doctor) =>
        [
          doctor.id,
          doctor.first_name,
          doctor.last_name,
          doctor.email,
          doctor.phone || "",
          doctor.specialty,
          doctor.years_experience,
          doctor.status,
          doctor.tier || "basic",
          new Date(doctor.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
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
                <div className="text-red-600 mb-2">Error loading reports</div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToCSV(filteredDoctors, "doctors-report.csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="doctors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="doctors">Doctor Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Report</TabsTrigger>
            <TabsTrigger value="activity">Activity Report</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        {uniqueSpecialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setTierFilter("all")
                        setSpecialtyFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredDoctors.length} of {doctors.length} doctors
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Approved: {filteredDoctors.filter((d) => d.status === "approved").length}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Pending: {filteredDoctors.filter((d) => d.status === "pending").length}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      Premium: {filteredDoctors.filter((d) => d.tier === "premium").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor List */}
            <Card>
              <CardHeader>
                <CardTitle>Doctor Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </div>
                            <div className="text-sm text-gray-600">{doctor.email}</div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                          <span>{doctor.specialty}</span>
                          <span>{doctor.years_experience} years experience</span>
                          {doctor.phone && <span>{doctor.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            doctor.status === "approved"
                              ? "default"
                              : doctor.status === "pending"
                                ? "secondary"
                                : doctor.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {doctor.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            doctor.tier === "premium"
                              ? "border-purple-200 text-purple-700"
                              : doctor.tier === "medium"
                                ? "border-blue-200 text-blue-700"
                                : "border-gray-200 text-gray-700"
                          }
                        >
                          {doctor.tier || "basic"}
                        </Badge>
                        <div className="text-xs text-gray-500">{new Date(doctor.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Total Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.total_doctors || 0}</div>
                  <p className="text-sm text-gray-600 mt-2">{stats?.recent_registrations || 0} new this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Approval Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats?.total_doctors ? Math.round((stats.approved_doctors / stats.total_doctors) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats?.approved_doctors || 0} of {stats?.total_doctors || 0} approved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Premium Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {doctors.filter((d) => d.tier === "premium").length}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Premium tier doctors</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.specialties &&
                    Object.entries(stats.specialties)
                      .sort(([, a], [, b]) => b - a)
                      .map(([specialty, count]) => (
                        <div key={specialty} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{specialty}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${stats.total_doctors ? (count / stats.total_doctors) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctors
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            Dr. {doctor.first_name} {doctor.last_name} registered
                          </div>
                          <div className="text-sm text-gray-600">
                            {doctor.specialty} • {doctor.tier || "basic"} tier
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              doctor.status === "approved"
                                ? "default"
                                : doctor.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {doctor.status}
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
