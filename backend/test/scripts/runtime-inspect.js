import 'dotenv/config'
import { pool } from '../../src/config/database.js'

try {
  const [tables] = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name IN ('leave_requests','leave_request_attachments','notifications','leave_entitlements')
     ORDER BY table_name`,
  )
  const [userColumns] = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'users' ORDER BY ordinal_position`,
  )
  const [users] = await pool.query(
    `SELECT u.user_id, u.employee_id, r.role_name,
            e.supervisor_id, e.department_id
     FROM users u JOIN roles r ON r.role_id = u.role_id
     JOIN employees e ON e.employee_id = u.employee_id
     WHERE u.status = 'active' ORDER BY u.user_id`,
  )
  const [entitlements] = await pool.query(
    `SELECT employee_id, leave_type_id, year, total_days, used_days
     FROM leave_entitlements ORDER BY year DESC, employee_id, leave_type_id LIMIT 50`,
  )
  const [recentRequests] = await pool.query(
    `SELECT leave_request_id, request_no, employee_id, leave_type_id, start_date, end_date,
            leave_days, reason, status, created_at
     FROM leave_requests ORDER BY leave_request_id DESC LIMIT 15`,
  )
  const [leaveColumns] = await pool.query(
    `SELECT column_name, column_type, is_nullable, column_default, extra
     FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='leave_requests'
     ORDER BY ordinal_position`,
  )
  console.log(JSON.stringify({
    tables: tables.map((row) => row.table_name),
    userColumns: userColumns.map((row) => row.column_name),
    users,
    entitlements,
    recentRequests,
    leaveColumns,
  }, null, 2))
} finally {
  await pool.end()
}
