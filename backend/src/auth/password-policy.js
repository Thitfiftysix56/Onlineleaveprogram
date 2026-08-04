export function validateNewPassword(password) {
  const value = String(password || '')

  if (value.length < 8) {
    return 'The new password must contain at least 8 characters.'
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

  return null
}

