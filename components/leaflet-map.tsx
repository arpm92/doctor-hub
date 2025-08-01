"use client"

import { useEffect, useRef } from "react"
import type { Doctor } from "@/lib/types"

// We'll load Leaflet dynamically to avoid SSR issues
declare global {
  interface Window {
    L: any
  }
}

interface LeafletMapProps {
  doctors: Doctor[]
  selectedDoctor?: Doctor | null
  onDoctorSelect?: (doctor: Doctor | null) => void
  height?: string
  zoom?: number
  center?: [number, number]
}

export function LeafletMap({
  doctors,
  selectedDoctor,
  onDoctorSelect,
  height = "400px",
  zoom = 4,
  center,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load CSS
        const cssLink = document.createElement("link")
        cssLink.rel = "stylesheet"
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        cssLink.crossOrigin = ""
        document.head.appendChild(cssLink)

        // Load JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        script.crossOrigin = ""

        await new Promise((resolve) => {
          script.onload = resolve
          document.head.appendChild(script)
        })
      }

      initializeMap()
    }

    const initializeMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Calculate center if not provided
      let mapCenter: [number, number] = center || [39.8283, -98.5795] // Center of US

      if (!center && doctors.length > 0) {
        const avgLat = doctors.reduce((sum, doctor) => sum + doctor.location.coordinates.lat, 0) / doctors.length
        const avgLng = doctors.reduce((sum, doctor) => sum + doctor.location.coordinates.lng, 0) / doctors.length
        mapCenter = [avgLat, avgLng]
      }

      // Initialize map
      const map = window.L.map(mapRef.current).setView(mapCenter, zoom)

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      // Add markers for doctors
      addDoctorMarkers(map)
    }

    const addDoctorMarkers = (map: any) => {
      // Clear existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker))
      markersRef.current = []

      doctors.forEach((doctor) => {
        const { lat, lng } = doctor.location.coordinates

        // Create custom icon based on specialty
        const iconColor = getSpecialtyColor(doctor.specialty)
        const customIcon = window.L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              background-color: ${iconColor};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
              font-weight: bold;
              cursor: pointer;
              ${selectedDoctor?.id === doctor.id ? "transform: scale(1.3); z-index: 1000;" : ""}
            ">
              ${doctor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map)

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${iconColor}, ${adjustColor(iconColor, -20)});
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
              ">
                ${doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </div>
              <div>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${doctor.name}</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">${doctor.specialty}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span style="font-size: 14px;">⭐</span>
                <span style="font-size: 14px; font-weight: 500;">${doctor.averageRating.toFixed(1)}</span>
                <span style="font-size: 12px; color: #6b7280;">(${doctor.totalReviews} reviews)</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px;">
                📍 ${doctor.location.address}
              </p>
            </div>
            
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <a href="/doctors/${doctor.slug}" 
                 style="
                   background: #f3f4f6;
                   color: #374151;
                   padding: 6px 12px;
                   border-radius: 6px;
                   text-decoration: none;
                   font-size: 12px;
                   font-weight: 500;
                   border: 1px solid #d1d5db;
                 ">
                View Profile
              </a>
              ${
                doctor.tier === "medium" || doctor.tier === "premium"
                  ? `
                <a href="/booking?doctor=${doctor.slug}"
                   style="
                     background: #3b82f6;
                     color: white;
                     padding: 6px 12px;
                     border-radius: 6px;
                     text-decoration: none;
                     font-size: 12px;
                     font-weight: 500;
                   ">
                  📅 Book
                </a>
              `
                  : ""
              }
            </div>
          </div>
        `

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "custom-popup",
        })

        // Handle marker click
        marker.on("click", () => {
          if (onDoctorSelect) {
            onDoctorSelect(selectedDoctor?.id === doctor.id ? null : doctor)
          }
        })

        markersRef.current.push(marker)
      })

      // Auto-fit bounds if multiple doctors
      if (doctors.length > 1) {
        const group = new window.L.featureGroup(markersRef.current)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [doctors, selectedDoctor, onDoctorSelect, height, zoom, center])

  // Update selected marker when selectedDoctor changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedDoctor) {
      const { lat, lng } = selectedDoctor.location.coordinates
      mapInstanceRef.current.setView([lat, lng], Math.max(mapInstanceRef.current.getZoom(), 12))

      // Find and open popup for selected doctor
      const selectedMarker = markersRef.current.find((marker, index) => doctors[index]?.id === selectedDoctor.id)
      if (selectedMarker) {
        selectedMarker.openPopup()
      }
    }
  }, [selectedDoctor, doctors])

  const getSpecialtyColor = (specialty: string): string => {
    const colors: Record<string, string> = {
      Cardiologist: "#ef4444",
      Neurologist: "#8b5cf6",
      Pediatrician: "#06b6d4",
      "Orthopedic Surgeon": "#f59e0b",
      Dermatologist: "#ec4899",
      Psychiatrist: "#10b981",
    }
    return colors[specialty] || "#6b7280"
  }

  const adjustColor = (color: string, amount: number): string => {
    const usePound = color[0] === "#"
    const col = usePound ? color.slice(1) : color
    const num = Number.parseInt(col, 16)
    let r = (num >> 16) + amount
    let g = ((num >> 8) & 0x00ff) + amount
    let b = (num & 0x0000ff) + amount
    r = r > 255 ? 255 : r < 0 ? 0 : r
    g = g > 255 ? 255 : g < 0 ? 0 : g
    b = b > 255 ? 255 : b < 0 ? 0 : b
    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
  }

  return (
    <>
      <div ref={mapRef} style={{ height, width: "100%", borderRadius: "8px" }} />
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  )
}
