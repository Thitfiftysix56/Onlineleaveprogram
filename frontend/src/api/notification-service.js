import api from './axios.js'
export const getNotifications = async () => (await api.get('/notifications')).data?.data
export const markNotificationRead = async (id) => (await api.patch(`/notifications/${id}/read`)).data
export const markAllNotificationsRead = async () => (await api.patch('/notifications/read-all')).data
export const deleteNotification = async (id) => (await api.delete(`/notifications/${id}`)).data
