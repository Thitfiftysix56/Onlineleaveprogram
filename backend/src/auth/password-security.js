import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto'

import { config } from '../config/environment.js'
import { validateNewPassword } from './password-policy.js'

export function generateTemporaryPassword() {
  let password = ''

  do {
    password = `Ol!${randomBytes(9).toString('base64url')}9aA`
  } while (validateNewPassword(password))

  return password
}

export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export function hashOtp(otp) {
  if (!config.passwordReset.otpSecret) {
    throw new Error('PASSWORD_RESET_OTP_SECRET is required')
  }

  return createHmac('sha256', config.passwordReset.otpSecret)
    .update(String(otp))
    .digest('hex')
}

export function otpHashMatches(otp, expectedHash) {
  const actual = Buffer.from(hashOtp(otp), 'hex')
  const expected = Buffer.from(String(expectedHash || ''), 'hex')

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function generateResetToken() {
  return randomBytes(32).toString('base64url')
}

export function hashResetToken(token) {
  return createHash('sha256').update(String(token)).digest('hex')
}

export function hashRateLimitKey(value) {
  return createHash('sha256').update(String(value).toLowerCase()).digest('hex')
}
