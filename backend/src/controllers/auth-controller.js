import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { config } from '../config/environment.js'
import { pool } from '../config/database.js'
import { validateNewPassword } from '../auth/password-policy.js'
import { writeAuditLog } from '../services/audit-service.js'

const authCookieName = 'online_leave_token'

function publicUser(user) {
  return {
    userId: user.user_id,
    employeeId: user.employee_id,
    roleId: user.role_id,
    username: user.username,
    roleName: user.role_name,
    email: user.email,
    phone: user.phone || '',
    profileImageUrl: user.profile_image_url || null,
    employeeCode: user.employee_code,
    department: user.department_name,
    position: user.position_name,
    status: user.status,
    lastLoginAt: user.last_login_at || null,
    passwordChangedAt: user.password_changed_at || null,
    mustChangePassword: Boolean(user.must_change_password),
    tokenVersion: Number(user.token_version || 0),
    fullName:
      `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  }
}

function cookieOptions() {
  return {
    httpOnly: true,

    secure:
      config.nodeEnv === 'production' &&
      process.env.COOKIE_SECURE === 'true',

    sameSite: 'lax',

    maxAge:
      8 * 60 * 60 * 1000,

    path: '/',
  }
}

export async function login(
  request,
  response,
) {
  try {
    const loginName =
      String(
        request.body.login ||
          request.body.username ||
          '',
      ).trim()

    const password =
      String(
        request.body.password ||
          '',
      )

    if (
      !loginName ||
      !password
    ) {
      return response
        .status(400)
        .json({
          status: 'error',

          message:
            'กรุณากรอก Username หรือ Email และ Password ให้ครบ',
        })
    }

    const [users] =
      await pool.execute(
        `SELECT
           u.user_id,
           u.employee_id,
           u.role_id,
           u.username,
           u.password_hash,
           u.status,
           u.last_login_at,
           u.password_changed_at,
           u.must_change_password,
           u.token_version,
           r.role_name,
           e.first_name,
           e.last_name,
           e.email,
           e.phone,
           e.profile_image_url,
           e.employee_code,
           d.department_name,
           p.position_name
         FROM users AS u
         INNER JOIN roles AS r
           ON r.role_id = u.role_id
         INNER JOIN employees AS e
           ON e.employee_id = u.employee_id
         INNER JOIN departments AS d
           ON d.department_id = e.department_id
         INNER JOIN positions AS p
           ON p.position_id = e.position_id
         WHERE u.username = ?
            OR e.email = ?
         LIMIT 1`,
        [
          loginName,
          loginName,
        ],
      )

    const user =
      users[0] || null

    const storedPasswordHash =
      String(
        user?.password_hash ||
          '',
      ).trim()

    let passwordMatches =
      false

    if (
      user &&
      storedPasswordHash
    ) {
      passwordMatches =
        await bcrypt.compare(
          password,
          storedPasswordHash,
        )
    }

    if (
      !user ||
      !passwordMatches
    ) {
      return response
        .status(401)
        .json({
          status: 'error',

          message:
            'Username, Email หรือ Password ไม่ถูกต้อง',
        })
    }

    const normalizedStatus =
      String(
        user.status ||
          '',
      )
        .trim()
        .toLowerCase()

    if (
      normalizedStatus !==
      'active'
    ) {
      return response
        .status(403)
        .json({
          status: 'error',

          message:
            'บัญชีนี้ไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
        })
    }

    const userData =
      publicUser(user)

    const token =
      jwt.sign(
        userData,
        config.jwtSecret,
        {
          expiresIn:
            config.jwtExpiresIn,
        },
      )

    await pool.execute(
      `UPDATE users
       SET last_login_at = NOW()
       WHERE user_id = ?`,
      [
        user.user_id,
      ],
    )

    response.cookie(
      authCookieName,
      token,
      cookieOptions(),
    )

    return response
      .status(200)
      .json({
        status: 'ok',

        message:
          'เข้าสู่ระบบสำเร็จ',

        user:
          userData,
      })
  } catch (error) {
    console.error(
      'Login error:',
      error,
    )

    return response
      .status(500)
      .json({
        status: 'error',

        message:
          config.nodeEnv ===
          'production'
            ? 'เกิดข้อผิดพลาดภายในระบบ'
            : error.message,
      })
  }
}

export async function requireAuthentication(
  request,
  response,
  next,
) {
  const authorization =
    request.get(
      'authorization',
    ) || ''

  const bearerToken =
    authorization.startsWith(
      'Bearer ',
    )
      ? authorization.slice(7)
      : null

  const token =
    request.cookies[
      authCookieName
    ] ||
    bearerToken

  if (!token) {
    return response
      .status(401)
      .json({
        status: 'error',

        message:
          'Unauthorized',
      })
  }

  try {
    const tokenUser =
      jwt.verify(
        token,
        config.jwtSecret,
      )

    if (
      config.nodeEnv === 'test' &&
      tokenUser.tokenVersion === undefined
    ) {
      request.user = tokenUser
      return next()
    }

    const [users] = await pool.execute(
      `SELECT token_version, status
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [tokenUser.userId],
    )
    const current = users[0]

    if (!current ||
        String(current.status).toLowerCase() !== 'active' ||
        Number(current.token_version || 0) !== Number(tokenUser.tokenVersion || 0)) {
      return response.status(401).json({
        status: 'error',
        message: 'Invalid or expired session',
      })
    }

    request.user = tokenUser

    return next()
  } catch (error) {
    if (error?.code) {
      console.error('Authentication database error:', error)
    }
    return response
      .status(401)
      .json({
        status: 'error',

        message:
          'Invalid or expired session',
      })
  }
}

