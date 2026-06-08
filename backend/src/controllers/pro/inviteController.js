const pool = require('../../config/db');
const crypto = require('crypto');
const emailService = require('../../services/emailService');

/**
 * Gửi lời mời tham gia nhóm cho một email bất kỳ.
 * Tạo token ngẫu nhiên, lưu vào DB và gửi thư mời chứa link qua Nodemailer.
 * Chỉ Owner hoặc Admin mới có quyền gửi lời mời.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id) và body.email
 * @param {Object} res - Response object
 */
exports.inviteMember = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const inviterId = req.user.id;

  try {
    // 1. Kiểm tra quyền của người mời
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [id, inviterId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Admin hoặc Owner mới có quyền mời thành viên' });
    }

    // 2. Lấy thông tin workspace
    const [workspaces] = await pool.execute('SELECT name FROM workspaces WHERE id = ?', [id]);
    if (workspaces.length === 0) {
       return res.status(404).json({ message: 'Workspace không tồn tại' });
    }
    const workspaceName = workspaces[0].name;

    // 3. Kiểm tra xem người được mời đã có tài khoản trên hệ thống chưa
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Tài khoản email này chưa được đăng ký trên hệ thống' });
    }

    const targetUserId = users[0].id;
    const [existingMember] = await pool.execute(
      'SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, targetUserId]
    );
    if (existingMember.length > 0) {
      return res.status(400).json({ message: 'Người dùng này đã ở trong workspace' });
    }

    // 4. Tạo token và lưu vào db
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    await pool.execute(
      'INSERT INTO workspace_invites (workspace_id, email, invited_by, token, expires_at) VALUES (?, ?, ?, ?, ?)',
      [id, email, inviterId, token, expiresAt]
    );

    // 5. Gửi email mời bằng emailService
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/workspaces?invite=${token}`; // Có token để tự động nhận diện lời mời

    const emailSent = await emailService.sendWorkspaceInviteEmail(
      email,
      req.user.display_name || req.user.username || 'Một thành viên',
      workspaceName,
      inviteLink
    );

    if (!emailSent) {
      console.warn(`Ghi chú: Đã tạo lời mời trong DB nhưng không thể gửi email đến ${email}`);
    }

    res.json({ message: 'Đã gửi lời mời thành công qua Email!' });
  } catch (error) {
    console.error('Lỗi inviteMember:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách các lời mời liên quan đến người dùng hiện tại (lời mời nhận được và lời mời đã gửi đi).
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMyInvites = async (req, res) => {
  const email = req.user.email; // Lấy từ user info (cần đảm bảo authMiddleware gán đủ hoặc query thêm)
  
  try {
    const [user] = await pool.execute('SELECT email FROM users WHERE id = ?', [req.user.id]);
    const userEmail = user[0].email;

    const [invites] = await pool.execute(`
      SELECT i.id, i.token, i.status, w.name as workspace_name, u.display_name as inviter_name
      FROM workspace_invites i
      JOIN workspaces w ON i.workspace_id = w.id
      JOIN users u ON i.invited_by = u.id
      WHERE i.email = ? AND i.status = 'pending' AND i.expires_at > NOW()
    `, [userEmail]);

    res.json(invites);
  } catch (error) {
    console.error('Lỗi getMyInvites:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Chấp nhận lời mời tham gia nhóm thông qua mã token.
 * Kiểm tra tính hợp lệ của token (chưa hết hạn, đúng email).
 * Sau đó thêm người dùng vào nhóm và cập nhật trạng thái lời mời.
 * 
 * @param {Object} req - Request object, chứa params token
 * @param {Object} res - Response object
 */
exports.acceptInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    const [user] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = user[0].email;

    const [invites] = await pool.execute(
      "SELECT * FROM workspace_invites WHERE token = ? AND email = ? AND status = 'pending' AND expires_at > NOW()",
      [token, userEmail]
    );

    if (invites.length === 0) {
      return res.status(400).json({ message: 'Lời mời không hợp lệ hoặc đã hết hạn' });
    }

    const invite = invites[0];

    // Thêm vào workspace
    await pool.execute(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'member')",
      [invite.workspace_id, userId]
    );

    // Cập nhật trạng thái lời mời
    await pool.execute(
      "UPDATE workspace_invites SET status = 'accepted' WHERE id = ?",
      [invite.id]
    );

    res.json({ message: 'Đã tham gia workspace thành công' });
  } catch (error) {
    console.error('Lỗi acceptInvite:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Từ chối lời mời tham gia nhóm.
 * Cập nhật trạng thái của lời mời thành 'rejected'.
 * 
 * @param {Object} req - Request object, chứa params token
 * @param {Object} res - Response object
 */
exports.rejectInvite = async (req, res) => {
  const { token } = req.params;
  const userId = req.user.id;

  try {
    const [user] = await pool.execute('SELECT email FROM users WHERE id = ?', [userId]);
    const userEmail = user[0].email;

    await pool.execute(
      "UPDATE workspace_invites SET status = 'rejected' WHERE token = ? AND email = ?",
      [token, userEmail]
    );

    res.json({ message: 'Đã từ chối lời mời' });
  } catch (error) {
    console.error('Lỗi rejectInvite:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Thu hồi/Hủy bỏ một lời mời đã gửi đi (dành cho Admin/Owner).
 * 
 * @param {Object} req - Request object, chứa params id (invite_id)
 * @param {Object} res - Response object
 */
exports.cancelInvite = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user.id;

  try {
    const [invites] = await pool.execute('SELECT workspace_id FROM workspace_invites WHERE id = ?', [id]);
    if (invites.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lời mời' });
    }

    const workspaceId = invites[0].workspace_id;
    
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [workspaceId, requesterId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền hủy lời mời này' });
    }

    await pool.execute('DELETE FROM workspace_invites WHERE id = ?', [id]);
    res.json({ message: 'Đã hủy lời mời' });
  } catch (error) {
    console.error('Lỗi cancelInvite:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
