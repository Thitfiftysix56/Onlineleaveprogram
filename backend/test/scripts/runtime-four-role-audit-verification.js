import { config as loadEnvironment } from 'dotenv'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'

loadEnvironment({ path: new URL('../../../.env', import.meta.url) })
process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3307'

const { expressApp } = await import('../../src/server.js')
const { pool: applicationPool } = await import('../../src/config/database.js')

const server = expressApp.listen(0, '127.0.0.1')
await new Promise((resolve, reject) => {
  server.once('listening', resolve)
  server.once('error', reject)
})

const baseUrl = `http://127.0.0.1:${server.address().port}/api`
const database = await mysql.createConnection({
  host: '127.0.0.1',
  port: 3307,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

const suffix = Date.now().toString(36).slice(-6).toUpperCase()
const testNames = {
  department: `TEST Department ${suffix}`,
  departmentUpdated: `TEST Department Updated ${suffix}`,
  position: `TEST Position ${suffix}`,
  positionUpdated: `TEST Position Updated ${suffix}`,
  leaveTypeCode: `TEST${suffix}`.slice(0, 10),
  leaveType: `TEST Leave Type ${suffix}`,
  leaveTypeUpdated: `TEST Leave Type Updated ${suffix}`,
  holiday: `TEST Holiday ${suffix}`,
  holidayUpdated: `TEST Holiday Updated ${suffix}`,
  temporaryHoliday: `TEST Temporary Holiday ${suffix}`,
}

const results = []
const created = {}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function token(user) {
  return jwt.sign({
    userId: user.user_id,
    employeeId: user.employee_id,
    roleName: user.role_name,
    role: String(user.role_name).toLowerCase(),
    tokenVersion: Number(user.token_version || 0),
    mustChangePassword: Boolean(user.must_change_password),
  }, process.env.JWT_SECRET, { expiresIn: '30m' })
}

async function api(user, method, path, body, expected = [200]) {
  const headers = { Authorization: `Bearer ${token(user)}` }
  let payload
  if (body instanceof FormData) payload = body
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  const response = await fetch(`${baseUrl}${path}`, { method, headers, body: payload })
  const json = await response.json().catch(() => ({}))
  if (!expected.includes(response.status)) {
    throw new Error(`${method} ${path}: expected ${expected.join('/')}, got ${response.status} (${json.message || 'no message'})`)
  }
  return json
}

function leaveForm(leaveTypeId, startDate, endDate, reason) {
  const form = new FormData()
  form.append('leaveTypeId', String(leaveTypeId))
  form.append('startDate', startDate)
  form.append('endDate', endDate)
  form.append('reason', reason)
  return form
}

async function step(name, task) {
  try {
    const value = await task()
    results.push({ name, status: 'PASS' })
    console.log('PASS', name)
    return value
  } catch (error) {
    results.push({ name, status: 'FAIL', detail: error.message })
    console.error('FAIL', name, error.message)
    throw error
  }
}

let failure = null
try {
  const [accounts] = await database.query(
    `SELECT u.user_id, u.employee_id, u.username, u.status, u.must_change_password,
            u.token_version, r.role_name
       FROM users u JOIN roles r ON r.role_id=u.role_id
      WHERE u.username IN ('employee001','supervisor001','hr001','admin001')`,
  )
  assert(accounts.length === 4, 'The four required accounts are not available.')
  assert(accounts.every((account) => account.status === 'active'), 'Every test account must be active.')
  const employee = accounts.find((account) => account.username === 'employee001')
  const supervisor = accounts.find((account) => account.username === 'supervisor001')
  const hr = accounts.find((account) => account.username === 'hr001')
  const admin = accounts.find((account) => account.username === 'admin001')

  await step('Admin Department management', async () => {
    const createdResponse = await api(admin, 'POST', '/hr/departments', {
      departmentName: testNames.department,
      description: `TEST department created for ${suffix}`,
      isActive: true,
    }, [201])
    created.departmentId = createdResponse.data.department.departmentId
    await api(admin, 'PUT', `/hr/departments/${created.departmentId}`, {
      departmentName: testNames.departmentUpdated,
      description: `TEST department updated for ${suffix}`,
      isActive: true,
    })
    await api(admin, 'PATCH', `/hr/departments/${created.departmentId}/status`, { status: 'Inactive' })
    await api(admin, 'PATCH', `/hr/departments/${created.departmentId}/status`, { status: 'Active' })
    const list = await api(admin, 'GET', '/hr/departments')
    assert(list.data.departments.some((item) => item.departmentId === created.departmentId), 'TEST department missing from list.')
  })

  await step('Admin Position management', async () => {
    const createdResponse = await api(admin, 'POST', '/hr/positions', {
      positionName: testNames.position,
      isActive: true,
    }, [201])
    created.positionId = createdResponse.data.position.positionId
    await api(admin, 'PUT', `/hr/positions/${created.positionId}`, {
      positionName: testNames.positionUpdated,
      isActive: true,
    })
    await api(admin, 'PATCH', `/hr/positions/${created.positionId}/status`, { status: 'Inactive' })
    await api(admin, 'PATCH', `/hr/positions/${created.positionId}/status`, { status: 'Active' })
    const list = await api(admin, 'GET', '/hr/positions')
    assert(list.data.positions.some((item) => item.positionId === created.positionId), 'TEST position missing from list.')
  })

  await step('HR Leave Type management', async () => {
    const body = {
      code: testNames.leaveTypeCode,
      name: testNames.leaveType,
      description: `TEST leave type created for ${suffix}`,
      defaultDays: 30,
      minimumDays: 1,
      maximumDaysPerRequest: 10,
      attachmentRule: 'never',
      attachmentRequired: false,
      isActive: true,
    }
    const createdResponse = await api(hr, 'POST', '/hr/leave-types', body, [201])
    created.leaveTypeId = createdResponse.data.leaveType.leaveTypeId
    await api(hr, 'PUT', `/hr/leave-types/${created.leaveTypeId}`, {
      ...body,
      name: testNames.leaveTypeUpdated,
      description: `TEST leave type updated for ${suffix}`,
    })
    await api(hr, 'PATCH', `/hr/leave-types/${created.leaveTypeId}/status`, { status: 'Inactive' })
    await api(hr, 'PATCH', `/hr/leave-types/${created.leaveTypeId}/status`, { status: 'Active' })
    const list = await api(hr, 'GET', '/hr/leave-types')
    assert(list.data.leaveTypes.some((item) => item.leaveTypeId === created.leaveTypeId), 'TEST leave type missing from list.')
  })

  await step('HR Holiday management', async () => {
    const createdResponse = await api(hr, 'POST', '/hr/holidays', {
      name: testNames.holiday,
      date: '2026-12-31',
      type: 'Company Holiday',
      description: `TEST holiday created for ${suffix}`,
      isActive: true,
    }, [201])
    created.holidayId = createdResponse.data.holiday.holidayId
    await api(hr, 'PUT', `/hr/holidays/${created.holidayId}`, {
      name: testNames.holidayUpdated,
      date: '2026-12-31',
      type: 'Company Holiday',
      description: `TEST holiday updated for ${suffix}`,
      isActive: true,
    })
    const temporary = await api(hr, 'POST', '/hr/holidays', {
      name: testNames.temporaryHoliday,
      date: '2026-12-30',
      type: 'Special Holiday',
      description: `TEST temporary holiday for ${suffix}`,
      isActive: true,
    }, [201])
    created.deletedHolidayId = temporary.data.holiday.holidayId
    await api(hr, 'DELETE', `/hr/holidays/${created.deletedHolidayId}`)
    const list = await api(hr, 'GET', '/hr/holidays?year=2026')
    assert(list.data.holidays.some((item) => item.holidayId === created.holidayId), 'TEST holiday missing from list.')
    assert(!list.data.holidays.some((item) => item.holidayId === created.deletedHolidayId), 'Deleted TEST holiday remains in list.')
  })

  await step('HR Employee management without creating an employee', async () => {
    const detail = await api(hr, 'GET', `/hr/employees/${employee.employee_id}`)
    const item = detail.data.employee
    await api(hr, 'PUT', `/hr/employees/${employee.employee_id}`, {
      employeeCode: item.employeeCode,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phone: item.phone || '',
      departmentId: item.departmentId,
      positionId: item.positionId,
      supervisorId: item.supervisorId,
      hireDate: String(item.hireDate).slice(0, 10),
      status: item.status,
    })
    const list = await api(hr, 'GET', '/hr/employees')
    assert(list.data.employees.some((record) => record.employeeId === employee.employee_id), 'employee001 missing from HR employee list.')
  })

  await step('HR Leave Entitlement management', async () => {
    const employeeEntitlement = await api(hr, 'POST', '/hr/leave-entitlements', {
      employeeId: employee.employee_id,
      leaveTypeId: created.leaveTypeId,
      year: 2026,
      totalDays: 30,
      usedDays: 0,
    }, [201])
    created.employeeEntitlementId = employeeEntitlement.data.leaveEntitlement.entitlementId
    const supervisorEntitlement = await api(hr, 'POST', '/hr/leave-entitlements', {
      employeeId: supervisor.employee_id,
      leaveTypeId: created.leaveTypeId,
      year: 2026,
      totalDays: 30,
      usedDays: 0,
    }, [201])
    created.supervisorEntitlementId = supervisorEntitlement.data.leaveEntitlement.entitlementId
    await api(hr, 'PUT', `/hr/leave-entitlements/${created.employeeEntitlementId}`, {
      employeeId: employee.employee_id,
      leaveTypeId: created.leaveTypeId,
      year: 2026,
      totalDays: 35,
      usedDays: 0,
    })
    const list = await api(hr, 'GET', `/hr/leave-entitlements?leaveType=${created.leaveTypeId}&year=2026`)
    assert(list.data.leaveEntitlements.length === 2, 'Expected TEST entitlements for employee and supervisor.')
  })

  await step('Admin User management without creating an account', async () => {
    const detail = await api(admin, 'GET', `/admin/users/${employee.user_id}`)
    const item = detail.user
    await api(admin, 'PUT', `/admin/users/${employee.user_id}`, {
      username: item.username,
      role: item.roleName,
      status: item.status,
    })
    await api(admin, 'PATCH', `/admin/users/${employee.user_id}/status`, { status: 'active' })
    const list = await api(admin, 'GET', '/admin/users')
    assert(list.users.length === 4, 'User Management must still contain exactly four accounts.')
  })

  let cancelledRequest
  await step('Employee Draft Edit Submit Cancel My Requests Detail Notification', async () => {
    const draftResponse = await api(employee, 'POST', '/leave/requests/drafts', leaveForm(
      created.leaveTypeId, '2026-10-05', '2026-10-05', 'TEST employee draft request',
    ), [201])
    const draft = draftResponse.data.leaveRequest
    created.employeeDraftRequestId = draft.id
    const editedResponse = await api(employee, 'PUT', `/leave/requests/${draft.id}/draft`, leaveForm(
      created.leaveTypeId, '2026-10-06', '2026-10-06', 'TEST employee edited draft',
    ))
    assert(editedResponse.data.leaveRequest.reason.includes('edited'), 'Draft edit was not persisted.')
    const draftDetail = await api(employee, 'GET', `/leave/requests/${draft.id}`)
    assert(draftDetail.data.leaveRequest.id === draft.id, 'Draft detail failed.')
    const submitted = await api(employee, 'POST', `/leave/requests/${draft.id}/submit`, leaveForm(
      created.leaveTypeId, '2026-10-06', '2026-10-06', 'TEST employee submitted request',
    ))
    assert(submitted.data.leaveRequest.status === 'pending', 'Edited draft was not submitted.')
    await api(employee, 'PATCH', `/leave/requests/${draft.id}/cancel`)
    cancelledRequest = (await api(employee, 'GET', `/leave/requests/${draft.id}`)).data.leaveRequest
    assert(cancelledRequest.status === 'cancelled', 'Pending request was not cancelled.')
    const own = await api(employee, 'GET', '/leave/requests')
    assert(own.data.leaveRequests.some((request) => request.id === draft.id), 'Cancelled request missing from My Requests.')
    const supervisorNotifications = await api(supervisor, 'GET', '/notifications')
    assert(supervisorNotifications.data.notifications.some((item) => item.leaveRequestId === draft.id), 'Supervisor submit notification missing.')
  })

  let approvedEmployeeRequest
  let rejectedEmployeeRequest
  await step('Supervisor sees employee001 and Approves or Rejects', async () => {
    approvedEmployeeRequest = (await api(employee, 'POST', '/leave/requests/submit', leaveForm(
      created.leaveTypeId, '2026-10-07', '2026-10-07', 'TEST employee approval request',
    ), [201])).data.leaveRequest
    rejectedEmployeeRequest = (await api(employee, 'POST', '/leave/requests/submit', leaveForm(
      created.leaveTypeId, '2026-10-08', '2026-10-08', 'TEST employee rejection request',
    ), [201])).data.leaveRequest
    created.employeeApprovedRequestId = approvedEmployeeRequest.id
    created.employeeRejectedRequestId = rejectedEmployeeRequest.id
    const inbox = await api(supervisor, 'GET', '/supervisor/approvals')
    assert(inbox.data.leaveRequests.some((item) => item.id === approvedEmployeeRequest.id), 'Approval request missing from supervisor inbox.')
    assert(inbox.data.leaveRequests.some((item) => item.id === rejectedEmployeeRequest.id), 'Rejection request missing from supervisor inbox.')
    await api(supervisor, 'GET', `/supervisor/approvals/${approvedEmployeeRequest.id}`)
    await api(supervisor, 'POST', `/supervisor/approvals/${approvedEmployeeRequest.id}/decision`, { decision: 'approved' })
    await api(supervisor, 'POST', `/supervisor/approvals/${rejectedEmployeeRequest.id}/decision`, {
      decision: 'rejected',
      reason: 'TEST supervisor rejection reason',
    })
    const approvedDetail = await api(employee, 'GET', `/leave/requests/${approvedEmployeeRequest.id}`)
    const rejectedDetail = await api(employee, 'GET', `/leave/requests/${rejectedEmployeeRequest.id}`)
    assert(approvedDetail.data.leaveRequest.status === 'approved', 'Supervisor approval did not persist.')
    assert(rejectedDetail.data.leaveRequest.status === 'rejected', 'Supervisor rejection did not persist.')
    const notifications = await api(employee, 'GET', '/notifications')
    assert(notifications.data.notifications.some((item) => item.leaveRequestId === approvedEmployeeRequest.id && item.type === 'leave-approved'), 'Employee approval notification missing.')
    assert(notifications.data.notifications.some((item) => item.leaveRequestId === rejectedEmployeeRequest.id && item.type === 'leave-rejected'), 'Employee rejection notification missing.')
  })

  await step('Supervisor Team Report', async () => {
    const report = await api(supervisor, 'GET', `/supervisor/team-report?leaveTypeId=${created.leaveTypeId}&startDate=2026-10-01&endDate=2026-10-31`)
    const ids = report.data.leaveRequests.map((item) => item.id)
    assert(ids.includes(approvedEmployeeRequest.id), 'Approved employee request missing from Team Report.')
    assert(ids.includes(rejectedEmployeeRequest.id), 'Rejected employee request missing from Team Report.')
    assert(ids.includes(cancelledRequest.id), 'Cancelled employee request missing from Team Report.')
  })

  let approvedSupervisorRequest
  let rejectedSupervisorRequest
  await step('Supervisor own requests visible to HR with Approve or Reject', async () => {
    approvedSupervisorRequest = (await api(supervisor, 'POST', '/leave/requests/submit', leaveForm(
      created.leaveTypeId, '2026-10-12', '2026-10-12', 'TEST supervisor approval request',
    ), [201])).data.leaveRequest
    rejectedSupervisorRequest = (await api(supervisor, 'POST', '/leave/requests/submit', leaveForm(
      created.leaveTypeId, '2026-10-13', '2026-10-13', 'TEST supervisor rejection request',
    ), [201])).data.leaveRequest
    created.supervisorApprovedRequestId = approvedSupervisorRequest.id
    created.supervisorRejectedRequestId = rejectedSupervisorRequest.id
    const inbox = await api(hr, 'GET', '/hr/approvals')
    assert(inbox.data.leaveRequests.some((item) => item.id === approvedSupervisorRequest.id), 'Supervisor approval request missing from HR inbox.')
    assert(inbox.data.leaveRequests.some((item) => item.id === rejectedSupervisorRequest.id), 'Supervisor rejection request missing from HR inbox.')
    await api(hr, 'GET', `/hr/approvals/${approvedSupervisorRequest.id}`)
    await api(hr, 'POST', `/hr/approvals/${approvedSupervisorRequest.id}/decision`, { decision: 'approved' })
    await api(hr, 'POST', `/hr/approvals/${rejectedSupervisorRequest.id}/decision`, {
      decision: 'rejected',
      reason: 'TEST hr rejection reason',
    })
    const notifications = await api(supervisor, 'GET', '/notifications')
    assert(notifications.data.notifications.some((item) => item.leaveRequestId === approvedSupervisorRequest.id && item.type === 'leave-approved'), 'Supervisor approval notification missing.')
    assert(notifications.data.notifications.some((item) => item.leaveRequestId === rejectedSupervisorRequest.id && item.type === 'leave-rejected'), 'Supervisor rejection notification missing.')
  })

  await step('HR Leave Report', async () => {
    const report = await api(hr, 'GET', `/reports/leave-requests?leaveTypeId=${created.leaveTypeId}`)
    const ids = report.data.leaveRequests.map((item) => item.id)
    for (const id of [
      created.employeeDraftRequestId,
      created.employeeApprovedRequestId,
      created.employeeRejectedRequestId,
      created.supervisorApprovedRequestId,
      created.supervisorRejectedRequestId,
    ]) assert(ids.includes(id), `Request ${id} missing from HR report.`)
  })

  await step('Audit Log coverage and Admin list', async () => {
    const failedLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: `TEST_LOGIN_${suffix}`, password: 'NotARealPassword1!' }),
    })
    assert(failedLogin.status === 401, 'Audit login-failure probe must return 401.')
    const auditResponse = await api(admin, 'GET', '/admin/audit-logs')
    const logs = auditResponse.data.auditLogs
    const actions = new Set(logs.map((item) => item.action))
    const expectedActions = [
      'create_department', 'update_department', 'update_department_status',
      'create_position', 'update_position', 'update_position_status',
      'create_leave_type', 'update_leave_type', 'update_leave_type_status',
      'create_holiday', 'update_holiday', 'delete_holiday',
      'update_employee', 'create_leave_entitlement', 'update_leave_entitlement',
      'update_user', 'update_user_status', 'save_leave_draft', 'submit_leave',
      'cancel_leave', 'leave_approved', 'leave_rejected', 'login_failed',
    ]
    const missing = expectedActions.filter((action) => !actions.has(action))
    assert(missing.length === 0, `Audit actions missing: ${missing.join(', ')}`)
    const leakedSecret = logs.some((item) => String(item.detail || '').includes('NotARealPassword1!'))
    assert(!leakedSecret, 'Audit detail contains the test password.')
    created.auditActions = [...actions].sort()
    created.auditLogCount = logs.length
  })

  const [[accountCount]] = await database.query('SELECT COUNT(*) count FROM users')
  const [[employeeCount]] = await database.query('SELECT COUNT(*) count FROM employees')
  assert(Number(accountCount.count) === 4, 'A TEST user account was unexpectedly created.')
  assert(Number(employeeCount.count) === 4, 'A TEST employee was unexpectedly created.')
} catch (error) {
  failure = error
} finally {
  const [testDepartments] = await database.query("SELECT department_id,department_name,is_active FROM departments WHERE department_name LIKE 'TEST%'")
  const [testPositions] = await database.query("SELECT position_id,position_name,is_active FROM positions WHERE position_name LIKE 'TEST%'")
  const [testLeaveTypes] = await database.query("SELECT leave_type_id,leave_type_code,leave_type_name,is_active FROM leave_types WHERE leave_type_code LIKE 'TEST%' OR leave_type_name LIKE 'TEST%'")
  const [testHolidays] = await database.query("SELECT holiday_id,holiday_name,holiday_date,is_active FROM holidays WHERE holiday_name LIKE 'TEST%'")
  const [testEntitlements] = await database.query(
    "SELECT le.entitlement_id,e.employee_code,lt.leave_type_code,le.year,le.total_days,le.used_days FROM leave_entitlements le JOIN employees e ON e.employee_id=le.employee_id JOIN leave_types lt ON lt.leave_type_id=le.leave_type_id WHERE lt.leave_type_code LIKE 'TEST%'",
  )
  const [testRequests] = await database.query(
    "SELECT lr.leave_request_id,lr.request_no,e.employee_code,lr.status,lr.leave_days FROM leave_requests lr JOIN employees e ON e.employee_id=lr.employee_id WHERE lr.reason LIKE 'TEST%' ORDER BY lr.leave_request_id",
  )
  const [auditCounts] = await database.query(
    "SELECT action,COUNT(*) count FROM audit_logs GROUP BY action ORDER BY action",
  )
  console.log('RUNTIME_SUMMARY', JSON.stringify({
    results,
    created,
    persistedTestData: {
      departments: testDepartments,
      positions: testPositions,
      leaveTypes: testLeaveTypes,
      holidays: testHolidays,
      entitlements: testEntitlements,
      leaveRequests: testRequests,
    },
    auditCounts,
  }, null, 2))
  await database.end()
  await new Promise((resolve) => server.close(resolve))
  await applicationPool.end()
}

if (failure) {
  console.error('RUNTIME_RESULT FAIL', failure.message)
  process.exit(1)
}
console.log('RUNTIME_RESULT PASS')
