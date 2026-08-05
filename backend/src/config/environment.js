const requiredVariables = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'JWT_SECRET',
]

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`,
    )
  }
}

export const config = {
  port: Number(
    process.env.PORT || 8082,
  ),

  nodeEnv:
    process.env.NODE_ENV ||
    'development',

  corsOrigins: (
    process.env.CORS_ORIGINS ||
    'http://localhost:5173'
  )
    .split(',')
    .map((origin) =>
      origin.trim(),
    )
    .filter(Boolean),

  jwtSecret:
    process.env.JWT_SECRET,

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN ||
    '8h',

  passwordReset: {
    otpSecret:
      process.env.PASSWORD_RESET_OTP_SECRET ||
      (process.env.NODE_ENV === 'test'
        ? 'test-password-reset-otp-secret-at-least-32-bytes'
        : ''),
    otpTtlMinutes: Number(process.env.PASSWORD_RESET_OTP_TTL_MINUTES || 5),
    tokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15),
    resendSeconds: Number(process.env.PASSWORD_RESET_RESEND_SECONDS || 60),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'Online Leave Approval System <no-reply@organization.local>',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  database: {
    host:
      process.env.DB_HOST,

    port: Number(
      process.env.DB_PORT,
    ),

    database:
      process.env.DB_NAME,

    user:
      process.env.DB_USER,

    password:
      process.env.DB_PASSWORD ||
      '',

    connectionLimit: Number(
      process.env
        .DB_CONNECTION_LIMIT ||
        10,
    ),
  },
}
