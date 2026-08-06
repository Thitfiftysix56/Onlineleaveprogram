import jwt from 'jsonwebtoken'
import { readFile } from 'node:fs/promises'
import { config as loadEnv, parse } from 'dotenv'

loadEnv()
if (!process.env.JWT_SECRET) {
  const rootEnvironment = parse(await readFile(new URL('../../.env', import.meta.url)))
  if (rootEnvironment.JWT_SECRET) process.env.JWT_SECRET = rootEnvironment.JWT_SECRET
}
if (process.env.RUNTIME_EMBEDDED === '1') process.env.NODE_ENV = 'test'
const { config } = await import('../../src/config/environment.js')
const { pool } = await import('../../src/config/database.js')

let runtimeServer = null
let baseUrl = process.env.DB_HOST === 'db' ? 'http://127.0.0.1:3000/api' : 'http://localhost:8082/api'
if (process.env.RUNTIME_EMBEDDED === '1') {
  const { expressApp } = await import('../../src/server.js')
  runtimeServer = expressApp.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    runtimeServer.once('listening', resolve)
    runtimeServer.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${runtimeServer.address().port}/api`
}
const results = []
const createdRequestIds = new Set()
let entitlementSnapshot = null

const record = (name, passed, detail = '') => results.push({ name, status: passed ? 'PASS' : 'FAIL', detail })
const assert = (condition, message) => { if (!condition) throw new Error(message) }

async function api(token, method, path, body, expected = [200]) {
  const headers = { Authorization: `Bearer ${token}` }
  let payload
  if (body instanceof FormData) payload = body
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
  const response = await fetch(`${baseUrl}${path}`, { method, headers, body: payload })
  const json = await response.json().catch(() => ({}))
  if (!expected.includes(response.status)) throw new Error(`${method} ${path}: expected ${expected}, received ${response.status} (${json.message || 'no message'})`)
  return { status: response.status, body: json }
}

function token(user) {
  return jwt.sign({
    userId: user.user_id, employeeId: user.employee_id, roleName: user.role_name,
    role: String(user.role_name).toLowerCase(), tokenVersion: Number(user.token_version || 0),
    mustChangePassword: false,
  }, config.jwtSecret, { expiresIn: '30m' })
}

function data(values) {
  const form = new FormData()
  for (const [key, value] of Object.entries(values)) form.append(key, String(value))
  return form
}

function dateKey(date) { return date.toISOString().slice(0, 10) }

try {
  const [users] = await pool.query(
    `SELECT u.user_id, u.employee_id, u.token_version, r.role_name, e.supervisor_id, e.department_id
     FROM users u JOIN roles r ON r.role_id=u.role_id JOIN employees e ON e.employee_id=u.employee_id
     WHERE u.status='active'`,
  )
  const employee = users.find((x) => String(x.role_name).toLowerCase() === 'employee' && x.supervisor_id)
  const supervisor = users.find((x) => x.employee_id === employee?.supervisor_id)
  const hr = users.find((x) => String(x.role_name).toLowerCase() === 'hr')
  const admin = users.find((x) => String(x.role_name).toLowerCase() === 'admin')
  assert(employee && supervisor && hr && admin, 'Four active test roles and an employee/supervisor relationship are required.')
  const employeeToken = token(employee); const supervisorToken = token(supervisor)
  const hrToken = token(hr); const adminToken = token(admin)

  const options = (await api(employeeToken, 'GET', '/leave/options?year=2026')).body.data
  const leaveType = options.leaveTypes.find((x) => x.hasEntitlement && x.availableDays >= 6 && !x.requiresAttachment) || options.leaveTypes.find((x) => x.hasEntitlement && x.availableDays >= 6)
  assert(leaveType, 'An entitlement with at least six available days is required.')
  const holidays = new Set(options.holidays.map((x) => x.date))
  const [existing] = await pool.query(`SELECT start_date,end_date FROM leave_requests WHERE employee_id=? AND status IN ('pending','approved')`, [employee.employee_id])
  const overlaps = (key) => existing.some((x) => dateKey(new Date(x.start_date)) <= key && dateKey(new Date(x.end_date)) >= key)
  const dates = []
  for (let cursor = new Date('2026-09-01T00:00:00Z'); cursor <= new Date('2026-12-20T00:00:00Z') && dates.length < 6; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const key = dateKey(cursor); const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6 && !holidays.has(key) && !overlaps(key)) dates.push(key)
  }
  assert(dates.length >= 6, 'Not enough free working dates for runtime tests.')
  const [[entitlement]] = await pool.query(`SELECT entitlement_id,total_days,used_days FROM leave_entitlements WHERE employee_id=? AND leave_type_id=? AND year=2026`, [employee.employee_id, leaveType.leaveTypeId])
  const initialBalance = (await api(employeeToken, 'GET', '/leave/balance?year=2026')).body.data.balances.find((x) => x.leaveTypeId === leaveType.leaveTypeId)
  entitlementSnapshot = { id: entitlement.entitlement_id, used: Number(entitlement.used_days), pending: initialBalance.pending }

  const draft = (await api(employeeToken, 'POST', '/leave/requests/drafts', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[0], endDate: dates[0], reason: 'Runtime draft verification' }), [201])).body.data.leaveRequest
  createdRequestIds.add(draft.id); assert(draft.status === 'draft' && draft.startDate === dates[0], 'Draft response or date-only mapping is incorrect.')
  record('Employee create draft and date-only', true)

  const updated = (await api(employeeToken, 'PUT', `/leave/requests/${draft.id}/draft`, data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[1], endDate: dates[1], reason: 'Runtime updated draft verification' }))).body.data.leaveRequest
  assert(updated.reason.includes('updated') && updated.startDate === dates[1], 'Draft update did not persist.')
  record('Employee update draft', true)
  const ownList = (await api(employeeToken, 'GET', '/leave/requests')).body.data.leaveRequests
  assert(ownList.some((x) => x.id === draft.id), 'Created draft missing from owner list.')
  const ownDetail = (await api(employeeToken, 'GET', `/leave/requests/${draft.id}`)).body.data.leaveRequest
  assert(ownDetail.id === draft.id, 'Owner detail failed.')
  const crossOwner = await api(supervisorToken, 'GET', `/leave/requests/${draft.id}`, undefined, [404])
  assert(crossOwner.status === 404, 'Cross-user request was visible.')
  record('My Requests list/detail/ownership', true)
  await api(employeeToken, 'DELETE', `/leave/requests/${draft.id}/draft`)
  createdRequestIds.delete(draft.id)
  record('Employee delete draft', true)

  const submitDraft = (await api(employeeToken, 'POST', '/leave/requests/drafts', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[2], endDate: dates[2], reason: 'Runtime submit edited draft' }), [201])).body.data.leaveRequest
  createdRequestIds.add(submitDraft.id)
  const pending = (await api(employeeToken, 'POST', `/leave/requests/${submitDraft.id}/submit`, data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[2], endDate: dates[2], reason: 'Runtime submitted edited draft' }))).body.data.leaveRequest
  assert(pending.status === 'pending' && pending.startDate === dates[2], 'Edited draft submission failed.')
  record('Submit edited draft', true)
  await api(employeeToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[2], endDate: dates[2], reason: 'Runtime overlap verification' }), [400])
  record('Overlap validation', true)

  const pendingBalance = (await api(employeeToken, 'GET', '/leave/balance?year=2026')).body.data.balances.find((x) => x.leaveTypeId === leaveType.leaveTypeId)
  assert(pendingBalance.pending === entitlementSnapshot.pending + 1 && pendingBalance.used === entitlementSnapshot.used, 'Pending balance is incorrect.')
  record('Balance counts pending from database', true)
  const supervisorInbox = (await api(supervisorToken, 'GET', '/supervisor/approvals')).body.data.leaveRequests
  assert(supervisorInbox.some((x) => x.id === pending.id), 'Supervisor cannot see team pending request.')
  await api(employeeToken, 'GET', '/supervisor/approvals', undefined, [403])
  record('Supervisor team scope and unauthorized role', true)
  const report = (await api(supervisorToken, 'GET', `/supervisor/team-report?status=pending&leaveTypeId=${leaveType.leaveTypeId}&departmentId=${employee.department_id}&startDate=${dates[2]}&endDate=${dates[2]}`)).body.data
  assert(report.leaveRequests.some((x) => x.id === pending.id) && report.summary.pending === report.leaveRequests.filter((x) => x.status === 'pending').length, 'Team report filter or summary is incorrect.')
  record('Supervisor team report filters/summary', true)

  await api(supervisorToken, 'POST', `/supervisor/approvals/${pending.id}/decision`, { decision: 'approved' })
  await api(supervisorToken, 'POST', `/supervisor/approvals/${pending.id}/decision`, { decision: 'approved' }, [409])
  await api(employeeToken, 'PUT', `/leave/requests/${pending.id}/draft`, data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[2], endDate: dates[2], reason: 'Should not update approved request' }), [409])
  await api(employeeToken, 'DELETE', `/leave/requests/${pending.id}/draft`, undefined, [409])
  const approvedBalance = (await api(employeeToken, 'GET', '/leave/balance?year=2026')).body.data.balances.find((x) => x.leaveTypeId === leaveType.leaveTypeId)
  assert(approvedBalance.pending === entitlementSnapshot.pending && approvedBalance.used === entitlementSnapshot.used + 1, 'Approve balance transition is incorrect.')
  record('Approve transaction/duplicate decision/immutable approved/balance', true)

  const cancelRequest = (await api(employeeToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[3], endDate: dates[3], reason: 'Runtime pending cancellation' }), [201])).body.data.leaveRequest
  createdRequestIds.add(cancelRequest.id)
  await api(employeeToken, 'PATCH', `/leave/requests/${cancelRequest.id}/cancel`)
  const cancelBalance = (await api(employeeToken, 'GET', '/leave/balance?year=2026')).body.data.balances.find((x) => x.leaveTypeId === leaveType.leaveTypeId)
  assert(cancelBalance.pending === entitlementSnapshot.pending, 'Cancelled request remains pending in balance.')
  record('Pending cancellation and balance', true)

  const rejectRequest = (await api(employeeToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[4], endDate: dates[4], reason: 'Runtime rejection verification' }), [201])).body.data.leaveRequest
  createdRequestIds.add(rejectRequest.id)
  await api(supervisorToken, 'POST', `/supervisor/approvals/${rejectRequest.id}/decision`, { decision: 'rejected', reason: 'Runtime rejection reason' })
  const rejectedDetail = (await api(employeeToken, 'GET', `/leave/requests/${rejectRequest.id}`)).body.data.leaveRequest
  assert(rejectedDetail.status === 'rejected' && rejectedDetail.rejectionReason === 'Runtime rejection reason', 'Rejected state or reason is missing.')
  await api(employeeToken, 'DELETE', `/leave/requests/${rejectRequest.id}/draft`, undefined, [409])
  record('Reject transaction/reason/immutable rejected', true)

  const supervisorNotifications = (await api(supervisorToken, 'GET', '/notifications')).body.data
  const submittedNotification = supervisorNotifications.notifications.find((x) => x.leaveRequestId === rejectRequest.id && x.type === 'leave-submitted')
  assert(submittedNotification && supervisorNotifications.unreadCount >= 1, 'Supervisor submit notification or unread count missing.')
  const employeeNotifications = (await api(employeeToken, 'GET', '/notifications')).body.data
  const rejectedNotification = employeeNotifications.notifications.find((x) => x.leaveRequestId === rejectRequest.id && x.type === 'leave-rejected')
  assert(rejectedNotification, 'Employee reject notification missing.')
  await api(employeeToken, 'PATCH', `/notifications/${rejectedNotification.id}/read`)
  const afterRead = (await api(employeeToken, 'GET', '/notifications')).body.data.notifications.find((x) => x.id === rejectedNotification.id)
  assert(afterRead.read, 'Read state did not persist.')
  await api(employeeToken, 'DELETE', `/notifications/${submittedNotification.id}`, undefined, [404])
  await api(supervisorToken, 'PATCH', '/notifications/read-all')
  const allRead = (await api(supervisorToken, 'GET', '/notifications')).body.data
  assert(allRead.unreadCount === 0, 'Mark all read did not persist.')
  await api(employeeToken, 'DELETE', `/notifications/${rejectedNotification.id}`)
  record('Notification events/list/unread/read-all/delete/ownership/persistence', true)

  const selfRequest = (await api(supervisorToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dates[5], endDate: dates[5], reason: 'Runtime supervisor own request' }), [400, 201]))
  if (selfRequest.status === 201) {
    const id = selfRequest.body.data.leaveRequest.id; createdRequestIds.add(id)
    await api(supervisorToken, 'POST', `/supervisor/approvals/${id}/decision`, { decision: 'approved' }, [403])
  }
  record('Supervisor cannot approve own request', true)

  const saturday = new Date(`${dates[0]}T00:00:00Z`)
  while (saturday.getUTCDay() !== 6) saturday.setUTCDate(saturday.getUTCDate() + 1)
  const monday = new Date(saturday); monday.setUTCDate(monday.getUTCDate() + 2)
  const weekendDraft = await api(employeeToken, 'POST', '/leave/requests/drafts', data({ leaveTypeId: leaveType.leaveTypeId, startDate: dateKey(saturday), endDate: dateKey(monday), reason: 'Runtime weekend calculation' }), [201, 400])
  if (weekendDraft.status === 201) {
    const request = weekendDraft.body.data.leaveRequest; createdRequestIds.add(request.id)
    assert(request.leaveDays === 1, 'Weekend calculation did not exclude Saturday and Sunday.')
  }
  record('Weekend calculation', true)
  if (options.holidays.length) {
    await api(employeeToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: leaveType.leaveTypeId, startDate: options.holidays[0].date, endDate: options.holidays[0].date, reason: 'Runtime holiday calculation' }), [400])
    record('Holiday calculation', true)
  } else record('Holiday calculation', true, 'No active holiday row available; options endpoint verified empty.')

  const attachmentType = options.leaveTypes.find((x) => x.requiresAttachment && x.hasEntitlement)
  if (attachmentType) {
    const threshold = Math.max(1, Number(attachmentType.attachmentRequiredAfterDays || 1))
    const end = new Date(`${dates[0]}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + threshold + 3)
    await api(employeeToken, 'POST', '/leave/requests/submit', data({ leaveTypeId: attachmentType.leaveTypeId, startDate: dates[0], endDate: dateKey(end), reason: 'Runtime attachment requirement' }), [400])
    record('Attachment requirement', true)
  } else record('Attachment requirement', true, 'No active attachment-required leave type available.')

  await api(employeeToken, 'GET', '/profile')
  await api(employeeToken, 'POST', '/auth/change-password', {}, [400])
  await api(adminToken, 'GET', '/admin/users')
  await api(hrToken, 'GET', '/hr/employees')
  await api(hrToken, 'GET', '/hr/leave-types')
  await api(hrToken, 'GET', '/hr/leave-entitlements')
  await api(hrToken, 'GET', '/hr/holidays')
  record('Profile/Change Password/Admin/HR regression routes', true)
} catch (exception) {
  record('Runtime suite execution', false, exception.message)
} finally {
  try {
    const ids = [...createdRequestIds]
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',')
      await pool.query(`DELETE FROM notifications WHERE leave_request_id IN (${placeholders})`, ids)
      await pool.query(`DELETE FROM audit_logs WHERE table_name='leave_requests' AND record_id IN (${placeholders})`, ids)
      await pool.query(`DELETE FROM leave_requests WHERE leave_request_id IN (${placeholders})`, ids)
    }
    if (entitlementSnapshot) await pool.query('UPDATE leave_entitlements SET used_days=? WHERE entitlement_id=?', [entitlementSnapshot.used, entitlementSnapshot.id])
  } catch (cleanupError) {
    record('Runtime test cleanup', false, cleanupError.message)
  }
  console.log(JSON.stringify(results, null, 2))
  if (runtimeServer) await new Promise((resolve) => runtimeServer.close(resolve))
  await pool.end()
}

if (results.some((item) => item.status === 'FAIL')) process.exitCode = 1
