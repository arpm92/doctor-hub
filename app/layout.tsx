import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { NavigationHeader } from "@/components/navigation-header"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedConnect - Expert Healthcare Professionals",
  description:
    "Connect with experienced doctors and book appointments online. Quality healthcare with compassionate professionals.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationHeader />
        {children}
      </body>
    </html>
  )
}
