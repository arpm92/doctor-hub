// lib/validation.ts

export interface ValidationError {
  field: string
  message: string
}

export interface FormValidation {
  isValid: boolean
  errors: ValidationError[]
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address"
  return null
}

// Password validation – at least 8 chars, upper, lower, digit, special
export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters long"
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter"
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter"
  if (!/\d/.test(password)) return "Password must contain a number"
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password))
    return "Password must contain a special character"
  return null
}

// Confirm password
export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!confirm) return "Please confirm your password"
  if (password !== confirm) return "Passwords do not match"
  return null
}

// Name validation
export const validateName = (name: string, fieldName: string): string | null => {
  if (!name.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
  if (!/^[A-Za-z\s'-]+$/.test(name.trim()))
    return `${fieldName} can only contain letters, spaces, hyphens, apostrophes`
  return null
}

// Phone validation – optional, but if present must be 10–15 digits
export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 10 || digits.length > 15)
    return "Phone number must be between 10 and 15 digits"
  return null
}

// Date of Birth – required, not future, age 13–120
export const validateDateOfBirth = (dob: string): string | null => {
  if (!dob) return "Date of birth is required"
  const date = new Date(dob)
  const now = new Date()
  if (isNaN(date.getTime())) return "Invalid date"
  if (date > now) return "Date of birth cannot be in the future"
  const age = now.getFullYear() - date.getFullYear()
  if (age < 13) return "You must be at least 13 years old"
  if (age > 120) return "Please enter a valid date of birth"
  return null
}

// Master form validator
export const validateRegistrationForm = (form: {
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

  const fnErr = validateName(form.firstName, "First name")
  if (fnErr) errors.push({ field: "firstName", message: fnErr })

  const lnErr = validateName(form.lastName, "Last name")
  if (lnErr) errors.push({ field: "lastName", message: lnErr })

  const emErr = validateEmail(form.email)
  if (emErr) errors.push({ field: "email", message: emErr })

  const phErr = validatePhone(form.phone)
  if (phErr) errors.push({ field: "phone", message: phErr })

  const dobErr = validateDateOfBirth(form.dateOfBirth)
  if (dobErr) errors.push({ field: "dateOfBirth", message: dobErr })

  const pwErr = validatePassword(form.password)
  if (pwErr) errors.push({ field: "password", message: pwErr })

  const cpwErr = validateConfirmPassword(form.password, form.confirmPassword)
  if (cpwErr) errors.push({ field: "confirmPassword", message: cpwErr })

  if (!form.agreeToTerms)
    errors.push({ field: "agreeToTerms", message: "You must agree to the terms" })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
