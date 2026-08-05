import bcrypt from 'bcryptjs'

import { config } from '../config/environment.js'
import { pool } from '../config/database.js'
import {
  generateOtp,
  generateResetToken,
  hashOtp,
  hashRateLimitKey,
  hashResetToken,
  otpHashMatches,
} from '../auth/password-security.js'
import { validateNewPassword } from '../auth/password-policy.js'
import { writeAuditLog } from '../services/audit-service.js'
import { sendPasswordResetOtp } from '../services/email-service.js'

const genericRequestMessage =
  'If an account matches the information provided, a verification code has been sent to the registered email address.'
const requestWindowMs = 15 * 60 * 1000
const identifierRequestLimit = 5
const ipRequestLimit = 30
const maximumResendsPerWindow = 3
const requestBuckets = new Map()

class EmailDeliveryError extends Error {}

function normalizeIdentifier(value) {
  return String(value || '').trim().toLowerCase()
}

function requestMetadata(request) {
  return {
    ipAddress: request.ip || null,
    userAgent: request.get('user-agent') || '',
  }
}

function consumeRequestLimit(key, limit) {
  const now = Date.now()
  const current = requestBuckets.get(key)

  if (!current || current.expiresAt <= now) {
    requestBuckets.set(key, { count: 1, expiresAt: now + requestWindowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    }
  }

  current.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

function retryResponse(response, retryAfterSeconds, message) {
  const seconds = Math.max(1, Math.ceil(Number(retryAfterSeconds) || 1))
  return response.status(429).json({
    status: 'error',
    message: message || `Please wait ${seconds} seconds before requesting another code.`,
    retryAfterSeconds: seconds,
  })
}

async function findResetUser(identifier) {
  const [users] = await pool.execute(
    `SELECT u.user_id, u.username, u.password_hash, u.status AS user_status,
            e.first_name, e.last_name, e.email, e.status AS employee_status
     FROM users AS u
     INNER JOIN employees AS e ON e.employee_id = u.employee_id
     WHERE LOWER(u.username) = ? OR LOWER(e.email) = ?
     LIMIT 1`,
    [identifier, identifier],
  )

  return users[0] || null
}

async function safeAudit(entry) {
  try {
    await writeAuditLog(pool, entry)
  } catch (error) {
    console.error('Password reset audit error:', error)
  }
}

function resetAllowed(user) {
  return user &&
    String(user.user_status).toLowerCase() === 'active' &&
    String(user.employee_status).toLowerCase() === 'active' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user.email || ''))
}

