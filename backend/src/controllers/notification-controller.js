import { pool } from '../config/database.js'

const id = (value) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const data = (row) => ({
  id: row.notification_id,
  notificationId: row.notification_id,
  type: row.notification_type,
  leaveRequestId: row.leave_request_id,
  title: row.title,
  message: row.message,
  path: notificationPath(row.notification_type, row.leave_request_id),
  read: Boolean(row.is_read),
  readAt: null,
  createdAt: row.created_at,
})

function notificationPath(type, leaveRequestId) {
  if (!leaveRequestId) return null
  if (type === 'leave-submitted') return `/supervisor/approval/${leaveRequestId}`
  if (['leave-approved', 'leave-rejected'].includes(type)) {
    return `/employee/my-requests/${leaveRequestId}`
  }
  return null
}

export async function listNotifications(request, response) {
  const [rows] = await pool.execute(
    `SELECT notification_id, notification_type, leave_request_id, title, message, is_read, created_at
     FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [request.user.userId],
  )
  const [[count]] = await pool.execute(
    'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0', [request.user.userId],
  )
  response.json({ status: 'ok', data: { notifications: rows.map(data), unreadCount: Number(count.unread_count) } })
}

export async function markNotificationRead(request, response) {
  const notificationId = id(request.params.notificationId)
  if (!notificationId) return response.status(400).json({ status: 'error', message: 'A valid notificationId is required.' })
  const [result] = await pool.execute(
    'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?',
    [notificationId, request.user.userId],
  )
  if (!result.affectedRows) return response.status(404).json({ status: 'error', message: 'Notification was not found.' })
  response.json({ status: 'ok', message: 'Notification marked as read.' })
}

export async function markAllNotificationsRead(request, response) {
  await pool.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [request.user.userId])
  response.json({ status: 'ok', message: 'All notifications marked as read.' })
}

export async function deleteNotification(request, response) {
  const notificationId = id(request.params.notificationId)
  if (!notificationId) return response.status(400).json({ status: 'error', message: 'A valid notificationId is required.' })
  const [result] = await pool.execute('DELETE FROM notifications WHERE notification_id = ? AND user_id = ?', [notificationId, request.user.userId])
  if (!result.affectedRows) return response.status(404).json({ status: 'error', message: 'Notification was not found.' })
  response.json({ status: 'ok', message: 'Notification deleted.' })
}
