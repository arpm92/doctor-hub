"use client"

import { Badge } from "@/components/ui/badge"
import { GoBackButton } from "@/components/go-back-button"

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
import { FileText, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
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

        const { user, error: userError } = await getCurrentUser()

        if (userError || !user) {
          router.push("/auth/doctor/login")
          return
        }

        const { doctor: doctorData, error: doctorError } = await getCurrentDoctor()

        if (doctorError) {
          setError("Error al cargar el perfil del doctor")
          return
        }

        if (!doctorData) {
          setError("Perfil de doctor no encontrado. Por favor contacta soporte.")
          return
        }

        setDoctor(doctorData)

        const { articles: articlesData, error: articlesError } = await getDoctorArticles(doctorData.id)

        if (articlesError) {
          setError("Error al cargar los artículos")
          return
        }

        setArticles(articlesData || [])
      } catch (err) {
        console.error("Error loading doctor data:", err)
        setError("Ocurrió un error inesperado")
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
        alert("Error al eliminar el artículo: " + error.message)
        return
      }

      setArticles((prev) => prev.filter((article) => article.id !== articleId))
      setSelectedArticle(null)
    } catch (err) {
      console.error("Error deleting article:", err)
      alert("Ocurrió un error inesperado")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: DoctorArticle["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>
      case "draft":
        return <Badge variant="secondary">Borrador</Badge>
      case "archived":
        return <Badge variant="outline">Archivado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus artículos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Intentar de Nuevo</Button>
            <Button onClick={handleSignOut}>Cerrar Sesión</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Perfil de doctor no encontrado.</p>
          <Button onClick={handleSignOut}>Cerrar Sesión</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <GoBackButton fallbackUrl="/doctor/dashboard" />
                <CardTitle>Gestionar Artículos</CardTitle>
              </div>
              <Button asChild>
                <Link href="/doctor/articles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Escribir Artículo
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
                      <TableHead>Título</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{getStatusBadge(article.status)}</TableCell>
                        <TableCell>{new Date(article.created_at).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/doctor/articles/${article.id}`}>
                                <Edit className="h-3 w-3 mr-1" />
                                Editar
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Eliminar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Eliminar Artículo</DialogTitle>
                                  <DialogDescription>
                                    ¿Estás seguro de que quieres eliminar "{article.title}"? Esta acción no se puede deshacer.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedArticle(null)}>
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteArticle(article.id)}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Eliminar"}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aún no tienes artículos</h3>
                <p className="text-gray-600 mb-4">
                  Comparte tu experiencia escribiendo artículos para pacientes y colegas.
                </p>
                <Button asChild>
                  <Link href="/doctor/articles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Escribir Tu Primer Artículo
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
