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
import {
  createDepartment,
  createEmployee,
  createHoliday,
  createLeaveEntitlement,
  createLeaveType,
  createPosition,
  deleteHoliday,
  getDepartment,
  getEmployee,
  getHoliday,
  getLeaveEntitlement,
  getLeaveType,
  getPosition,
  listDepartments,
  listEmployees,
  listHolidays,
  listLeaveEntitlements,
  listLeaveTypes,
  listPositions,
  updateDepartment,
  updateDepartmentStatus,
  updateEmployee,
  updateEmployeeStatus,
  updateHoliday,
  updateLeaveEntitlement,
  updateLeaveType,
  updateLeaveTypeStatus,
  updatePosition,
  updatePositionStatus,
} from './controllers/hr-management-controller.js'
import { requireAdmin, requireHrOrAdmin } from './middleware/authorization.js'

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

const hrRoutes = [
  ['get', '/api/hr/employees', listEmployees],
  ['get', '/api/hr/employees/:employeeId', getEmployee],
  ['post', '/api/hr/employees', createEmployee],
  ['put', '/api/hr/employees/:employeeId', updateEmployee],
  ['patch', '/api/hr/employees/:employeeId/status', updateEmployeeStatus],
  ['get', '/api/hr/departments', listDepartments],
  ['get', '/api/hr/departments/:departmentId', getDepartment],
  ['post', '/api/hr/departments', createDepartment],
  ['put', '/api/hr/departments/:departmentId', updateDepartment],
  ['patch', '/api/hr/departments/:departmentId/status', updateDepartmentStatus],
  ['get', '/api/hr/positions', listPositions],
  ['get', '/api/hr/positions/:positionId', getPosition],
  ['post', '/api/hr/positions', createPosition],
  ['put', '/api/hr/positions/:positionId', updatePosition],
  ['patch', '/api/hr/positions/:positionId/status', updatePositionStatus],
  ['get', '/api/hr/leave-types', listLeaveTypes],
  ['get', '/api/hr/leave-types/:leaveTypeId', getLeaveType],
  ['post', '/api/hr/leave-types', createLeaveType],
  ['put', '/api/hr/leave-types/:leaveTypeId', updateLeaveType],
  ['patch', '/api/hr/leave-types/:leaveTypeId/status', updateLeaveTypeStatus],
  ['get', '/api/hr/holidays', listHolidays],
  ['get', '/api/hr/holidays/:holidayId', getHoliday],
  ['post', '/api/hr/holidays', createHoliday],
  ['put', '/api/hr/holidays/:holidayId', updateHoliday],
  ['delete', '/api/hr/holidays/:holidayId', deleteHoliday],
  ['get', '/api/hr/leave-entitlements', listLeaveEntitlements],
  ['get', '/api/hr/leave-entitlements/:entitlementId', getLeaveEntitlement],
  ['post', '/api/hr/leave-entitlements', createLeaveEntitlement],
  ['put', '/api/hr/leave-entitlements/:entitlementId', updateLeaveEntitlement],
]

for (const [method, path, handler] of hrRoutes) {
  expressApp[method](path, requireAuthentication, requireHrOrAdmin, handler)
}

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
