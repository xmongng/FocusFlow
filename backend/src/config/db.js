const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối Database MySQL thành công!');
    connection.release();
  } catch (error) {
    console.error('❌ Lỗi kết nối Database:', error.message);
    console.log('---');
    console.log('Hãy đảm bảo bạn đã chạy mã SQL tạo database và bảng trước đó.');
  }
}

testConnection();

module.exports = pool;
