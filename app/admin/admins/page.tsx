"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { UserPlus, Shield, Search, MoreHorizontal, Crown, User, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase, adminSignUp } from "@/lib/supabase"
import type { Admin } from "@/lib/supabase"

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // New admin form data
  const [newAdmin, setNewAdmin] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "super_admin",
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const { data: admins, error } = await supabase
        .from("admins")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setAdmins(admins || [])
    } catch (err) {
      console.error("Error fetching admins:", err)
      setError(err instanceof Error ? err.message : "Failed to load admins")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const { data, error } = await adminSignUp(newAdmin.email, newAdmin.password, {
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        role: newAdmin.role,
      })

      if (error) {
        throw new Error(error.message)
      }

      setSubmitSuccess(true)
      setNewAdmin({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "admin",
      })

      // Refresh the admin list
      await fetchAdmins()

      setTimeout(() => {
        setIsAddDialogOpen(false)
        setSubmitSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Error adding admin:", err)
      setSubmitError(err instanceof Error ? err.message : "Failed to add admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-red-600 mb-2">Error loading admins</div>
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GoBackButton fallbackUrl="/admin/dashboard" />
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Admin Management
            </h1>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>

              {submitSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">Admin added successfully!</AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{submitError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAddAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newAdmin.role}
                    onValueChange={(value: "admin" | "super_admin") =>
                      setNewAdmin((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredAdmins.length} of {admins.length} admins
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card>
          <CardHeader>
            <CardTitle>System Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {admin.role === "super_admin" ? (
                        <Crown className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {admin.first_name} {admin.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{admin.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={admin.role === "super_admin" ? "default" : "secondary"}
                      className={admin.role === "super_admin" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </Badge>

                    <div className="text-xs text-gray-500">
                      Joined {new Date(admin.created_at).toLocaleDateString()}
                    </div>

                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredAdmins.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No admins found matching your search." : "No admins found."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{admins.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Super Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {admins.filter((a) => a.role === "super_admin").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regular Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{admins.filter((a) => a.role === "admin").length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
