import assert from 'node:assert/strict'
import test from 'node:test'
import bcrypt from 'bcryptjs'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'admin-users-test-secret-with-at-least-32-bytes'

const [{ expressApp }, { pool }, { default: jwt }] =
  await Promise.all([
    import('../src/server.js'),
    import('../src/config/database.js'),
    import('jsonwebtoken'),
  ])

let httpServer
let baseUrl
const originalPoolExecute = pool.execute

test.before(async () => {
  await new Promise((resolve) => {
    httpServer = expressApp.listen(0, '127.0.0.1', resolve)
  })

  const address = httpServer.address()
  baseUrl = `http://127.0.0.1:${address.port}`
})

test.after(async () => {
  pool.execute = originalPoolExecute

  await new Promise((resolve, reject) => {
    httpServer.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

  await pool.end()
})

function authorizationHeader(roleName) {
  const token = jwt.sign(
    {
      userId: 99,
      username: 'test-user',
      roleName,
    },
    process.env.JWT_SECRET,
    { expiresIn: '5m' },
  )

  return {
    authorization: `Bearer ${token}`,
  }
}

test('GET /api/admin/users returns 401 when unauthenticated', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users`)

  assert.equal(response.status, 401)
})

test('GET /api/admin/users returns 403 for a non-admin user', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users`, {
    headers: authorizationHeader('Employee'),
  })

  assert.equal(response.status, 403)
})

test('GET /api/admin/users returns sanitized users for an admin', async () => {
  pool.execute = async () => [
    [
      {
        user_id: 1,
        employee_id: 10,
        employee_code: 'EMP010',
        username: 'admin001',
        password_hash: 'must-not-be-returned',
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        role_id: 4,
        role_name: 'Admin',
        status: 'active',
        last_login_at: '2026-08-03T01:00:00.000Z',
        must_change_password: 0,
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-08-01T00:00:00.000Z',
      },
    ],
  ]

  const response = await fetch(`${baseUrl}/api/admin/users`, {
    headers: authorizationHeader('Admin'),
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.status, 'ok')
  assert.equal(body.users.length, 1)
  assert.deepEqual(body.users[0], {
    userId: 1,
    employeeId: 10,
    employeeCode: 'EMP010',
    username: 'admin001',
    fullName: 'Admin User',
    email: 'admin@example.com',
    roleId: 4,
    roleName: 'Admin',
    status: 'active',
    lastLoginAt: '2026-08-03T01:00:00.000Z',
    mustChangePassword: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  })
  assert.equal('password_hash' in body.users[0], false)
  assert.equal(JSON.stringify(body).includes('must-not-be-returned'), false)
})

test('admin account endpoints reject unauthenticated and non-admin requests', async () => {
  const unauthenticatedResponse = await fetch(
    `${baseUrl}/api/admin/employees/available-for-account`,
  )
  const forbiddenResponse = await fetch(
    `${baseUrl}/api/admin/users/1`,
    { headers: authorizationHeader('Supervisor') },
  )

  assert.equal(unauthenticatedResponse.status, 401)
  assert.equal(forbiddenResponse.status, 403)
})

test('available employees returns only employees without an account', async () => {
  pool.execute = async (sql) => {
    assert.match(sql, /LEFT JOIN users AS u/)
    assert.match(sql, /WHERE u\.user_id IS NULL/)

    return [
      [
        {
          employee_id: 10,
          employee_code: 'EMP010',
          first_name: 'Available',
          last_name: 'Employee',
          email: 'available@example.com',
          department_name: 'Information Technology',
          position_name: 'Developer',
        },
      ],
    ]
  }

  const response = await fetch(
    `${baseUrl}/api/admin/employees/available-for-account`,
    { headers: authorizationHeader('Admin') },
  )
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(body, {
    status: 'ok',
    employees: [
      {
        employeeId: 10,
        employeeCode: 'EMP010',
        fullName: 'Available Employee',
        email: 'available@example.com',
        department: 'Information Technology',
        position: 'Developer',
      },
    ],
  })
})

test('POST /api/admin/users creates a hashed account and returns the temporary password once', async () => {
  const queries = []
  const results = [
    [[{ employee_id: 10, user_id: null }]],
    [[]],
    [[{ role_id: 1, role_name: 'Employee' }]],
    [{ insertId: 7 }],
    [[{
      user_id: 7,
      employee_id: 10,
      employee_code: 'EMP010',
      username: 'employee010',
      password_hash: 'must-not-be-returned',
      first_name: 'Available',
      last_name: 'Employee',
      email: 'available@example.com',
      department_name: 'Information Technology',
      position_name: 'Developer',
      role_id: 1,
      role_name: 'Employee',
      status: 'active',
      last_login_at: null,
      must_change_password: 1,
      created_at: '2026-08-03T00:00:00.000Z',
      updated_at: '2026-08-03T00:00:00.000Z',
    }]],
  ]
  pool.execute = async (sql, parameters) => {
    queries.push({ sql, parameters })
    return results.shift()
  }

  const response = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: {
      ...authorizationHeader('Admin'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      employeeId: 10,
      username: 'employee010',
      role: 'Employee',
      status: 'active',
    }),
  })
  const body = await response.json()

  assert.equal(response.status, 201)
  assert.equal(body.status, 'ok')
  assert.equal(body.username, 'employee010')
  assert.equal(body.mustChangePassword, true)
  assert.match(body.temporaryPassword, /[a-z]/)
  assert.match(body.temporaryPassword, /[A-Z]/)
  assert.match(body.temporaryPassword, /[0-9]/)
  assert.match(body.temporaryPassword, /[^A-Za-z0-9]/)
  assert.equal(JSON.stringify(body).includes('password_hash'), false)
  assert.match(queries[3].sql, /INSERT INTO users/)
  assert.match(queries[3].sql, /must_change_password/)
  assert.notEqual(queries[3].parameters[3], body.temporaryPassword)
  assert.match(queries[3].parameters[3], /^\$2[aby]\$/)
})

