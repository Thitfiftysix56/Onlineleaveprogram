import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import { generateTemporaryPassword } from '../src/auth/password-security.js'

const demoUsernames = ['employee001', 'supervisor001', 'hr001', 'admin001']
const standardLeaveCodes = ['LT001', 'LT002', 'LT003']

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
})

async function snapshot(connection) {
  const [leaveTypes] = await connection.query(
    `SELECT leave_type_code, leave_type_name, annual_quota_days,
            minimum_days, maximum_days_per_request
       FROM leave_types
      WHERE leave_type_code IN (?)
      ORDER BY leave_type_code`,
    [standardLeaveCodes],
  )
  const [hierarchy] = await connection.query(
    `SELECT u.username, r.role_name AS role, e.employee_id,
            e.status AS employee_status, e.supervisor_id,
            CONCAT_WS(' ', s.first_name, s.last_name) AS supervisor_employee,
            su.username AS supervisor_user, su.status AS supervisor_user_status,
            sr.role_name AS supervisor_role
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       JOIN employees e ON e.employee_id = u.employee_id
       LEFT JOIN employees s ON s.employee_id = e.supervisor_id
       LEFT JOIN users su ON su.employee_id = s.employee_id
       LEFT JOIN roles sr ON sr.role_id = su.role_id
      WHERE u.username IN (?)
      ORDER BY FIELD(u.username, 'employee001', 'supervisor001', 'hr001', 'admin001')`,
    [demoUsernames],
  )
  return { leaveTypes, hierarchy }
}

let temporaryPassword = null
try {
  await db.beginTransaction()
  const before = await snapshot(db)

  await db.query(
    `UPDATE leave_types
        SET maximum_days_per_request = annual_quota_days
      WHERE leave_type_code IN (?)
        AND maximum_days_per_request = 1
        AND annual_quota_days > 1`,
    [standardLeaveCodes],
  )

  const [existingSupervisors] = await db.query(
    `SELECT e.employee_id
       FROM employees e
       JOIN users u ON u.employee_id = e.employee_id
       JOIN roles r ON r.role_id = u.role_id
      WHERE r.role_name = 'Supervisor'
        AND e.status = 'active'
        AND u.status = 'active'
        AND u.username <> 'supervisor001'
      ORDER BY e.employee_id
      LIMIT 1`,
  )

  let supportSupervisorId = existingSupervisors[0]?.employee_id
  if (!supportSupervisorId) {
    const [existingSupport] = await db.query(
      `SELECT e.employee_id
         FROM employees e
         JOIN users u ON u.employee_id = e.employee_id
         JOIN roles r ON r.role_id = u.role_id
        WHERE e.employee_code = 'SUP-002'
          AND u.username = 'supervisor002'
          AND e.status = 'active'
          AND u.status = 'active'
          AND r.role_name = 'Supervisor'
        LIMIT 1`,
    )
    supportSupervisorId = existingSupport[0]?.employee_id
  }

  if (!supportSupervisorId) {
    const [[base]] = await db.query(
      `SELECT e.department_id, e.position_id, r.role_id
         FROM employees e
         JOIN users u ON u.employee_id = e.employee_id
         JOIN roles r ON r.role_name = 'Supervisor' AND r.is_active = 1
        WHERE u.username = 'supervisor001'
        LIMIT 1`,
    )
    if (!base) throw new Error('Cannot locate the Supervisor role or supervisor001 profile.')

    const [employee] = await db.query(
      `INSERT INTO employees
         (employee_code, first_name, last_name, email, department_id,
          position_id, supervisor_id, hire_date, status)
       VALUES ('SUP-002', 'Supervisor', '002', 'supervisor002@organization.local',
               ?, ?, NULL, CURRENT_DATE(), 'active')`,
      [base.department_id, base.position_id],
    )
    supportSupervisorId = employee.insertId
    temporaryPassword = generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)
    await db.query(
      `INSERT INTO users
         (employee_id, role_id, username, password_hash, status, must_change_password)
       VALUES (?, ?, 'supervisor002', ?, 'active', 1)`,
      [supportSupervisorId, base.role_id, passwordHash],
    )
  }

  const [[primarySupervisor]] = await db.query(
    `SELECT e.employee_id
       FROM employees e
       JOIN users u ON u.employee_id = e.employee_id
       JOIN roles r ON r.role_id = u.role_id
      WHERE u.username = 'supervisor001' AND e.status = 'active'
        AND u.status = 'active' AND r.role_name = 'Supervisor'
      LIMIT 1`,
  )
  if (!primarySupervisor) throw new Error('supervisor001 is not a valid active Supervisor.')

  await db.query(
    `UPDATE employees e JOIN users u ON u.employee_id = e.employee_id
        SET e.supervisor_id = ?
      WHERE u.username IN ('hr001', 'admin001') AND e.supervisor_id IS NULL`,
    [primarySupervisor.employee_id],
  )
  await db.query(
    `UPDATE employees e JOIN users u ON u.employee_id = e.employee_id
        SET e.supervisor_id = ?
      WHERE u.username = 'supervisor001' AND e.supervisor_id IS NULL
        AND e.employee_id <> ?`,
    [supportSupervisorId, supportSupervisorId],
  )

  const after = await snapshot(db)
  await db.commit()
  console.log(JSON.stringify({ before, after, supportAccountCreated: Boolean(temporaryPassword) }, null, 2))
  if (temporaryPassword) {
    console.log(`Temporary password for supervisor002 (shown once): ${temporaryPassword}`)
  }
} catch (error) {
  await db.rollback()
  throw error
} finally {
  await db.end()
}
