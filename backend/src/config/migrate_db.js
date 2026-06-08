const pool = require('./db');

async function migrate() {
  try {
    console.log('Bắt đầu cập nhật cơ sở dữ liệu...');
    
    // Thay đổi cột password thành cho phép NULL
    console.log('Đang thay đổi cột password thành NULL...');
    await pool.query('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
    
    // Thêm cột google_id (bỏ qua nếu đã tồn tại)
    console.log('Đang thêm cột google_id...');
    try {
      await pool.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE AFTER id');
      console.log('Đã thêm cột google_id thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột google_id đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }
    
    // Đổi kiểu due_date trong tasks thành DATETIME
    console.log('Đang đổi kiểu due_date thành DATETIME...');
    await pool.query('ALTER TABLE tasks MODIFY due_date DATETIME');

    // Thêm cột discord_notified vào bảng tasks
    console.log('Đang thêm cột discord_notified...');
    try {
      await pool.query('ALTER TABLE tasks ADD COLUMN discord_notified TINYINT(1) DEFAULT 0');
      console.log('Đã thêm cột discord_notified thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột discord_notified đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    // Thêm cột email_uid vào bảng tasks
    console.log('Đang thêm cột email_uid...');
    try {
      await pool.query('ALTER TABLE tasks ADD COLUMN email_uid VARCHAR(255) UNIQUE');
      console.log('Đã thêm cột email_uid thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột email_uid đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    // Thêm cột source vào bảng tasks
    console.log('Đang thêm cột source...');
    try {
      await pool.query("ALTER TABLE tasks ADD COLUMN source VARCHAR(50) DEFAULT 'Custom'");
      console.log('Đã thêm cột source thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột source đã tồn tại, bỏ qua.');
      } else {
        throw e;
      }
    }

    // Cập nhật giá trị cột source và mặc định sang 'Custom'
    console.log("Đang cập nhật giá trị mặc định cột source sang 'Custom' và chuyển đổi dữ liệu cũ...");
    try {
      await pool.query("ALTER TABLE tasks MODIFY COLUMN source VARCHAR(50) DEFAULT 'Custom'");
      await pool.query("UPDATE tasks SET source = 'Custom' WHERE source = 'Manual'");
      console.log("Đã cập nhật mặc định cột source sang 'Custom' thành công.");
    } catch (e) {
      console.error('Lỗi khi cập nhật mặc định cột source:', e.message);
    }

    // Chuyển đổi kiểu dữ liệu của cột priority sang VARCHAR
    console.log("Đang thay đổi kiểu dữ liệu cột priority sang VARCHAR...");
    try {
      await pool.query("ALTER TABLE tasks MODIFY COLUMN priority VARCHAR(50) DEFAULT '2'");
      console.log("Đã thay đổi kiểu dữ liệu cột priority thành công.");
    } catch (e) {
      console.error('Lỗi khi thay đổi kiểu dữ liệu cột priority:', e.message);
    }

    // Chuyển đổi dữ liệu độ ưu tiên sang số (1, 2, 3)
    console.log("Đang chuyển đổi mức độ ưu tiên sang số (1, 2, 3)...");
    try {
      await pool.query("UPDATE tasks SET priority = '1' WHERE priority IN ('high', 'urgent')");
      await pool.query("UPDATE tasks SET priority = '2' WHERE priority = 'medium' OR priority IS NULL");
      await pool.query("UPDATE tasks SET priority = '3' WHERE priority = 'low'");
      console.log("Đã chuyển đổi mức độ ưu tiên sang số thành công.");
    } catch (e) {
      console.error('Lỗi khi chuyển đổi mức độ ưu tiên:', e.message);
    }

    // Sửa nguồn cho các task email cũ
    console.log("Đang sửa nguồn cho các task đồng bộ từ email cũ...");
    try {
      await pool.query("UPDATE tasks SET source = 'Email' WHERE email_uid IS NOT NULL");
      console.log("Đã sửa nguồn cho các task email cũ thành công.");
    } catch (e) {
      console.error('Lỗi khi sửa nguồn cho các task email cũ:', e.message);
    }

    // Tạo bảng notifications
    console.log("Đang tạo bảng notifications...");
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NULL,
          type VARCHAR(50) DEFAULT 'Email',
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log("Đã tạo bảng notifications thành công.");
    } catch (e) {
      console.error('Lỗi khi tạo bảng notifications:', e.message);
    }

    // Thêm cột updated_at vào bảng tasks
    console.log('Đang thêm cột updated_at vào bảng tasks...');
    try {
      await pool.query('ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      console.log('Đã thêm cột updated_at thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột updated_at đã tồn tại, bỏ qua.');
      } else {
        console.error('Lỗi khi thêm cột updated_at:', e.message);
      }
    }

    // Thêm cột source vào bảng events
    console.log('Đang thêm cột source vào bảng events...');
    try {
      await pool.query("ALTER TABLE events ADD COLUMN source VARCHAR(50) DEFAULT 'Custom'");
      console.log('Đã thêm cột source vào bảng events thành công.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('Cột source trong bảng events đã tồn tại, bỏ qua.');
      } else {
        console.error('Lỗi khi thêm cột source vào bảng events:', e.message);
      }
    }
    // Cập nhật tiêu đề thông báo cũ
    console.log('Đang cập nhật tiêu đề các thông báo cũ từ "Đồng bộ Email" sang "Thông báo từ email"...');
    try {
      await pool.query("UPDATE notifications SET title = 'Thông báo từ email' WHERE title = 'Đồng bộ Email'");
      console.log('Đã cập nhật tiêu đề thông báo cũ thành công.');
    } catch (e) {
      console.error('Lỗi khi cập nhật tiêu đề thông báo cũ:', e.message);
    }
    
    console.log('✅ Cập nhật cơ sở dữ liệu hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

migrate();