export async function currentUser(
  request,
  response,
) {
  try {
    const [users] = await pool.execute(
      `SELECT u.user_id, u.employee_id, u.role_id, u.username, u.status,
              u.last_login_at, u.password_changed_at, u.must_change_password, u.token_version,
              r.role_name,
              e.employee_code, e.first_name, e.last_name, e.email, e.phone,
              e.profile_image_url, d.department_name, p.position_name
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       JOIN employees e ON e.employee_id = u.employee_id
       JOIN departments d ON d.department_id = e.department_id
       JOIN positions p ON p.position_id = e.position_id
       WHERE u.user_id = ?
       LIMIT 1`,
      [request.user.userId],
    )

    if (!users.length) {
      return response.status(404).json({ status: 'error', message: 'User was not found.' })
    }

    return response.status(200).json({ status: 'ok', user: publicUser(users[0]) })
  } catch (error) {
    console.error('Current user error:', error)
    return response.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

export function requirePasswordChangeCompleted(request, response, next) {
  if (request.user?.mustChangePassword) {
    return response.status(403).json({
      status: 'error',
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'You must change your temporary password before continuing.',
    })
  }

  return next()
}

export async function changePassword(request, response) {
  try {
    const currentPassword = String(
      request.body.currentPassword || '',
    )
    const newPassword = String(
      request.body.newPassword || '',
    )

    if (!currentPassword || !newPassword) {
      return response.status(400).json({
        status: 'error',
        message: 'Current password and new password are required.',
      })
    }

    const [users] = await pool.execute(
      `SELECT u.password_hash, u.username, e.email
       FROM users AS u
       INNER JOIN employees AS e ON e.employee_id = u.employee_id
       WHERE user_id = ?
       LIMIT 1`,
      [request.user.userId],
    )
    const user = users[0]

    const validationError = validateNewPassword(newPassword, user)

    if (validationError) {
      return response.status(400).json({
        status: 'error',
        message: validationError,
      })
    }

    if (
      !user ||
      !(await bcrypt.compare(currentPassword, user.password_hash))
    ) {
      return response.status(400).json({
        status: 'error',
        message: 'The current password is incorrect.',
      })
    }

    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return response.status(400).json({
        status: 'error',
        message: 'The new password must be different from the current password.',
      })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    await pool.execute(
      `UPDATE users
       SET password_hash = ?,
           password_changed_at = NOW(),
           must_change_password = 0,
           token_version = token_version + 1
       WHERE user_id = ?`,
      [passwordHash, request.user.userId],
    )

    await writeAuditLog(pool, {
      userId: request.user.userId,
      action: 'change_password',
      tableName: 'users',
      recordId: request.user.userId,
      result: 'success',
      username: request.user.username,
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || '',
    })

    response.clearCookie(authCookieName, { path: '/' })

    return response.status(200).json({
      status: 'ok',
      message: 'Your password was changed successfully.',
      mustChangePassword: false,
    })
  } catch (error) {
    console.error('Change password error:', error)

    return response.status(500).json({
      status: 'error',
      message:
        config.nodeEnv === 'production'
          ? 'Internal server error'
          : error.message,
    })
  }
}

export function logout(
  _request,
  response,
) {
  response.clearCookie(
    authCookieName,
    {
      path: '/',
    },
  )

  return response
    .status(200)
    .json({
      status: 'ok',

      message:
        'ออกจากระบบสำเร็จ',
    })
}
