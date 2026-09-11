import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'hr-management-test-secret-with-at-least-32-bytes'

const [{ expressApp }, { pool }, { default: jwt }] = await Promise.all([
  import('../src/server.js'),
  import('../src/config/database.js'),
  import('jsonwebtoken'),
])

let server
let baseUrl
const originalExecute = pool.execute
const originalGetConnection = pool.getConnection

test.before(async () => {
  await new Promise((resolve) => { server = expressApp.listen(0, '127.0.0.1', resolve) })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  pool.execute = originalExecute
  pool.getConnection = originalGetConnection
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await pool.end()
})

function auth(roleName = 'HR') {
  return {
    authorization: `Bearer ${jwt.sign({ userId: 3, username: 'hr-test', roleName }, process.env.JWT_SECRET, { expiresIn: '5m' })}`,
    'content-type': 'application/json',
  }
}

const employeeRow = {
  employee_id: 10, employee_code: 'TST010', first_name: 'Test', last_name: 'Employee',
  phone: '0812345678', email: 'test10@example.test', department_id: 1,
  department_name: 'IT', position_id: 1, position_name: 'Developer', supervisor_id: null,
  supervisor_name: null, hire_date: '2026-01-01', status: 'active', role_id: 1,
  role_name: 'Employee', user_id: 20, created_at: '2026-01-01', updated_at: '2026-01-01',
  password_hash: 'never-return-this',
}
const departmentRow = { department_id: 1, department_name: 'IT', division_name: 'Development', description: 'Tech', is_active: 1, employee_count: 2, active_employee_count: 2 }
const positionRow = { position_id: 1, position_name: 'Developer', department_id: 1, department_name: 'IT', division_name: 'Development', position_group: 'Developer', is_active: 1, employee_count: 2 }
const leaveTypeRow = {
  leave_type_id: 1, leave_type_code: 'ANN', leave_type_name: 'Annual Leave', description: 'Annual leave type',
  annual_quota_days: '10.00', minimum_days: '0.50', maximum_days_per_request: '5.00',
  requires_attachment: 0, attachment_required_after_days: null, is_active: 1,
}
const holidayRow = { holiday_id: 1, holiday_date: '2026-12-05', holiday_name: 'Test Holiday', holiday_type: 'Public Holiday', description: 'Test holiday description', year: 2026, is_active: 1 }
const entitlementRow = {
  entitlement_id: 1, employee_id: 10, employee_code: 'TST010', employee_name: 'Test Employee',
  department_name: 'IT', leave_type_id: 1, leave_type_name: 'Annual Leave', year: 2026,
  total_days: '10.00', used_days: '2.00', remaining_days: '8.00', updated_by: 3,
}

const listPaths = [
  '/api/hr/employees', '/api/hr/departments', '/api/hr/positions',
  '/api/hr/leave-types', '/api/hr/holidays', '/api/hr/leave-entitlements',
]

test('all HR module list endpoints enforce 401 and 403 and allow HR/Admin', async () => {
  pool.execute = async () => [[]]
  for (const path of listPaths) {
    assert.equal((await fetch(`${baseUrl}${path}`)).status, 401)
    assert.equal((await fetch(`${baseUrl}${path}`, { headers: auth('Employee') })).status, 403)
    assert.equal((await fetch(`${baseUrl}${path}`, { headers: auth('Supervisor') })).status, 403)
    assert.equal((await fetch(`${baseUrl}${path}`, { headers: auth('HR') })).status, 200)
    assert.equal((await fetch(`${baseUrl}${path}`, { headers: auth('Admin') })).status, 200)
  }
})

test('employee list maps joined data without exposing password_hash', async () => {
  pool.execute = async () => [[employeeRow]]
  const response = await fetch(`${baseUrl}/api/hr/employees`, { headers: auth() })
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.data.employees[0].employeeCode, 'TST010')
  assert.equal(body.data.employees[0].department, 'IT')
  assert.equal(JSON.stringify(body).includes('password_hash'), false)
})

