import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../src/config/database.js'

const allowed = new Set([
  '20260803_add_users_password_changed_at.sql',
  '20260804_add_users_must_change_password.sql',
  '20260805_add_leave_workflow.sql',
])
const requested = process.argv.slice(2)
if (!requested.length || requested.some((name) => !allowed.has(name))) {
  throw new Error(`Pass only approved additive migrations: ${[...allowed].join(', ')}`)
}

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../migrations')
try {
  for (const name of requested) {
    const sql = await readFile(path.join(directory, name), 'utf8')
    const statements = sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)
    for (const statement of statements) await pool.query(statement)
    console.log(`${name}: applied`)
  }
} finally {
  await pool.end()
}
