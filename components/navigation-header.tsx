"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, Calendar, MapPin } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function NavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Check if user is a patient
        const { data: patient } = await supabase
          .from("patients")
          .select("*")
          .eq("id", user.id)
          .single()

        if (patient) {
          setUserProfile({ ...patient, type: "patient" })
        } else {
          // Check if user is a doctor
          const { data: doctor } = await supabase
            .from("doctors")
            .select("*")
            .eq("id", user.id)
            .single()

          if (doctor) {
            setUserProfile({ ...doctor, type: "doctor" })
          } else {
            // Check if user is an admin
            const { data: admin } = await supabase
              .from("admins")
              .select("*")
              .eq("id", user.id)
              .single()

            if (admin) {
              setUserProfile({ ...admin, type: "admin" })
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    router.push("/")
  }

  const getDashboardLink = () => {
    if (!userProfile) return "/profile"
    
    switch (userProfile.type) {
      case "admin":
        return "/admin/dashboard"
      case "doctor":
        return "/doctor/dashboard"
      case "patient":
      default:
        return "/profile"
    }
  }

  const getUserDisplayName = () => {
    if (!userProfile) return user?.email || "User"
    
    switch (userProfile.type) {
      case "admin":
        return userProfile.full_name || "Admin"
      case "doctor":
        return `Dr. ${userProfile.first_name} ${userProfile.last_name}`
      case "patient":
      default:
        return userProfile.full_name || user?.email || "User"
    }
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/placeholder-logo.svg"
              alt="MedConnect"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-emerald-600">MedConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#doctors-section" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Doctors
            </Link>
            <Link href="/map" className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Map
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-emerald-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {userProfile?.type === "patient" && (
                    <DropdownMenuItem asChild>
                      <Link href="/appointments" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        My Appointments
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/#doctors-section" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Doctors
              </Link>
              <Link 
                href="/map" 
                className="text-gray-700 hover:text-emerald-600 transition-colors flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="h-4 w-4" />
                Map
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t">
                {loading ? (
                  <div className="w-full h-10 bg-gray-200 rounded animate-pulse" />
                ) : user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Signed in as {getUserDisplayName()}</p>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href={getDashboardLink()} onClick={() => setIsMenuOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    {userProfile?.type === "patient" && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link href="/appointments" onClick={() => setIsMenuOpen(false)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          My Appointments
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="w-full justify-start text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
