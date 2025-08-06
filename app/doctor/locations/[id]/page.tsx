"use client"

import { FormDescription } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { GoBackButton } from "@/components/go-back-button"
import { 
  getCurrentUser, 
  getCurrentDoctor, 
  getDoctorLocation, 
  updateDoctorLocation, 
  signOut, 
  type Doctor, 
  type DoctorLocation 
} from "@/lib/supabase"

const locationSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(3, { message: "City must be at least 3 characters." }),
  state: z.string().min(2, { message: "State must be at least 2 characters." }),
  postal_code: z.string().optional(),
  country: z.string().min(2, { message: "Country must be at least 2 characters." }),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  is_primary: z.boolean().default(false),
})

export default function DoctorLocationEditPage() {
  const router = useRouter()
  const params = useParams()
  const locationId = params.id as string
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [location, setLocation] = useState<DoctorLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
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

        // Get location data
        const { location: locationData, error: locationError } = await getDoctorLocation(locationId)

        if (locationError) {
          setError("Failed to load location: " + locationError.message)
          return
        }

        if (!locationData) {
          setError("Location not found")
          return
        }

        // Verify the location belongs to this doctor
        if (locationData.doctor_id !== doctorData.id) {
          setError("You don't have permission to edit this location")
          return
        }

        setLocation(locationData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (locationId) {
      loadData()
    }
  }, [router, locationId])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Venezuela",
      phone: "",
      email: "",
      website: "",
      is_primary: false,
    },
  })

  // Update form when location data is loaded
  useEffect(() => {
    if (location) {
      form.reset({
        name: location.name || "",
        address: location.address || "",
        city: location.city || "",
        state: location.state || "",
        postal_code: location.postal_code || "",
        country: location.country || "Venezuela",
        phone: location.phone || "",
        email: location.email || "",
        website: location.website || "",
        is_primary: location.is_primary || false,
      })
    }
  }, [location, form])

  const onSubmit = async (values: z.infer<typeof locationSchema>) => {
    setIsUpdating(true)
    setError(null)

    if (!doctor || !location) {
      setError("Data not loaded")
      return
    }

    try {
      // Clean up empty strings for optional fields
      const cleanedValues = {
        ...values,
        email: values.email || null,
        website: values.website || null,
        postal_code: values.postal_code || null,
        phone: values.phone || null,
      }

      const { data, error } = await updateDoctorLocation(location.id, cleanedValues)

      if (error) {
        setError("Failed to update location: " + error.message)
        return
      }

      toast({
        title: "Location updated successfully!",
        description: "Your changes have been saved.",
      })
      router.push("/doctor/locations")
    } catch (err) {
      console.error("Error updating location:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading location...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor || !location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Location not found.</p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GoBackButton fallbackUrl="/doctor/locations" />
                <CardTitle>Edit Location</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Location Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Caracas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Distrito Capital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1010" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Venezuela" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+58 212 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>Optional - Leave blank if you don't have a website</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_primary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Primary Location</FormLabel>
                        <FormDescription>Set this location as your primary location.</FormDescription>
                      </div>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? "Updating..." : "Update Location"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
