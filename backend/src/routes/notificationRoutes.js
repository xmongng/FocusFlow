const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  getUnreadCount,
  deleteNotification,
} = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

// Áp dụng middleware xác thực cho tất cả các route
router.use(auth);

// SSE Connection Endpoint
router.get('/realtime', (req, res) => {
  const userId = req.user.id;

  // Thiết lập Headers cho Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Gửi heartbeat mỗi 20 giây để giữ kết nối không bị đóng bởi proxy/trình duyệt
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  const realtimeService = require('../services/realtimeService');
  realtimeService.addClient(userId, res);

  req.on('close', () => {
    clearInterval(heartbeat);
    realtimeService.removeClient(userId, res);
  });
});

// Các route cho notifications
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
