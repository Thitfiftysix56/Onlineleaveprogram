import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'password-reset-test-secret-with-at-least-32-bytes'
process.env.PASSWORD_RESET_OTP_SECRET = 'otp-test-secret-with-at-least-32-random-bytes'

const [
  { expressApp },
  { pool },
  { hashOtp, hashResetToken },
  { setEmailTransportForTests },
  { resetPasswordRequestRateLimitsForTests },
] = await Promise.all([
  import('../src/server.js'),
  import('../src/config/database.js'),
  import('../src/auth/password-security.js'),
  import('../src/services/email-service.js'),
  import('../src/controllers/password-reset-controller.js'),
])

let server
let baseUrl
const originalExecute = pool.execute
const originalGetConnection = pool.getConnection

const activeUser = {
  user_id: 7,
  username: 'employee007',
  password_hash: await bcrypt.hash('OldPassword1!', 4),
  user_status: 'active',
  first_name: 'Password',
  last_name: 'User',
  email: 'employee007@example.test',
  employee_status: 'active',
}

function fakeConnection(execute) {
  return {
    execute,
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release() {},
  }
}

test.before(async () => {
  await new Promise((resolve) => {
    server = expressApp.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  pool.execute = originalExecute
  pool.getConnection = originalGetConnection
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  await pool.end()
})

test.beforeEach(() => {
  resetPasswordRequestRateLimitsForTests()
})

test('forgot password returns the same generic response for an unknown account', async () => {
  pool.execute = async () => [[]]

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: 'unknown-account' }),
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.match(body.message, /If an account matches/)
  assert.equal('otp' in body, false)
  assert.equal('email' in body, false)
})

test('OTP request sends to the database email and stores only an HMAC hash', async () => {
  let sentMail
  let insertedParameters
  setEmailTransportForTests({
    async sendMail(message) {
      sentMail = message
      return {
        accepted: [message.to],
        rejected: [],
        messageId: 'test-otp-message',
        response: '250 Message accepted',
      }
    },
  })
  const results = [
    [[activeUser]],
    [[]],
    [[{ request_count: 0, retry_after_seconds: 0 }]],
  ]
  pool.execute = async () => results.shift()
  pool.getConnection = async () => fakeConnection(async (sql, parameters) => {
    if (sql.includes('INSERT INTO password_reset_otps')) {
      insertedParameters = parameters
      return [{ insertId: 51 }]
    }
    return [{ affectedRows: 1 }]
  })

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: 'employee007',
      email: 'attacker@example.test',
    }),
  })
  const body = await response.json()
  const otp = sentMail.text.match(/\b\d{6}\b/)[0]

  assert.equal(response.status, 200)
  assert.equal(sentMail.to, activeUser.email)
  assert.notEqual(sentMail.to, 'attacker@example.test')
  assert.equal(insertedParameters[1], hashOtp(otp))
  assert.notEqual(insertedParameters[1], otp)
  assert.equal(JSON.stringify(body).includes(otp), false)
})

test('resend before the 60 second cooldown returns 429 with retryAfterSeconds', async () => {
  let cooldownQuery = ''
  pool.execute = async (sql) => {
    if (sql.includes('FROM users AS u')) return [[activeUser]]
    if (sql.includes('ORDER BY created_at DESC')) {
      cooldownQuery = sql
      return [[{
        id: 51,
        otp_hash: hashOtp('123456'),
        resend_count: 0,
        retry_after_seconds: 42,
      }]]
    }
    throw new Error(`Unexpected query: ${sql}`)
  }

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username, isResend: true }),
  })
  const body = await response.json()

  assert.equal(response.status, 429)
  assert.equal(body.retryAfterSeconds, 42)
  assert.match(body.message, /42 seconds/)
  assert.match(cooldownQuery, /TIMESTAMPDIFF\(SECOND, created_at, NOW\(\)\)/)
})

