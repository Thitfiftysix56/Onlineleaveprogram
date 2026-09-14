import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../src/config/database.js'

const approvedMigrations = [
  '20260803_add_users_password_changed_at.sql',
  '20260804_add_employee_profile_image_url.sql',
  '20260804_add_hr_management_fields.sql',
  '20260804_add_password_reset_tables.sql',
  '20260804_add_users_must_change_password.sql',
  '20260805_add_leave_workflow.sql',
  '20260908_add_login_lockout.sql',
  '20260911_link_departments_divisions_positions.sql',
  '20260914_seed_organization_catalog.sql',
  '20260911_add_employee_intended_role.sql',
  '20260911_add_leave_request_year_allocations.sql',
  '20260911_sync_thailand_public_holidays_2026.sql',
]
const allowed = new Set(approvedMigrations)
const requested = process.argv.slice(2)
if (requested.some((name) => !allowed.has(name))) {
  throw new Error(`Pass only approved additive migrations: ${approvedMigrations.join(', ')}`)
}
const migrations = requested.length ? requested : approvedMigrations

const migrationChecks = {
  '20260911_link_departments_divisions_positions.sql': async () => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS column_count
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND ((table_name = 'departments' AND column_name = 'division_name')
            OR (table_name = 'positions' AND column_name IN ('department_id', 'position_group')))`,
    )
    return Number(rows[0]?.column_count) === 3
  },
  '20260911_add_employee_intended_role.sql': async () => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS column_count
         FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'employees'
          AND column_name = 'intended_role_id'`,
    )
    return Number(rows[0]?.column_count) === 1
  },
  '20260914_seed_organization_catalog.sql': async () => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS department_count
         FROM departments
        WHERE (department_name, division_name) IN (
          ('Information Technology', 'Development'),
          ('Information Technology', 'Infrastructure'),
          ('Information Technology', 'IT Support'),
          ('Information Technology', 'Cybersecurity'),
          ('Human Resources', 'Recruitment'),
          ('Human Resources', 'Employee Relations'),
          ('Human Resources', 'Payroll and Benefits'),
          ('Human Resources', 'Training and Development'),
          ('Finance', 'Accounting'),
          ('Finance', 'Financial Planning'),
          ('Finance', 'Treasury'),
          ('Marketing', 'Digital Marketing'),
          ('Marketing', 'Content'),
          ('Marketing', 'Market Research')
        )`,
    )
    return Number(rows[0]?.department_count) === 14
  },
  '20260911_add_leave_request_year_allocations.sql': async () => {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS table_count
         FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'leave_request_year_allocations'`,
    )
    return Number(rows[0]?.table_count) === 1
  },
}

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
try {
  for (const name of migrations) {
    if (migrationChecks[name] && await migrationChecks[name]()) {
      console.log(`${name}: already applied`)
      continue
    }

    const sql = await readFile(path.join(directory, name), 'utf8')
    const statements = sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)
    for (const statement of statements) await pool.query(statement)
    console.log(`${name}: applied`)
  }
} finally {
  await pool.end()
}
