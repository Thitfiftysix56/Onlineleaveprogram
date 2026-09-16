import { expect } from '@playwright/test'

export const PASSWORD = process.env.E2E_PASSWORD || 'Password123!'

export const accounts = {
  employee: 'employee001',
  supervisor: 'supervisor001',
  hr: 'hr001',
  admin: 'admin001',
}

export const roleRoutes = {
  employee: [
    '/employee/dashboard', '/employee/leave-request', '/employee/my-requests',
    '/employee/notifications', '/employee/profile',
    '/employee/edit-personal-information', '/employee/change-password',
  ],
  supervisor: [
    '/supervisor/dashboard', '/supervisor/leave-request', '/supervisor/my-requests',
    '/supervisor/approval', '/supervisor/team-reports', '/supervisor/notifications',
    '/supervisor/profile', '/supervisor/edit-personal-information',
    '/supervisor/change-password',
  ],
  hr: [
    '/hr/dashboard', '/hr/leave-request', '/hr/my-requests', '/hr/approval',
    '/hr/employee-management', '/hr/employee-management/add',
    '/hr/leave-entitlement', '/hr/leave-types', '/hr/leave-types/add',
    '/hr/holiday-management', '/hr/reports', '/hr/notifications', '/hr/profile',
    '/hr/edit-personal-information', '/hr/change-password',
  ],
  admin: [
    '/admin/dashboard', '/admin/leave-request', '/admin/my-requests',
    '/admin/user-management', '/admin/user-management/add',
    '/admin/department-management', '/admin/department-management/add',
    '/admin/position-management', '/admin/position-management/add',
    '/admin/audit-log', '/admin/notifications', '/admin/profile',
    '/admin/edit-personal-information', '/admin/change-password',
  ],
}

export async function uiLogin(page, role) {
  await page.goto('/login')
  await page.getByLabel('ชื่อผู้ใช้').fill(accounts[role])
  await page.locator('#password').fill(PASSWORD)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`))
}

export async function apiLogin(playwright, baseURL, role) {
  const context = await playwright.request.newContext({ baseURL })
  const response = await context.post('/api/auth/login', {
    data: { login: accounts[role], password: PASSWORD },
  })
  expect(response.status(), await response.text()).toBe(200)
  return context
}

export function monitorPage(page) {
  const problems = []
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    // React 19 reports MUI system-prop forwarding as a console warning. Track it
    // in the audit report, but do not confuse this non-fatal rendering warning
    // with a page crash or an application/API failure.
    if (message.type() === 'error' && !message.text().includes('React does not recognize the `%s` prop')) {
      problems.push(`console: ${message.text()}`)
    }
  })
  page.on('requestfailed', (request) => {
    problems.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`)
  })
  page.on('response', (response) => {
    if (response.status() >= 500) problems.push(`HTTP ${response.status()}: ${response.url()}`)
  })
  return problems
}

export async function expectHealthyPage(page, problems) {
  await expect(page.locator('body')).toBeVisible()
  await expect(page.locator('body')).not.toContainText('Unknown column')
  await expect(page.locator('body')).not.toContainText('Internal server error')
  await expect(page.locator('body')).not.toContainText('Something went wrong')
  expect(problems).toEqual([])
}
