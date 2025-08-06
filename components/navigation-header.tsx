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
import { getCurrentUser, signOut } from "@/lib/supabase"

export function NavigationHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
    }
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
              Find Doctors
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Map View
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-emerald-600 transition-colors">
              For Doctors
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Contact
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
                        Doctor Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/doctor/register" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Join Our Network
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/login" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin Access
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Patient Login */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2 relative bg-emerald-600 hover:bg-emerald-700">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Patient</span>
                      <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-800">
                        Soon
                      </Badge>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="h-3 w-3" />
                        Coming Soon
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="text-gray-400">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In (Coming Soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-gray-400">
                      <Heart className="h-4 w-4 mr-2" />
                      Create Account (Coming Soon)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/doctor/dashboard" className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/doctor/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
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