test('POST /api/admin/users rejects a duplicate username', async () => {
  const results = [
    [[{ employee_id: 10, user_id: null }]],
    [[{ user_id: 3 }]],
  ]
  pool.execute = async () => results.shift()

  const response = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: {
      ...authorizationHeader('Admin'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      employeeId: 10,
      username: 'admin001',
      role: 'Employee',
      status: 'active',
    }),
  })

  assert.equal(response.status, 409)
})

test('POST /api/admin/users rejects an employee who already has an account', async () => {
  pool.execute = async () => [
    [{ employee_id: 10, user_id: 3 }],
  ]

  const response = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: {
      ...authorizationHeader('Admin'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      employeeId: 10,
      username: 'employee010',
      role: 'Employee',
      status: 'active',
    }),
  })

  assert.equal(response.status, 409)
})

test('PUT /api/admin/users/:userId updates only username, role and status', async () => {
  const user = {
    user_id: 7,
    employee_id: 10,
    employee_code: 'EMP010',
    username: 'employee010',
    password_hash: 'must-not-be-returned',
    first_name: 'Available',
    last_name: 'Employee',
    email: 'available@example.com',
    department_name: 'Information Technology',
    position_name: 'Developer',
    role_id: 1,
    role_name: 'Employee',
    status: 'active',
    last_login_at: null,
    created_at: '2026-08-03T00:00:00.000Z',
    updated_at: '2026-08-03T00:00:00.000Z',
  }
  const updatedUser = {
    ...user,
    username: 'employee010.edited',
    role_id: 2,
    role_name: 'Supervisor',
    status: 'inactive',
  }
  const queries = []
  const results = [
    [[user]],
    [[]],
    [[{ role_id: 2, role_name: 'Supervisor' }]],
    [{ affectedRows: 1 }],
    [[updatedUser]],
  ]
  pool.execute = async (sql, parameters) => {
    queries.push({ sql, parameters })
    return results.shift()
  }

  const response = await fetch(`${baseUrl}/api/admin/users/7`, {
    method: 'PUT',
    headers: {
      ...authorizationHeader('Admin'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      employeeId: 999,
      username: 'employee010.edited',
      role: 'Supervisor',
      status: 'inactive',
      password_hash: 'attempted-overwrite',
    }),
  })
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.user.employeeId, 10)
  assert.equal(body.user.username, 'employee010.edited')
  assert.equal(body.user.roleName, 'Supervisor')
  assert.equal(body.user.status, 'inactive')
  assert.equal(JSON.stringify(body).includes('password_hash'), false)
  assert.doesNotMatch(queries[3].sql, /employee_id|password_hash/)
  assert.deepEqual(queries[3].parameters, [
    'employee010.edited',
    2,
    'inactive',
    7,
  ])
})

test('PATCH /api/admin/users/:userId/status returns 401 when unauthenticated', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users/7/status`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ status: 'Active' }),
  })

  assert.equal(response.status, 401)
})

test('PATCH /api/admin/users/:userId/status returns 403 for a non-admin', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users/7/status`, {
    method: 'PATCH',
    headers: {
      ...authorizationHeader('Employee'),
      'content-type': 'application/json',
    },
    body: JSON.stringify({ status: 'Active' }),
  })

  assert.equal(response.status, 403)
})