test('employee GET one returns 404', async () => {
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/employees/999`, { headers: auth() })).status, 404)
})

test('employee create rejects invalid department and position', async () => {
  const payload = { employeeCode: 'TST011', firstName: 'New', lastName: 'Employee', email: 'new@example.test', phone: '0812345678', departmentId: 99, positionId: 99, hireDate: '2026-01-01', status: 'active' }
  pool.execute = async () => [[]]
  let response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 400)
  pool.execute = async (sql) => sql.includes('departments') ? [[{ department_id: 1 }]] : [[]]
  response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...payload, departmentId: 1 }) })
  assert.equal(response.status, 400)
})

test('employee create ignores a supplied code and rejects duplicate email', async () => {
  const payload = { employeeCode: 'TST010', firstName: 'New', lastName: 'Employee', email: 'new@example.test', phone: '0812345678', departmentId: 1, positionId: 1, roleName: 'Employee', hireDate: '2026-01-01', status: 'active' }
  const results = [[[{ department_id: 1 }]], [[{ position_id: 1 }]], [[{ role_id: 1, role_name: 'Employee' }]], [[{ position_id: 1 }]], [[{ employee_id: 10, employee_code: 'OTHER', email: 'new@example.test' }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })).status, 409)
})

test('employee create, update and status update succeed with parameterized SQL', async () => {
  let results = [[[{ department_id: 1 }]], [[{ position_id: 1 }]], [[{ role_id: 1, role_name: 'Employee' }]], [[{ position_id: 1 }]], [[]], [[employeeRow]]]
  const queries = []
  pool.execute = async (sql, parameters) => { queries.push({ sql, parameters }); return results.shift() }
  const connectionQueries = []
  const connectionResults = [
    [{ insertId: 10 }],
    [[]],
    [{ affectedRows: 1 }],
    [{ affectedRows: 1 }],
    [{ affectedRows: 1 }],
    [[{ user_id: 4 }]],
    [{ affectedRows: 1 }],
  ]
  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, parameters) => {
      connectionQueries.push({ sql, parameters })
      return connectionResults.shift()
    },
  })
  const payload = { employeeCode: 'TST010', firstName: 'Test', lastName: 'Employee', email: 'test10@example.test', phone: '0812345678', departmentId: 1, positionId: 1, roleName: 'Employee', hireDate: '2026-01-01', status: 'active' }
  let response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 201)
  assert.match(connectionQueries[0].parameters[0], /^TMP-/)
  assert.equal(connectionQueries[2].parameters[0], 'EMP-010')
  assert.match(connectionQueries[5].sql, /LOWER\(r\.role_name\) = 'admin'/)
  assert.match(connectionQueries[6].sql, /INSERT INTO notifications/)
  assert.equal(connectionQueries[6].parameters[0], 4)
  assert.equal(connectionQueries[6].parameters[4], 'employee-account-required')

  results = [[[employeeRow]], [[{ department_id: 1 }]], [[{ position_id: 1 }]], [[{ role_id: 1, role_name: 'Employee' }]], [[{ position_id: 1 }]], [[]], [{ affectedRows: 1 }], [{ affectedRows: 1 }], [{ affectedRows: 1 }], [{ affectedRows: 1 }], [[employeeRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/employees/10`, { method: 'PUT', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 200)

  results = [[[employeeRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/employees/10/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'inactive' }) })
  assert.equal(response.status, 200)
})

test('employee phone is required and must contain exactly ten digits', async () => {
  const payload = { firstName: 'New', lastName: 'Employee', email: 'phone@example.test', departmentId: 1, positionId: 1, hireDate: '2026-01-01', status: 'active' }
  for (const phone of ['', '081234567', '08123456789', '08A2345678']) {
    const response = await fetch(`${baseUrl}/api/hr/employees`, {
      method: 'POST',
      headers: auth(),
      body: JSON.stringify({ ...payload, phone }),
    })
    assert.equal(response.status, 400, phone)
  }
})

