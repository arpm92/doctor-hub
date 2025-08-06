"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

interface GoBackButtonProps {
  fallbackUrl?: string
  className?: string
  children?: React.ReactNode
}

export function GoBackButton({ fallbackUrl = "/", className = "", children }: GoBackButtonProps) {
  const router = useRouter()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackUrl)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleGoBack}
      className={`flex items-center gap-2 bg-transparent border-emerald-200 text-emerald-700 hover:bg-emerald-50 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || "Go Back"}
    </Button>
  )
}
