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

test.before(async () => {
  await new Promise((resolve) => { server = expressApp.listen(0, '127.0.0.1', resolve) })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

test.after(async () => {
  pool.execute = originalExecute
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
const departmentRow = { department_id: 1, department_name: 'IT', description: 'Tech', is_active: 1, employee_count: 2, active_employee_count: 2 }
const positionRow = { position_id: 1, position_name: 'Developer', is_active: 1, employee_count: 2 }
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
  const payload = { employeeCode: 'TST011', firstName: 'New', lastName: 'Employee', email: 'new@example.test', departmentId: 99, positionId: 99, hireDate: '2026-01-01', status: 'active' }
  pool.execute = async () => [[]]
  let response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 400)
  pool.execute = async (sql) => sql.includes('departments') ? [[{ department_id: 1 }]] : [[]]
  response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...payload, departmentId: 1 }) })
  assert.equal(response.status, 400)
})

test('employee create rejects duplicate code and duplicate email', async () => {
  const payload = { employeeCode: 'TST010', firstName: 'New', lastName: 'Employee', email: 'new@example.test', departmentId: 1, positionId: 1, hireDate: '2026-01-01', status: 'active' }
  let results = [[[{ department_id: 1 }]], [[{ position_id: 1 }]], [[{ employee_id: 10, employee_code: 'TST010', email: 'old@example.test' }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })).status, 409)
  results = [[[{ department_id: 1 }]], [[{ position_id: 1 }]], [[{ employee_id: 10, employee_code: 'OTHER', email: 'new@example.test' }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })).status, 409)
})

test('employee create, update and status update succeed with parameterized SQL', async () => {
  let results = [[[{ department_id: 1 }]], [[{ position_id: 1 }]], [[]], [{ insertId: 10 }], [[employeeRow]]]
  const queries = []
  pool.execute = async (sql, parameters) => { queries.push({ sql, parameters }); return results.shift() }
  const payload = { employeeCode: 'TST010', firstName: 'Test', lastName: 'Employee', email: 'test10@example.test', phone: '0812345678', departmentId: 1, positionId: 1, hireDate: '2026-01-01', status: 'active' }
  let response = await fetch(`${baseUrl}/api/hr/employees`, { method: 'POST', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 201)
  assert.equal(queries[3].parameters[0], 'TST010')

  results = [[[employeeRow]], [[{ department_id: 1 }]], [[{ position_id: 1 }]], [[]], [{ affectedRows: 1 }], [[employeeRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/employees/10`, { method: 'PUT', headers: auth(), body: JSON.stringify(payload) })
  assert.equal(response.status, 200)

  results = [[[employeeRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/employees/10/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'inactive' }) })
  assert.equal(response.status, 200)
})

test('department list/get/create/update/status and duplicate validation', async () => {
  pool.execute = async () => [[departmentRow]]
  let response = await fetch(`${baseUrl}/api/hr/departments`, { headers: auth() })
  assert.equal(response.status, 200)
  response = await fetch(`${baseUrl}/api/hr/departments/1`, { headers: auth() })
  assert.equal(response.status, 200)

  let results = [[[]], [{ insertId: 1 }], [[departmentRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/departments`, { method: 'POST', headers: auth(), body: JSON.stringify({ departmentName: 'IT', description: 'Tech', status: 'Active' }) })
  assert.equal(response.status, 201)

  results = [[[departmentRow]], [[]], [{ affectedRows: 1 }], [[departmentRow]]]
  pool.execute = async () => results.shift()
  response = await fetch(`${baseUrl}/api/hr/departments/1`, { method: 'PUT', headers: auth(), body: JSON.stringify({ departmentName: 'IT', description: 'Tech', status: 'Active' }) })
  assert.equal(response.status, 200)

  results = [[[departmentRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/departments/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)

  pool.execute = async () => [[{ department_id: 2 }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/departments`, { method: 'POST', headers: auth(), body: JSON.stringify({ departmentName: 'IT', status: 'Active' }) })).status, 409)
})

test('position list/get/create/update/status, duplicate and 404 work', async () => {
  pool.execute = async () => [[positionRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { headers: auth() })).status, 200)
  let results = [[[]], [{ insertId: 1 }], [[positionRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { method: 'POST', headers: auth(), body: JSON.stringify({ positionName: 'Developer', status: 'Active' }) })).status, 201)
  pool.execute = async () => [[{ position_id: 2 }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions`, { method: 'POST', headers: auth(), body: JSON.stringify({ positionName: 'Developer', status: 'Active' }) })).status, 409)
  results = [[[positionRow]], [[]], [{ affectedRows: 1 }], [[positionRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1`, { method: 'PUT', headers: auth(), body: JSON.stringify({ positionName: 'Developer', status: 'Active' }) })).status, 200)
  results = [[[positionRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/positions/999`, { headers: auth() })).status, 404)
})

test('leave type list/get/create/update/status and validation work', async () => {
  pool.execute = async () => [[leaveTypeRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { headers: auth() })).status, 200)
  const invalid = { code: 'ANN', name: 'Annual Leave', description: 'Annual leave type', defaultDays: -1, minimumDays: 1, maximumDaysPerRequest: 5, status: 'Active' }
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify(invalid) })).status, 400)
  const valid = { ...invalid, defaultDays: 10 }
  let results = [[[]], [{ insertId: 1 }], [[leaveTypeRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 201)
  pool.execute = async () => [[{ leave_type_id: 2, leave_type_code: 'ANN', leave_type_name: 'Other' }]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 409)
  let updateResults = [[[leaveTypeRow]], [[]], [{ affectedRows: 1 }], [[leaveTypeRow]]]
  pool.execute = async () => updateResults.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1`, { method: 'PUT', headers: auth(), body: JSON.stringify(valid) })).status, 200)
  updateResults = [[[leaveTypeRow]], [{ affectedRows: 1 }]]
  pool.execute = async () => updateResults.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-types/1/status`, { method: 'PATCH', headers: auth(), body: JSON.stringify({ status: 'Inactive' }) })).status, 200)
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

test('leave entitlement list/get/create/update and validation work', async () => {
  pool.execute = async () => [[entitlementRow]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { headers: auth() })).status, 200)
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements/1`, { headers: auth() })).status, 200)
  const valid = { employeeId: 10, leaveTypeId: 1, year: 2026, totalDays: 10, usedDays: 2 }
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 400)
  let results = [[[{ employee_id: 10 }]], [[]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 400)
  results = [[[{ employee_id: 10 }]], [[{ leave_type_id: 1 }]], [[{ entitlement_id: 2 }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 409)
  results = [[[{ employee_id: 10 }]], [[{ leave_type_id: 1 }]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { method: 'POST', headers: auth(), body: JSON.stringify({ ...valid, usedDays: 11 }) })).status, 400)
  results = [[[{ employee_id: 10 }]], [[{ leave_type_id: 1 }]], [[]], [{ insertId: 1 }], [[entitlementRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements`, { method: 'POST', headers: auth(), body: JSON.stringify(valid) })).status, 201)
  results = [[[{ employee_id: 10 }]], [[{ leave_type_id: 1 }]], [[entitlementRow]], [[]], [{ affectedRows: 1 }], [[entitlementRow]]]
  pool.execute = async () => results.shift()
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements/1`, { method: 'PUT', headers: auth(), body: JSON.stringify(valid) })).status, 200)
  pool.execute = async () => [[]]
  assert.equal((await fetch(`${baseUrl}/api/hr/leave-entitlements/999`, { headers: auth() })).status, 404)
})
