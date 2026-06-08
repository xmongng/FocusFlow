const pool = require('../../config/db');

/**
 * Xóa một thành viên khỏi workspace hoặc cho phép thành viên tự rời nhóm.
 * Owner không thể tự rời nhóm mà phải xóa nhóm hoặc chuyển quyền.
 * Admin không thể xóa Admin khác.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id) và userId (người cần xóa)
 * @param {Object} res - Response object
 */
exports.removeMember = async (req, res) => {
  const { id, userId: targetUserId } = req.params;
  const requesterId = req.user.id;

  try {
    const [requester] = await pool.execute(
      'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, requesterId]
    );

    if (requester.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền' });
    }

    const [target] = await pool.execute(
      'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, targetUserId]
    );

    if (target.length === 0) {
      return res.status(404).json({ message: 'Thành viên không tồn tại trong workspace' });
    }

    if (target[0].role === 'owner') {
      if (requesterId === parseInt(targetUserId)) {
        return res.status(403).json({ message: 'Chủ sở hữu (Owner) không thể tự thoát nhóm. Hãy chuyển quyền hoặc xóa nhóm.' });
      }
      return res.status(403).json({ message: 'Không thể xóa Chủ sở hữu (Owner)' });
    }

    // Chỉ owner hoặc admin mới được xóa người khác (admin không được xóa admin khác)
    if (requesterId !== parseInt(targetUserId)) {
      if (requester[0].role === 'member') {
        return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên' });
      }
      if (requester[0].role === 'admin' && target[0].role === 'admin') {
         return res.status(403).json({ message: 'Admin không thể xóa Admin khác' });
      }
    }

    await pool.execute('DELETE FROM workspace_members WHERE workspace_id = ? AND user_id = ?', [id, targetUserId]);
    res.json({ message: 'Đã xóa thành viên khỏi workspace' });
  } catch (error) {
    console.error('Lỗi removeMember:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật vai trò (quyền hạn) của một thành viên trong nhóm.
 * Chỉ Owner mới có quyền đổi vai trò của người khác thành Admin hoặc Member.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id), userId (người cần đổi) và body.role ('admin', 'member')
 * @param {Object} res - Response object
 */
exports.updateMemberRole = async (req, res) => {
  const { id, userId: targetUserId } = req.params;
  const { role } = req.body;
  const requesterId = req.user.id;

  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ message: 'Quyền không hợp lệ' });
  }

  try {
    const [requester] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role = 'owner'",
      [id, requesterId]
    );

    if (requester.length === 0) {
      return res.status(403).json({ message: 'Chỉ Owner mới được đổi quyền thành viên' });
    }

    await pool.execute(
      'UPDATE workspace_members SET role = ? WHERE workspace_id = ? AND user_id = ?',
      [role, id, targetUserId]
    );

    res.json({ message: 'Đã cập nhật quyền thành viên' });
  } catch (error) {
    console.error('Lỗi updateMemberRole:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
