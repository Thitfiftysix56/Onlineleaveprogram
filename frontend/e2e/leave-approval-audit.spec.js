import { execFileSync } from 'node:child_process'
import { expect, test } from '@playwright/test'
import { apiLogin } from './helpers.js'

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

async function json(response, expected = [200]) {
  const body = await response.json().catch(() => ({}))
  expect(expected, `${response.url()} -> ${response.status()} ${body.message || ''}`).toContain(response.status())
  return body
}

async function leaveOptions(api) {
  return (await json(await api.get('/api/leave/options'))).data
}

async function findFreeDates(api, count) {
  const options = await leaveOptions(api)
  const own = (await json(await api.get('/api/leave/requests'))).data.leaveRequests
  const holidays = new Set(options.holidays.map((item) => item.date))
  const occupied = own.filter((item) => ['pending', 'approved'].includes(item.status))
  const selected = []
  const cursor = new Date()
  cursor.setUTCDate(cursor.getUTCDate() + 4)
  for (let attempts = 0; attempts < 300 && selected.length < count; attempts += 1) {
    const key = dateKey(cursor)
    const day = cursor.getUTCDay()
    const overlaps = occupied.some((item) => item.startDate <= key && item.endDate >= key)
    if (day !== 0 && day !== 6 && !holidays.has(key) && !overlaps) selected.push(key)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  expect(selected, 'Not enough free working dates in the entitlement year').toHaveLength(count)
  return { dates: selected, options }
}

function form(leaveTypeId, date, reason) {
  return { multipart: { leaveTypeId: String(leaveTypeId), startDate: date, endDate: date, reason } }
}

function cleanupDatabase(requestIds, balanceSnapshots) {
  if (!requestIds.length) return
  const ids = requestIds.map(Number).filter(Number.isInteger).join(',')
  const restores = balanceSnapshots.map((item) =>
    `UPDATE leave_entitlements SET used_days=${Number(item.used)} WHERE entitlement_id=${Number(item.id)}`,
  ).join('; ')
  const sql = [
    `DELETE FROM notifications WHERE leave_request_id IN (${ids})`,
    `DELETE FROM audit_logs WHERE table_name='leave_requests' AND record_id IN (${ids})`,
    `DELETE FROM leave_approval_logs WHERE leave_request_id IN (${ids})`,
    `DELETE FROM leave_request_attachments WHERE leave_request_id IN (${ids})`,
    `DELETE FROM leave_requests WHERE leave_request_id IN (${ids})`,
    restores,
  ].filter(Boolean).join('; ')
  execFileSync('docker', [
    'compose', 'exec', '-T', 'db', 'mariadb', '-uleave_app', '-pLeaveApp2026',
    'online_leave_approval_system', '-e', sql,
  ], { cwd: '..', stdio: 'pipe' })
}

test('complete leave lifecycle, approval routing, notifications and audit trail', async ({ playwright, baseURL }) => {
  test.setTimeout(120_000)
  const contexts = {}
  const createdIds = []
  const balances = []

  try {
    for (const role of ['employee', 'supervisor', 'hr', 'admin']) {
      contexts[role] = await apiLogin(playwright, baseURL, role)
    }

    const employeeData = await findFreeDates(contexts.employee, 4)
    const employeeType = employeeData.options.leaveTypes.find((item) =>
      item.hasEntitlement && !item.requiresAttachment && item.availableDays >= 2,
    )
    expect(employeeType, 'Employee needs an active non-attachment entitlement').toBeTruthy()
    const employeeBalance = (await json(await contexts.employee.get('/api/leave/balance'))).data.balances
      .find((item) => item.leaveTypeId === employeeType.leaveTypeId)
    balances.push({ id: employeeBalance.id, used: employeeBalance.used })

    await test.step('Employee creates, updates and deletes a draft', async () => {
      const draft = (await json(await contexts.employee.post('/api/leave/requests/drafts',
        form(employeeType.leaveTypeId, employeeData.dates[0], 'Employee draft verification')), [201])).data.leaveRequest
      createdIds.push(draft.id)
      const updated = (await json(await contexts.employee.put(`/api/leave/requests/${draft.id}/draft`,
        form(employeeType.leaveTypeId, employeeData.dates[0], 'Employee updated draft verification')))).data.leaveRequest
      expect(updated.reason).toContain('updated')
      await json(await contexts.employee.delete(`/api/leave/requests/${draft.id}/draft`))
      createdIds.splice(createdIds.indexOf(draft.id), 1)
    })

    await test.step('Employee submits and cancels a pending request', async () => {
      const item = (await json(await contexts.employee.post('/api/leave/requests/submit',
        form(employeeType.leaveTypeId, employeeData.dates[0], 'Employee cancellation verification')), [201])).data.leaveRequest
      createdIds.push(item.id)
      await json(await contexts.employee.patch(`/api/leave/requests/${item.id}/cancel`))
      const detail = (await json(await contexts.employee.get(`/api/leave/requests/${item.id}`))).data.leaveRequest
      expect(detail.status).toBe('cancelled')
    })

    let approved
    await test.step('Supervisor approves an Employee request', async () => {
      approved = (await json(await contexts.employee.post('/api/leave/requests/submit',
        form(employeeType.leaveTypeId, employeeData.dates[1], 'Employee approval verification')), [201])).data.leaveRequest
      createdIds.push(approved.id)
      const inbox = (await json(await contexts.supervisor.get('/api/supervisor/approvals'))).data.leaveRequests
      expect(inbox.some((item) => item.id === approved.id)).toBeTruthy()
      await json(await contexts.employee.post(`/api/supervisor/approvals/${approved.id}/decision`, { data: { decision: 'approved' } }), [403])
      await json(await contexts.supervisor.post(`/api/supervisor/approvals/${approved.id}/decision`, { data: { decision: 'approved' } }))
      const detail = (await json(await contexts.employee.get(`/api/leave/requests/${approved.id}`))).data.leaveRequest
      expect(detail.status).toBe('approved')
      await json(await contexts.supervisor.post(`/api/supervisor/approvals/${approved.id}/decision`, { data: { decision: 'approved' } }), [409])
    })

    let rejected
    await test.step('Supervisor rejection requires and stores a reason', async () => {
      rejected = (await json(await contexts.employee.post('/api/leave/requests/submit',
        form(employeeType.leaveTypeId, employeeData.dates[2], 'Employee rejection verification')), [201])).data.leaveRequest
      createdIds.push(rejected.id)
      await json(await contexts.supervisor.post(`/api/supervisor/approvals/${rejected.id}/decision`, { data: { decision: 'rejected' } }), [400])
      await json(await contexts.supervisor.post(`/api/supervisor/approvals/${rejected.id}/decision`, {
        data: { decision: 'rejected', reason: 'E2E supervisor rejection reason' },
      }))
      const detail = (await json(await contexts.employee.get(`/api/leave/requests/${rejected.id}`))).data.leaveRequest
      expect(detail.status).toBe('rejected')
      expect(detail.rejectionReason).toBe('E2E supervisor rejection reason')
    })

    let supervisorApproved
    await test.step('HR approves a Supervisor own request; Supervisor cannot self-approve', async () => {
      const supervisorData = await findFreeDates(contexts.supervisor, 1)
      const supervisorType = supervisorData.options.leaveTypes.find((item) =>
        item.hasEntitlement && !item.requiresAttachment && item.availableDays >= 1,
      )
      expect(supervisorType, 'Supervisor needs an active non-attachment entitlement').toBeTruthy()
      const supervisorBalance = (await json(await contexts.supervisor.get('/api/leave/balance'))).data.balances
        .find((item) => item.leaveTypeId === supervisorType.leaveTypeId)
      balances.push({ id: supervisorBalance.id, used: supervisorBalance.used })
      supervisorApproved = (await json(await contexts.supervisor.post('/api/leave/requests/submit',
        form(supervisorType.leaveTypeId, supervisorData.dates[0], 'Supervisor approval verification')), [201])).data.leaveRequest
      createdIds.push(supervisorApproved.id)
      await json(await contexts.supervisor.post(`/api/supervisor/approvals/${supervisorApproved.id}/decision`, { data: { decision: 'approved' } }), [403])
      const hrInbox = (await json(await contexts.hr.get('/api/hr/approvals'))).data.leaveRequests
      expect(hrInbox.some((item) => item.id === supervisorApproved.id)).toBeTruthy()
      await json(await contexts.hr.post(`/api/hr/approvals/${supervisorApproved.id}/decision`, { data: { decision: 'approved' } }))
      const detail = (await json(await contexts.supervisor.get(`/api/leave/requests/${supervisorApproved.id}`))).data.leaveRequest
      expect(detail.status).toBe('approved')
    })

    await test.step('Notifications and reports contain workflow records', async () => {
      const employeeNotifications = (await json(await contexts.employee.get('/api/notifications'))).data.notifications
      expect(employeeNotifications.some((item) => item.leaveRequestId === approved.id && item.type === 'leave-approved')).toBeTruthy()
      expect(employeeNotifications.some((item) => item.leaveRequestId === rejected.id && item.type === 'leave-rejected')).toBeTruthy()
      const supervisorNotifications = (await json(await contexts.supervisor.get('/api/notifications'))).data.notifications
      expect(supervisorNotifications.some((item) => item.leaveRequestId === supervisorApproved.id && item.type === 'leave-approved')).toBeTruthy()
      const team = (await json(await contexts.supervisor.get('/api/supervisor/team-report'))).data.leaveRequests
      expect(team.some((item) => item.id === approved.id)).toBeTruthy()
      const hrReport = (await json(await contexts.hr.get('/api/reports/leave-requests'))).data.leaveRequests
      expect(hrReport.some((item) => item.id === supervisorApproved.id)).toBeTruthy()
    })

    await test.step('Admin-only audit log records submit, cancel, approve and reject', async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const logs = (await json(await contexts.admin.get('/api/admin/audit-logs'))).data.auditLogs
      const related = logs.filter((item) => createdIds.includes(Number(item.recordId)))
      const actions = new Set(related.map((item) => item.action))
      for (const action of ['submit_leave', 'cancel_leave', 'leave_approved', 'leave_rejected']) {
        expect(actions, `Missing audit action ${action}`).toContain(action)
      }
      await json(await contexts.employee.get('/api/admin/audit-logs'), [403])
    })
  } finally {
    for (const context of Object.values(contexts)) await context.dispose()
    cleanupDatabase(createdIds, balances)
  }
})
