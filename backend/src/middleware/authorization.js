export function requireAdmin(request, response, next) {
  const roleName = String(
    request.user?.roleName || '',
  )
    .trim()
    .toLowerCase()

  if (roleName !== 'admin') {
    return response.status(403).json({
      status: 'error',
      message: 'Forbidden',
    })
  }

  return next()
}

