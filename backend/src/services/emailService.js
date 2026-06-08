const nodemailer = require('nodemailer');
require('dotenv').config();

// Khởi tạo Transporter để gửi mail qua Gmail SMTP sử dụng App Password trong tệp .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.IMAP_USER,         // xuanmongng@gmail.com
    pass: process.env.IMAP_PASSWORD,     // ggiysdjvokeuwxem (App Password)
  },
});

/**
 * Gửi email khôi phục mật khẩu chứa đường dẫn reset mật khẩu dạng HTML đẹp mắt.
 * @param {string} toEmail - Địa chỉ email người nhận.
 * @param {string} resetLink - Đường dẫn khôi phục mật khẩu.
 * @returns {Promise<boolean>} Trả về true nếu gửi thư thành công, ngược lại là false.
 */
exports.sendResetPasswordEmail = async (toEmail, resetLink) => {
  const mailOptions = {
    from: `"FocusFlow Automation" <${process.env.IMAP_USER}>`,
    to: toEmail,
    subject: '🔑 [FocusFlow] Yêu cầu khôi phục mật khẩu tài khoản của bạn',
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dashed #8b5cf6;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">FocusFlow<span style="color: #f43f5e;">.</span></h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0; font-weight: 500;">Hệ thống Lịch trình & Tối ưu hóa Hiệu suất thông minh</p>
        </div>
        
        <div style="padding: 10px 20px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 700;">Xin chào,</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email này trên **FocusFlow**.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25); transition: transform 0.2s;">
              Đặt lại mật khẩu mới
            </a>
          </div>
          
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
            Đường dẫn khôi phục mật khẩu này **chỉ có hiệu lực trong vòng 15 phút** kể từ thời điểm email này được gửi đi. Vì lý do bảo mật, vui lòng không chia sẻ email này với bất kỳ ai.
          </p>
          
          <p style="color: #ef4444; font-size: 13px; font-weight: 600; margin-top: 20px;">
            ⚠️ Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được an toàn.
          </p>
        </div>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Email này được gửi tự động từ hệ thống FocusFlow.</p>
          <p style="margin: 4px 0 0 0;">© 2026 FocusFlow Inc. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Đã gửi thư khôi phục mật khẩu thành công đến: ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Service Error] Gửi mail thất bại:', error.message);
    return false;
  }
};

/**
 * Gửi email mời tham gia Workspace.
 * @param {string} toEmail - Địa chỉ email người nhận.
 * @param {string} inviterName - Tên người mời.
 * @param {string} workspaceName - Tên workspace được mời.
 * @param {string} inviteLink - Đường dẫn để chấp nhận/từ chối lời mời.
 * @returns {Promise<boolean>}
 */
exports.sendWorkspaceInviteEmail = async (toEmail, inviterName, workspaceName, inviteLink) => {
  const mailOptions = {
    from: `"FocusFlow Automation" <${process.env.IMAP_USER}>`,
    to: toEmail,
    subject: `📩 [FocusFlow] Lời mời tham gia Workspace "${workspaceName}" từ ${inviterName}`,
    html: `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dashed #8b5cf6;">
          <h1 style="color: #7c3aed; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">FocusFlow<span style="color: #f43f5e;">.</span></h1>
          <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0; font-weight: 500;">Hệ thống Lịch trình & Tối ưu hóa Hiệu suất thông minh</p>
        </div>
        
        <div style="padding: 10px 20px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; font-weight: 700;">Xin chào,</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Bạn vừa nhận được một lời mời tham gia làm việc chung tại Workspace <strong>${workspaceName}</strong> từ <strong>${inviterName}</strong> trên nền tảng **FocusFlow**.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25); transition: transform 0.2s;">
              Tham gia Workspace
            </a>
          </div>
          
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
            Đường dẫn này sẽ đưa bạn đến trang quản lý nhóm để xem xét và chấp nhận lời mời.
          </p>
          
          <p style="color: #6b7280; font-size: 13px; font-weight: 500; margin-top: 20px;">
            Nếu bạn không quen biết người gửi hoặc không muốn tham gia, bạn có thể bỏ qua email này một cách an toàn.
          </p>
        </div>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">Email này được gửi tự động từ hệ thống FocusFlow.</p>
          <p style="margin: 4px 0 0 0;">© 2026 FocusFlow Inc. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Đã gửi thư mời tham gia workspace đến: ${toEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[Email Service Error] Gửi mail mời thất bại:', error.message);
    return false;
  }
};
