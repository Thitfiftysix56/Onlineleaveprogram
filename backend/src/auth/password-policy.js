export const passwordPolicyRequirements = [
  'At least 10 characters',
  'At least one uppercase letter',
  'At least one lowercase letter',
  'At least one number',
  'At least one special character',
  'No spaces',
]

export function validateNewPassword(password, identity = {}) {
  const value = String(password || '')

  if (value.length < 10) {
    return 'The new password must contain at least 10 characters.'
  }

  if (!/[a-z]/.test(value)) {
    return 'The new password must contain a lowercase letter.'
  }

  if (!/[A-Z]/.test(value)) {
    return 'The new password must contain an uppercase letter.'
  }

  if (!/[0-9]/.test(value)) {
    return 'The new password must contain a number.'
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'The new password must contain a special character.'
  }

  if (/\s/.test(value)) {
    return 'The new password must not contain spaces.'
  }

  const normalizedValue = value.toLowerCase()
  const username = String(identity.username || '').trim().toLowerCase()
  const email = String(identity.email || '').trim().toLowerCase()

  if (username && normalizedValue === username) {
    return 'The new password must not be the same as the username.'
  }

  if (email && normalizedValue === email) {
    return 'The new password must not be the same as the email address.'
  }

  return null
}
