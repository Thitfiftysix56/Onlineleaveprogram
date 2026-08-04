import api from './axios.js';

export const getHolidays = async (params = {}) =>
  (await api.get('/hr/holidays', { params })).data?.data?.holidays || [];
export const getHoliday = async (id) =>
  (await api.get(`/hr/holidays/${id}`)).data?.data?.holiday;
export const createHoliday = async (data) =>
  (await api.post('/hr/holidays', data)).data;
export const updateHoliday = async (id, data) =>
  (await api.put(`/hr/holidays/${id}`, data)).data;
export const deleteHoliday = async (id) =>
  (await api.delete(`/hr/holidays/${id}`)).data;
