import bcrypt from 'bcryptjs'

import { pool } from '../config/database.js'
import { config } from '../config/environment.js'
import { generateTemporaryPassword } from '../auth/password-security.js'
import { writeAuditLog } from '../services/audit-service.js'
import { createNotification } from '../services/notification-service.js'

const allowedStatuses = new Set([
  'active',
  'inactive',
  'locked',
])

const userDetailQuery = `SELECT
  u.user_id,
  u.employee_id,
  e.employee_code,
  u.username,
  e.first_name,
  e.last_name,
  e.email,
  d.department_name,
  p.position_name,
  u.role_id,
  r.role_name,
  u.status,
  u.failed_login_attempts,
  u.last_failed_login_at,
  u.locked_until,
  u.last_login_at,
  u.must_change_password,
  u.created_at,
  u.updated_at
FROM users AS u
INNER JOIN employees AS e
  ON e.employee_id = u.employee_id
INNER JOIN departments AS d
  ON d.department_id = e.department_id
INNER JOIN positions AS p
  ON p.position_id = e.position_id
INNER JOIN roles AS r
  ON r.role_id = u.role_id`

function publicAdminUser(user) {
  return {
    userId: user.user_id,
    employeeId: user.employee_id,
    employeeCode: user.employee_code,
    username: user.username,
    fullName:
      `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    email: user.email,
    roleId: user.role_id,
    roleName: user.role_name,
    status: user.status,
    failedLoginAttempts: Number(user.failed_login_attempts || 0),
    lastFailedLoginAt: user.last_failed_login_at || null,
    lockedUntil: user.locked_until || null,
    lastLoginAt: user.last_login_at,
    mustChangePassword: Boolean(user.must_change_password),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

function publicAdminUserDetail(user) {
  return {
    ...publicAdminUser(user),
    department: user.department_name,
    position: user.position_name,
  }
}

function publicAvailableEmployee(employee) {
  return {
    employeeId: employee.employee_id,
    employeeCode: employee.employee_code,
    fullName:
      `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
    email: employee.email,
    department: employee.department_name,
    position: employee.position_name,
    roleId: employee.intended_role_id,
    roleName: employee.intended_role_name,
  }
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase()
}

function validateUsername(username) {
  if (!username) {
    return 'Username is required.'
  }

  if (!/^[a-z0-9._-]{4,50}$/.test(username)) {
    return 'Username must use 4-50 lowercase letters, numbers, dots, underscores or hyphens.'
  }

  return null
}

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase()
}

async function findRole(role) {
  const roleName = String(role || '').trim()

  if (!roleName) {
    return null
  }

  const [roles] = await pool.execute(
    `SELECT role_id, role_name
     FROM roles
     WHERE LOWER(role_name) = LOWER(?)
       AND is_active = 1
     LIMIT 1`,
    [roleName],
  )

  return roles[0] || null
}

async function findUserById(userId, executor = pool) {
  const [users] = await executor.execute(
    `${userDetailQuery}
     WHERE u.user_id = ?
     LIMIT 1`,
    [userId],
  )

  return users[0] || null
}

const employeeCodePrefixes = {
  employee: 'EMP',
  supervisor: 'SUP',
  hr: 'HR',
  admin: 'ADM',
}

function employeeCodePrefix(roleName) {
  return employeeCodePrefixes[String(roleName || '').trim().toLowerCase()] || 'EMP'
}

async function syncEmployeeCodeWithRole(
  executor,
  employeeId,
  currentCode,
  roleName,
) {
  const prefix = employeeCodePrefix(roleName)
  const expectedPrefix = `${prefix}-`

  if (String(currentCode || '').toUpperCase().startsWith(expectedPrefix)) {
    return currentCode
  }

  const [existingCodes] = await executor.execute(
    `SELECT employee_code
     FROM employees
     WHERE employee_id <> ?
       AND employee_code LIKE ?`,
    [employeeId, `${expectedPrefix}%`],
  )
  const usedSequences = new Set(
    existingCodes
      .map(({ employee_code: code }) => {
        const match = String(code || '').toUpperCase().match(
          new RegExp(`^${prefix}-(\\d+)$`),
        )
        return match ? Number(match[1]) : null
      })
      .filter(Number.isInteger),
  )
  let sequence = 1
  while (usedSequences.has(sequence)) sequence += 1
  const employeeCode = `${prefix}-${String(sequence).padStart(3, '0')}`

  await executor.execute(
    `UPDATE employees
     SET employee_code = ?, updated_at = NOW()
     WHERE employee_id = ?`,
    [employeeCode, employeeId],
  )

  return employeeCode
}

