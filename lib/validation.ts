// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Password validation - must contain at least 8 characters, uppercase, lowercase, number, and special character
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false
  
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)
  
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar
}

// Name validation - 2-50 characters, letters, spaces, hyphens, apostrophes
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/
  return nameRegex.test(name.trim())
}

// Phone validation - accepts various formats, strips non-digits for validation
export const validatePhone = (phone: string, required: boolean = false): boolean => {
  if (!phone || phone.trim() === '') {
    return !required // If not required, empty is valid
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Must have 10-15 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

// Date validation
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime()) && dateObj <= new Date()
}

// Specialty validation
export function validateSpecialty(specialty: string): boolean {
  const validSpecialties = [
    "Cardiologist",
    "Neurologist", 
    "Pediatrician",
    "Orthopedic Surgeon",
    "Dermatologist",
    "Psychiatrist",
    "General Practice",
    "Internal Medicine",
    "Emergency Medicine",
    "Radiology",
    "Anesthesiology",
    "Pathology",
    "Surgery",
    "Obstetrics and Gynecology",
    "Ophthalmology",
    "Otolaryngology",
    "Urology",
    "Oncology",
    "Endocrinology",
    "Gastroenterology"
  ]
  
  return validSpecialties.includes(specialty)
}

// Bio validation
export function validateBio(bio: string): boolean {
  return bio.trim().length <= 1000
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Postal code validation (US format)
export function validatePostalCode(postalCode: string): boolean {
  const usZipRegex = /^\d{5}(-\d{4})?$/
  return usZipRegex.test(postalCode.trim())
}

// Address validation
export function validateAddress(address: string): boolean {
  return address.trim().length >= 5 && address.trim().length <= 200
}

// City validation
export function validateCity(city: string): boolean {
  const cityRegex = /^[a-zA-Z\s\-']{2,50}$/
  return cityRegex.test(city.trim())
}

// State validation (US states)
export function validateState(state: string): boolean {
  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]
  
  return usStates.includes(state.toUpperCase())
}

// Article title validation
export function validateArticleTitle(title: string): boolean {
  return title.trim().length >= 5 && title.trim().length <= 200
}

// Article content validation
export function validateArticleContent(content: string): boolean {
  return content.trim().length >= 100 && content.trim().length <= 10000
}

// Slug validation
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100
}

// Helper function to generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Validation error messages
export const ValidationMessages = {
  email: "Please enter a valid email address",
  password: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
  name: "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes",
  phone: "Phone number is required and must contain 10-15 digits",
  phoneOptional: "Phone number must contain 10-15 digits",
  dateOfBirth: "Please enter a valid date of birth",
  required: "This field is required",
  specialty: "Please select a valid medical specialty",
  yearsExperience: "Years of experience must be between 0 and 60",
  bio: "Bio must be less than 1000 characters",
  url: "Please enter a valid URL",
  postalCode: "Please enter a valid postal code (e.g., 12345 or 12345-6789)",
  address: "Address must be 5-200 characters",
  city: "City must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes",
  state: "Please enter a valid US state abbreviation",
  articleTitle: "Title must be 5-200 characters",
  articleContent: "Content must be 100-10000 characters",
  slug: "Slug must be 3-100 characters and contain only lowercase letters, numbers, and hyphens"
}
