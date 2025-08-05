"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import {
  getCurrentUser,
  getCurrentDoctor,
  getDoctorArticles,
  deleteDoctorArticle,
  signOut,
  type Doctor,
  type DoctorArticle,
} from "@/lib/supabase"

export default function DoctorArticlesPage() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [articles, setArticles] = useState<DoctorArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<DoctorArticle | null>(null)

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

        // Load articles
        const { articles: articlesData, error: articlesError } = await getDoctorArticles(doctorData.id)

        if (articlesError) {
          setError("Failed to load articles")
          return
        }

        setArticles(articlesData || [])
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

  const handleDeleteArticle = async (articleId: string) => {
    setIsUpdating(true)
    try {
      const { error } = await deleteDoctorArticle(articleId)
      if (error) {
        alert("Failed to delete article: " + error.message)
        return
      }

      // Update local state
      setArticles((prev) => prev.filter((article) => article.id !== articleId))
      setSelectedArticle(null)
    } catch (err) {
      console.error("Error deleting article:", err)
      alert("An unexpected error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: DoctorArticle["status"]) => {
    switch (status) {
      case "published":
        return <Badge>Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading your articles...</div>
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
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle>Manage Articles</CardTitle>
              <Button asChild>
                <Link href="/doctor/articles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Write Article
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {articles.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>{article.title}</TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/doctor/articles/${article.id}`}>
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Article</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete {article.title}? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteArticle(article.id)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                <p className="text-gray-600 mb-4">
                  Share your expertise by writing articles for patients and colleagues.
                </p>
                <Button asChild>
                  <Link href="/doctor/articles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Article
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
