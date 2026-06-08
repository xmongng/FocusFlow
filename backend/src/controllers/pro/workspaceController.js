const pool = require('../../config/db');

/**
 * Tạo một workspace (nhóm làm việc) mới.
 * Người tạo sẽ tự động trở thành Chủ sở hữu (Owner) của workspace đó.
 * 
 * @param {Object} req - Request object, chứa body gồm (name, description, color)
 * @param {Object} res - Response object
 */
exports.createWorkspace = async (req, res) => {
  const { name, description, color } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ message: 'Tên workspace là bắt buộc' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO workspaces (name, description, owner_id, color) VALUES (?, ?, ?, ?)',
      [name, description || '', userId, color || '#6366f1']
    );

    const workspaceId = result.insertId;

    // Thêm người tạo vào bảng members với role owner
    await pool.execute(
      "INSERT INTO workspace_members (workspace_id, user_id, role) VALUES (?, ?, 'owner')",
      [workspaceId, userId]
    );

    const [workspaces] = await pool.execute('SELECT * FROM workspaces WHERE id = ?', [workspaceId]);
    res.status(201).json(workspaces[0]);
  } catch (error) {
    console.error('Lỗi createWorkspace:', error);
    res.status(500).json({ message: 'Lỗi khi tạo workspace' });
  }
};

/**
 * Lấy danh sách tất cả các workspace mà người dùng hiện tại đang tham gia.
 * Kèm theo thông tin về vai trò (role) của họ trong từng nhóm.
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getMyWorkspaces = async (req, res) => {
  const userId = req.user.id;
  try {
    const [workspaces] = await pool.execute(`
      SELECT w.*, wm.role 
      FROM workspaces w
      JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ?
    `, [userId]);
    res.json(workspaces);
  } catch (error) {
    console.error('Lỗi getMyWorkspaces:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Lấy thông tin chi tiết của một workspace, bao gồm danh sách thành viên và vai trò.
 * Yêu cầu người xem phải là thành viên của nhóm.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id)
 * @param {Object} res - Response object
 */
exports.getWorkspaceDetail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Kiểm tra quyền truy cập (có phải là member không)
    const [members] = await pool.execute(
      'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập workspace này' });
    }

    const [workspaces] = await pool.execute('SELECT * FROM workspaces WHERE id = ?', [id]);
    
    // Lấy danh sách thành viên
    const [memberList] = await pool.execute(`
      SELECT u.id, u.username, u.email, u.display_name, wm.role, wm.joined_at
      FROM workspace_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = ?
    `, [id]);

    res.json({
      ...workspaces[0],
      myRole: members[0].role,
      members: memberList
    });
  } catch (error) {
    console.error('Lỗi getWorkspaceDetail:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật thông tin cơ bản của workspace (tên, mô tả, màu sắc).
 * Chỉ dành cho Owner và Admin.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id) và body (name, description, color)
 * @param {Object} res - Response object
 */
exports.updateWorkspace = async (req, res) => {
  const { id } = req.params;
  const { name, description, color } = req.body;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Admin hoặc Owner mới được sửa workspace' });
    }

    await pool.execute(
      'UPDATE workspaces SET name = ?, description = ?, color = ? WHERE id = ?',
      [name, description, color, id]
    );

    res.json({ message: 'Cập nhật workspace thành công' });
  } catch (error) {
    console.error('Lỗi updateWorkspace:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Xóa hoàn toàn một workspace và dọn dẹp các dữ liệu liên quan (công việc, bình luận, sự kiện).
 * Yêu cầu quyền Owner. Sử dụng Transaction để an toàn.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id)
 * @param {Object} res - Response object
 */
exports.deleteWorkspace = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role = 'owner'",
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Owner mới được xóa workspace' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa tất cả tasks (tự động xóa task_comments nhờ ON DELETE CASCADE)
      await connection.execute('DELETE FROM tasks WHERE workspace_id = ?', [id]);
      
      // Xóa tất cả events liên quan
      await connection.execute('DELETE FROM events WHERE workspace_id = ?', [id]);

      // Xóa workspaces (sẽ tự động xóa workspace_members và workspace_invites nhờ ON DELETE CASCADE)
      await connection.execute('DELETE FROM workspaces WHERE id = ?', [id]);

      await connection.commit();
      res.json({ message: 'Đã xóa workspace và dọn dẹp dữ liệu liên quan' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Lỗi deleteWorkspace:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
