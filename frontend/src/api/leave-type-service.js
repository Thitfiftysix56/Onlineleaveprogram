import api from './axios.js';

export const getLeaveTypes = async () =>
  (await api.get('/hr/leave-types')).data?.data?.leaveTypes || [];
export const getLeaveType = async (id) =>
  (await api.get(`/hr/leave-types/${id}`)).data?.data?.leaveType;
export const createLeaveType = async (data) =>
  (await api.post('/hr/leave-types', data)).data;
export const updateLeaveType = async (id, data) =>
  (await api.put(`/hr/leave-types/${id}`, data)).data;
export const updateLeaveTypeStatus = async (id, status) =>
  (await api.patch(`/hr/leave-types/${id}/status`, { status })).data;
