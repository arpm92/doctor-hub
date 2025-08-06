"use client"

import type React from "react"
import { GoBackButton } from "@/components/go-back-button"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser, getCurrentDoctor, updateDoctorProfile, signOut, type Doctor } from "@/lib/supabase"

export default function DoctorProfilePage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if user is authenticated
        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        // Get doctor profile
        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()

        if (doctorError) {
          setError("Failed to load doctor profile")
          return
        }

        if (!doctorData) {
          setError("Doctor profile not found. Please contact support.")
          return
        }

        setDoctor(doctorData)
      } catch (err) {
        console.error("Error loading doctor data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctorData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsUpdating(true)
    setError(null)

    if (!doctor) {
      setError("Doctor profile not loaded")
      return
    }

    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const updates = {
      bio: formData.get("bio") as string,
      years_experience: Number(formData.get("years_experience")),
      languages: (formData.get("languages") as string).split(",").map((l) => l.trim()),
    }

    try {
      const { data, error } = await updateDoctorProfile(doctor.id, updates)

      if (error) {
        setError("Failed to update profile: " + error.message)
        return
      }

      setDoctor({ ...doctor, ...updates })
      toast({
        title: "Profile updated successfully!",
        description: "Your changes have been saved.",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading your profile...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Error: {error}
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Doctor profile not found.
        <Button onClick={handleSignOut}>Sign Out</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-4">
              <GoBackButton fallbackUrl="/doctor/dashboard" />
              <CardTitle>Edit Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={doctor.bio || ""}
                  className="w-full"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div>
                <Label htmlFor="years_experience">Years of Experience</Label>
                <Input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  defaultValue={doctor.years_experience}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input
                  type="text"
                  id="languages"
                  name="languages"
                  defaultValue={doctor.languages?.join(", ") || ""}
                  className="w-full"
                  placeholder="English, Spanish, French"
                />
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full">
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
