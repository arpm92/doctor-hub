"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

interface GoBackButtonProps {
  fallbackUrl?: string
  className?: string
  children?: React.ReactNode
}

export function GoBackButton({ fallbackUrl = "/", className, children }: GoBackButtonProps) {
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
      variant="ghost"
      onClick={handleGoBack}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0 h-auto font-normal ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || "Go Back"}
    </Button>
  )
}
