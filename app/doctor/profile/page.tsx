"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Camera, Share2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-start md:items-center justify-center py-8 md:py-12">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>
            Administra tu información pública y cómo te ven los pacientes.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/doctor/profile/edit")}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button variant="outline" onClick={() => router.push("/doctor/profile/photo")}>
              <Camera className="h-4 w-4 mr-2" />
              Cambiar Foto
            </Button>
            <Button variant="outline" onClick={() => router.push("/doctor/profile/social")}>
              <Share2 className="h-4 w-4 mr-2" />
              Redes Sociales
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
