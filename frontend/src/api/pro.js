import api from './client';

export const planApi = {
  getCurrentPlan: () => api.get('/plan').then(r => r.data),
  upgrade: () => api.post('/plan/upgrade').then(r => r.data),
  downgrade: () => api.post('/plan/downgrade').then(r => r.data),
};

export const workspaceApi = {
  create: (data) => api.post('/workspaces', data).then(r => r.data),
  list: () => api.get('/workspaces').then(r => r.data),
  getDetail: (id) => api.get(`/workspaces/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/workspaces/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/workspaces/${id}`).then(r => r.data),
  
  getTasks: (id) => api.get(`/workspaces/${id}/tasks`).then(r => r.data),
  createTask: (id, data) => api.post(`/workspaces/${id}/tasks`, data).then(r => r.data),
  createBatchTasks: (id, tasks) => api.post(`/workspaces/${id}/tasks/batch`, { tasks }).then(r => r.data),
  updateTask: (id, taskId, data) => api.put(`/workspaces/${id}/tasks/${taskId}`, data).then(r => r.data),
  deleteTask: (id, taskId) => api.delete(`/workspaces/${id}/tasks/${taskId}`).then(r => r.data),
  
  getTaskComments: (wsId, taskId) => api.get(`/workspaces/${wsId}/tasks/${taskId}/comments`).then(r => r.data),
  createTaskComment: (wsId, taskId, content) => api.post(`/workspaces/${wsId}/tasks/${taskId}/comments`, { content }).then(r => r.data),
  
  removeMember: (wsId, userId) => api.delete(`/workspaces/${wsId}/members/${userId}`).then(r => r.data),
  updateMemberRole: (wsId, userId, role) => api.put(`/workspaces/${wsId}/members/${userId}/role`, { role }).then(r => r.data),
};

export const inviteApi = {
  inviteMember: (wsId, email) => api.post(`/invites/workspaces/${wsId}`, { email }).then(r => r.data),
  getMyInvites: () => api.get('/invites').then(r => r.data),
  accept: (token) => api.post(`/invites/${token}/accept`).then(r => r.data),
  reject: (token) => api.post(`/invites/${token}/reject`).then(r => r.data),
  cancel: (id) => api.delete(`/invites/${id}`).then(r => r.data),
};
