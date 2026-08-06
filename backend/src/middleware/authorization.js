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

export function requireHrOrAdmin(request, response, next) {
  const roleName = String(request.user?.roleName || '')
    .trim()
    .toLowerCase()

  if (!['hr', 'admin'].includes(roleName)) {
    return response.status(403).json({
      status: 'error',
      message: 'Forbidden',
    })
  }

  return next()
}

export function requireSupervisor(request, response, next) {
  const roleName = String(request.user?.roleName || '').trim().toLowerCase()
  if (roleName !== 'supervisor') {
    return response.status(403).json({ status: 'error', message: 'Forbidden' })
  }
  return next()
}
