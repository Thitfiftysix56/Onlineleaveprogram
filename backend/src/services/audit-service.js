export async function writeAuditLog(connection, {
  userId = null,
  action,
  tableName = null,
  recordId = null,
  result,
  username = '',
  adminUserId = null,
  ipAddress = null,
  userAgent = '',
}) {
  const detail = JSON.stringify({
    result,
    username: String(username || '').slice(0, 50),
    adminUserId,
    userAgent: String(userAgent || '').slice(0, 255),
  })

  await connection.execute(
    `INSERT INTO audit_logs
       (user_id, action, table_name, record_id, detail, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, action, tableName, recordId, detail, ipAddress],
  )
}
