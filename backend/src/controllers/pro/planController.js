const pool = require('../../config/db');

/**
 * Lấy thông tin gói dịch vụ hiện tại của người dùng.
 * Bao gồm tên gói, số lượng request AI đã sử dụng trong tháng, v.v.
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.execute(
      'SELECT plan, ai_request_count, ai_request_date FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const user = users[0];
    const plan = user.plan || 'free';
    
    // Xử lý bộ đếm request ngày hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    let dbDateStr = null;
    if (user.ai_request_date) {
      try {
         dbDateStr = new Date(user.ai_request_date).toISOString().split('T')[0];
      } catch (e) {}
    }

    let currentCount = user.ai_request_count;
    if (dbDateStr !== todayStr) {
      currentCount = 0;
    }

    let maxRequests = 20;
    if (plan === 'pro') maxRequests = 100;
    if (plan === 'enterprise') maxRequests = 999999;

    res.json({
      plan,
      aiUsage: {
        used: currentCount,
        limit: maxRequests
      }
    });
  } catch (error) {
    console.error('Lỗi getCurrentPlan:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Nâng cấp tài khoản của người dùng lên gói Pro.
 * (Tương lai có thể tích hợp thanh toán tại đây).
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.upgradeToPro = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.execute("UPDATE users SET plan = 'pro' WHERE id = ?", [userId]);
    res.json({ message: 'Đã nâng cấp lên gói Pro thành công!', plan: 'pro' });
  } catch (error) {
    console.error('Lỗi upgradeToPro:', error);
    res.status(500).json({ message: 'Lỗi khi nâng cấp' });
  }
};

/**
 * Hạ cấp tài khoản của người dùng về gói Free (Miễn phí).
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.downgradeToFree = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Kiểm tra xem user có đang là owner của workspace nào không
    const [workspaces] = await pool.execute('SELECT id FROM workspaces WHERE owner_id = ?', [userId]);
    if (workspaces.length > 0) {
      return res.status(400).json({ 
        message: 'Bạn phải xóa hoặc chuyển nhượng quyền sở hữu các workspace trước khi hạ cấp về gói Free.' 
      });
    }

    await pool.execute("UPDATE users SET plan = 'free' WHERE id = ?", [userId]);
    res.json({ message: 'Đã hạ cấp về gói Free.', plan: 'free' });
  } catch (error) {
    console.error('Lỗi downgradeToFree:', error);
    res.status(500).json({ message: 'Lỗi khi hạ cấp' });
  }
};
