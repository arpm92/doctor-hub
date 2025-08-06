"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { GoBackButton } from "@/components/go-back-button"
import { 
  getCurrentUser, 
  getCurrentDoctor, 
  getDoctorArticle, 
  updateDoctorArticle, 
  signOut, 
  type Doctor, 
  type DoctorArticle 
} from "@/lib/supabase"

const articleSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, { message: "Slug must be lowercase and contain only letters, numbers, and dashes." }),
  content: z.string().min(20, { message: "Content must be at least 20 characters." }),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export default function DoctorArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [article, setArticle] = useState<DoctorArticle | null>(null)
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

        // Get article data
        const { article: articleData, error: articleError } = await getDoctorArticle(articleId)

        if (articleError) {
          setError("Failed to load article: " + articleError.message)
          return
        }

        if (!articleData) {
          setError("Article not found")
          return
        }

        // Verify the article belongs to this doctor
        if (articleData.doctor_id !== doctorData.id) {
          setError("You don't have permission to edit this article")
          return
        }

        setArticle(articleData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (articleId) {
      loadData()
    }
  }, [router, articleId])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/auth/doctor/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: "draft",
    },
  })

  // Update form when article data is loaded
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title || "",
        slug: article.slug || "",
        content: article.content || "",
        excerpt: article.excerpt || "",
        status: article.status || "draft",
      })
    }
  }, [article, form])

  const onSubmit = async (values: z.infer<typeof articleSchema>) => {
    setIsUpdating(true)
    setError(null)

    if (!doctor || !article) {
      setError("Data not loaded")
      return
    }

    try {
      const { data, error } = await updateDoctorArticle(article.id, values)

      if (error) {
        setError("Failed to update article: " + error.message)
        return
      }

      toast({
        title: "Article updated successfully!",
        description: "Your changes have been saved.",
      })
      router.push("/doctor/articles")
    } catch (err) {
      console.error("Error updating article:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading article...</div>
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

  if (!doctor || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Article not found.</p>
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
                <GoBackButton fallbackUrl="/doctor/articles" />
                <CardTitle>Edit Article</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Article Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="article-slug" {...field} />
                      </FormControl>
                      <FormDescription>Lowercase, letters, numbers, and dashes only. Used in the URL.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Write your article here..." className="min-h-[200px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Short summary of the article" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? "Updating..." : "Update Article"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
