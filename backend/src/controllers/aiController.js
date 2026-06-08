const plannerService = require('../services/ai/plannerService');
const pool = require('../config/db');
const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

const { isWorkEmail } = require('../utils/emailFilter');

// Hàm phụ để truy vấn email trực tiếp từ IMAP
async function fetchRecentEmails() {
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

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    const status = connection.imap._box;
    const totalMessages = status.messages.total;
    
    if (totalMessages === 0) {
      connection.end();
      return 'Hộp thư điện tử trống.';
    }

    // Lấy tối đa 20 email gần nhất để lọc ra các mail công việc
    const startSeq = Math.max(1, totalMessages - 19);
    const endSeq = totalMessages;
    const searchCriteria = [`${startSeq}:${endSeq}`];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT', ''],
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    connection.end();

    // Đảo ngược để thư mới nhất lên đầu
    messages.reverse();

    let workEmails = [];
    for (const item of messages) {
      const all = item.parts.find(part => part.which === '');
      const parsed = await simpleParser("Imap-Id: " + item.attributes.uid + "\r\n" + all.body);
      const from = parsed.from ? parsed.from.value[0].address : 'Không rõ';
      const subject = parsed.subject || 'Không có tiêu đề';
      const text = parsed.text ? parsed.text.trim() : '';

      if (isWorkEmail(subject, from, text)) {
        const date = parsed.date ? new Date(parsed.date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Không rõ';
        workEmails.push({
          uid: item.attributes.uid,
          from,
          subject,
          date,
          snippet: text.substring(0, 300).trim()
        });
      }

      // Chỉ cần lấy tối đa 5 mail công việc
      if (workEmails.length >= 5) break;
    }

    if (workEmails.length === 0) {
      return 'Không tìm thấy thư điện tử nào liên quan đến công việc gần đây.';
    }

    let formatted = '';
    for (const email of workEmails) {
      formatted += `\n--- THƯ ĐIỆN TỬ CÔNG VIỆC (UID: ${email.uid}) ---\n`;
      formatted += `Người gửi: ${email.from}\n`;
      formatted += `Tiêu đề: ${email.subject}\n`;
      formatted += `Thời gian nhận: ${email.date}\n`;
      formatted += `Nội dung trích đoạn: ${email.snippet}\n`;
    }
    return formatted;
  } catch (err) {
    console.error('Lỗi khi đọc IMAP cho AI:', err.message);
    return `[Không thể kết nối đến hộp thư: ${err.message}]`;
  }
}

