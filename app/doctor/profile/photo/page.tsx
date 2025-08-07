"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, ArrowLeft } from 'lucide-react'
import { getCurrentDoctor, uploadFile, updateDoctorProfile } from "@/lib/supabase"
import type { Doctor } from "@/lib/supabase"

export default function DoctorPhotoPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctor = async () => {
      setIsLoading(true)
      const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()
      if (doctorError || !doctorData) {
        router.push("/auth/doctor/login")
        return
      }
      setDoctor(doctorData)
      if (doctorData.profile_image) {
        setPreviewUrl(doctorData.profile_image)
      }
      setIsLoading(false)
    }
    fetchDoctor()
  }, [router])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError("Invalid file type. Please select a PNG, JPG, or WEBP image.")
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("File is too large. Maximum size is 5MB.")
        return
      }
      
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
      setSuccess(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !doctor) {
      setError("Please select an image to upload.")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `${doctor.id}/profile.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await uploadFile(selectedFile, "profile-images", filePath)

      if (uploadError || !uploadData) {
        throw uploadError || new Error("File upload failed to return data.")
      }

      // The publicUrl should be part of the returned data from our helper
      const { publicUrl } = uploadData

      if (!publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.")
      }

      // Add a timestamp to the URL to bust browser cache
      const finalUrl = `${publicUrl}?t=${new Date().getTime()}`

      const { error: updateError } = await updateDoctorProfile(doctor.id, { profile_image: finalUrl })

      if (updateError) {
        throw updateError
      }

      setSuccess("Profile picture updated successfully!")
      setDoctor(prev => prev ? { ...prev, profile_image: finalUrl } : null)
      setPreviewUrl(finalUrl) // Update preview with the new URL
      setSelectedFile(null) // Clear selection
      router.refresh() // Refresh server components that might use this image

    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.message || "An unexpected error occurred during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Profile Photo</CardTitle>
          <CardDescription>A professional photo helps build trust with patients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white ring-offset-2 ring-offset-gray-100 relative">
                <Image 
                  src={previewUrl || "/placeholder.svg?width=160&height=160&query=profile+avatar"} 
                  alt="Profile preview" 
                  fill
                  sizes="160px"
                  className="object-cover" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile-picture">Choose a new photo</Label>
              <Input id="profile-picture" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isUploading} />
              <p className="text-xs text-gray-500">PNG, JPG, or WEBP. Max 5MB.</p>
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="border-green-500 text-green-700"><AlertDescription>{success}</AlertDescription></Alert>}
            
            <Button type="submit" className="w-full" disabled={isUploading || !selectedFile}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload and Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
