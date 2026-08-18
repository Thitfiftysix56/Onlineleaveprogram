import { pool } from '../config/database.js'

export async function listLeaveReport(request, response) {
  const conditions = []
  const parameters = []
  const filters = [
    ['status', 'lr.status'],
    ['leaveTypeId', 'lr.leave_type_id'],
    ['departmentId', 'e.department_id'],
  ]
  for (const [key, column] of filters) {
    if (request.query[key] && request.query[key] !== 'all') {
      conditions.push(`${column} = ?`)
      parameters.push(request.query[key])
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(request.query.startDate || '')) {
    conditions.push('lr.start_date >= ?')
    parameters.push(request.query.startDate)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(request.query.endDate || '')) {
    conditions.push('lr.end_date <= ?')
    parameters.push(request.query.endDate)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.execute(
    `SELECT lr.leave_request_id AS id, lr.request_no AS requestNo,
       lr.leave_type_id AS leaveTypeId, lt.leave_type_name AS leaveType,
       lr.start_date AS startDate, lr.end_date AS endDate, lr.leave_days AS leaveDays,
       lr.reason, lr.status, lr.submitted_at AS submittedAt, lr.created_at AS createdAt,
       e.employee_id AS employeeId, e.employee_code AS employeeCode,
       CONCAT(e.first_name, ' ', e.last_name) AS employeeName,
       d.department_name AS department
     FROM leave_requests lr
     JOIN employees e ON e.employee_id = lr.employee_id
     JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
     LEFT JOIN departments d ON d.department_id = e.department_id
     ${where} ORDER BY lr.created_at DESC`, parameters,
  )
  response.json({ status: 'ok', data: { leaveRequests: rows } })
}

export async function listAuditLogs(_request, response) {
  const [rows] = await pool.execute(
    `SELECT al.audit_id AS id, al.created_at AS createdAt, al.action,
       al.table_name AS tableName, al.record_id AS recordId, al.ip_address AS ipAddress,
       al.detail, u.username, r.role_name AS role,
       CONCAT(e.first_name, ' ', e.last_name) AS employeeName
     FROM audit_logs al
     LEFT JOIN users u ON u.user_id = al.user_id
     LEFT JOIN roles r ON r.role_id = u.role_id
     LEFT JOIN employees e ON e.employee_id = u.employee_id
     ORDER BY al.created_at DESC LIMIT 1000`,
  )
  response.json({ status: 'ok', data: { auditLogs: rows } })
}
