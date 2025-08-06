"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogIn, Heart, Stethoscope, ChevronDown, Shield, User, LogOut } from 'lucide-react'
import { getCurrentUser, getCurrentDoctor, getCurrentAdmin, signOut } from "@/lib/supabase"

export function NavigationHeader() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'doctor' | 'admin' | 'patient' | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { user } = await getCurrentUser()
      setUser(user)
      
      if (user) {
        // Check if user is admin first
        const { admin } = await getCurrentAdmin()
        if (admin) {
          setUserType('admin')
          setUserProfile(admin)
          setLoading(false)
          return
        }

        // Check if user is doctor
        const { doctor } = await getCurrentDoctor()
        if (doctor) {
          setUserType('doctor')
          setUserProfile(doctor)
          setLoading(false)
          return
        }

        // Default to patient if no specific profile found
        setUserType('patient')
        setUserProfile(null)
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error checking user:", error)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      setUserType(null)
      setUserProfile(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getDashboardLink = () => {
    if (userType === 'admin') {
      return '/admin/dashboard'
    } else if (userType === 'doctor') {
      return '/doctor/dashboard'
    }
    return '/profile'
  }

  const getDashboardLabel = () => {
    if (userType === 'admin') {
      return 'Panel de Administrador'
    } else if (userType === 'doctor') {
      return 'Panel de Doctor'
    }
    return 'Mi Perfil'
  }

  const getUserDisplayName = () => {
    if (userType === 'admin' && userProfile) {
      return `${userProfile.first_name} ${userProfile.last_name}`
    } else if (userType === 'doctor' && userProfile) {
      return `Dr. ${userProfile.first_name} ${userProfile.last_name}`
    }
    return user?.email || 'Usuario'
  }

  return (
    <header className="bg-white border-b border-emerald-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-emerald-600 transition-colors">
            <Heart className="h-6 w-6 text-emerald-600" />
            MedConnect
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#doctors-section" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Encontrar Doctores
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Vista de Mapa
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Para Doctores
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {!loading && !user && (
              <>
                {/* Doctor Login */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <Stethoscope className="h-4 w-4" />
                      <span className="hidden sm:inline">Doctor</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/auth/doctor/login" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Iniciar Sesión
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/doctor/register" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Únete a Nuestra Red
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/login" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Acceso de Administrador
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Patient Login */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2 relative bg-emerald-600 hover:bg-emerald-700">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Paciente</span>
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-800">
                        Pronto
                      </Badge>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="h-3 w-3" />
                        Próximamente
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-gray-400">
                      <LogIn className="h-4 w-4 mr-2" />
                      Iniciar Sesión (Próximamente)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-gray-400">
                      <Heart className="h-4 w-4 mr-2" />
                      Crear Cuenta (Próximamente)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    {userType === 'admin' ? <Shield className="h-4 w-4" /> : userType === 'doctor' ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span className="hidden sm:inline">{getUserDisplayName()}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {userType === 'admin' ? <Shield className="h-3 w-3" /> : userType === 'doctor' ? <Stethoscope className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      <span className="capitalize">{userType === 'admin' ? 'Administrador' : userType === 'doctor' ? 'Doctor' : 'Paciente'}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center gap-2">
                      {userType === 'admin' ? <Shield className="h-4 w-4" /> : userType === 'doctor' ? <Stethoscope className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      {getDashboardLabel()}
                    </Link>
                  </DropdownMenuItem>
                  {userType === 'doctor' && (
                    <DropdownMenuItem asChild>
                      <Link href="/doctor/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
