const pool = require('../config/db');

// Middleware yêu cầu user phải có gói Pro hoặc Enterprise
module.exports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.execute('SELECT plan FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    const plan = users[0].plan || 'free';
    
    if (plan === 'free') {
      return res.status(403).json({ message: 'Tính năng này chỉ dành cho gói Pro hoặc Enterprise. Vui lòng nâng cấp để sử dụng.' });
    }
    
    next();
  } catch (error) {
    console.error('Lỗi trong proMiddleware:', error);
    res.status(500).json({ message: 'Lỗi xác thực quyền truy cập' });
  }
};
