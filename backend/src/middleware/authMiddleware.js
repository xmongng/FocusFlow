const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Lấy token từ header Authorization hoặc query parameter
  const authHeader = req.header('Authorization');
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy Token, quyền truy cập bị từ chối' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
