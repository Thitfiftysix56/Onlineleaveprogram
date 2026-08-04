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