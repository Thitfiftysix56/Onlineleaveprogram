import api from './axios.js'

const form = (data, attachments = []) => {
  const body = new FormData()
  for (const [key, value] of Object.entries(data)) if (value !== null && value !== undefined) body.append(key, value)
  for (const file of attachments) if (file instanceof File) body.append('attachments', file)
  return body
}
const config = { headers: { 'Content-Type': 'multipart/form-data' } }

export const getLeaveOptions = async (year) => (await api.get('/leave/options', { params: { year } })).data?.data
export const getMyLeaveRequests = async () => (await api.get('/leave/requests')).data?.data?.leaveRequests || []
export const getMyLeaveRequest = async (id) => (await api.get(`/leave/requests/${id}`)).data?.data?.leaveRequest
export const saveLeaveDraft = async (data, attachments) => (await api.post('/leave/requests/drafts', form(data, attachments), config)).data
export const updateLeaveDraft = async (id, data, attachments) => (await api.put(`/leave/requests/${id}/draft`, form(data, attachments), config)).data
export const submitLeaveRequest = async (data, attachments) => (await api.post('/leave/requests/submit', form(data, attachments), config)).data
export const submitLeaveDraft = async (id, data, attachments) => (await api.post(`/leave/requests/${id}/submit`, form(data, attachments), config)).data
export const deleteLeaveDraft = async (id) => (await api.delete(`/leave/requests/${id}/draft`)).data
export const cancelLeaveRequest = async (id) => (await api.patch(`/leave/requests/${id}/cancel`)).data
export const getLeaveBalance = async (year) => (await api.get('/leave/balance', { params: { year } })).data?.data
export const deleteLeaveAttachment = async (id) => (await api.delete(`/leave-attachments/${id}`)).data
export const getSupervisorApprovals = async () => (await api.get('/supervisor/approvals')).data?.data?.leaveRequests || []
export const getSupervisorApproval = async (id) => (await api.get(`/supervisor/approvals/${id}`)).data?.data?.leaveRequest
export const decideLeaveRequest = async (id, decision, reason = '') => (await api.post(`/supervisor/approvals/${id}/decision`, { decision, reason })).data
export const getTeamReport = async (params) => (await api.get('/supervisor/team-report', { params })).data?.data
