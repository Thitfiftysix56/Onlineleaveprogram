import mysql from 'mysql2/promise'
import { config } from './environment.js'

export const pool = mysql.createPool({
  ...config.database,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+07:00',
  dateStrings: ['DATE'],
})

export async function verifyDatabaseConnection() {
  const [rows] = await pool.query(
    'SELECT DATABASE() AS database_name, NOW() AS database_time',
  )

  return rows[0]
}