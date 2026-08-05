import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'auth-security-test-secret-with-at-least-32-bytes'

const [{ expressApp }, { pool }, { default: jwt }] = await Promise.all([
  import('../src/server.js'),
  import('../src/config/database.js'),
  import('jsonwebtoken'),
])

let server
let baseUrl
const originalExecute = pool.execute

function token(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' })
}

test.before(async () => {
  await new Promise((resolve) => {
    server = expressApp.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  pool.execute = originalExecute
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  await pool.end()
})

test('a forced-change session cannot access profile or business APIs', async () => {
  const authorization = `Bearer ${token({
    userId: 7,
    username: 'forced-user',
    roleName: 'Employee',
    mustChangePassword: true,
  })}`

  const response = await fetch(`${baseUrl}/api/profile`, {
    headers: { authorization },
  })
  const body = await response.json()

  assert.equal(response.status, 403)
  assert.equal(body.code, 'PASSWORD_CHANGE_REQUIRED')
})

test('a bearer token with an old tokenVersion is invalidated', async () => {
  pool.execute = async () => [[{ token_version: 2, status: 'active' }]]
  const authorization = `Bearer ${token({
    userId: 7,
    username: 'versioned-user',
    roleName: 'Employee',
    tokenVersion: 1,
    mustChangePassword: false,
  })}`

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { authorization },
  })

  assert.equal(response.status, 401)
})
