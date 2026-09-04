import assert from 'node:assert/strict'
import test from 'node:test'

Object.assign(process.env, {
  NODE_ENV: 'test',
  DB_HOST: '127.0.0.1',
  DB_PORT: '3306',
  DB_NAME: 'audit_test',
  DB_USER: 'audit_test',
  JWT_SECRET: 'audit-test-jwt-secret-at-least-32-bytes',
})

const {
  createAuditActivityMiddleware,
  resolveAuditAction,
} = await import('../src/middleware/audit-activity.js')

function request(overrides = {}) {
  return {
    method: 'GET',
    originalUrl: '/api/health',
    body: {},
    cookies: {},
    ip: '127.0.0.1',
    get: () => '',
    ...overrides,
  }
}

function response(statusCode = 200) {
  return {
    statusCode,
    sentBody: null,
    json(body) {
      this.sentBody = body
      return this
    },
  }
}

function auditConnection() {
  const calls = []
  return {
    calls,
    async execute(sql, params) {
      calls.push({ sql, params })
      return [{ insertId: calls.length }]
    },
  }
}

test('audit action resolver maps important mutations and excludes controller-owned logs', () => {
  assert.deepEqual(resolveAuditAction('PUT', '/api/admin/users/7'), {
    action: 'update_user',
    recordId: 7,
  })
  assert.deepEqual(resolveAuditAction('POST', '/api/leave/requests/12/submit'), {
    action: 'submit_leave',
    recordId: 12,
  })
  assert.deepEqual(resolveAuditAction('PATCH', '/api/hr/leave-types/3/status'), {
    action: 'update_leave_type_status',
    recordId: 3,
  })
  assert.equal(resolveAuditAction('GET', '/api/admin/users'), null)
  assert.deepEqual(resolveAuditAction('POST', '/api/admin/users'), {
    action: null,
    recordId: null,
  })
})

test('successful authenticated mutation writes a sanitized audit row before responding', async () => {
  const connection = auditConnection()
  const middleware = createAuditActivityMiddleware(connection)
  const req = request({
    method: 'PUT',
    originalUrl: '/api/hr/departments/4',
    body: { name: 'Operations', password: 'must-not-be-recorded' },
    user: { userId: 3, username: 'hr001', roleName: 'HR' },
  })
  const res = response()

  middleware(req, res, () => {})
  await res.json({ status: 'ok' })

  assert.equal(connection.calls.length, 1)
  const params = connection.calls[0].params
  assert.equal(params[0], 3)
  assert.equal(params[1], 'update_department')
  assert.equal(params[2], 'departments')
  assert.equal(params[3], 4)
  assert.doesNotMatch(params[4], /password|must-not-be-recorded/)
})

test('failed login is audited without storing the submitted password', async () => {
  const connection = auditConnection()
  const middleware = createAuditActivityMiddleware(connection)
  const req = request({
    method: 'POST',
    originalUrl: '/api/auth/login',
    body: { login: 'employee001', password: 'Secret123!' },
  })
  const res = response(401)

  middleware(req, res, () => {})
  await res.json({ status: 'error' })

  const params = connection.calls[0].params
  assert.equal(params[0], null)
  assert.equal(params[1], 'login_failed')
  assert.match(params[4], /employee001/)
  assert.doesNotMatch(params[4], /Secret123!|password/)
})

test('read-only and failed business requests do not create audit rows', async () => {
  const connection = auditConnection()
  const middleware = createAuditActivityMiddleware(connection)

  const getRequest = request({ method: 'GET', originalUrl: '/api/hr/employees' })
  const getResponse = response()
  middleware(getRequest, getResponse, () => {})
  getResponse.json({ status: 'ok' })

  const failedRequest = request({
    method: 'PUT',
    originalUrl: '/api/hr/employees/2',
    user: { userId: 3, username: 'hr001', roleName: 'HR' },
  })
  const failedResponse = response(400)
  middleware(failedRequest, failedResponse, () => {})
  failedResponse.json({ status: 'error' })

  assert.equal(connection.calls.length, 0)
})