test('resend after cooldown creates a different OTP and sends a second email', async () => {
  const previousOtp = '123456'
  let sentMail
  let insertedParameters
  let invalidatedOldOtp = false
  let commits = 0
  let rollbacks = 0
  setEmailTransportForTests({
    async sendMail(message) {
      sentMail = message
      return {
        accepted: [message.to],
        rejected: [],
        messageId: 'test-resend-message',
        response: '250 Message accepted',
      }
    },
  })
  pool.execute = async (sql) => {
    if (sql.includes('FROM users AS u')) return [[activeUser]]
    if (sql.includes('ORDER BY created_at DESC')) {
      return [[{
        id: 51,
        otp_hash: hashOtp(previousOtp),
        resend_count: 0,
        retry_after_seconds: 0,
      }]]
    }
    if (sql.includes('COUNT(*) AS request_count')) {
      return [[{ request_count: 1, retry_after_seconds: 840 }]]
    }
    throw new Error(`Unexpected query: ${sql}`)
  }
  pool.getConnection = async () => ({
    async execute(sql, parameters) {
      if (sql.includes('UPDATE password_reset_otps')) invalidatedOldOtp = true
      if (sql.includes('INSERT INTO password_reset_otps')) {
        insertedParameters = parameters
        return [{ insertId: 52 }]
      }
      return [{ affectedRows: 1 }]
    },
    async beginTransaction() {},
    async commit() { commits += 1 },
    async rollback() { rollbacks += 1 },
    release() {},
  })

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username, isResend: true }),
  })
  const body = await response.json()
  const resentOtp = sentMail.text.match(/\b\d{6}\b/)[0]

  assert.equal(response.status, 200)
  assert.equal(sentMail.to, activeUser.email)
  assert.notEqual(resentOtp, previousOtp)
  assert.equal(insertedParameters[1], hashOtp(resentOtp))
  assert.equal(insertedParameters[3], 1)
  assert.equal(invalidatedOldOtp, true)
  assert.equal(commits, 1)
  assert.equal(rollbacks, 0)
  assert.equal(JSON.stringify(body).includes(resentOtp), false)
})

test('resend is limited to three times in a 15 minute window', async () => {
  pool.execute = async (sql) => {
    if (sql.includes('FROM users AS u')) return [[activeUser]]
    if (sql.includes('ORDER BY created_at DESC')) {
      return [[{
        id: 54,
        otp_hash: hashOtp('123456'),
        resend_count: 3,
        retry_after_seconds: 0,
      }]]
    }
    if (sql.includes('COUNT(*) AS request_count')) {
      return [[{ request_count: 4, retry_after_seconds: 240 }]]
    }
    throw new Error(`Unexpected query: ${sql}`)
  }

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username, isResend: true }),
  })
  const body = await response.json()

  assert.equal(response.status, 429)
  assert.equal(body.retryAfterSeconds, 240)
  assert.match(body.message, /240 seconds/)
})

test('email delivery failure rolls back the resend and returns 503', async () => {
  let commits = 0
  let rollbacks = 0
  setEmailTransportForTests({
    async sendMail() {
      throw new Error('SMTP unavailable')
    },
  })
  pool.execute = async (sql) => {
    if (sql.includes('FROM users AS u')) return [[activeUser]]
    if (sql.includes('ORDER BY created_at DESC')) return [[]]
    if (sql.includes('COUNT(*) AS request_count')) {
      return [[{ request_count: 0, retry_after_seconds: 0 }]]
    }
    throw new Error(`Unexpected query: ${sql}`)
  }
  pool.getConnection = async () => ({
    async execute(sql) {
      if (sql.includes('INSERT INTO password_reset_otps')) return [{ insertId: 51 }]
      return [{ affectedRows: 1 }]
    },
    async beginTransaction() {},
    async commit() { commits += 1 },
    async rollback() { rollbacks += 1 },
    release() {},
  })

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/request-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username }),
  })
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.equal(body.message, 'Email service is temporarily unavailable.')
  assert.equal(commits, 0)
  assert.equal(rollbacks, 1)
})

