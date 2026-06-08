const pool = require('../config/db');

exports.getTasks = async (req, res) => {
  const { workspace_id } = req.query;
  try {
    let query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC';
    let params = [req.user.id];

    if (workspace_id) {
      // TODO: Có thể kiểm tra quyền user trong workspace này
      query = 'SELECT * FROM tasks WHERE workspace_id = ? ORDER BY due_date ASC';
      params = [workspace_id];
    }

    const [tasks] = await pool.execute(query, params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo công việc mới
exports.createTask = async (req, res) => {
  const { title, description, priority, due_date, category_id, source, workspace_id, assigned_to } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, description, priority, due_date, category_id, source, workspace_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || '', priority || '2', due_date, category_id || null, source || 'Custom', workspace_id || null, assigned_to || null]
    );

    const [newTask] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật công việc (ví dụ: đổi trạng thái hoàn thành)
exports.updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    // Lấy thông tin công việc hiện tại
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }
    const currentTask = rows[0];

    // Trích xuất thông tin mới hoặc giữ nguyên thông tin cũ nếu không truyền lên
    const title = req.body.title !== undefined ? req.body.title : currentTask.title;
    const description = req.body.description !== undefined ? req.body.description : currentTask.description;
    
    let status = currentTask.status;
    if (req.body.status !== undefined) {
      status = req.body.status;
    } else if (req.body.is_completed !== undefined) {
      status = req.body.is_completed ? 'done' : 'todo';
    } else if (req.body.isCompleted !== undefined) {
      status = req.body.isCompleted ? 'done' : 'todo';
    }

    const priority = req.body.priority !== undefined ? req.body.priority : currentTask.priority;
    
    let due_date = req.body.due_date !== undefined ? req.body.due_date : currentTask.due_date;
    if (due_date) {
      const parsedDate = new Date(due_date);
      if (!isNaN(parsedDate.getTime())) {
        due_date = parsedDate;
      }
    }

    const category_id = req.body.category_id !== undefined ? req.body.category_id : currentTask.category_id;
    const assigned_to = req.body.assigned_to !== undefined ? req.body.assigned_to : currentTask.assigned_to;

    // Reset discord_notified = 0 khi cập nhật thông tin để gửi lại nhắc nhở cho thời hạn mới
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, category_id = ?, assigned_to = ?, discord_notified = 0 WHERE id = ? AND user_id = ?',
      [title, description || '', status, priority, due_date, category_id, assigned_to, id, req.user.id]
    );
    res.json({ message: 'Cập nhật công việc thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa công việc
exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công việc để xóa' });
    }

    res.json({ message: 'Đã xóa công việc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
