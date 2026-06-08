// Map lưu trữ các client SSE đang hoạt động
// Khóa: userId (Integer), Giá trị: Set chứa các đối tượng Response (res)
const clients = new Map();

const realtimeService = {
  /**
   * Thêm một kết nối client mới
   * @param {number|string} userId 
   * @param {object} res - Express Response object
   */
  addClient(userId, res) {
    const key = parseInt(userId);
    if (isNaN(key)) return;

    if (!clients.has(key)) {
      clients.set(key, new Set());
    }
    clients.get(key).add(res);
    console.log(`[SSE] Người dùng ${key} đã kết nối. Số lượng kết nối hiện tại: ${clients.get(key).size}`);
  },

  /**
   * Đóng/Xóa một kết nối client
   * @param {number|string} userId 
   * @param {object} res - Express Response object
   */
  removeClient(userId, res) {
    const key = parseInt(userId);
    if (isNaN(key)) return;

    if (clients.has(key)) {
      const userClients = clients.get(key);
      userClients.delete(res);
      console.log(`[SSE] Người dùng ${key} ngắt kết nối. Kết nối còn lại: ${userClients.size}`);
      if (userClients.size === 0) {
        clients.delete(key);
      }
    }
  },

  /**
   * Gửi sự kiện thời gian thực tới một người dùng cụ thể (tất cả các tab đang mở)
   * @param {number|string} userId 
   * @param {string} event - Tên sự kiện (ví dụ: 'new_comment', 'new_notification')
   * @param {object} data - Dữ liệu gửi đi (JSON object)
   */
  sendToUser(userId, event, data) {
    const key = parseInt(userId);
    if (isNaN(key)) return;

    const userClients = clients.get(key);
    if (userClients && userClients.size > 0) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      for (const res of userClients) {
        try {
          res.write(payload);
        } catch (err) {
          console.error(`[SSE] Lỗi khi gửi dữ liệu cho người dùng ${userId}:`, err);
        }
      }
    }
  },

  /**
   * Gửi sự kiện thời gian thực tới danh sách người dùng
   * @param {Array<number|string>} userIds 
   * @param {string} event 
   * @param {object} data 
   */
  sendToUsers(userIds, event, data) {
    if (!Array.isArray(userIds)) return;
    userIds.forEach(id => this.sendToUser(id, event, data));
  }
};

module.exports = realtimeService;
