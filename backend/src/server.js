import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import {
  changePassword,
  currentUser,
  login,
  logout,
  requireAuthentication,
} from './controllers/auth-controller.js'
import {
  createAdminUser,
  getAdminUser,
  listAdminUsers,
  listAvailableEmployees,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserStatus,
} from './controllers/admin-users-controller.js'
import { config } from './config/environment.js'
import { pool, verifyDatabaseConnection } from './config/database.js'
import { requireAdmin } from './middleware/authorization.js'

export const expressApp = express()

expressApp.disable('x-powered-by')
expressApp.set('trust proxy', 1)
expressApp.use(helmet())
expressApp.use(cors({
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Origin is not allowed by CORS'))
  },
  credentials: true,
}))
expressApp.use(express.json({ limit: '1mb' }))
expressApp.use(express.urlencoded({ extended: false }))
expressApp.use(cookieParser())

async function health(_request, response) {
  const database = await verifyDatabaseConnection()

  response.json({
    status: 'ok',
    services: {
      backend: 'connected',
      database: 'connected',
    },
    runtime: `node ${process.version}`,
    database: database.database_name,
    timestamp: new Date().toISOString(),
  })
}

expressApp.get('/api', (_request, response) => {
  response.json({
    name: 'Online Leave System API',
    runtime: 'Node.js + Express',
    status: 'ok',
  })
})
expressApp.get('/api/health', health)
expressApp.post('/api/auth/login', login)
expressApp.get('/api/auth/me', requireAuthentication, currentUser)
expressApp.post(
  '/api/auth/change-password',
  requireAuthentication,
  changePassword,
)
expressApp.post('/api/auth/logout', logout)
expressApp.get(
  '/api/admin/users',
  requireAuthentication,
  requireAdmin,
  listAdminUsers,
)
expressApp.get(
  '/api/admin/employees/available-for-account',
  requireAuthentication,
  requireAdmin,
  listAvailableEmployees,
)
expressApp.get(
  '/api/admin/users/:userId',
  requireAuthentication,
  requireAdmin,
  getAdminUser,
)
expressApp.post(
  '/api/admin/users',
  requireAuthentication,
  requireAdmin,
  createAdminUser,
)
expressApp.put(
  '/api/admin/users/:userId',
  requireAuthentication,
  requireAdmin,
  updateAdminUser,
)
expressApp.patch(
  '/api/admin/users/:userId/status',
  requireAuthentication,
  requireAdmin,
  updateAdminUserStatus,
)
expressApp.post(
  '/api/admin/users/:userId/reset-password',
  requireAuthentication,
  requireAdmin,
  resetAdminUserPassword,
)

expressApp.use((request, response) => {
  response.status(404).json({
    status: 'error',
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  })
})

expressApp.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'production'
      ? 'Internal server error'
      : error.message,
  })
})

let server = null

if (config.nodeEnv !== 'test') {
  server = expressApp.listen(config.port, '0.0.0.0', async () => {
    try {
      const database = await verifyDatabaseConnection()
      console.log(
        `Express listening on port ${config.port}; connected to ${database.database_name}`,
      )
    } catch (error) {
      console.error('Express started but database connection failed', error)
    }
  })
}

async function shutdown(signal) {
  if (!server) {
    return
  }

  console.log(`${signal} received; shutting down`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

if (server) {
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}
