import jwt from 'jsonwebtoken'

import { config } from '../config/environment.js'
import { pool } from '../config/database.js'
import { writeAuditLog } from '../services/audit-service.js'

const authCookieName = 'online_leave_token'

const exactActions = new Map([
  ['POST /api/auth/login', 'login'],
  ['POST /api/auth/logout', 'logout'],
  ['PUT /api/profile', 'update_profile'],
  ['POST /api/admin/users', null], // Logged by the controller after creation.
  ['POST /api/leave/requests/drafts', 'save_leave_draft'],
  ['POST /api/leave/requests/submit', 'submit_leave'],
  ['POST /api/hr/employees', 'create_employee'],
  ['POST /api/hr/departments', 'create_department'],
  ['POST /api/hr/positions', 'create_position'],
  ['POST /api/hr/leave-types', 'create_leave_type'],
  ['POST /api/hr/holidays', 'create_holiday'],
  ['POST /api/hr/leave-entitlements', 'create_leave_entitlement'],
])

const patternActions = [
  ['PUT', /^\/api\/admin\/users\/(\d+)$/, 'update_user'],
  ['PATCH', /^\/api\/admin\/users\/(\d+)\/status$/, 'update_user_status'],
  ['POST', /^\/api\/admin\/users\/(\d+)\/reset-password$/, null],
  ['PUT', /^\/api\/hr\/employees\/(\d+)$/, 'update_employee'],
  ['PATCH', /^\/api\/hr\/employees\/(\d+)\/status$/, 'update_employee_status'],
  ['PUT', /^\/api\/hr\/departments\/(\d+)$/, 'update_department'],
  ['PATCH', /^\/api\/hr\/departments\/(\d+)\/status$/, 'update_department_status'],
  ['PUT', /^\/api\/hr\/positions\/(\d+)$/, 'update_position'],
  ['PATCH', /^\/api\/hr\/positions\/(\d+)\/status$/, 'update_position_status'],
  ['PUT', /^\/api\/hr\/leave-types\/(\d+)$/, 'update_leave_type'],
  ['PATCH', /^\/api\/hr\/leave-types\/(\d+)\/status$/, 'update_leave_type_status'],
  ['PUT', /^\/api\/hr\/holidays\/(\d+)$/, 'update_holiday'],
  ['DELETE', /^\/api\/hr\/holidays\/(\d+)$/, 'delete_holiday'],
  ['PUT', /^\/api\/hr\/leave-entitlements\/(\d+)$/, 'update_leave_entitlement'],
  ['PUT', /^\/api\/leave\/requests\/(\d+)\/draft$/, 'save_leave_draft'],
  ['DELETE', /^\/api\/leave\/requests\/(\d+)\/draft$/, 'delete_leave_draft'],
  ['POST', /^\/api\/leave\/requests\/(\d+)\/submit$/, 'submit_leave'],
  ['PATCH', /^\/api\/leave\/requests\/(\d+)\/cancel$/, 'cancel_leave'],
  ['POST', /^\/api\/(?:supervisor|hr)\/approvals\/(\d+)\/decision$/, null],
  ['DELETE', /^\/api\/leave-attachments\/(\d+)$/, 'delete_attachment'],
]

export function resolveAuditAction(method, path) {
  const normalizedMethod = String(method || '').toUpperCase()
  const normalizedPath = String(path || '').split('?')[0]
  const exactKey = `${normalizedMethod} ${normalizedPath}`

  if (exactActions.has(exactKey)) {
    return { action: exactActions.get(exactKey), recordId: null }
  }

  for (const [expectedMethod, pattern, action] of patternActions) {
    if (normalizedMethod !== expectedMethod) continue
    const match = normalizedPath.match(pattern)
    if (match) return { action, recordId: Number(match[1]) || null }
  }

  return null
}

function tokenUser(request) {
  const authorization = request.get?.('authorization') || ''
  const bearerToken = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : null
  const token = request.cookies?.[authCookieName] || bearerToken

  if (!token) return null
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch {
    return null
  }
}

function responseRecordId(body) {
  const candidates = [
    body?.id,
    body?.data?.id,
    body?.user?.id,
    body?.user?.userId,
    body?.employee?.id,
    body?.department?.id,
    body?.position?.id,
    body?.leaveType?.id,
    body?.holiday?.id,
    body?.leaveEntitlement?.id,
    body?.data?.leaveRequest?.id,
    body?.data?.employee?.employeeId,
    body?.data?.department?.departmentId,
    body?.data?.position?.positionId,
    body?.data?.leaveType?.leaveTypeId,
    body?.data?.holiday?.holidayId,
    body?.data?.leaveEntitlement?.entitlementId,
    body?.data?.employeeId,
    body?.data?.departmentId,
    body?.data?.positionId,
    body?.data?.leaveTypeId,
    body?.data?.holidayId,
  ]
  const value = candidates.find((candidate) => Number.isInteger(Number(candidate)))
  return value === undefined ? null : Number(value)
}

function tableNameFor(action) {
  if (['login', 'login_failed', 'logout', 'update_user', 'update_user_status'].includes(action)) return 'users'
  if (action === 'update_profile' || action.includes('employee')) return 'employees'
  if (action.includes('department')) return 'departments'
  if (action.includes('position')) return 'positions'
  if (action.includes('leave_type')) return 'leave_types'
  if (action.includes('holiday')) return 'holidays'
  if (action.includes('entitlement')) return 'leave_entitlements'
  if (action.includes('attachment')) return 'leave_request_attachments'
  if (action.includes('leave')) return 'leave_requests'
  return null
}

export function createAuditActivityMiddleware(connection = pool) {
  return (request, response, next) => {
    const resolved = resolveAuditAction(request.method, request.originalUrl || request.path)
    if (!resolved || resolved.action === null) return next()

    const originalJson = response.json.bind(response)
    let responseSent = false

    response.json = function auditedJson(body) {
      if (responseSent) return originalJson(body)
      responseSent = true

      const statusCode = Number(response.statusCode || 200)
      const action = resolved.action === 'login' && statusCode >= 400
        ? 'login_failed'
        : resolved.action
      const shouldAudit = action === 'login_failed' || (statusCode >= 200 && statusCode < 400)

      if (!shouldAudit) return originalJson(body)

      const authenticatedUser = request.user || tokenUser(request) || body?.user || null
      const recordId = resolved.recordId || responseRecordId(body)

      return writeAuditLog(connection, {
        userId: authenticatedUser?.userId || authenticatedUser?.user_id || null,
        action,
        tableName: tableNameFor(action),
        recordId,
        result: action === 'login_failed' ? 'failed' : 'success',
        username: authenticatedUser?.username || request.body?.login || request.body?.username || '',
        adminUserId: String(request.user?.roleName || '').toLowerCase() === 'admin'
          ? request.user.userId
          : null,
        ipAddress: request.ip || null,
        userAgent: request.get?.('user-agent') || '',
      })
        .catch((error) => {
          console.error('Audit log write error:', error)
        })
        .then(() => originalJson(body))
    }

    return next()
  }
}

export const auditActivity = createAuditActivityMiddleware()
