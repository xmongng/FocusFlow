const pool = require('../config/db');

exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE user_id = ?',
      [req.user.id]
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  const { name, color, icon } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
      [req.user.id, name, color || '#4A90D9', icon || '📅']
    );
    const [newCat] = await pool.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(newCat[0]);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
