const pool = require('../config/db');

// Lấy danh sách sự kiện
exports.getEvents = async (req, res) => {
  try {
    const [events] = await pool.execute(
      'SELECT e.*, c.name as category_name, c.color as category_color FROM events e LEFT JOIN categories c ON e.category_id = c.id WHERE e.user_id = ? ORDER BY e.start_time ASC',
      [req.user.id]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo sự kiện mới
exports.createEvent = async (req, res) => {
  const { title, description, start_time, end_time, location, category_id, is_all_day } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO events (user_id, title, description, start_time, end_time, location, category_id, is_all_day) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, start_time, end_time, location, category_id || null, is_all_day || false]
    );
    
    const [newEvent] = await pool.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sự kiện
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM events WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Đã xóa sự kiện' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
