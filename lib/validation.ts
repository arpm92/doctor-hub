export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required"
  if (!email.includes("@")) return "Please enter a valid email address"

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email address"

  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters long"
  if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"

  return null
}

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return "Please confirm your password"
  if (password !== confirmPassword) return "Passwords do not match"

  return null
}

export const validateName = (name: string, fieldName: string): string | null => {
  if (!name) return `${fieldName} is required`
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`

  return null
}

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null // Phone is optional

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, "")

  // Check if it's a valid US phone number (10 digits)
  if (digitsOnly.length !== 10) {
    return "Please enter a valid 10-digit phone number"
  }

  // Optional: Check for valid US phone number format
  const phoneRegex = /^$$?([0-9]{3})$$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  if (!phoneRegex.test(phone)) {
    return "Please enter a valid phone number (e.g., (555) 123-4567)"
  }

  return null
}

export const validateDateOfBirth = (dateOfBirth: string): string | null => {
  if (!dateOfBirth) return "Date of birth is required"

  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()

  if (birthDate > today) return "Date of birth cannot be in the future"
  if (age > 120) return "Please enter a valid date of birth"
  if (age < 13) return "You must be at least 13 years old to register"

  return null
}

export const validateRegistrationForm = (formData: {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}): FormValidation => {
  const errors: ValidationError[] = []

  // Validate first name
  const firstNameError = validateName(formData.firstName, "First name")
  if (firstNameError) errors.push({ field: "firstName", message: firstNameError })

  // Validate last name
  const lastNameError = validateName(formData.lastName, "Last name")
  if (lastNameError) errors.push({ field: "lastName", message: lastNameError })

  // Validate email
  const emailError = validateEmail(formData.email)
  if (emailError) errors.push({ field: "email", message: emailError })

  // Validate phone (optional)
  const phoneError = validatePhone(formData.phone)
  if (phoneError) errors.push({ field: "phone", message: phoneError })

  // Validate date of birth
  const dobError = validateDateOfBirth(formData.dateOfBirth)
  if (dobError) errors.push({ field: "dateOfBirth", message: dobError })

  // Validate password
  const passwordError = validatePassword(formData.password)
  if (passwordError) errors.push({ field: "password", message: passwordError })

  // Validate confirm password
  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword)
  if (confirmPasswordError) errors.push({ field: "confirmPassword", message: confirmPasswordError })

  // Validate terms agreement
  if (!formData.agreeToTerms) {
    errors.push({ field: "agreeToTerms", message: "You must agree to the terms and conditions" })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
