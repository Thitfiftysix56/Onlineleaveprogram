import api from './axios.js'

const notificationCacheDuration = 3000
let cachedNotifications = null
let cacheUpdatedAt = 0
let pendingNotificationRequest = null

const clearNotificationCache = () => {
  cachedNotifications = null
  cacheUpdatedAt = 0
}

export const getNotifications = async ({ force = false } = {}) => {
  const now = Date.now()
  if (!force && cachedNotifications && now - cacheUpdatedAt < notificationCacheDuration) {
    return cachedNotifications
  }
  if (!force && pendingNotificationRequest) return pendingNotificationRequest

  pendingNotificationRequest = api.get('/notifications')
    .then((response) => {
      cachedNotifications = response.data?.data
      cacheUpdatedAt = Date.now()
      return cachedNotifications
    })
    .finally(() => {
      pendingNotificationRequest = null
    })
  return pendingNotificationRequest
}

export const markNotificationRead = async (id) => {
  const result = (await api.patch(`/notifications/${id}/read`)).data
  clearNotificationCache()
  return result
}

export const markAllNotificationsRead = async () => {
  const result = (await api.patch('/notifications/read-all')).data
  clearNotificationCache()
  return result
}

export const deleteNotification = async (id) => {
  const result = (await api.delete(`/notifications/${id}`)).data
  clearNotificationCache()
  return result
}
