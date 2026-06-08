const pool = require('./db');

async function run() {
  try {
    console.log('Đang kiểm tra và thêm cột reset_token...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER google_id');
      console.log('✅ Đã thêm cột reset_token thành công!');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột reset_token đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    console.log('Đang kiểm tra và thêm cột reset_token_expiry...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token');
      console.log('✅ Đã thêm cột reset_token_expiry thành công!');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột reset_token_expiry đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    console.log('🎉 Hoàn thành cập nhật database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật database:', error);
    process.exit(1);
  }
}

run();
