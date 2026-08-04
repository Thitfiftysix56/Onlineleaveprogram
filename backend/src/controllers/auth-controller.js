import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { config } from '../config/environment.js'
import { pool } from '../config/database.js'
import { validateNewPassword } from '../auth/password-policy.js'

const authCookieName = 'online_leave_token'

function publicUser(user) {
  return {
    userId: user.user_id,
    employeeId: user.employee_id,
    roleId: user.role_id,
    username: user.username,
    roleName: user.role_name,
    email: user.email,
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
           r.role_name,
           e.first_name,
           e.last_name,
           e.email
         FROM users AS u
         INNER JOIN roles AS r
           ON r.role_id = u.role_id
         INNER JOIN employees AS e
           ON e.employee_id = u.employee_id
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

export function requireAuthentication(
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
    request.user =
      jwt.verify(
        token,
        config.jwtSecret,
      )

    return next()
  } catch {
    return response
      .status(401)
      .json({
        status: 'error',

        message:
          'Invalid or expired session',
      })
  }
}

export function currentUser(
  request,
  response,
) {
  return response
    .status(200)
    .json({
      status: 'ok',

      user:
        request.user,
    })
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

    const validationError = validateNewPassword(newPassword)

    if (validationError) {
      return response.status(400).json({
        status: 'error',
        message: validationError,
      })
    }

    const [users] = await pool.execute(
      `SELECT password_hash
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [request.user.userId],
    )
    const user = users[0]

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
       SET password_hash = ?
       WHERE user_id = ?`,
      [passwordHash, request.user.userId],
    )

    return response.status(200).json({
      status: 'ok',
      message: 'Your password was changed successfully.',
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
