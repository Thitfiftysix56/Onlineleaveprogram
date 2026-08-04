import api from './axios.js';

export const getPositions = async () =>
  (await api.get('/hr/positions')).data?.data?.positions || [];
export const getPosition = async (id) =>
  (await api.get(`/hr/positions/${id}`)).data?.data?.position;
export const createPosition = async (data) =>
  (await api.post('/hr/positions', data)).data;
export const updatePosition = async (id, data) =>
  (await api.put(`/hr/positions/${id}`, data)).data;
export const updatePositionStatus = async (id, status) =>
  (await api.patch(`/hr/positions/${id}/status`, { status })).data;
