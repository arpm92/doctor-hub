"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoBackButton } from "@/components/go-back-button"
import { Upload, Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { getCurrentDoctor, updateDoctorProfile, supabase } from "@/lib/supabase"

export default function DoctorPhotoPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const { doctor: doctorData, error } = await getCurrentDoctor()
        
        if (error || !doctorData) {
          router.push("/auth/doctor/login")
          return
        }

        setDoctor(doctorData)
        if (doctorData.profile_image) {
          setPreviewUrl(doctorData.profile_image)
        }
      } catch (err) {
        console.error("Error loading doctor:", err)
        router.push("/auth/doctor/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadDoctor()
  }, [router])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !doctor) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${doctor.id}/profile.${fileExt}`

      console.log("Uploading file:", fileName)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        setUploadError(`Upload failed: ${uploadError.message}`)
        return
      }

      console.log("Upload successful:", uploadData)

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      console.log("Public URL:", publicUrl)

      // Update doctor profile with new image URL
      const { data: updateData, error: updateError } = await updateDoctorProfile(doctor.id, {
        profile_image: publicUrl
      })

      if (updateError) {
        console.error("Profile update error:", updateError)
        setUploadError(`Failed to update profile: ${updateError.message}`)
        return
      }

      console.log("Profile updated successfully")

      // Update local state
      setDoctor({ ...doctor, profile_image: publicUrl })
      setPreviewUrl(publicUrl)
      setUploadSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch (err) {
      console.error("Unexpected error:", err)
      setUploadError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please sign in to access your profile.</p>
            <Button onClick={() => router.push("/auth/doctor/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <GoBackButton fallbackUrl="/doctor/profile" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Profile Photo</h1>
          <p className="text-gray-600 mt-2">
            Upload a professional photo to help patients recognize you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Photo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Current Photo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
                {previewUrl ? (
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Profile photo"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No photo uploaded</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>Tips for a great profile photo:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use a professional headshot</li>
                  <li>Ensure good lighting and clear image</li>
                  <li>Face should be clearly visible</li>
                  <li>Professional attire recommended</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {uploadError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}

              {uploadSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Profile photo updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {isUploading ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 text-emerald-600 mx-auto animate-spin" />
                      <p className="text-gray-600">Uploading photo...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Click to upload a photo
                        </p>
                        <p className="text-gray-600">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photo
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/doctor/profile")}
                  className="w-full bg-transparent"
                >
                  Back to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
