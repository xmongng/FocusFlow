const pool = require('../config/db');

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json({ notifications: rows });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đánh dấu một thông báo là đã đọc
exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    res.json({ message: 'Đã đánh dấu là đã đọc' });
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đánh dấu tất cả là đã đọc
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Lỗi khi lấy số lượng thông báo chưa đọc:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    res.json({ message: 'Đã xóa thông báo' });
  } catch (error) {
    console.error('Lỗi khi xóa thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
