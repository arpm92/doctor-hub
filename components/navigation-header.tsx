"use client"
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
import { LogIn, Heart, Stethoscope, ChevronDown, Shield } from "lucide-react"

export function NavigationHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <Heart className="h-6 w-6 text-blue-600" />
            MedConnect
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Find Doctors
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-gray-900 transition-colors">
              Map View
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Doctors
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {/* Doctor Login */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Stethoscope className="h-4 w-4" />
                  <span className="hidden sm:inline">Doctor</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/auth/doctor/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Doctor Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Join Our Network
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Patient Login */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex items-center gap-2 relative">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Patient</span>
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4">
                    Soon
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-3 w-3" />
                    Coming Soon
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild disabled>
                  <Link href="/auth/login" className="flex items-center gap-2 text-gray-400">
                    <LogIn className="h-4 w-4" />
                    Sign In (Coming Soon)
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild disabled>
                  <Link href="/auth/register" className="flex items-center gap-2 text-gray-400">
                    <Heart className="h-4 w-4" />
                    Create Account (Coming Soon)
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