export async function requestPasswordResetOtp(request, response) {
  const startedAt = Date.now()
  const identifier = normalizeIdentifier(request.body.identifier)
  const metadata = requestMetadata(request)

  if (!identifier) {
    return response.status(400).json({ status: 'error', message: 'Username or email is required.' })
  }

  const identifierKey = hashRateLimitKey(`identifier:${identifier}`)
  const ipKey = hashRateLimitKey(`ip:${metadata.ipAddress || 'unknown'}`)
  const identifierLimit = consumeRequestLimit(identifierKey, identifierRequestLimit)
  const ipLimit = consumeRequestLimit(ipKey, ipRequestLimit)

  if (!identifierLimit.allowed || !ipLimit.allowed) {
    const retryAfterSeconds = Math.max(
      identifierLimit.retryAfterSeconds,
      ipLimit.retryAfterSeconds,
    )
    await safeAudit({
      action: 'password_reset_rate_limited',
      result: 'rate_limited',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    })
    return retryResponse(
      response,
      retryAfterSeconds,
      `Too many password reset requests. Please try again in ${retryAfterSeconds} seconds.`,
    )
  }

  try {
    const user = await findResetUser(identifier)

    if (resetAllowed(user)) {
      const [recentOtps] = await pool.execute(
        `SELECT id, otp_hash, resend_count,
                GREATEST(0, ? - GREATEST(0, TIMESTAMPDIFF(SECOND, created_at, NOW())))
                  AS retry_after_seconds
         FROM password_reset_otps
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [config.passwordReset.resendSeconds, user.user_id],
      )
      const previousOtp = recentOtps[0]

      if (previousOtp && Number(previousOtp.retry_after_seconds) > 0) {
        return retryResponse(response, previousOtp.retry_after_seconds)
      }

      const requestWindowSeconds = Math.floor(requestWindowMs / 1000)
      const [windowRows] = await pool.execute(
        `SELECT COUNT(*) AS request_count,
                GREATEST(0, ? - GREATEST(0, TIMESTAMPDIFF(SECOND, MIN(created_at), NOW())))
                  AS retry_after_seconds
         FROM password_reset_otps
         WHERE user_id = ?
           AND created_at >= DATE_SUB(NOW(), INTERVAL ? SECOND)`,
        [requestWindowSeconds, user.user_id, requestWindowSeconds],
      )
      const recentRequestCount = Number(windowRows[0]?.request_count || 0)

      if (recentRequestCount >= maximumResendsPerWindow + 1) {
        const retryAfterSeconds = Number(windowRows[0]?.retry_after_seconds || requestWindowSeconds)
        return retryResponse(
          response,
          retryAfterSeconds,
          `Too many verification code requests. Please try again in ${retryAfterSeconds} seconds.`,
        )
      }

      let otp
      let otpHash
      do {
        otp = generateOtp()
        otpHash = hashOtp(otp)
      } while (previousOtp && otpHash === previousOtp.otp_hash)

      const resendCount = request.body.isResend === true ? recentRequestCount : 0

      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        await connection.execute(
          `UPDATE password_reset_otps
           SET invalidated_at = NOW()
           WHERE user_id = ? AND used_at IS NULL AND invalidated_at IS NULL`,
          [user.user_id],
        )
        const [result] = await connection.execute(
          `INSERT INTO password_reset_otps
             (user_id, otp_hash, expires_at, resend_count, requested_ip, requested_user_agent)
           VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?, ?, ?)`,
          [
            user.user_id,
            otpHash,
            config.passwordReset.otpTtlMinutes,
            resendCount,
            metadata.ipAddress,
            metadata.userAgent.slice(0, 255),
          ],
        )
        const otpId = result.insertId
        try {
          await sendPasswordResetOtp({
            to: user.email,
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            otp,
          })
        } catch (error) {
          throw new EmailDeliveryError(error.message)
        }
        await writeAuditLog(connection, {
          userId: user.user_id,
          action: 'password_reset_otp_requested',
          tableName: 'password_reset_otps',
          recordId: otpId,
          result: 'requested',
          username: user.username,
          ...metadata,
        })
        await connection.commit()
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    } else {
      hashOtp('000000')
    }

    const remainingDelay = Math.max(0, 200 - (Date.now() - startedAt))
    if (remainingDelay) {
      await new Promise((resolve) => setTimeout(resolve, remainingDelay))
    }

    return response.status(200).json({
      message: genericRequestMessage,
      retryAfterSeconds: config.passwordReset.resendSeconds,
    })
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      console.error('Password reset email delivery failed:', error.message)
      return response.status(503).json({
        status: 'error',
        message: 'Email service is temporarily unavailable.',
      })
    }
    console.error('Request password reset OTP error:', error.message)
    return response.status(500).json({ status: 'error', message: 'Unable to request a verification code.' })
  }
}

export async function verifyPasswordResetOtp(request, response) {
  const identifier = normalizeIdentifier(request.body.identifier)
  const otp = String(request.body.otp || '').trim()
  const metadata = requestMetadata(request)

  if (!identifier || !/^\d{6}$/.test(otp)) {
    return response.status(400).json({ status: 'error', message: 'Verification code is incorrect.' })
  }

  try {
    const user = await findResetUser(identifier)
    if (!resetAllowed(user)) {
      return response.status(400).json({ status: 'error', message: 'Unable to verify the code.' })
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [otps] = await connection.execute(
        `SELECT id, otp_hash, expires_at, verified_at, used_at, invalidated_at, attempt_count
         FROM password_reset_otps
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [user.user_id],
      )
      const storedOtp = otps[0]

      let errorMessage = ''
      if (!storedOtp) errorMessage = 'Please request a new verification code.'
      else if (storedOtp.used_at) errorMessage = 'Verification code has already been used.'
      else if (storedOtp.invalidated_at) errorMessage = 'Please request a new verification code.'
      else if (storedOtp.verified_at) errorMessage = 'Verification code has already been used.'
      else if (new Date(storedOtp.expires_at).getTime() <= Date.now()) errorMessage = 'Verification code has expired.'
      else if (Number(storedOtp.attempt_count) >= 5) errorMessage = 'Too many verification attempts.'

      if (errorMessage) {
        await connection.rollback()
        return response.status(400).json({ status: 'error', message: errorMessage })
      }

      if (!otpHashMatches(otp, storedOtp.otp_hash)) {
        const attempts = Number(storedOtp.attempt_count) + 1
        await connection.execute(
          `UPDATE password_reset_otps
           SET attempt_count = ?, invalidated_at = IF(? >= 5, NOW(), invalidated_at)
           WHERE id = ?`,
          [attempts, attempts, storedOtp.id],
        )
        await writeAuditLog(connection, {
          userId: user.user_id,
          action: 'password_reset_otp_failed',
          tableName: 'password_reset_otps',
          recordId: storedOtp.id,
          result: attempts >= 5 ? 'attempt_limit' : 'incorrect',
          username: user.username,
          ...metadata,
        })
        await connection.commit()
        return response.status(400).json({
          status: 'error',
          message: attempts >= 5 ? 'Too many verification attempts.' : 'Verification code is incorrect.',
        })
      }

      const resetToken = generateResetToken()
      const tokenHash = hashResetToken(resetToken)
      await connection.execute(
        `UPDATE password_reset_tokens
         SET invalidated_at = NOW()
         WHERE user_id = ? AND used_at IS NULL AND invalidated_at IS NULL`,
        [user.user_id],
      )
      await connection.execute(
        'UPDATE password_reset_otps SET verified_at = NOW() WHERE id = ?',
        [storedOtp.id],
      )
      await connection.execute(
        `INSERT INTO password_reset_tokens (user_id, token_hash, otp_id, expires_at)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [user.user_id, tokenHash, storedOtp.id, config.passwordReset.tokenTtlMinutes],
      )
      await writeAuditLog(connection, {
        userId: user.user_id,
        action: 'password_reset_otp_verified',
        tableName: 'password_reset_otps',
        recordId: storedOtp.id,
        result: 'verified',
        username: user.username,
        ...metadata,
      })
      await connection.commit()
      return response.status(200).json({
        message: 'Verification successful.',
        resetToken,
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Verify password reset OTP error:', error)
    return response.status(500).json({ status: 'error', message: 'Unable to verify the code.' })
  }
}

export async function resetForgottenPassword(request, response) {
  const resetToken = String(request.body.resetToken || '').trim()
  const newPassword = String(request.body.newPassword || '')
  const confirmPassword = String(request.body.confirmPassword || '')
  const metadata = requestMetadata(request)

  if (!resetToken) {
    return response.status(400).json({ status: 'error', message: 'Reset token is required.' })
  }
  if (newPassword !== confirmPassword) {
    return response.status(400).json({ status: 'error', message: 'The confirmation password does not match.' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [tokens] = await connection.execute(
      `SELECT t.id, t.user_id, t.otp_id, t.expires_at, t.used_at, t.invalidated_at,
              o.verified_at, o.used_at AS otp_used_at, o.invalidated_at AS otp_invalidated_at,
              u.username, u.password_hash, u.status AS user_status,
              e.email, e.status AS employee_status
       FROM password_reset_tokens AS t
       INNER JOIN password_reset_otps AS o ON o.id = t.otp_id
       INNER JOIN users AS u ON u.user_id = t.user_id
       INNER JOIN employees AS e ON e.employee_id = u.employee_id
       WHERE t.token_hash = ?
       LIMIT 1
       FOR UPDATE`,
      [hashResetToken(resetToken)],
    )
    const token = tokens[0]

    if (!token || token.used_at || token.invalidated_at || !token.verified_at ||
        token.otp_used_at || token.otp_invalidated_at ||
        new Date(token.expires_at).getTime() <= Date.now()) {
      await connection.rollback()
      return response.status(400).json({ status: 'error', message: 'The reset token is invalid, expired or already used.' })
    }
    if (String(token.user_status).toLowerCase() !== 'active' ||
        String(token.employee_status).toLowerCase() !== 'active') {
      await connection.rollback()
      return response.status(403).json({ status: 'error', message: 'The account is not available.' })
    }

    const validationError = validateNewPassword(newPassword, token)
    if (validationError) {
      await connection.rollback()
      return response.status(400).json({ status: 'error', message: validationError })
    }
    if (await bcrypt.compare(newPassword, token.password_hash)) {
      await connection.rollback()
      return response.status(400).json({ status: 'error', message: 'The new password must be different from the current password.' })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await connection.execute(
      `UPDATE users
       SET password_hash = ?, password_changed_at = NOW(),
           must_change_password = 0, token_version = token_version + 1
       WHERE user_id = ?`,
      [passwordHash, token.user_id],
    )
    await connection.execute('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [token.id])
    await connection.execute('UPDATE password_reset_otps SET used_at = NOW() WHERE id = ?', [token.otp_id])
    await connection.execute(
      `UPDATE password_reset_tokens SET invalidated_at = NOW()
       WHERE user_id = ? AND id <> ? AND used_at IS NULL AND invalidated_at IS NULL`,
      [token.user_id, token.id],
    )
    await connection.execute(
      `UPDATE password_reset_otps SET invalidated_at = NOW()
       WHERE user_id = ? AND id <> ? AND used_at IS NULL AND invalidated_at IS NULL`,
      [token.user_id, token.otp_id],
    )
    await writeAuditLog(connection, {
      userId: token.user_id,
      action: 'password_reset_completed',
      tableName: 'users',
      recordId: token.user_id,
      result: 'success',
      username: token.username,
      ...metadata,
    })
    await connection.commit()
    return response.status(200).json({ message: 'Password reset successfully.' })
  } catch (error) {
    await connection.rollback()
    console.error('Reset forgotten password error:', error)
    return response.status(500).json({ status: 'error', message: 'Unable to reset the password.' })
  } finally {
    connection.release()
  }
}

export function resetPasswordRequestRateLimitsForTests() {
  requestBuckets.clear()
}

export { genericRequestMessage }