function internalError(response, label, error) {
  console.error(label, error)

  return response.status(500).json({
    status: 'error',
    message:
      config.nodeEnv === 'production'
        ? 'Internal server error'
        : error.message,
  })
}

export async function listAdminUsers(_request, response) {
  try {
    const [users] = await pool.execute(
      `${userDetailQuery}
       ORDER BY u.user_id ASC`,
    )

    return response.status(200).json({
      status: 'ok',
      users: users.map(publicAdminUser),
    })
  } catch (error) {
    return internalError(response, 'List admin users error:', error)
  }
}

export async function listAvailableEmployees(_request, response) {
  try {
    const [employees] = await pool.execute(
      `SELECT
         e.employee_id,
         e.employee_code,
         e.first_name,
         e.last_name,
         e.email,
         d.department_name,
         p.position_name,
         e.intended_role_id,
         ir.role_name AS intended_role_name
       FROM employees AS e
       INNER JOIN departments AS d
         ON d.department_id = e.department_id
       INNER JOIN positions AS p
         ON p.position_id = e.position_id
       INNER JOIN roles AS ir
         ON ir.role_id = e.intended_role_id AND ir.is_active = 1
       LEFT JOIN users AS u
         ON u.employee_id = e.employee_id
       WHERE u.user_id IS NULL
       ORDER BY e.employee_id ASC`,
    )

    return response.status(200).json({
      status: 'ok',
      employees: employees.map(publicAvailableEmployee),
    })
  } catch (error) {
    return internalError(
      response,
      'List available employees error:',
      error,
    )
  }
}

export async function getAdminUser(request, response) {
  try {
    const userId = Number(request.params.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'A valid userId is required.',
      })
    }

    const user = await findUserById(userId)

    if (!user) {
      return response.status(404).json({
        status: 'error',
        message: 'User account was not found.',
      })
    }

    return response.status(200).json({
      status: 'ok',
      user: publicAdminUserDetail(user),
    })
  } catch (error) {
    return internalError(response, 'Get admin user error:', error)
  }
}

export async function createAdminUser(request, response) {
  let connection
  try {
    const employeeId = Number(request.body.employeeId)
    const username = normalizeUsername(request.body.username)
    const status = normalizeStatus(request.body.status)
    const usernameError = validateUsername(username)

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'A valid employeeId is required.',
      })
    }

    if (usernameError) {
      return response.status(400).json({
        status: 'error',
        message: usernameError,
      })
    }

    if (!allowedStatuses.has(status)) {
      return response.status(400).json({
        status: 'error',
        message: 'Status must be active, inactive or locked.',
      })
    }

    const [employees] = await pool.execute(
      `SELECT e.employee_id, e.employee_code, e.intended_role_id,
              ir.role_name AS intended_role_name, u.user_id
       FROM employees AS e
       INNER JOIN roles AS ir
         ON ir.role_id = e.intended_role_id AND ir.is_active = 1
       LEFT JOIN users AS u
         ON u.employee_id = e.employee_id
       WHERE e.employee_id = ?
       LIMIT 1`,
      [employeeId],
    )
    const employee = employees[0]

    if (!employee) {
      return response.status(400).json({
        status: 'error',
        message: 'The selected employee was not found.',
      })
    }

    if (employee.user_id) {
      return response.status(409).json({
        status: 'error',
        message: 'The selected employee already has a user account.',
      })
    }

    const [duplicateUsers] = await pool.execute(
      `SELECT user_id
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username],
    )

    if (duplicateUsers.length > 0) {
      return response.status(409).json({
        status: 'error',
        message: 'This username is already in use.',
      })
    }

    const role = {
      role_id: employee.intended_role_id,
      role_name: employee.intended_role_name,
    }

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)
    connection = await pool.getConnection()
    await connection.beginTransaction()
    await syncEmployeeCodeWithRole(
      connection,
      employeeId,
      employee.employee_code,
      role.role_name,
    )
    const [result] = await connection.execute(
      `INSERT INTO users
         (employee_id, role_id, username, password_hash, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [employeeId, role.role_id, username, passwordHash, status],
    )
    const createdUser = await findUserById(result.insertId, connection)
    await connection.commit()

    await writeAuditLog(pool, {
      userId: request.user.userId,
      action: 'create_user',
      tableName: 'users',
      recordId: result.insertId,
      result: 'success',
      username,
      adminUserId: request.user.userId,
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || '',
    })

    return response.status(201).json({
      status: 'ok',
      message: 'User account created successfully.',
      user: publicAdminUserDetail(createdUser),
      username,
      temporaryPassword,
      mustChangePassword: true,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        status: 'error',
        message: 'The username or employee already has a user account.',
      })
    }

    return internalError(response, 'Create admin user error:', error)
  } finally {
    if (connection) connection.release()
  }
}

