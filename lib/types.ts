export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  readTime: string
  image: string
}

export interface Location {
  address: string
  city: string
  state: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Review {
  id: string
  patientId: string
  patientName: string
  patientAvatar?: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
}

export interface Patient {
  id: string
  name: string
  email: string
  avatar?: string
  provider: "google" | "email"
  createdAt: string
}

export interface Doctor {
  id: string
  slug: string
  name: string
  specialty: string
  tier: "basic" | "medium" | "premium"
  bio: string
  image: string
  location: Location
  education: string[]
  experience: string
  languages: string[]
  certifications: string[]
  socialMedia: {
    linkedin?: string
    instagram?: string
    twitter?: string
    facebook?: string
  }
  blogPosts: BlogPost[]
  reviews: Review[]
  averageRating: number
  totalReviews: number
}
