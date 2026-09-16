import { expect, test } from '@playwright/test'
import {
  accounts, apiLogin, expectHealthyPage, monitorPage, roleRoutes, uiLogin,
} from './helpers.js'

test.describe('Authentication and role UI coverage', () => {
  test('protected route redirects an anonymous user to login', async ({ page }) => {
    await page.goto('/admin/audit-log')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('invalid credentials are rejected without a server error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('ชื่อผู้ใช้').fill('__unknown_e2e_user__')
    await page.locator('#password').fill('WrongPassword123!')
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText(/ไม่ถูกต้อง/)
    await expect(page).toHaveURL(/\/login$/)
  })

  for (const role of Object.keys(accounts)) {
    test(`${role}: login and every routed page render without runtime/5xx errors`, async ({ page }) => {
      const problems = monitorPage(page)
      await uiLogin(page, role)
      for (const route of roleRoutes[role]) {
        await test.step(route, async () => {
          problems.length = 0
          await page.goto(route)
          await expect(page).toHaveURL(new RegExp(`${route.replaceAll('/', '\\/')}$`))
          await expectHealthyPage(page, problems)
        })
      }
    })

    test(`${role}: cannot open another role's protected UI`, async ({ page }) => {
      await uiLogin(page, role)
      const forbiddenRole = role === 'admin' ? 'hr' : 'admin'
      await page.goto(`/${forbiddenRole}/dashboard`)
      await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`))
    })
  }
})

test.describe('API authorization matrix', () => {
  const common = ['/api/profile', '/api/leave/options', '/api/leave/requests', '/api/leave/balance', '/api/notifications']
  const privileged = {
    employee: { allow: [], deny: ['/api/supervisor/approvals', '/api/hr/employees', '/api/admin/users', '/api/admin/audit-logs'] },
    supervisor: { allow: ['/api/supervisor/approvals', '/api/supervisor/team-report'], deny: ['/api/hr/employees', '/api/admin/users', '/api/admin/audit-logs'] },
    hr: { allow: ['/api/hr/approvals', '/api/hr/employees', '/api/hr/leave-types', '/api/hr/leave-entitlements', '/api/hr/holidays', '/api/reports/leave-requests'], deny: ['/api/admin/users', '/api/admin/audit-logs'] },
    admin: { allow: ['/api/hr/employees', '/api/hr/leave-types', '/api/hr/leave-entitlements', '/api/hr/holidays', '/api/reports/leave-requests', '/api/admin/users', '/api/admin/audit-logs'], deny: ['/api/hr/approvals', '/api/supervisor/approvals'] },
  }

  for (const role of Object.keys(accounts)) {
    test(`${role}: API permissions match the role contract`, async ({ playwright, baseURL }) => {
      const api = await apiLogin(playwright, baseURL, role)
      try {
        for (const path of [...common, ...privileged[role].allow]) {
          const response = await api.get(path)
          expect(response.status(), `${role} should access ${path}: ${await response.text()}`).toBe(200)
        }
        for (const path of privileged[role].deny) {
          const response = await api.get(path)
          expect([401, 403], `${role} should not access ${path}: ${await response.text()}`).toContain(response.status())
        }
      } finally {
        await api.dispose()
      }
    })
  }
})
