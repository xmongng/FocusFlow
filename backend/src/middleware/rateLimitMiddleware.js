const pool = require('../config/db');

// Giới hạn request AI: Free = 20/ngày, Pro = 100/ngày, Enterprise = Unlimited
module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Lấy thông tin plan và request count hiện tại
    const [users] = await pool.execute(
      'SELECT plan, ai_request_count, ai_request_date FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    const user = users[0];
    const plan = user.plan || 'free';
    
    // Lấy ngày hiện tại
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Ngày lấy từ DB có thể là Date object, chuyển về string dạng YYYY-MM-DD
    let dbDateStr = null;
    if (user.ai_request_date) {
      // Đảm bảo UTC handling nếu cần, ở đây dùng toISOString
      try {
         dbDateStr = new Date(user.ai_request_date).toISOString().split('T')[0];
      } catch (e) {
         dbDateStr = null;
      }
    }
    
    // Nếu sang ngày mới, reset bộ đếm
    let currentCount = user.ai_request_count;
    if (dbDateStr !== todayStr) {
      currentCount = 0;
    }
    
    // Kiểm tra giới hạn dựa trên plan
    let maxRequests = 20; // free
    if (plan === 'pro') maxRequests = 100;
    if (plan === 'enterprise') maxRequests = 999999;
    
    if (currentCount >= maxRequests) {
      return res.status(429).json({ 
        message: 'Bạn đã đạt giới hạn sử dụng AI hôm nay. Nâng cấp gói Pro để tăng giới hạn.',
        limit: maxRequests,
        used: currentCount
      });
    }
    
    // Tăng bộ đếm và cập nhật ngày
    await pool.execute(
      'UPDATE users SET ai_request_count = ?, ai_request_date = ? WHERE id = ?',
      [currentCount + 1, todayStr, userId]
    );
    
    // Chuyển thông tin cho các hàm tiếp theo
    req.aiUsage = {
      limit: maxRequests,
      used: currentCount + 1
    };
    
    next();
  } catch (error) {
    console.error('Lỗi trong rateLimitMiddleware:', error);
    res.status(500).json({ message: 'Lỗi khi kiểm tra giới hạn AI' });
  }
};
