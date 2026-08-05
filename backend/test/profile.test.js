import assert from 'node:assert/strict'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'profile-test-secret-with-at-least-32-bytes'

const [
  { expressApp },
  { pool },
  { profileImagesDirectory },
  { default: jwt },
] = await Promise.all([
  import('../src/server.js'),
  import('../src/config/database.js'),
  import('../src/controllers/profile-controller.js'),
  import('jsonwebtoken'),
])

let server
let baseUrl
const originalExecute = pool.execute

const profileRow = {
  user_id: 4,
  employee_id: 14,
  employee_code: 'EMP014',
  username: 'profile-user',
  role_id: 3,
  role_name: 'HR',
  first_name: 'Profile',
  last_name: 'User',
  email: 'profile@example.test',
  phone: '0812345678',
  profile_image_url: null,
  department_id: 2,
  department_name: 'Human Resources',
  position_id: 3,
  position_name: 'HR Officer',
  status: 'active',
  last_login_at: null,
  password_changed_at: null,
  password_hash: 'must-never-be-returned',
}

function auth(roleName = 'HR') {
  return {
    authorization: `Bearer ${jwt.sign(
      { userId: 4, employeeId: 14, username: 'profile-user', roleName },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    )}`,
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
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  await pool.end()
})

test('profile endpoints require authentication', async () => {
  assert.equal((await fetch(`${baseUrl}/api/profile`)).status, 401)
  assert.equal((await fetch(`${baseUrl}/api/profile`, { method: 'PUT' })).status, 401)
})

test('all authenticated roles can read their own sanitized profile', async () => {
  for (const roleName of ['Employee', 'Supervisor', 'HR', 'Admin']) {
    pool.execute = async () => [[{ ...profileRow, role_name: roleName }]]
    const response = await fetch(`${baseUrl}/api/profile`, { headers: auth(roleName) })
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.profile.employeeCode, 'EMP014')
    assert.equal(body.profile.roleName, roleName)
    assert.equal(JSON.stringify(body).includes('password_hash'), false)
  }
})

test('auth session refresh returns current database profile fields', async () => {
  pool.execute = async () => [[{
    ...profileRow,
    profile_image_url: '/api/profile-images/current.png',
  }]]

  const response = await fetch(`${baseUrl}/api/auth/me`, { headers: auth() })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.user.fullName, 'Profile User')
  assert.equal(body.user.email, 'profile@example.test')
  assert.equal(body.user.phone, '0812345678')
  assert.equal(body.user.profileImageUrl, '/api/profile-images/current.png')
  assert.equal(JSON.stringify(body).includes('password_hash'), false)
})

test('profile update changes only allowed employee fields', async () => {
  const queries = []
  const updatedRow = {
    ...profileRow,
    first_name: 'Updated',
    last_name: 'Profile',
    email: 'updated@example.test',
    phone: '0899999999',
  }
  const results = [[[profileRow]], [[]], [{ affectedRows: 1 }], [[updatedRow]]]
  pool.execute = async (sql, parameters) => {
    queries.push({ sql, parameters })
    return results.shift()
  }

  const form = new FormData()
  form.set('fullName', 'Updated Profile')
  form.set('email', 'updated@example.test')
  form.set('phone', '0899999999')
  form.set('employeeId', '999')
  form.set('username', 'cannot-change')
  form.set('role', 'Admin')

  const response = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: auth(),
    body: form,
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.profile.fullName, 'Updated Profile')
  assert.match(queries[2].sql, /SET first_name = \?, last_name = \?, email = \?, phone = \?, profile_image_url = \?/)
  assert.doesNotMatch(queries[2].sql, /username|role_id|employee_code|password_hash/)
})

test('profile upload validates file type and file size', async () => {
  let form = new FormData()
  form.set('fullName', 'Profile User')
  form.set('email', 'profile@example.test')
  form.set('profileImage', new Blob(['not an image'], { type: 'text/plain' }), 'profile.txt')
  let response = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: auth(),
    body: form,
  })
  assert.equal(response.status, 400)

  form = new FormData()
  form.set('fullName', 'Profile User')
  form.set('email', 'profile@example.test')
  form.set(
    'profileImage',
    new Blob([new Uint8Array(2 * 1024 * 1024 + 1)], { type: 'image/png' }),
    'large.png',
  )
  response = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: auth(),
    body: form,
  })
  assert.equal(response.status, 400)
})

test('valid profile image is persisted and returned as a URL', async () => {
  const updatedRow = { ...profileRow }
  const results = [[[profileRow]], [[]], [{ affectedRows: 1 }], [[updatedRow]]]
  pool.execute = async (sql, parameters) => {
    const result = results.shift()
    if (sql.includes('UPDATE employees')) updatedRow.profile_image_url = parameters[4]
    return result
  }

  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const form = new FormData()
  form.set('fullName', 'Profile User')
  form.set('email', 'profile@example.test')
  form.set('phone', '')
  form.set('profileImage', new Blob([pngHeader], { type: 'image/png' }), 'profile.png')

  const response = await fetch(`${baseUrl}/api/profile`, {
    method: 'PUT',
    headers: auth(),
    body: form,
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.match(body.profile.profileImageUrl, /^\/api\/profile-images\/4-[\w-]+\.png$/)
  assert.equal(JSON.stringify(body).includes('password_hash'), false)

  await unlink(path.join(profileImagesDirectory, path.basename(body.profile.profileImageUrl)))
})
