"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getCurrentUser, getCurrentDoctor, updateDoctorProfile, uploadFile, signOut, type Doctor } from "@/lib/supabase"

export default function DoctorProfilePhotoPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
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

    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    try {
      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await uploadFile(
        selectedFile,
        "doctor-profile-images",
        `${doctor.id}/${selectedFile.name}`,
      )

      if (uploadError) {
        setError("Failed to upload file: " + uploadError.message)
        return
      }

      // Update doctor profile with the new image URL
      const updates = {
        profile_image: uploadData?.publicUrl,
      }

      const { data, error } = await updateDoctorProfile(doctor.id, updates)

      if (error) {
        setError("Failed to update profile: " + error.message)
        return
      }

      setDoctor({ ...doctor, ...updates })
      toast({
        title: "Profile photo updated successfully!",
        description: "Your new photo has been saved.",
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
            <CardTitle>Update Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center mb-6">
              <Avatar className="w-32 h-32">
                {previewUrl ? (
                  <AvatarImage src={previewUrl || "/placeholder.svg"} alt="Preview" />
                ) : doctor.profile_image ? (
                  <AvatarImage src={doctor.profile_image || "/placeholder.svg"} alt={doctor.name} />
                ) : (
                  <AvatarFallback>
                    {doctor.first_name[0]}
                    {doctor.last_name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-sm text-gray-500 mt-2">Current Profile Photo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="profile_image">New Photo</Label>
                <Input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={isUpdating || !selectedFile} className="w-full">
                {isUpdating ? "Updating..." : "Upload New Photo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
