import { expect, test } from '@playwright/test'
import { apiLogin } from './helpers.js'

async function body(response, expected = [200]) {
  const payload = await response.json().catch(() => ({}))
  expect(expected, `${response.url()} -> ${response.status()} ${payload.message || ''}`).toContain(response.status())
  return payload
}

test('Admin and HR management CRUD generates complete audit evidence', async ({ playwright, baseURL }) => {
  test.setTimeout(90_000)
  const admin = await apiLogin(playwright, baseURL, 'admin')
  const hr = await apiLogin(playwright, baseURL, 'hr')
  const suffix = Date.now().toString(36).slice(-6).toUpperCase()
  const created = {}

  try {
    await test.step('Admin department create, update, status, list and delete', async () => {
      const createdPayload = await body(await admin.post('/api/hr/departments', { data: {
        departmentName: `Playwright Department ${suffix}`,
        description: 'Playwright management verification', isActive: true,
      } }), [201])
      created.department = createdPayload.data.department.departmentId
      await body(await admin.put(`/api/hr/departments/${created.department}`, { data: {
        departmentName: `Playwright Department Updated ${suffix}`,
        description: 'Playwright updated verification', isActive: true,
      } }))
      await body(await admin.patch(`/api/hr/departments/${created.department}/status`, { data: { status: 'Inactive' } }))
      const list = (await body(await admin.get('/api/hr/departments'))).data.departments
      expect(list.some((item) => item.departmentId === created.department)).toBeTruthy()
      await body(await admin.delete(`/api/hr/departments/${created.department}`))
      created.department = null
    })

    await test.step('Admin position create, update, status, list and delete', async () => {
      const createdPayload = await body(await admin.post('/api/hr/positions', { data: {
        positionName: `Playwright Position ${suffix}`, isActive: true,
      } }), [201])
      created.position = createdPayload.data.position.positionId
      await body(await admin.put(`/api/hr/positions/${created.position}`, { data: {
        positionName: `Playwright Position Updated ${suffix}`, isActive: true,
      } }))
      await body(await admin.patch(`/api/hr/positions/${created.position}/status`, { data: { status: 'Inactive' } }))
      const list = (await body(await admin.get('/api/hr/positions'))).data.positions
      expect(list.some((item) => item.positionId === created.position)).toBeTruthy()
      await body(await admin.delete(`/api/hr/positions/${created.position}`))
      created.position = null
    })

    await test.step('HR leave type create, update, entitlement generation, status and delete', async () => {
      const base = {
        code: `PW${suffix}`.slice(0, 10), name: `Playwright Leave ${suffix}`,
        description: 'Playwright leave type verification', defaultDays: 4,
        minimumDays: 1, maximumDaysPerRequest: 2, attachmentRule: 'never',
        attachmentRequired: false, isActive: true,
      }
      const createdPayload = await body(await hr.post('/api/hr/leave-types', { data: base }), [201])
      created.leaveType = createdPayload.data.leaveType.leaveTypeId
      await body(await hr.put(`/api/hr/leave-types/${created.leaveType}`, { data: {
        ...base, name: `Playwright Leave Updated ${suffix}`,
      } }))
      const entitlements = (await body(await hr.get(`/api/hr/leave-entitlements?leaveType=${created.leaveType}`))).data.leaveEntitlements
      expect(entitlements.length).toBeGreaterThanOrEqual(4)
      expect(entitlements.every((item) => Number(item.totalDays) === 4)).toBeTruthy()
      await body(await hr.patch(`/api/hr/leave-types/${created.leaveType}/status`, { data: { status: 'Inactive' } }))
      await body(await hr.delete(`/api/hr/leave-types/${created.leaveType}`))
      created.leaveType = null
    })

    await test.step('HR holiday create, update, list and delete', async () => {
      const createdPayload = await body(await hr.post('/api/hr/holidays', { data: {
        name: `Playwright Holiday ${suffix}`, date: '2026-11-18', type: 'Company Holiday',
        description: 'Playwright holiday verification', isActive: true,
      } }), [201])
      created.holiday = createdPayload.data.holiday.holidayId
      await body(await hr.put(`/api/hr/holidays/${created.holiday}`, { data: {
        name: `Playwright Holiday Updated ${suffix}`, date: '2026-11-18', type: 'Special Holiday',
        description: 'Playwright updated holiday verification', isActive: true,
      } }))
      const list = (await body(await hr.get('/api/hr/holidays?year=2026'))).data.holidays
      expect(list.some((item) => item.holidayId === created.holiday)).toBeTruthy()
      await body(await hr.delete(`/api/hr/holidays/${created.holiday}`))
      created.holiday = null
    })

    await test.step('Role-specific directories and audit actions are complete', async () => {
      const users = await body(await admin.get('/api/admin/users'))
      expect(users.users.length).toBeGreaterThanOrEqual(4)
      const employees = (await body(await hr.get('/api/hr/employees'))).data.employees
      expect(employees.length).toBeGreaterThanOrEqual(4)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const logs = (await body(await admin.get('/api/admin/audit-logs'))).data.auditLogs
      const actions = new Set(logs.map((item) => item.action))
      for (const action of [
        'create_department', 'update_department', 'update_department_status', 'delete_department',
        'create_position', 'update_position', 'update_position_status', 'delete_position',
        'create_leave_type', 'update_leave_type', 'update_leave_type_status', 'delete_leave_type',
        'create_holiday', 'update_holiday', 'delete_holiday',
      ]) expect(actions, `Missing ${action}`).toContain(action)
    })
  } finally {
    if (created.holiday) await hr.delete(`/api/hr/holidays/${created.holiday}`)
    if (created.leaveType) {
      await hr.patch(`/api/hr/leave-types/${created.leaveType}/status`, { data: { status: 'Inactive' } })
      await hr.delete(`/api/hr/leave-types/${created.leaveType}`)
    }
    if (created.position) {
      await admin.patch(`/api/hr/positions/${created.position}/status`, { data: { status: 'Inactive' } })
      await admin.delete(`/api/hr/positions/${created.position}`)
    }
    if (created.department) {
      await admin.patch(`/api/hr/departments/${created.department}/status`, { data: { status: 'Inactive' } })
      await admin.delete(`/api/hr/departments/${created.department}`)
    }
    await admin.dispose()
    await hr.dispose()
  }
})
