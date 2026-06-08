const pool = require('../../config/db');

/**
 * Lấy danh sách bình luận/ghi chú của một công việc cụ thể.
 * Hàm này đồng thời đánh dấu các thông báo liên quan thành "đã đọc" và phát tín hiệu SSE.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id) và taskId
 * @param {Object} res - Response object
 */
exports.getTaskComments = async (req, res) => {
  const { id: workspaceId, taskId } = req.params;
  const userId = req.user.id;

  try {
    // Kiểm tra quyền (phải là thành viên)
    const [members] = await pool.execute(
      'SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [workspaceId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền xem bình luận này' });
    }

    const [comments] = await pool.execute(`
      SELECT c.*, u.display_name, u.avatar_url, u.email
      FROM task_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `, [taskId]);

    // Đánh dấu đã đọc các thông báo liên quan đến bình luận của công việc này
    const [updateNotif] = await pool.execute(
      `UPDATE notifications SET is_read = 1 
       WHERE user_id = ? AND reference_id = ? AND reference_type = 'task_comment' AND is_read = 0`,
      [userId, taskId]
    );

    if (updateNotif.affectedRows > 0) {
      const realtimeService = require('../../services/realtimeService');
      realtimeService.sendToUser(userId, 'update_notifications', {
        message: 'notifications_read'
      });
    }

    res.json(comments);
  } catch (error) {
    console.error('Lỗi getTaskComments:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Thêm một bình luận/ghi chú mới vào công việc.
 * Tự động tạo thông báo (notification) cho các thành viên khác trong nhóm và phát sự kiện realtime (SSE)
 * để đồng bộ cập nhật trên giao diện mọi người mà không cần tải lại trang.
 * 
 * @param {Object} req - Request object, chứa body.content (nội dung bình luận)
 * @param {Object} res - Response object
 */
exports.createTaskComment = async (req, res) => {
  const { id: workspaceId, taskId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
  }

  try {
    // Kiểm tra quyền (phải là thành viên)
    const [members] = await pool.execute(
      'SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [workspaceId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền bình luận trong workspace này' });
    }

    const [result] = await pool.execute(
      'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [taskId, userId, content.trim()]
    );

    const [newComment] = await pool.execute(`
      SELECT c.*, u.display_name, u.avatar_url, u.email
      FROM task_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    // Gửi thông báo & Đẩy sự kiện realtime qua SSE
    try {
      const [otherMembers] = await pool.execute(
        'SELECT user_id FROM workspace_members WHERE workspace_id = ? AND user_id != ?',
        [workspaceId, userId]
      );

      const [tasks] = await pool.execute('SELECT title FROM tasks WHERE id = ?', [taskId]);
      const taskTitle = tasks[0]?.title || 'công việc';
      const senderName = newComment[0].display_name || 'Thành viên nhóm';

      const notifTitle = 'Ghi chú mới trong nhóm';
      const notifMessage = `${senderName} đã bình luận trong "${taskTitle}": ${content.trim()}`;
      const notifType = 'Comment';

      const realtimeService = require('../../services/realtimeService');

      // Lưu thông báo vào database và gửi qua SSE realtime tới các thành viên khác
      for (const member of otherMembers) {
        const [notifResult] = await pool.execute(
          'INSERT INTO notifications (user_id, title, message, type, is_read, reference_id, reference_type) VALUES (?, ?, ?, ?, 0, ?, ?)',
          [member.user_id, notifTitle, notifMessage, notifType, taskId, 'task_comment']
        );

        realtimeService.sendToUser(member.user_id, 'new_notification', {
          id: notifResult.insertId,
          user_id: member.user_id,
          title: notifTitle,
          message: notifMessage,
          type: notifType,
          is_read: 0,
          reference_id: taskId,
          reference_type: 'task_comment',
          created_at: new Date()
        });
      }

      // Đẩy sự kiện new_comment tới tất cả thành viên trong nhóm để đồng bộ giao diện bình luận
      const [allMembers] = await pool.execute(
        'SELECT user_id FROM workspace_members WHERE workspace_id = ?',
        [workspaceId]
      );

      allMembers.forEach(member => {
        realtimeService.sendToUser(member.user_id, 'new_comment', {
          workspaceId: parseInt(workspaceId),
          taskId: parseInt(taskId),
          comment: newComment[0]
        });
      });
    } catch (realtimeError) {
      console.error('Lỗi khi gửi thông báo realtime:', realtimeError);
      // Tiếp tục trả về comment kể cả khi lỗi gửi realtime để không chặn luồng chính
    }

    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Lỗi createTaskComment:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
