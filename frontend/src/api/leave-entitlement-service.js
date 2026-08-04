import api from './axios.js';

export const getLeaveEntitlements = async (params = {}) =>
  (await api.get('/hr/leave-entitlements', { params })).data?.data?.leaveEntitlements || [];
export const getLeaveEntitlement = async (id) =>
  (await api.get(`/hr/leave-entitlements/${id}`)).data?.data?.leaveEntitlement;
export const createLeaveEntitlement = async (data) =>
  (await api.post('/hr/leave-entitlements', data)).data;
export const updateLeaveEntitlement = async (id, data) =>
  (await api.put(`/hr/leave-entitlements/${id}`, data)).data;