test('employee delete requires inactive data without business references and removes generated entitlements', async () => {
  pool.execute = async () => [[employeeRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/employees/10`, { method: 'DELETE', headers: auth() })).status, 409)

  const inactiveEmployee = { ...employeeRow, status: 'inactive' }
  let results = [[[inactiveEmployee]], [[{ user_count: 0, request_count: 0, entitlement_count: 3, subordinate_count: 0 }]]]
  pool.execute = async () => results.shift()
  const deleteQueries = []
  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, parameters) => {
      deleteQueries.push({ sql, parameters })
      return [{ affectedRows: 1 }]
    },
  })
  assert.equal((await fetch(`${baseUrl}/api/hr/employees/10`, { method: 'DELETE', headers: auth() })).status, 200)
  assert.match(deleteQueries[0].sql, /DELETE FROM leave_entitlements/)
  assert.match(deleteQueries[1].sql, /DELETE FROM employees/)
})

test('department list/get/create/update/status and duplicate validation', async () => {
  pool.execute = async () => [[departmentRow]]
  let response = await fetch(`${baseUrl}/api/hr/departments`, { headers: auth() })
  assert.equal(response.status, 200)
  response = await fetch(`${baseUrl}/api/hr/departments/1`, { headers: auth() })
  assert.equal(response.status, 200)

  let results = [[[]], [{ insertId: 1 }], [[departmentRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/departments`, { method: 'POST', headers: auth(), body: JSON.stringify({ departmentName: 'IT', divisionName: 'Development', description: 'Tech', status: 'Active' }) })
  assert.equal(response.status, 201)

  results = [[[departmentRow]], [[]], [{ affectedRows: 1 }], [[departmentRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/departments/1`, { method: 'PUT', headers: auth(), body: JSON.stringify({ departmentName: 'IT', divisionName: 'Development', description: 'Tech', status: 'Active' }) })
  assert.equal(response.status, 200)

  results = [[[departmentRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/departments/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)

  pool.execute = async () => [[{ department_id: 2 }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/departments`, { method: 'POST', headers: auth(), body: JSON.stringify({ departmentName: 'IT', divisionName: 'Development', status: 'Active' }) })).status, 409)
})

test('department delete requires inactive department without employees', async () => {
  pool.execute = async () => [[departmentRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/departments/1`, { method: 'DELETE', headers: auth() })).status, 409)

  const unusedDepartment = { ...departmentRow, is_active: 0, employee_count: 0, active_employee_count: 0 }
  let results = [[[unusedDepartment]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/departments/1`, { method: 'DELETE', headers: auth() })).status, 200)
})

