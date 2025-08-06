export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required"
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address"
  }
  
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required"
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long"
  }
  
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter"
  }
  
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter"
  }
  
  if (!/\d/.test(password)) {
    return "Password must contain at least one number"
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Password must contain at least one special character"
  }
  
  return null
}

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
  }
  
  return null
}

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return null // Phone is optional
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length < 10) {
    return "Phone number must be at least 10 digits"
  }
  
  if (digitsOnly.length > 15) {
    return "Phone number cannot exceed 15 digits"
  }
  
  return null
}

export const validateDateOfBirth = (dateOfBirth: string): string | null => {
  if (!dateOfBirth) {
    return "Date of birth is required"
  }
  
  const date = new Date(dateOfBirth)
  const today = new Date()
  
  if (isNaN(date.getTime())) {
    return "Please enter a valid date"
  }
  
  if (date >= today) {
    return "Date of birth must be in the past"
  }
  
  // Check if person is at least 13 years old
  const minAge = new Date()
  minAge.setFullYear(today.getFullYear() - 13)
  
  if (date > minAge) {
    return "You must be at least 13 years old"
  }
  
  // Check if person is not older than 120 years
  const maxAge = new Date()
  maxAge.setFullYear(today.getFullYear() - 120)
  
  if (date < maxAge) {
    return "Please enter a valid date of birth"
  }
  
  return null
}

export const validateYearsExperience = (years: string | number): string | null => {
  const yearsNum = typeof years === 'string' ? parseInt(years, 10) : years
  
  if (isNaN(yearsNum)) {
    return "Years of experience must be a valid number"
  }
  
  if (yearsNum < 0) {
    return "Years of experience cannot be negative"
  }
  
  if (yearsNum > 60) {
    return "Years of experience cannot exceed 60 years"
  }
  
  return null
}

export const validateSpecialty = (specialty: string): string | null => {
  if (!specialty || !specialty.trim()) {
    return "Medical specialty is required"
  }
  
  return null
}

export const validateBio = (bio: string): string | null => {
  if (bio && bio.length > 1000) {
    return "Bio cannot exceed 1000 characters"
  }
  
  return null
}