exports.chatWithAI = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'Lịch sử trò chuyện không hợp lệ' });
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.BASE_URL || 'https://integrate.api.nvidia.com/v1';

  if (!apiKey) {
    return res.status(500).json({ message: 'Cấu hình API Key chưa được thiết lập trên server' });
  }

  try {
    const userId = req.user.id;

    // Lấy danh sách công việc chưa hoàn thành (kèm source và mô tả để AI đọc)
    const [tasks] = await pool.execute(
      "SELECT title, description, due_date, priority, status, source FROM tasks WHERE user_id = ? AND status != 'done' ORDER BY due_date ASC",
      [userId]
    );

    const formattedTasks = tasks.map(t => {
      const due = t.due_date ? new Date(t.due_date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'Không có';
      const desc = t.description ? `, Mô tả: ${t.description.replace(/\n/g, ' ')}` : '';
      return `- [CÔNG VIỆC] [Nguồn: ${t.source || 'Custom'}] ${t.title} (Hạn: ${due}, Ưu tiên: ${t.priority || '2'}, Trạng thái: ${t.status}${desc})`;
    }).join('\n');

    const currentTimeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Kiểm tra xem tin nhắn cuối cùng có hỏi về email/thư điện tử hay không
    const lastMessage = messages[messages.length - 1];
    const userQuery = (lastMessage.content || lastMessage.text || '').toLowerCase();
    const needsEmailContext = userQuery.includes('mail') || userQuery.includes('email') || userQuery.includes('thư');

    let emailInboxContext = '';
    if (needsEmailContext) {
      if (process.env.IMAP_USER && process.env.IMAP_PASSWORD) {
        console.log('[AI Chat] Người dùng hỏi về email. Đang kết nối IMAP để lấy thư thực tế...');
        emailInboxContext = await fetchRecentEmails();
      } else {
        emailInboxContext = '\n[Lưu ý: Không thể truy cập hộp thư vì thông tin cấu hình IMAP chưa được thiết lập trong tệp .env trên máy chủ]';
      }
    }

    // Định nghĩa System Prompt để định hướng tính cách và chức năng của AI cùng dữ liệu thực tế
    const systemPrompt = {
      role: 'system',
      content: `Bạn là trợ lý ảo lịch cá nhân thông minh tên là FocusFlow.
Nhiệm vụ của bạn:
- Hỗ trợ người dùng sắp xếp thời gian, quản lý công việc và tư vấn lên lịch trình hiệu quả.
- Giao tiếp thân thiện, ngắn gọn, súc tích và chuyên nghiệp bằng tiếng Việt.
- Sử dụng Markdown để định dạng văn bản cho rõ ràng, dễ đọc.
- Thời gian hiện tại hệ thống của bạn là: ${currentTimeStr} (múi giờ Việt Nam). Dùng thông tin này để xử lý các từ tương đối như "hôm nay", "ngày mai", "tuần tới"...

LỊCH TRÌNH VÀ CÔNG VIỆC HIỆN TẠI CỦA NGƯỜI DÙNG:
Công việc chưa hoàn thành:
${formattedTasks || 'Không có công việc chưa hoàn thành nào.'}
${emailInboxContext ? `\nTHÔNG TIN ĐỌC TRỰC TIẾP TỪ HỘP THƯ EMAIL CỦA NGƯỜI DÙNG (MỚI NHẤT):\n${emailInboxContext}` : ''}

QUY TẮC ĐẶC BIỆT KHI LÊN LỊCH TRÌNH / TẠO CÔNG VIỆC:
Nếu người dùng muốn bạn lên lịch, sắp xếp thời gian, hoặc tạo công việc mới (bao gồm cả việc lên lịch dựa trên các email vừa đọc ở trên), hãy trò chuyện bình thường với họ. ĐỒNG THỜI, ở cuối câu trả lời của bạn, bạn BẮT BUỘC phải đính kèm một khối XML <plan> chứa chuỗi JSON biểu diễn các công việc đề xuất đó. Không được để bất kỳ text nào khác bên ngoài hoặc bên trong thẻ <plan> ngoài JSON.
Định dạng thẻ <plan> phải chính xác như sau:
<plan>
{
  "proposed_blocks": [
    {
      "title": "Tên công việc đề xuất",
      "type": "task",
      "startTime": "HH:mm" (Khung giờ bắt đầu thực hiện, ví dụ "14:30", hoặc để trống nếu không có giờ cụ thể),
      "endTime": "HH:mm" (Khung giờ kết thúc thực hiện, ví dụ "15:30", hoặc để trống),
      "priority": "1" | "2" | "3" (Bắt buộc, 1=Cao, 2=Trung bình, 3=Thấp),
      "reason": "Giải thích ngắn gọn lý do đề xuất"
    }
  ],
  "targetDate": "YYYY-MM-DD" (Ngày diễn ra lịch trình đề xuất, định dạng YYYY-MM-DD, ví dụ "2026-05-26")
}
</plan>

Lưu ý quan trọng:
- Nếu người dùng yêu cầu chỉnh sửa hoặc điều chỉnh lịch trình đã đề xuất trong đoạn chat trước, hãy cập nhật lại toàn bộ danh sách các blocks này và trả về thẻ <plan> mới chứa toàn bộ các đề xuất đã được chỉnh sửa.
- Nếu người dùng chỉ hỏi đáp thông thường (ví dụ: "Lịch hôm nay thế nào?", "Tôi có việc gì gấp không?", "Hộp thư email của tôi có thư gì mới?") mà không cần thay đổi hay tạo mới lịch trình/công việc, bạn chỉ cần trả lời bình thường và KHÔNG cần kèm theo thẻ <plan>.`
    };

    // Chuẩn bị payload gửi lên Nvidia NIM API
    const apiMessages = [
      systemPrompt,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content || msg.text
      }))
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: apiMessages,
        temperature: 0.5,
        max_tokens: 1500,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('NVIDIA API Error:', errorData);
      throw new Error(errorData.message || 'Lỗi khi gọi NVIDIA API');
    }

    const data = await response.json();
    const assistantReply = data.choices && data.choices[0] && data.choices[0].message.content;

    if (!assistantReply) {
      throw new Error('Định dạng phản hồi từ AI không hợp lệ');
    }

    res.json({ reply: assistantReply });
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi giao tiếp với AI', error: error.message });
  }
};

exports.generatePlan = async (req, res) => {
  try {
    const { userInput, dateStr } = req.body;
    if (!userInput || !dateStr) {
      return res.status(400).json({ message: 'Thiếu thông tin người dùng hoặc ngày' });
    }
    const blocks = await plannerService.generatePlan(userInput, req.user.id, dateStr);
    res.json({ blocks });
  } catch (error) {
    console.error('AI Generate Plan Error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo kế hoạch', error: error.message });
  }
};

exports.commitPlan = async (req, res) => {
  try {
    const { blocks, dateStr } = req.body;
    if (!blocks || !Array.isArray(blocks) || !dateStr) {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    const results = await plannerService.commitPlan(blocks, req.user.id, dateStr);
    res.json(results);
  } catch (error) {
    console.error('AI Commit Plan Error:', error);
    res.status(500).json({ message: 'Lỗi khi lưu kế hoạch', error: error.message });
  }
};
