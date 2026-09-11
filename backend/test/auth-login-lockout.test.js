import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'auth-lockout-test-secret-with-at-least-32-bytes'

const [{ login }, { pool }] = await Promise.all([
  import('../src/controllers/auth-controller.js'),
  import('../src/config/database.js'),
])

const originalExecute = pool.execute

test.after(async () => {
  pool.execute = originalExecute
  await pool.end()
})

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    cookie() { return this },
  }
}

test('account is temporarily locked after five failed passwords inside fifteen minutes', async () => {
  const passwordHash = await bcrypt.hash('CorrectPassword1!', 4)
  let attempts = 0
  let status = 'active'
  let lockedUntil = null

  pool.execute = async (sql, parameters) => {
    if (sql.includes('FROM users AS u')) {
      return [[{
        user_id: 7,
        employee_id: 8,
        role_id: 1,
        username: 'employee007',
        password_hash: passwordHash,
        status,
        failed_login_attempts: attempts,
        last_failed_login_at: attempts ? new Date() : null,
        locked_until: lockedUntil,
      }]]
    }
    if (sql.includes('SET failed_login_attempts = ?')) {
      attempts = Number(parameters[0])
      if (parameters[1] === 1) {
        status = 'locked'
        lockedUntil = parameters[3]
      }
      return [{ affectedRows: 1 }]
    }
    return [{ affectedRows: 1 }]
  }

  for (let index = 1; index <= 5; index += 1) {
    const response = responseRecorder()
    await login({ body: { login: 'employee007', password: 'WrongPassword1!' } }, response)
    assert.equal(response.statusCode, index === 5 ? 423 : 401)
  }

  assert.equal(attempts, 5)
  assert.equal(status, 'locked')
  assert.ok(lockedUntil instanceof Date)
})
