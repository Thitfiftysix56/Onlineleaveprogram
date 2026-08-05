import bcrypt from 'bcryptjs'

import { pool } from '../config/database.js'
import { config } from '../config/environment.js'
import { generateTemporaryPassword } from '../auth/password-security.js'
import { writeAuditLog } from '../services/audit-service.js'

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

async function findUserById(userId) {
  const [users] = await pool.execute(
    `${userDetailQuery}
     WHERE u.user_id = ?
     LIMIT 1`,
    [userId],
  )

  return users[0] || null
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
         p.position_name
       FROM employees AS e
       INNER JOIN departments AS d
         ON d.department_id = e.department_id
       INNER JOIN positions AS p
         ON p.position_id = e.position_id
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
      `SELECT e.employee_id, u.user_id
       FROM employees AS e
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

    const role = await findRole(request.body.role)

    if (!role) {
      return response.status(400).json({
        status: 'error',
        message: 'The selected role is invalid or inactive.',
      })
    }

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)
    const [result] = await pool.execute(
      `INSERT INTO users
         (employee_id, role_id, username, password_hash, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [employeeId, role.role_id, username, passwordHash, status],
    )
    const createdUser = await findUserById(result.insertId)

    await writeAuditLog(pool, {
      userId: request.user.userId,
      action: 'user_created',
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
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        status: 'error',
        message: 'The username or employee already has a user account.',
      })
    }

    return internalError(response, 'Create admin user error:', error)
  }
}

export async function updateAdminUser(request, response) {
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

    await pool.execute(
      `UPDATE users
       SET username = ?,
           role_id = ?,
           status = ?,
           updated_at = NOW()
       WHERE user_id = ?`,
      [username, role.role_id, status, userId],
    )
    const updatedUser = await findUserById(userId)

    return response.status(200).json({
      status: 'ok',
      message: 'User account updated successfully.',
      user: publicAdminUserDetail(updatedUser),
    })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        status: 'error',
        message: 'This username is already in use.',
      })
    }

    return internalError(response, 'Update admin user error:', error)
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
       SET status = ?
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
