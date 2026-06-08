import api from './client';

// Các API liên quan đến Xác thực (Đăng nhập, Đăng ký, Đăng xuất, Lấy thông tin cá nhân, Google OAuth)
export const authApi = {
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  getMe: () => api.get('/auth/me').then(r => r.data),
  googleLogin: (idToken) => api.post('/auth/google-login', { idToken }).then(r => r.data),
  // Gửi yêu cầu quên mật khẩu (nhập email)
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(r => r.data),
  // Thực hiện đặt lại mật khẩu mới bằng token
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }).then(r => r.data),
};

// Các API liên quan đến Công việc (Lấy danh sách, Tạo mới, Cập nhật, Xóa, Hoàn thành công việc)
export const tasksApi = {
  list: (params) => api.get('/tasks', { params }).then(r => r.data),
  create: (data) => api.post('/tasks', data).then(r => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
  complete: (id) => api.patch(`/tasks/${id}/complete`).then(r => r.data),
};

// Các API liên quan đến Danh mục/Thư mục phân loại công việc
export const categoriesApi = {
  list: () => api.get('/categories').then(r => r.data),
  create: (data) => api.post('/categories', data).then(r => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/categories/${id}`).then(r => r.data),
};

// Các API lấy dữ liệu tổng hợp cho trang Tổng quan (Dashboard)
export const dashboardApi = {
  getToday: () => api.get('/dashboard/today').then(r => r.data),
};

// Các API quản lý Thông báo (Lấy danh sách, Đánh dấu đã đọc, Đếm số thông báo chưa đọc)
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }).then(r => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then(r => r.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
};

// Các API liên quan đến Trợ lý ảo AI (Trò chuyện, Đề xuất kế hoạch thông minh, Cam kết lịch trình tự động)
export const aiApi = {
  chat: (messages) => api.post('/ai/chat', { messages }).then(r => r.data),
  generatePlan: (userInput, dateStr) => api.post('/ai/plan', { userInput, dateStr }).then(r => r.data),
  commitPlan: (blocks, dateStr) => api.post('/ai/plan/commit', { blocks, dateStr }).then(r => r.data),
};