test('position list/get/create/update/status, duplicate and 404 work', async () => {
  pool.execute = async () => [[positionRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { headers: auth() })).status, 200)
  let results = [[[departmentRow]], [[]], [{ insertId: 1 }], [[positionRow]]]
  pool.execute = async () => results.shift()
  const positionPayload = { departmentId: 1, positionGroup: 'Developer', positionName: 'Developer', status: 'Active' }
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { method: 'POST', headers: auth(), body: JSON.stringify(positionPayload) })).status, 201)
  pool.execute = async (sql) => sql.includes('FROM departments') ? [[departmentRow]] : [[{ position_id: 2 }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { method: 'POST', headers: auth(), body: JSON.stringify(positionPayload) })).status, 409)
  results = [[[positionRow]], [[departmentRow]], [[]], [{ affectedRows: 1 }], [[positionRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { method: 'PUT', headers: auth(), body: JSON.stringify(positionPayload) })).status, 200)
  results = [[[positionRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/999`, { headers: auth() })).status, 404)
})

test('position delete requires inactive position without employees', async () => {
  pool.execute = async () => [[positionRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { method: 'DELETE', headers: auth() })).status, 409)

  const unusedPosition = { ...positionRow, is_active: 0, employee_count: 0 }
  let results = [[[unusedPosition]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { method: 'DELETE', headers: auth() })).status, 200)
})

test('leave type list/get/create/update/status and validation work', async () => {
  pool.execute = async () => [[leaveTypeRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { headers: auth() })).status, 200)
  const invalid = { code: 'ANN', name: 'Annual Leave', description: 'Annual leave type', defaultDays: -1, minimumDays: 1, maximumDaysPerRequest: 5, status: 'Active' }
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify(invalid) })).status, 400)
  const valid = { ...invalid, defaultDays: 10 }
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...valid, maximumDaysPerRequest: '' }) })).status, 400)
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...valid, minimumDays: 6, maximumDaysPerRequest: 5 }) })).status, 400)
  let results = [[[]]]
  pool.execute = async () => results.shift()
  const createQueries = []
  const generatedLeaveType = { ...leaveTypeRow, leave_type_code: 'LT-001' }
  const createResults = [
    [{ insertId: 1 }],
    [[]],
    [{ affectedRows: 1 }],
    [{ affectedRows: 1 }],
    [{ affectedRows: 1 }],
    [[generatedLeaveType]],
  ]
  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, parameters) => {
      createQueries.push({ sql, parameters })
      return createResults.shift()
    },
  })
  const createResponse = await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...valid, code: 'MANUAL' }) })
  const createBody = await createResponse.json()
  assert.equal(createResponse.status, 201)
  assert.equal(createBody.data.leaveType.code, 'LT-001')
  assert.match(createQueries[0].parameters[0], /^TL[A-Z0-9]{8}$/)
  assert.ok(createQueries[0].parameters[0].length <= 10)
  assert.deepEqual(createQueries[2].parameters, ['LT-001', 1])
  assert.match(createQueries[3].sql, /INSERT INTO leave_entitlements/)
  assert.equal(createQueries[3].parameters.at(-1), 1)
  assert.match(createQueries[4].sql, /UPDATE leave_entitlements/)
  pool.getConnection = originalGetConnection
  pool.execute = async () => [[{ leave_type_id: 2, leave_type_code: 'ANN', leave_type_name: 'Other' }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 409)
  let updateResults = [[[leaveTypeRow]], [[]], [[{ maximum_approved_days: 0 }]], [{ affectedRows: 1 }], [{ affectedRows: 1 }], [{ affectedRows: 1 }], [[leaveTypeRow]]]
  pool.execute = async () => updateResults.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'PUT', headers: auth(), body: JSON.stringify(valid) })).status, 200)
  updateResults = [[[leaveTypeRow]], [[]], [[{ maximum_approved_days: 6 }]]]
  pool.execute = async () => updateResults.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'PUT', headers: auth(), body: JSON.stringify({ ...valid, defaultDays: 5 }) })).status, 409)
  updateResults = [[[leaveTypeRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => updateResults.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)
})

test('leave type delete ignores unused generated entitlements but protects business history', async () => {
  const originalConnectionFactory = pool.getConnection
  pool.execute = async () => [[leaveTypeRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'DELETE', headers: auth() })).status, 409)

  const inactiveLeaveType = { ...leaveTypeRow, is_active: 0 }
  let results = [[[inactiveLeaveType]], [[{ request_count: 1, used_entitlement_count: 0 }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'DELETE', headers: auth() })).status, 409)

  results = [[[inactiveLeaveType]], [[{ request_count: 0, used_entitlement_count: 0 }]]]
  pool.execute = async () => results.shift()
  const deleteQueries = []
  pool.getConnection = async () => ({
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {},
    execute: async (sql, parameters) => {
      deleteQueries.push({ sql, parameters })
      return [{ affectedRows: 1 }]
    },
  })
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'DELETE', headers: auth() })).status, 200)
  assert.match(deleteQueries[0].sql, /DELETE FROM leave_entitlements/)
  assert.match(deleteQueries[1].sql, /DELETE FROM leave_types/)
  pool.getConnection = originalConnectionFactory
})

test('holiday list/get/create/update/delete and validation work', async () => {
  pool.execute = async () => [[holidayRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays/1`, { headers: auth() })).status, 200)
  const invalid = { name: 'Test Holiday', date: '2026-02-30', type: 'Public Holiday', description: 'Test holiday description', status: 'Active' }
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays`, { method: 'POST', headers: auth(), body: JSON.stringify(invalid) })).status, 400)
  const valid = { ...invalid, date: '2026-12-05' }
  let results = [[[]], [{ insertId: 1 }], [[holidayRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 201)
  results = [[[]], [{ insertId: 2 }], [[holidayRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays`, {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ holidayName: 'Company Day', holidayDate: '2026-12-06', isActive: true }),
  })).status, 201)
  pool.execute = async () => [[{ holiday_id: 2 }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 409)
  results = [[[holidayRow]], [[]], [{ affectedRows: 1 }], [[holidayRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays/1`, { method: 'PUT', headers: auth(), body: JSON.stringify(valid) })).status, 200)
  results = [[[holidayRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays/1`, { method: 'DELETE', headers: auth() })).status, 200)
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/holidays/999`, { headers: auth() })).status, 404)
})

test('leave entitlements are readable but cannot be changed per employee', async () => {
  pool.execute = async () => [[entitlementRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements/1`, { headers: auth() })).status, 200)

  const payload = { employeeId: 10, leaveTypeId: 1, year: 2026, totalDays: 10 }
  let response = await fetch(`${baseUrl}/api/hr/leave-entitlements`, {
    method: 'POST', headers: auth(), body: JSON.stringify(payload),
  })
  assert.equal(response.status, 409)
  assert.match((await response.json()).message, /อัตโนมัติ/)

  response = await fetch(`${baseUrl}/api/hr/leave-entitlements/1`, {
    method: 'PUT', headers: auth(), body: JSON.stringify(payload),
  })
  assert.equal(response.status, 409)
  assert.match((await response.json()).message, /อัตโนมัติ/)

  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements/999`, { headers: auth() })).status, 404)
})
