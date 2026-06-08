const pool = require('./db');

async function migrate() {
  try {
    console.log('Bắt đầu cập nhật cơ sở dữ liệu cho gói Pro...');

    // 1. Cập nhật bảng users
    console.log('Đang cập nhật bảng users...');
    try {
      await pool.query("ALTER TABLE users ADD COLUMN plan ENUM('free','pro','enterprise') DEFAULT 'free'");
      console.log('Đã thêm cột plan vào bảng users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột plan đã tồn tại, bỏ qua.');
      else throw e;
    }
    
    try {
      await pool.query("ALTER TABLE users ADD COLUMN ai_request_count INT DEFAULT 0");
      console.log('Đã thêm cột ai_request_count vào bảng users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột ai_request_count đã tồn tại, bỏ qua.');
      else throw e;
    }

    try {
      await pool.query("ALTER TABLE users ADD COLUMN ai_request_date DATE DEFAULT NULL");
      console.log('Đã thêm cột ai_request_date vào bảng users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột ai_request_date đã tồn tại, bỏ qua.');
      else throw e;
    }

    // 2. Tạo bảng workspaces
    console.log('Đang tạo bảng workspaces...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id INT NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1',
        max_members INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Đã tạo bảng workspaces thành công.');

    // 3. Tạo bảng workspace_members
    console.log('Đang tạo bảng workspace_members...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('owner','admin','member') DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_member (workspace_id, user_id)
      )
    `);
    console.log('Đã tạo bảng workspace_members thành công.');

    // 4. Tạo bảng workspace_invites
    console.log('Đang tạo bảng workspace_invites...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspace_invites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        workspace_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        invited_by INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        status ENUM('pending','accepted','rejected','expired') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Đã tạo bảng workspace_invites thành công.');

    // 5. Tạo bảng task_comments
    console.log('Đang tạo bảng task_comments...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Đã tạo bảng task_comments thành công.');

    // 6. Cập nhật bảng tasks
    console.log('Đang cập nhật bảng tasks...');
    try {
      await pool.query("ALTER TABLE tasks ADD COLUMN workspace_id INT NULL");
      await pool.query("ALTER TABLE tasks ADD FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL");
      console.log('Đã thêm cột workspace_id vào bảng tasks.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột workspace_id trong tasks đã tồn tại, bỏ qua.');
      else console.error('Lỗi thêm workspace_id vào tasks:', e.message);
    }
    
    try {
      await pool.query("ALTER TABLE tasks ADD COLUMN assigned_to INT NULL");
      await pool.query("ALTER TABLE tasks ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL");
      console.log('Đã thêm cột assigned_to vào bảng tasks.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột assigned_to trong tasks đã tồn tại, bỏ qua.');
      else console.error('Lỗi thêm assigned_to vào tasks:', e.message);
    }

    // 7. Cập nhật bảng events
    console.log('Đang cập nhật bảng events...');
    try {
      await pool.query("ALTER TABLE events ADD COLUMN workspace_id INT NULL");
      await pool.query("ALTER TABLE events ADD FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL");
      console.log('Đã thêm cột workspace_id vào bảng events.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột workspace_id trong events đã tồn tại, bỏ qua.');
      else console.error('Lỗi thêm workspace_id vào events:', e.message);
    }

    // 8. Cập nhật bảng notifications
    console.log('Đang cập nhật bảng notifications...');
    try {
      await pool.query("ALTER TABLE notifications ADD COLUMN reference_id INT NULL");
      console.log('Đã thêm cột reference_id vào bảng notifications.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột reference_id đã tồn tại, bỏ qua.');
      else console.error('Lỗi thêm reference_id vào notifications:', e.message);
    }
    
    try {
      await pool.query("ALTER TABLE notifications ADD COLUMN reference_type VARCHAR(50) NULL");
      console.log('Đã thêm cột reference_type vào bảng notifications.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('Cột reference_type đã tồn tại, bỏ qua.');
      else console.error('Lỗi thêm reference_type vào notifications:', e.message);
    }

    console.log('✅ Cập nhật cơ sở dữ liệu cho gói Pro hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

migrate();
