import api from './axios.js';

export const getDepartments = async () =>
  (await api.get('/hr/departments')).data?.data?.departments || [];
export const getDepartment = async (id) =>
  (await api.get(`/hr/departments/${id}`)).data?.data?.department;
export const createDepartment = async (data) =>
  (await api.post('/hr/departments', data)).data;
export const updateDepartment = async (id, data) =>
  (await api.put(`/hr/departments/${id}`, data)).data;
export const updateDepartmentStatus = async (id, status) =>
  (await api.patch(`/hr/departments/${id}/status`, { status })).data;