export async function updateAdminUser(request, response) {
  let connection
  try {
    const userId = Number(request.params.userId)
    const username = normalizeUsername(request.body.username)
    const status = normalizeStatus(request.body.status)
    const usernameError = validateUsername(username)

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'A valid userId is required.',
      })
    }

    if (usernameError) {
      return response.status(400).json({
        status: 'error',
        message: usernameError,
      })
    }

    if (!allowedStatuses.has(status)) {
      return response.status(400).json({
        status: 'error',
        message: 'Status must be active, inactive or locked.',
      })
    }

    const existingUser = await findUserById(userId)

    if (!existingUser) {
      return response.status(404).json({
        status: 'error',
        message: 'User account was not found.',
      })
    }

    const [duplicateUsers] = await pool.execute(
      `SELECT user_id
       FROM users
       WHERE username = ?
         AND user_id <> ?
       LIMIT 1`,
      [username, userId],
    )

    if (duplicateUsers.length > 0) {
      return response.status(409).json({
        status: 'error',
        message: 'This username is already in use.',
      })
    }

    const role = await findRole(request.body.role)

    if (!role) {
      return response.status(400).json({
        status: 'error',
        message: 'The selected role is invalid or inactive.',
      })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()
    await syncEmployeeCodeWithRole(
      connection,
      existingUser.employee_id,
      existingUser.employee_code,
      role.role_name,
    )
    await connection.execute(
      `UPDATE users
       SET username = ?,
           role_id = ?,
           status = ?,
           failed_login_attempts = 0,
           last_failed_login_at = NULL,
           locked_until = NULL,
           updated_at = NOW()
       WHERE user_id = ?`,
      [username, role.role_id, status, userId],
    )
    const updatedUser = await findUserById(userId, connection)
    await connection.commit()

    return response.status(200).json({
      status: 'ok',
      message: 'User account updated successfully.',
      user: publicAdminUserDetail(updatedUser),
    })
  } catch (error) {
    if (connection) await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        status: 'error',
        message: 'This username is already in use.',
      })
    }

    return internalError(response, 'Update admin user error:', error)
  } finally {
    if (connection) connection.release()
  }
}

