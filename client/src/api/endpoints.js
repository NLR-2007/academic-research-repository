import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  verifyOtp: (data) => api.post('/auth/admin/verify-otp', data)
};

export const paperApi = {
  list: (params) => api.get('/papers', { params }),
  trending: () => api.get('/papers/trending'),
  detail: (id, params) => api.get(`/papers/${id}`, { params }),
  uploadTemp: (formData) => api.post('/papers/upload-temp', formData),
  extract: (data) => api.post('/papers/extract', data),
  duplicateCheck: (title) => api.get('/papers/duplicate-check', { params: { title } }),
  submit: (data) => api.post('/papers/submit', data),
  update: (id, data) => api.put(`/papers/${id}`, data),
  requestAccess: (id) => api.post(`/papers/${id}/request-access`),
  respondAccess: (requestId, status) => api.post(`/papers/access-requests/${requestId}/respond`, { status }),
  shareLink: (id) => api.post(`/papers/${id}/share-link`)
};

export const categoryApi = {
  list: () => api.get('/categories')
};

export const userApi = {
  profile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  markNotificationsRead: () => api.patch('/users/notifications/read')
};

export const adminApi = {
  dashboard: (params) => api.get('/admin/dashboard', { params }),
  pendingCount: () => api.get('/admin/pending-count'),
  papers: (params) => api.get('/admin/papers', { params }),
  approve: (id) => api.patch(`/admin/papers/${id}/approve`),
  reject: (id, reason) => api.patch(`/admin/papers/${id}/reject`, { reason }),
  deletePaper: (id, reason) => api.delete(`/admin/papers/${id}`, { data: { reason } }),
  users: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  logs: () => api.get('/admin/logs')
};
