"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { Settings, Save, Shield, Bell, Globe, Users, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  // General Settings
  const [siteName, setSiteName] = useState("Doctor Hub")
  const [siteDescription, setSiteDescription] = useState("Find and connect with medical professionals")
  const [contactEmail, setContactEmail] = useState("admin@doctorhub.com")
  const [supportEmail, setSupportEmail] = useState("support@doctorhub.com")

  // Doctor Settings
  const [autoApproval, setAutoApproval] = useState(false)
  const [requireVerification, setRequireVerification] = useState(true)
  const [maxLocationsPerDoctor, setMaxLocationsPerDoctor] = useState("5")
  const [maxArticlesPerDoctor, setMaxArticlesPerDoctor] = useState("10")

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newDoctorNotifications, setNewDoctorNotifications] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(true)

  // Subscription Settings
  const [basicTierPrice, setBasicTierPrice] = useState("0")
  const [mediumTierPrice, setMediumTierPrice] = useState("29")
  const [premiumTierPrice, setPremiumTierPrice] = useState("99")

  const handleSave = async () => {
    setLoading(true)
    setSaveStatus("saving")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Here you would typically save to your backend/database
      console.log("Saving settings:", {
        general: { siteName, siteDescription, contactEmail, supportEmail },
        doctors: { autoApproval, requireVerification, maxLocationsPerDoctor, maxArticlesPerDoctor },
        notifications: { emailNotifications, newDoctorNotifications, weeklyReports },
        subscriptions: { basicTierPrice, mediumTierPrice, premiumTierPrice },
      })

      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <GoBackButton fallbackUrl="/admin/dashboard" />
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Settings
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {saveStatus === "saved" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">Failed to save settings. Please try again.</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Site Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Doctor Hub"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="admin@doctorhub.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Find and connect with medical professionals"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@doctorhub.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Doctor Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-approve new doctors</Label>
                    <p className="text-sm text-gray-600">
                      Automatically approve doctor registrations without manual review
                    </p>
                  </div>
                  <Switch checked={autoApproval} onCheckedChange={setAutoApproval} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Require email verification</Label>
                    <p className="text-sm text-gray-600">
                      Doctors must verify their email before accessing their account
                    </p>
                  </div>
                  <Switch checked={requireVerification} onCheckedChange={setRequireVerification} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxLocations">Max locations per doctor</Label>
                    <Select value={maxLocationsPerDoctor} onValueChange={setMaxLocationsPerDoctor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 location</SelectItem>
                        <SelectItem value="3">3 locations</SelectItem>
                        <SelectItem value="5">5 locations</SelectItem>
                        <SelectItem value="10">10 locations</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxArticles">Max articles per doctor</Label>
                    <Select value={maxArticlesPerDoctor} onValueChange={setMaxArticlesPerDoctor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 articles</SelectItem>
                        <SelectItem value="10">10 articles</SelectItem>
                        <SelectItem value="25">25 articles</SelectItem>
                        <SelectItem value="50">50 articles</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Email notifications</Label>
                    <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>New doctor registrations</Label>
                    <p className="text-sm text-gray-600">Get notified when new doctors register</p>
                  </div>
                  <Switch checked={newDoctorNotifications} onCheckedChange={setNewDoctorNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Weekly reports</Label>
                    <p className="text-sm text-gray-600">Receive weekly summary reports via email</p>
                  </div>
                  <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basicPrice">Basic Tier Price ($)</Label>
                    <Input
                      id="basicPrice"
                      type="number"
                      value={basicTierPrice}
                      onChange={(e) => setBasicTierPrice(e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-600">Free tier with basic features</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mediumPrice">Medium Tier Price ($)</Label>
                    <Input
                      id="mediumPrice"
                      type="number"
                      value={mediumTierPrice}
                      onChange={(e) => setMediumTierPrice(e.target.value)}
                      placeholder="29"
                    />
                    <p className="text-xs text-gray-600">Enhanced visibility and features</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premiumPrice">Premium Tier Price ($)</Label>
                    <Input
                      id="premiumPrice"
                      type="number"
                      value={premiumTierPrice}
                      onChange={(e) => setPremiumTierPrice(e.target.value)}
                      placeholder="99"
                    />
                    <p className="text-xs text-gray-600">Priority placement and all features</p>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Changing subscription prices will affect new subscriptions only. Existing subscriptions will
                    maintain their current pricing.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Security settings are managed through your authentication provider. Contact your system
                    administrator for advanced security configurations.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600">Add an extra layer of security</div>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Session Management</div>
                      <div className="text-sm text-gray-600">Manage active admin sessions</div>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Audit Logs</div>
                      <div className="text-sm text-gray-600">View system activity logs</div>
                    </div>
                    <Button variant="outline">View Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
