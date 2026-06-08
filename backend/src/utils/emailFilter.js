/**
 * Lọc email công việc (loại bỏ quảng cáo, tin rác, cảnh báo bảo mật)
 * @param {string} subject Tiêu đề email
 * @param {string} from Người gửi email
 * @param {string} text Nội dung email
 * @returns {boolean} true nếu là email công việc, false nếu là quảng cáo/rác/hệ thống
 */
function isWorkEmail(subject, from, text) {
  const subj = (subject || '').toLowerCase();
  const body = (text || '').toLowerCase();
  const fromAdd = (from || '').toLowerCase();

  // 1. Kiểm tra domain hoặc email gửi thư rác/quảng cáo/marketing/hệ thống
  const spamSenders = [
    'speakenglishwithvanessa.com',
    'boot.dev',
    'alibabacloud.com',
    'convertkit',
    'newsletter',
    'noreply',
    'no-reply',
    'notification',
    'support',
    'alert',
    'info@',
    'contact@speakenglish',
    'accounts.google.com',
    'modal.com',
    'discord.com'
  ];

  if (spamSenders.some(sender => fromAdd.includes(sender))) {
    return false;
  }

  // 2. Danh sách từ khóa spam/quảng cáo trong tiêu đề hoặc người gửi
  const spamKeywords = [
    'discount', 'off', 'coupon', 'sale', 'newsletter', 'promo', 'deal', 'apply', 'register',
    'giảm giá', 'khuyến mãi', 'ưu đãi', 'quảng cáo', 'marketing', 'cảnh báo bảo mật',
    'security alert', 'xác minh', 'verification', 'unseen',
    'đăng ký', 'chúc mừng', 'mã giảm giá', 'discount code', 'last chance', 'hours left',
    'bảo mật', 'mật khẩu ứng dụng', 'xác thực', 'thiết lập mật khẩu'
  ];

  if (spamKeywords.some(kw => subj.includes(kw) || fromAdd.includes(kw))) {
    return false;
  }

  // 3. Từ khóa spam trong nội dung email (body)
  const bodySpamKeywords = [
    'unsubscribe',
    'hủy đăng ký',
    'mã giảm giá',
    'discount code',
    'coupon code',
    'off các khóa học',
    'mật khẩu ứng dụng',
    'cảnh báo bảo mật',
    'security alert',
    'không phải bạn',
    'tài khoản google',
    'xác minh 2 bước'
  ];

  if (bodySpamKeywords.some(kw => body.includes(kw))) {
    return false;
  }

  // 4. Danh sách từ khóa công việc/học tập bắt buộc phải có (trong tiêu đề hoặc nội dung)
  const workKeywords = [
    'lịch', 'họp', 'deadline', 'công việc', 'kế hoạch', 'báo cáo', 'gặp', 'trao đổi',
    'meeting', 'schedule', 'task', 'appointment', 'report', 'assign', 'project', 'dự án',
    'nhắc nhở', 'reminder', 'bài tập', 'homework', 'thi', 'ôn thi', 'kiểm tra', 'exam', 
    'test', 'nộp bài', 'nộp', 'submit', 'học tập', 'học', 'yêu cầu', 'thông báo', 'hoàn thành',
    'hạn chót', 'hạn nộp'
  ];

  return workKeywords.some(kw => subj.includes(kw) || body.includes(kw));
}

module.exports = {
  isWorkEmail
};
