const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  const { username, email, password, display_name } = req.body;

  try {
    // 1. Kiểm tra email/username đã tồn tại chưa
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email hoặc tên đăng nhập đã tồn tại' });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Lưu vào database
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, display_name) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, display_name || username]
    );

    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Tìm người dùng theo email
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    const user = rows[0];

    // 2. Kiểm tra mật khẩu (Hỗ trợ cả Hash và Plaintext cho MVP)
    let isMatch = false;
    console.log(`🔑 Đang kiểm tra đăng nhập cho: ${email}`);
    if (!user.password) {
      console.log('❌ Tài khoản không có mật khẩu (Đăng nhập qua Google)');
      return res.status(400).json({ message: 'Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google hoặc khôi phục mật khẩu.' });
    }

    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      console.log('❌ Mật khẩu không khớp!');
      return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
    }

    console.log('✅ Đăng nhập thành công!');

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Trả về thông tin (không kèm mật khẩu)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        plan: user.plan || 'free'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập bằng Google
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Xác thực idToken gửi từ frontend lên
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // 2. Kiểm tra user trong Database
    // Tìm theo google_id trước
    let [users] = await pool.execute('SELECT * FROM users WHERE google_id = ?', [googleId]);
    let user = users[0];

    if (!user) {
      // Nếu không thấy google_id, tìm theo email
      [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      user = users[0];

      if (user) {
        // Nếu tìm thấy email, cập nhật thêm google_id vào tài khoản
        await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
        user.google_id = googleId;
      } else {
        // Nếu chưa có tài khoản, tạo mới
        const tempUsername = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7);
        
        const [result] = await pool.execute(
          'INSERT INTO users (google_id, username, email, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)',
          [googleId, tempUsername, email, name, picture]
        );
        
        user = {
          id: result.insertId,
          google_id: googleId,
          username: tempUsername,
          email: email,
          display_name: name,
          avatar_url: picture
        };
      }
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Trả về thông tin
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        plan: user.plan || 'free'
      }
    });

  } catch (error) {
    console.error('Lỗi xác thực Google:', error);
    res.status(400).json({ message: 'Xác thực Google thất bại' });
  }
};

// ========================================================
// CHỨC NĂNG QUÊN MẬT KHẨU & KHÔI PHỤC MẬT KHẨU (FORGOT/RESET PASSWORD)
// ========================================================

const crypto = require('crypto');
const emailService = require('../services/emailService');

// Yêu cầu khôi phục mật khẩu (Quên mật khẩu)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Kiểm tra email người dùng trong cơ sở dữ liệu
    const [users] = await pool.execute('SELECT id, email FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      // Vì lý do bảo mật, không báo lộ email có tồn tại hay không. Trả về thông báo thành công chung.
      return res.json({ message: 'Nếu địa chỉ email tồn tại trong hệ thống, bạn sẽ sớm nhận được thư khôi phục.' });
    }

    // 2. Sinh mã reset token bảo mật (32 bytes ngẫu nhiên dạng hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hạn sử dụng: 15 phút
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 3. Lưu reset token và hạn sử dụng vào database MySQL
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, tokenExpiry, user.id]
    );

    // 4. Gửi email chứa đường dẫn khôi phục
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const emailSent = await emailService.sendResetPasswordEmail(user.email, resetLink);

    if (!emailSent) {
      return res.status(500).json({ message: 'Lỗi gửi thư khôi phục mật khẩu, vui lòng thử lại sau.' });
    }

    res.json({ message: 'Đường dẫn khôi phục mật khẩu đã được gửi đến email của bạn.' });
  } catch (error) {
    console.error('Lỗi trong forgotPassword:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình xử lý yêu cầu.' });
  }
};

// Đặt lại mật khẩu mới (Khôi phục mật khẩu)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 1. Tìm user có reset_token khớp và còn hạn sử dụng
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    // 2. Mã hóa (băm) mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 3. Cập nhật mật khẩu mới, đồng thời xóa sạch reset_token và reset_token_expiry để vô hiệu hóa
    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Đổi mật khẩu thành công! Hãy đăng nhập lại với mật khẩu mới.' });
  } catch (error) {
    console.error('Lỗi trong resetPassword:', error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình đặt lại mật khẩu.' });
  }
};