export async function updateAdminUserStatus(request, response) {
  try {
    const userId = Number(request.params.userId)
    const status = normalizeStatus(request.body.status)

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'A valid userId is required.',
      })
    }

    if (!allowedStatuses.has(status)) {
      return response.status(400).json({
        status: 'error',
        message: 'Status must be Active, Inactive or Locked.',
      })
    }

    const [users] = await pool.execute(
      `SELECT user_id, username, status
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [userId],
    )

    if (users.length === 0) {
      return response.status(404).json({
        status: 'error',
        message: 'User account was not found.',
      })
    }

    await pool.execute(
      `UPDATE users
       SET status = ?,
           failed_login_attempts = 0,
           last_failed_login_at = NULL,
           locked_until = NULL
       WHERE user_id = ?`,
      [status, userId],
    )

    return response.status(200).json({
      status: 'ok',
      message: 'User status updated successfully',
    })
  } catch (error) {
    return internalError(response, 'Update user status error:', error)
  }
}

export async function deleteAdminUser(request, response) {
  let connection
  try {
    const userId = Number(request.params.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'รหัสบัญชีผู้ใช้ไม่ถูกต้อง',
      })
    }

    if (userId === Number(request.user.userId)) {
      return response.status(409).json({
        status: 'error',
        message: 'ไม่สามารถลบบัญชีที่กำลังเข้าสู่ระบบอยู่ได้',
      })
    }

    const [users] = await pool.execute(
      `SELECT u.user_id, u.username, u.status, e.employee_code, e.first_name, e.last_name
         FROM users u
         JOIN employees e ON e.employee_id = u.employee_id
        WHERE u.user_id = ?
        LIMIT 1`,
      [userId],
    )
    const user = users[0]

    if (!user) {
      return response.status(404).json({
        status: 'error',
        message: 'ไม่พบบัญชีผู้ใช้',
      })
    }

    if (normalizeStatus(user.status) !== 'inactive') {
      return response.status(409).json({
        status: 'error',
        message: 'ต้องปิดใช้งานบัญชีก่อนจึงจะลบได้',
      })
    }

    const [[references]] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM leave_approval_logs WHERE approver_id = ?) AS approval_count,
         (SELECT COUNT(*) FROM leave_attachments WHERE uploaded_by = ?) AS attachment_count`,
      [userId, userId],
    )

    if (Number(references.approval_count) > 0) {
      return response.status(409).json({
        status: 'error',
        message: 'ไม่สามารถลบบัญชีที่มีประวัติอนุมัติหรือปฏิเสธคำขอลาได้',
      })
    }
    if (Number(references.attachment_count) > 0) {
      return response.status(409).json({
        status: 'error',
        message: 'ไม่สามารถลบบัญชีที่มีประวัติอัปโหลดเอกสารคำขอลาได้',
      })
    }

    connection = await pool.getConnection()
    await connection.beginTransaction()
    const [hrUserRows] = await connection.execute(
      `SELECT u.user_id
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
        WHERE LOWER(r.role_name) = 'hr'
          AND u.status = 'active'
          AND u.user_id <> ?`,
      [userId],
    )
    const hrUsers = Array.isArray(hrUserRows) ? hrUserRows : []
    await connection.execute('UPDATE audit_logs SET user_id = NULL WHERE user_id = ?', [userId])
    await connection.execute('UPDATE leave_entitlements SET updated_by = NULL WHERE updated_by = ?', [userId])
    await connection.execute('UPDATE leave_attachments SET deleted_by = NULL WHERE deleted_by = ?', [userId])
    await connection.execute('DELETE FROM notifications WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM password_reset_otps WHERE user_id = ?', [userId])
    await connection.execute('DELETE FROM users WHERE user_id = ?', [userId])
    const employeeName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    for (const hrUser of hrUsers) {
      await createNotification(connection, {
        userId: hrUser.user_id,
        type: 'user-account-deleted',
        title: 'บัญชีผู้ใช้ถูกลบแล้ว',
        message: `บัญชีผู้ใช้ของ ${user.employee_code || user.username}${employeeName ? ` ${employeeName}` : ''} ถูกลบแล้ว สามารถดำเนินการลบข้อมูลพนักงานได้`,
      })
    }
    await connection.commit()

    return response.status(200).json({
      status: 'ok',
      message: 'ลบบัญชีผู้ใช้เรียบร้อยแล้ว',
      data: { userId },
    })
  } catch (error) {
    if (connection) await connection.rollback()
    return internalError(response, 'Delete admin user error:', error)
  } finally {
    if (connection) connection.release()
  }
}

export async function resetAdminUserPassword(request, response) {
  try {
    const userId = Number(request.params.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      return response.status(400).json({
        status: 'error',
        message: 'A valid userId is required.',
      })
    }

    const [users] = await pool.execute(
      `SELECT user_id, username, status
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [userId],
    )

    if (users.length === 0) {
      return response.status(404).json({
        status: 'error',
        message: 'User account was not found.',
      })
    }

    const user = users[0]

    if (String(user.status || '').toLowerCase() === 'inactive') {
      return response.status(409).json({
        status: 'error',
        message: 'The user account is inactive and cannot be reset.',
      })
    }

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)

    await pool.execute(
      `UPDATE users
       SET password_hash = ?,
           password_changed_at = NOW(),
           must_change_password = 1,
           token_version = token_version + 1
       WHERE user_id = ?`,
      [passwordHash, userId],
    )

    await writeAuditLog(pool, {
      userId: request.user.userId,
      action: 'admin_password_reset',
      tableName: 'users',
      recordId: userId,
      result: 'success',
      username: user.username,
      adminUserId: request.user.userId,
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || '',
    })

    return response.status(200).json({
      status: 'ok',
      message: 'Password reset successfully.',
      username: user.username,
      temporaryPassword,
      mustChangePassword: true,
    })
  } catch (error) {
    return internalError(response, 'Reset user password error:', error)
  }
}
