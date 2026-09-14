import { pool } from '../config/database.js'

const id = (value) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const data = (row) => ({
  id: row.notification_id,
  notificationId: row.notification_id,
  type: row.notification_type,
  leaveRequestId: row.leave_request_id,
  title: row.title,
  message: row.message,
  path: notificationPath(row.notification_type, row.leave_request_id, row.owner_role, row.recipient_role),
  read: Boolean(row.is_read),
  readAt: null,
  createdAt: row.created_at,
})

function notificationPath(type, leaveRequestId, ownerRole = 'Employee', recipientRole = 'Employee') {
  if (type === 'employee-account-required') return '/admin/user-management'
  if (type === 'user-account-deleted') return '/hr/employee-management'
  if (!leaveRequestId) return null
  if (type === 'leave-submitted' || type === 'leave-cancelled') {
    return String(recipientRole).toLowerCase() === 'hr'
      ? `/hr/approval/${leaveRequestId}`
      : `/supervisor/approval/${leaveRequestId}`
  }
  if (['leave-approved', 'leave-rejected'].includes(type)) {
    const role = String(ownerRole || 'Employee').toLowerCase()
    return `/${['employee', 'supervisor', 'hr', 'admin'].includes(role) ? role : 'employee'}/my-requests/${leaveRequestId}`
  }
  return null
}

export async function listNotifications(request, response) {
  const [rows] = await pool.execute(
    `SELECT n.notification_id, n.notification_type, n.leave_request_id, n.title, n.message, n.is_read, n.created_at,
       owner_role.role_name AS owner_role, recipient_role.role_name AS recipient_role
     FROM notifications n
     LEFT JOIN leave_requests lr ON lr.leave_request_id = n.leave_request_id
     LEFT JOIN users owner_user ON owner_user.employee_id = lr.employee_id
     LEFT JOIN roles owner_role ON owner_role.role_id = owner_user.role_id
     LEFT JOIN users recipient_user ON recipient_user.user_id = n.user_id
     LEFT JOIN roles recipient_role ON recipient_role.role_id = recipient_user.role_id
     WHERE n.user_id = ?
       AND (n.notification_type <> 'leave-cancelled'
         OR owner_user.user_id IS NULL
         OR n.user_id <> owner_user.user_id)
     ORDER BY n.created_at DESC`, [request.user.userId],
  )
  const [[count]] = await pool.execute(
    `SELECT COUNT(*) AS unread_count
     FROM notifications n
     LEFT JOIN leave_requests lr ON lr.leave_request_id = n.leave_request_id
     LEFT JOIN users owner_user ON owner_user.employee_id = lr.employee_id
     WHERE n.user_id = ?
       AND n.is_read = 0
       AND (n.notification_type <> 'leave-cancelled'
         OR owner_user.user_id IS NULL
         OR n.user_id <> owner_user.user_id)`,
    [request.user.userId],
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
