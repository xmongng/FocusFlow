const pool = require('../../config/db');

/**
 * Lấy danh sách toàn bộ công việc (tasks) trong một workspace cụ thể.
 * Yêu cầu người dùng phải là thành viên của workspace.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id)
 * @param {Object} res - Response object
 */
exports.getWorkspaceTasks = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      'SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập workspace này' });
    }

    const [tasks] = await pool.execute(`
      SELECT t.*, u.display_name as assignee_name, COUNT(c.id) as comment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN task_comments c ON t.id = c.task_id
      WHERE t.workspace_id = ?
      GROUP BY t.id
      ORDER BY t.due_date ASC
    `, [id]);

    res.json(tasks);
  } catch (error) {
    console.error('Lỗi getWorkspaceTasks:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Tạo một công việc mới trong workspace.
 * Chỉ Owner hoặc Admin mới có quyền tạo và giao việc.
 * 
 * @param {Object} req - Request object, chứa body gồm (title, description, priority, due_date, assigned_to, status)
 * @param {Object} res - Response object
 */
exports.createWorkspaceTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, due_date, assigned_to, status } = req.body;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Owner hoặc Admin mới được giao việc' });
    }

    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, description, priority, due_date, workspace_id, assigned_to, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description || '', priority || '2', due_date || null, id, assigned_to || null, 'Workspace', status || 'todo']
    );

    const [newTask] = await pool.execute(`
      SELECT t.*, u.display_name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?
    `, [result.insertId]);

    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Lỗi createWorkspaceTask:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Tạo hàng loạt công việc mới trong workspace (Tính năng giao việc nhanh).
 * Chỉ Owner hoặc Admin mới có quyền thực hiện. Dùng transaction để đảm bảo toàn vẹn dữ liệu.
 * 
 * @param {Object} req - Request object, chứa body.tasks (mảng các object công việc)
 * @param {Object} res - Response object
 */
exports.createBatchTasks = async (req, res) => {
  const { id } = req.params;
  const { tasks } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ message: 'Danh sách công việc không hợp lệ' });
  }

  try {
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Owner hoặc Admin mới được giao việc' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertQuery = 'INSERT INTO tasks (user_id, title, description, priority, due_date, workspace_id, assigned_to, source, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      
      for (const task of tasks) {
        if (!task.title) continue;
        await connection.execute(insertQuery, [
          userId, 
          task.title, 
          task.description || '', 
          task.priority || '2', 
          task.due_date || null, 
          id, 
          task.assigned_to || null, 
          'Workspace', 
          task.status || 'todo'
        ]);
      }

      await connection.commit();
      res.status(201).json({ message: 'Đã tạo danh sách công việc thành công' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Lỗi createBatchTasks:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Xóa một công việc khỏi workspace.
 * Chỉ Owner hoặc Admin mới có quyền xóa.
 * 
 * @param {Object} req - Request object, chứa params id (workspace_id) và taskId
 * @param {Object} res - Response object
 */
exports.deleteWorkspaceTask = async (req, res) => {
  const { id, taskId } = req.params;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      "SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? AND role IN ('owner', 'admin')",
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Chỉ Owner hoặc Admin mới được xóa công việc' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ? AND workspace_id = ?', [taskId, id]);
    res.json({ message: 'Đã xóa công việc' });
  } catch (error) {
    console.error('Lỗi deleteWorkspaceTask:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * Cập nhật thông tin hoặc trạng thái của một công việc.
 * - Member: Chỉ được cập nhật trạng thái (status) nếu là người được giao việc đó (hoặc task vô chủ).
 * - Admin/Owner: Được phép cập nhật tất cả thông tin (tiêu đề, mô tả, hạn chót, người được giao...).
 * 
 * @param {Object} req - Request object, chứa body các trường cần cập nhật
 * @param {Object} res - Response object
 */
exports.updateWorkspaceTask = async (req, res) => {
  const { id, taskId } = req.params;
  const { title, description, priority, due_date, assigned_to, status } = req.body;
  const userId = req.user.id;

  try {
    const [members] = await pool.execute(
      'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ?',
      [id, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập workspace này' });
    }

    const role = members[0].role;
    
    // Fetch task
    const [tasks] = await pool.execute('SELECT * FROM tasks WHERE id = ? AND workspace_id = ?', [taskId, id]);
    if (tasks.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy công việc' });
    }
    const currentTask = tasks[0];

    // If member, only allow status update and only if they are the assignee or it's unassigned
    if (role === 'member') {
      if (currentTask.assigned_to !== userId && currentTask.assigned_to !== null) {
         return res.status(403).json({ message: 'Chỉ người được giao mới được cập nhật trạng thái' });
      }
      
      const newStatus = status !== undefined ? status : currentTask.status;
      
      await pool.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [newStatus, taskId]
      );
      
      return res.json({ message: 'Cập nhật trạng thái thành công' });
    }

    // Owner/Admin can update everything
    const newTitle = title !== undefined ? title : currentTask.title;
    const newDesc = description !== undefined ? description : currentTask.description;
    const newPrio = priority !== undefined ? priority : currentTask.priority;
    const newDate = due_date !== undefined ? due_date : currentTask.due_date;
    const newAssign = assigned_to !== undefined ? assigned_to : currentTask.assigned_to;
    const newStatus = status !== undefined ? status : currentTask.status;

    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, assigned_to = ?, status = ? WHERE id = ?',
      [newTitle, newDesc, newPrio, newDate, newAssign, newStatus, taskId]
    );

    res.json({ message: 'Cập nhật công việc thành công' });
  } catch (error) {
    console.error('Lỗi updateWorkspaceTask:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
