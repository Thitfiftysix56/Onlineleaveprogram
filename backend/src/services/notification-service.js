export async function createNotification(connection, {
  userId,
  type,
  title,
  message,
  leaveRequestId = null,
}) {
  await connection.execute(
    `INSERT INTO notifications
       (user_id, leave_request_id, title, message, notification_type, is_read)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [userId, leaveRequestId, title, message, type],
  )
}