test('a resent OTP rejects the old code and verifies the new code', async () => {
  const oldOtp = '123456'
  const newOtp = '654321'
  let failedAttempts = 0
  pool.execute = async () => [[activeUser]]
  pool.getConnection = async () => fakeConnection(async (sql, parameters) => {
    if (sql.includes('FROM password_reset_otps')) {
      return [[{
        id: 52,
        otp_hash: hashOtp(newOtp),
        expires_at: new Date(Date.now() + 60_000),
        verified_at: null,
        used_at: null,
        invalidated_at: null,
        attempt_count: failedAttempts,
      }]]
    }
    if (sql.includes('SET attempt_count')) failedAttempts = Number(parameters[0])
    return [{ affectedRows: 1 }]
  })

  const oldResponse = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username, otp: oldOtp }),
  })
  const newResponse = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: activeUser.username, otp: newOtp }),
  })

  assert.equal(oldResponse.status, 400)
  assert.equal(newResponse.status, 200)
})

test('verified OTP creates a short-lived reset token while storing only its hash', async () => {
  const otp = '482193'
  let storedTokenHash
  pool.execute = async () => [[activeUser]]
  pool.getConnection = async () => fakeConnection(async (sql, parameters) => {
    if (sql.includes('FROM password_reset_otps')) {
      return [[{
        id: 51,
        otp_hash: hashOtp(otp),
        expires_at: new Date(Date.now() + 60_000),
        verified_at: null,
        used_at: null,
        invalidated_at: null,
        attempt_count: 0,
      }]]
    }
    if (sql.includes('INSERT INTO password_reset_tokens')) {
      storedTokenHash = parameters[1]
    }
    return [{ affectedRows: 1 }]
  })

  const response = await fetch(`${baseUrl}/api/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee007', otp }),
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.ok(body.resetToken)
  assert.equal(storedTokenHash, hashResetToken(body.resetToken))
  assert.notEqual(storedTokenHash, body.resetToken)
})

test('reset token changes the hash atomically and cannot be reused', async () => {
  const rawToken = 'one-time-reset-token'
  let tokenUsed = false
  let updatedPasswordHash
  let commits = 0
  let rollbacks = 0

  pool.getConnection = async () => ({
    async beginTransaction() {},
    async commit() { commits += 1 },
    async rollback() { rollbacks += 1 },
    release() {},
    async execute(sql, parameters) {
      if (sql.includes('FROM password_reset_tokens AS t')) {
        return [[{
          id: 61,
          user_id: activeUser.user_id,
          otp_id: 51,
          expires_at: new Date(Date.now() + 60_000),
          used_at: tokenUsed ? new Date() : null,
          invalidated_at: null,
          verified_at: new Date(),
          otp_used_at: null,
          otp_invalidated_at: null,
          username: activeUser.username,
          email: activeUser.email,
          password_hash: activeUser.password_hash,
          user_status: 'active',
          employee_status: 'active',
        }]]
      }
      if (sql.includes('UPDATE users')) {
        updatedPasswordHash = parameters[0]
      }
      if (sql.includes('UPDATE password_reset_tokens SET used_at')) {
        tokenUsed = true
      }
      return [{ affectedRows: 1 }]
    },
  })

  const payload = {
    resetToken: rawToken,
    newPassword: 'NewPassword2!',
    confirmPassword: 'NewPassword2!',
  }
  const firstResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const firstBody = await firstResponse.json()
  const replayResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  assert.equal(firstResponse.status, 200)
  assert.equal(firstBody.message, 'Password reset successfully.')
  assert.equal(await bcrypt.compare(payload.newPassword, updatedPasswordHash), true)
  assert.equal(await bcrypt.compare('OldPassword1!', updatedPasswordHash), false)
  assert.equal(replayResponse.status, 400)
  assert.equal(commits, 1)
  assert.ok(rollbacks >= 1)
  assert.equal(JSON.stringify(firstBody).includes('password_hash'), false)
})
