const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const pool = require('../config/db');
const { isWorkEmail } = require('../utils/emailFilter');

/**
 * Helper định dạng đối tượng Date sang kiểu DATETIME của MySQL (YYYY-MM-DD HH:mm:ss)
 * @param {Date} date - Đối tượng Date của Javascript cần định dạng.
 * @returns {string} Chuỗi thời gian đã định dạng phù hợp với cơ sở dữ liệu.
 */
function formatDateTime(date) {
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

class AutomationService {
  constructor() {
    // Chu kỳ quét Email (đọc số phút từ file .env, mặc định là 5 phút. Nhân 60000 để chuyển đổi từ phút sang mili-giây)
    this.emailSyncInterval = parseInt(process.env.EMAIL_SYNC_INTERVAL_MINUTES || '5') * 60000;

    // Chu kỳ quét và gửi nhắc nhở công việc sắp đến hạn lên Discord (cố định là 60000 ms = 1 phút)
    this.discordCheckInterval = 60000; // 1 minute

    // Chu kỳ tự động rà soát để dọn dẹp các tác vụ cũ quá 30 ngày trong database (cố định là 3600000 ms = 1 giờ)
    this.cleanupInterval = 3600000; // 1 hour

    // Cờ trạng thái (Flag) chặn chạy trùng lặp: Bảo đảm không có 2 tiến trình đồng bộ Email chạy song song cùng lúc
    this.isSyncingEmail = false;

    // Cờ trạng thái chặn chạy trùng lặp: Bảo đảm không có 2 tiến trình quét và gửi tin nhắn Discord chạy cùng lúc
    this.isCheckingDiscord = false;

    // Cờ trạng thái chặn chạy trùng lặp: Bảo đảm không có 2 tiến trình dọn dẹp dữ liệu cũ chạy cùng lúc
    this.isCleaningTasks = false;
  }

  start() {
    if (process.env.ENABLE_AUTOMATION !== 'true') {
      console.log('Chế độ Tự động hóa bị vô hiệu hóa (ENABLE_AUTOMATION !== true).');
      return;
    }

    console.log('🤖 Khởi động dịch vụ tự động hóa (Email, Discord & Cleanup)...');

    // Khởi động đồng bộ Email
    if (process.env.IMAP_USER && process.env.IMAP_PASSWORD) {
      console.log(`- Bật quét Email định kỳ mỗi ${this.emailSyncInterval / 60000} phút.`);
      this.syncEmails(); // Run immediately
      setInterval(() => this.syncEmails(), this.emailSyncInterval);
    } else {
      console.log('⚠️ Không tìm thấy cấu hình IMAP, bỏ qua quét Email.');
    }

    // Khởi động nhắc nhở Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      console.log('- Bật quét thông báo Discord định kỳ mỗi 1 phút.');
      this.checkAndSendDiscordReminders(); // Run immediately
      setInterval(() => this.checkAndSendDiscordReminders(), this.discordCheckInterval);
    } else {
      console.log('⚠️ Không tìm thấy cấu hình Discord Webhook, bỏ qua gửi nhắc nhở.');
    }

    // Khởi động dọn dẹp công việc hoàn thành và sự kiện cũ định kỳ mỗi 1 tiếng (chỉ xóa dữ liệu cũ hơn 30 ngày)
    console.log('- Bật tự động dọn dẹp dữ liệu người dùng cũ hơn 30 ngày (1 tháng).');
    this.cleanCompletedTasks(); // Run immediately
    setInterval(() => this.cleanCompletedTasks(), this.cleanupInterval);
  }

  // ============== 1. LOGIC QUÉT EMAIL ==============
  async syncEmails() {
    if (this.isSyncingEmail) return;
    this.isSyncingEmail = true;

    try {
      const config = {
        imap: {
          user: process.env.IMAP_USER,
          password: process.env.IMAP_PASSWORD,
          host: process.env.IMAP_HOST || 'imap.gmail.com',
          port: parseInt(process.env.IMAP_PORT || '993'),
          tls: process.env.IMAP_TLS !== 'false',
          tlsOptions: { rejectUnauthorized: false },
          authTimeout: 30000
        }
      };

      console.log('[Email Sync] Đang kết nối IMAP...');
      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: true // Đánh dấu đã đọc ngay khi quét
      };

      console.log('[Email Sync] Đang tìm kiếm thư chưa đọc...');
      const messages = await connection.search(searchCriteria, fetchOptions);
      
      console.log(`[Email Sync] Tìm thấy ${messages.length} thư mới.`);

      for (const item of messages) {
        try {
          const emailUid = `email-${item.attributes.uid}`;
          
          // Kiểm tra xem đã xử lý thư này chưa
          const [existing] = await pool.execute('SELECT id FROM tasks WHERE email_uid = ?', [emailUid]);
          if (existing.length > 0) continue; // Bỏ qua nếu đã xử lý

          // Lấy nội dung
          const all = item.parts.find(part => part.which === '');
          const id = item.attributes.uid;
          const idHeader = "Imap-Id: "+id+"\r\n";
          
          const parsed = await simpleParser(idHeader + all.body);
          
          const subject = parsed.subject || '';
          const text = parsed.text || '';
          const from = parsed.from ? parsed.from.value[0].address : '';

          // Lọc nội dung bằng hàm helper dùng chung
          if (!isWorkEmail(subject, from, text)) {
            continue; // Bỏ qua nếu là quảng cáo, tin rác, cảnh báo bảo mật hoặc không liên quan đến công việc
          }


          console.log(`[Email Sync] Đang phân tích bằng AI: ${subject}`);
          const aiData = await this.analyzeEmailWithAI(subject, text);
          
          if (aiData && aiData.title) {
            // Lưu vào CSDL
            await this.saveTaskToDB(aiData, emailUid, from);
          }
        } catch (msgErr) {
          console.error(`[Email Sync] Lỗi khi xử lý thư:`, msgErr);
        }
      }

      connection.end();
      console.log('[Email Sync] Hoàn thành quét thư.');
    } catch (error) {
      console.error('[Email Sync] Lỗi khi kết nối hoặc quét IMAP:', error.message);
    } finally {
      this.isSyncingEmail = false;
    }
  }

  /**
   * Gọi AI (NVIDIA NIM) phân tích tiêu đề và nội dung email thô để trích xuất thông tin công việc.
   * @param {string} subject - Tiêu đề của email nhận được.
   * @param {string} text - Nội dung văn bản thô của email nhận được.
   * @returns {Promise<Object|null>} Đối tượng chứa title, description, due_date, priority hoặc null nếu có lỗi.
   */
  async analyzeEmailWithAI(subject, text) {
    try {
      const apiKey = process.env.NVIDIA_API_KEY;
      const baseUrl = process.env.BASE_URL || 'https://integrate.api.nvidia.com/v1';

      if (!apiKey) throw new Error('Thiếu NVIDIA_API_KEY');

      const systemPrompt = `Bạn là hệ thống trích xuất công việc thông minh.
Người dùng sẽ gửi nội dung một email. Hãy phân tích và trả về ĐÚNG MỘT khối JSON với định dạng sau (không giải thích thêm):
{
  "title": "Tiêu đề công việc ngắn gọn",
  "description": "Mô tả chi tiết hoặc ghi chú (nếu có)",
  "due_date": "YYYY-MM-DD HH:MM:SS" (Tìm thời hạn hoặc thời gian diễn ra. Định dạng 24h. Nếu không có giờ cụ thể, hãy để 23:59:00. Nếu không tìm thấy ngày tháng nào, trả về null),
  "priority": "1" (nếu có tính cấp bách hoặc quan trọng), "2" (mặc định/trung bình), hoặc "3" (thấp)
}`;

      const userPrompt = `Subject: ${subject}\n\nBody:\n${text.substring(0, 3000)}`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1, // Nhiệt độ thấp để dễ ra JSON chuẩn
          max_tokens: 500,
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi gọi API NVIDIA');
      }

      const data = await response.json();
      const reply = data.choices[0].message.content.trim();
      // Xử lý chuỗi JSON bằng Regex để tìm khối {...}
      const match = reply.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Không tìm thấy JSON hợp lệ từ AI: ' + reply);
      
      const jsonStr = match[0];
      const parsedData = JSON.parse(jsonStr);
      return parsedData;
    } catch (error) {
      console.error('[AI Parser Error]', error.message);
      return null;
    }
  }

  /**
   * Lưu công việc đã trích xuất từ email vào cơ sở dữ liệu và gửi thông báo hệ thống cho user sở hữu email.
   * @param {Object} aiData - Dữ liệu công việc đã được AI phân tích cấu trúc (gồm title, description, due_date, priority).
   * @param {string} emailUid - Mã định danh duy nhất của email trên IMAP (dạng `email-[uid]`) nhằm tránh trùng lặp.
   * @param {string} fromEmail - Địa chỉ email của người gửi (dùng để lưu thông tin nguồn).
   */
  async saveTaskToDB(aiData, emailUid, fromEmail) {
    try {
      // Tìm User ID phù hợp nhất. Thử tìm theo cấu hình email, sau đó lấy user đầu tiên làm fallback.
      let userId = 1; 
      const imapUser = process.env.IMAP_USER;
      
      let [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [imapUser]);
      if (users.length === 0) {
        // Fallback
        [users] = await pool.execute('SELECT id FROM users LIMIT 1');
      }
      if (users.length > 0) {
        userId = users[0].id;
      } else {
        console.log('[Email Sync] Không có user nào trong hệ thống, bỏ qua.');
        return;
      }

      const { title, description, due_date, priority } = aiData;
      let parsedDueDate = due_date && due_date !== 'null' ? due_date : null;

      if (!parsedDueDate) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        parsedDueDate = `${yyyy}-${mm}-${dd} 23:59:00`;
      }


      await pool.execute(
        'INSERT INTO tasks (user_id, title, description, due_date, priority, status, email_uid, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, title, description || '', parsedDueDate, priority || '2', 'todo', emailUid, 'Email']
      );
      
      console.log(`[Email Sync] Đã lưu task mới: "${title}" cho User ${userId}`);

      // Ghi nhận thông báo
      await pool.execute(
        'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [userId, `Thông báo từ email`, `Công việc "${title}" đã được trích xuất từ email của bạn.`, 'Email', 0]
      );
      console.log(`[Email Sync] Đã tạo thông báo cho User ${userId}`);

    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') {
         console.error('[Save Task Error]', error.message);
      }
    }
  }

  // ============== 2. LOGIC GỬI THÔNG BÁO DISCORD ==============
  async checkAndSendDiscordReminders() {
    if (this.isCheckingDiscord) return;
    this.isCheckingDiscord = true;

    try {
      const now = new Date();
      // Allow searching from 10 minutes ago up to 30 minutes in the future to ensure reliability during restarts
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
      
      const tenMinutesAgoStr = formatDateTime(tenMinutesAgo);
      const in30MinutesStr = formatDateTime(in30Minutes);

      // Query uncompleted tasks that are due within the 30-minute window (and not notified yet)
      const query = `
        SELECT id, title, description, priority, source, due_date 
        FROM tasks 
        WHERE status != 'done' 
          AND discord_notified = 0 
          AND due_date IS NOT NULL
          AND due_date >= ?
          AND due_date <= ?
      `;

      const [tasksToNotify] = await pool.execute(query, [tenMinutesAgoStr, in30MinutesStr]);

      for (const task of tasksToNotify) {
        const priorityLabels = {
          '1': '🔴 Cao (Quan trọng)',
          '2': '🟡 Trung bình',
          '3': '🟢 Thấp'
        };
        const sourceLabels = {
          'Email': '📧 Đồng bộ từ Email',
          'Zalo': '💬 Zalo',
          'Slack': '💬 Slack',
          'Discord': '💬 Discord',
          'Custom': '👤 Tự tạo'
        };

        const priorityText = priorityLabels[task.priority] || '🟡 Trung bình';
        const sourceText = sourceLabels[task.source] || '👤 Tự tạo';
        const formattedDate = new Date(task.due_date).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour12: false
        });

        let message = `🔔 **[NHẮC NHỞ CÔNG VIỆC SẮP ĐẾN HẠN]**\n`;
        message += `-------------------------------------------\n`;
        message += `📌 **Công việc:** ${task.title}\n`;
        if (task.description) {
          message += `📝 **Mô tả:** ${task.description}\n`;
        }
        message += `⏰ **Thời hạn:** \`${formattedDate}\` (Còn dưới 30 phút)\n`;
        message += `🔥 **Mức độ ưu tiên:** ${priorityText}\n`;
        message += `🔌 **Nguồn:** ${sourceText}\n`;
        message += `-------------------------------------------\n`;
        message += `*Hãy tập trung hoàn thành đúng hạn nhé! 💪*`;

        const success = await this.sendDiscordMessage(message);

        if (success) {
          await pool.execute('UPDATE tasks SET discord_notified = 1 WHERE id = ?', [task.id]);
          console.log(`[Discord] Đã gửi nhắc nhở thành công cho task ID: ${task.id} - "${task.title}"`);
        }
      }
    } catch (error) {
      console.error('[Discord Check Error]', error.message);
    } finally {
      this.isCheckingDiscord = false;
    }
  }

  /**
   * Gửi tin nhắn cảnh báo/nhắc nhở công việc lên Discord thông qua Webhook URL.
   * @param {string} text - Nội dung tin nhắn đã được định dạng Markdown để hiển thị trên Discord.
   * @returns {Promise<boolean>} Trả về true nếu gửi thành công sang Discord, ngược lại là false.
   */
  async sendDiscordMessage(text) {
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!webhookUrl) return false;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: text
        })
      });

      if (!response.ok) {
        console.error('[Discord API Error]', response.statusText);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[Discord Send Error]', error.message);
      return false;
    }
  }

  // ============== 3. TỰ ĐỘNG DỌN DẸP DỮ LIỆU CŨ ĐỊNH KỲ (HÀNG THÁNG) ==============
  async cleanCompletedTasks() {
    if (this.isCleaningTasks) return;
    this.isCleaningTasks = true;

    try {
      console.log('[Task Cleanup] Đang rà soát và dọn dẹp công việc, sự kiện, thông báo cũ hơn 30 ngày (1 tháng)...');
      
      // Xóa các task có status = 'done' và thời gian cập nhật hơn 30 ngày trước
      const [taskResult] = await pool.execute(
        "DELETE FROM tasks WHERE status = 'done' AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
      );

      // Xóa các event có thời gian kết thúc hơn 30 ngày trước
      const [eventResult] = await pool.execute(
        "DELETE FROM events WHERE end_time < DATE_SUB(NOW(), INTERVAL 30 DAY)"
      );

      // Xóa các thông báo đã được tạo hơn 30 ngày trước
      const [notifResult] = await pool.execute(
        "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
      );

      if (taskResult.affectedRows > 0 || eventResult.affectedRows > 0 || notifResult.affectedRows > 0) {
        console.log(`[Task Cleanup] Đã tự động dọn dẹp: ${taskResult.affectedRows} công việc, ${eventResult.affectedRows} sự kiện, và ${notifResult.affectedRows} thông báo cũ hơn 30 ngày.`);
      } else {
        console.log('[Task Cleanup] Không có dữ liệu cũ nào (> 30 ngày) cần dọn dẹp.');
      }
    } catch (error) {
      console.error('[Task Cleanup Error]', error.message);
    } finally {
      this.isCleaningTasks = false;
    }
  }
}

module.exports = new AutomationService();