for (const requestedStatus of ['Active', 'Locked', 'Inactive']) {
  test(`PATCH /api/admin/users/:userId/status updates only status to ${requestedStatus}`, async () => {
    const queries = []
    const results = [
      [[{ user_id: 7 }]],
      [{ affectedRows: 1 }],
    ]
    pool.execute = async (sql, parameters) => {
      queries.push({ sql, parameters })
      return results.shift()
    }

    const response = await fetch(`${baseUrl}/api/admin/users/7/status`, {
      method: 'PATCH',
      headers: {
        ...authorizationHeader('Admin'),
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        status: requestedStatus,
        username: 'must-not-change',
        role: 'must-not-change',
        password_hash: 'must-not-change',
      }),
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.deepEqual(body, {
      status: 'ok',
      message: 'User status updated successfully',
    })
    assert.match(queries[1].sql, /SET status = \?/) 
    assert.doesNotMatch(
      queries[1].sql,
      /username|role_id|password_hash/,
    )
    assert.deepEqual(queries[1].parameters, [
      requestedStatus.toLowerCase(),
      7,
    ])
  })
}

test('POST /api/admin/users/:userId/reset-password returns 401 when unauthenticated', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
  })

  assert.equal(response.status, 401)
})

test('POST /api/admin/users/:userId/reset-password returns 403 for a non-admin', async () => {
  const response = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Employee'),
  })

  assert.equal(response.status, 403)
})

test('POST /api/admin/users/:userId/reset-password returns 404 when user does not exist', async () => {
  pool.execute = async () => [[]]

  const response = await fetch(`${baseUrl}/api/admin/users/999/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Admin'),
  })
  const body = await response.json()

  assert.equal(response.status, 404)
  assert.equal(body.status, 'error')
})

test('POST /api/admin/users/:userId/reset-password rejects an inactive account', async () => {
  pool.execute = async () => [[{
    user_id: 7,
    username: 'inactive-user',
    status: 'inactive',
  }]]

  const response = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Admin'),
  })
  const body = await response.json()

  assert.equal(response.status, 409)
  assert.equal(body.status, 'error')
})

test('POST /api/admin/users/:userId/reset-password replaces only the password', async () => {
  const queries = []
  const results = [
    [[{ user_id: 7, username: 'employee007', status: 'active' }]],
    [{ affectedRows: 1 }],
    [{ insertId: 12 }],
  ]
  pool.execute = async (sql, parameters) => {
    queries.push({ sql, parameters })
    return results.shift()
  }

  const response = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Admin'),
  })
  const body = await response.json()
  const storedHash = queries[1].parameters[0]

  assert.equal(response.status, 200)
  assert.equal(body.status, 'ok')
  assert.equal(body.message, 'Password reset successfully.')
  assert.equal(body.username, 'employee007')
  assert.equal(body.mustChangePassword, true)
  assert.equal(typeof body.temporaryPassword, 'string')
  assert.equal(JSON.stringify(body).includes('password_hash'), false)
  assert.match(queries[1].sql, /SET password_hash = \?/) 
  assert.match(queries[1].sql, /password_changed_at = NOW\(\)/)
  assert.match(queries[1].sql, /must_change_password = 1/)
  assert.match(queries[1].sql, /token_version = token_version \+ 1/)
  assert.doesNotMatch(queries[1].sql, /username|role_id|status/)
  assert.deepEqual(queries[1].parameters.slice(1), [7])
  assert.equal(bcrypt.getRounds(storedHash), 12)
  assert.equal(await bcrypt.compare(body.temporaryPassword, storedHash), true)
  assert.equal(await bcrypt.compare('OldPassword123!', storedHash), false)
  assert.match(queries[2].sql, /INSERT INTO audit_logs/)
  assert.equal(queries[2].parameters[0], 99)
  assert.equal(queries[2].parameters[3], 7)
  assert.match(queries[2].parameters[4], /employee007/)
  assert.equal(queries[2].parameters.join(' ').includes(body.temporaryPassword), false)
  assert.equal(queries[2].parameters.join(' ').includes(storedHash), false)
})

test('each password reset generates a different temporary password', async () => {
  pool.execute = async (sql) => {
    if (sql.includes('SELECT user_id, username, status')) {
      return [[{ user_id: 7, username: 'employee007', status: 'active' }]]
    }
    return [{ affectedRows: 1 }]
  }

  const firstResponse = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Admin'),
  })
  const firstBody = await firstResponse.json()
  const secondResponse = await fetch(`${baseUrl}/api/admin/users/7/reset-password`, {
    method: 'POST',
    headers: authorizationHeader('Admin'),
  })
  const secondBody = await secondResponse.json()

  assert.equal(firstResponse.status, 200)
  assert.equal(secondResponse.status, 200)
  assert.notEqual(firstBody.temporaryPassword, secondBody.temporaryPassword)
})
