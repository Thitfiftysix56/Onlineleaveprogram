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
  '20260911_sync_thailand_public_holidays_2026.sql',
]
const allowed = new Set(approvedMigrations)
const requested = process.argv.slice(2)
if (requested.some((name) => !allowed.has(name))) {
  throw new Error(`Pass only approved additive migrations: ${approvedMigrations.join(', ')}`)
}
const migrations = requested.length ? requested : approvedMigrations

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
try {
  for (const name of migrations) {
    const sql = await readFile(path.join(directory, name), 'utf8')
    const statements = sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)
    for (const statement of statements) await pool.query(statement)
    console.log(`${name}: applied`)
  }
} finally {
  await pool.end()
}
