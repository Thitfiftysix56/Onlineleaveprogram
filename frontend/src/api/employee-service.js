import api from './axios.js';

export const getEmployees = async (params = {}) =>
  (await api.get('/hr/employees', { params })).data?.data?.employees || [];
export const getEmployee = async (id) =>
  (await api.get(`/hr/employees/${id}`)).data?.data?.employee;
export const createEmployee = async (data) =>
  (await api.post('/hr/employees', data)).data;
export const updateEmployee = async (id, data) =>
  (await api.put(`/hr/employees/${id}`, data)).data;
export const updateEmployeeStatus = async (id, status) =>
  (await api.patch(`/hr/employees/${id}/status`, { status })).data;
