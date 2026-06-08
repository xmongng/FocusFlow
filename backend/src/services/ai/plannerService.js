const pool = require('../../config/db');

const buildPrompt = (userInput, existingTasks, dateStr) => {
  return `Bạn là một trợ lý ảo siêu việt tên là AI Schedule Planner.
Người dùng yêu cầu lập kế hoạch công việc cho ngày: ${dateStr}

Yêu cầu của người dùng:
"${userInput}"

---
Công việc (Tasks) hiện tại trong ngày hoặc chưa hoàn thành:
${JSON.stringify(existingTasks, null, 2)}
---

Dựa vào các thông tin trên, hãy đề xuất lịch trình các công việc cần làm.
Quy định bắt buộc:
1. Trả về ĐÚNG VÀ CHỈ 1 cục JSON hợp lệ chứa mảng "blocks". KHÔNG TRẢ VỀ TEXT NÀO KHÁC BÊN NGOÀI JSON.
2. Mỗi "block" đại diện cho 1 công việc cần làm, có cấu trúc:
{
  "title": "Tên công việc",
  "startTime": "HH:mm" (Khung giờ bắt đầu thực hiện, ví dụ "09:00", hoặc để trống nếu không có giờ cụ thể),
  "endTime": "HH:mm" (Khung giờ kết thúc thực hiện, ví dụ "10:00", hoặc để trống),
  "reason": "Lý do AI đề xuất công việc hoặc khung giờ này",
  "priority": "1" | "2" | "3" (1=Quan trọng, 2=Trung bình, 3=Thấp)
}
3. Cố gắng chia nhỏ thời gian hợp lý, kết hợp lịch cũ và yêu cầu mới.`;
};

const parseAIResponse = (raw) => {
  try {
    // Thường AI sẽ bọc trong ```json ... ```, dùng regex để bóc tách
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : raw;
    
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.blocks)) {
      throw new Error("Không tìm thấy mảng blocks trong phản hồi");
    }
    
    // Validate và chuẩn hóa
    const validBlocks = parsed.blocks.map(b => ({
      ...b,
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'task',
      status: 'pending' // pending, accepted, rejected
    }));
    
    return validBlocks;
  } catch (error) {
    console.error('Parse AI Error:', error, 'Raw:', raw);
    throw new Error('AI trả về định dạng không hợp lệ');
  }
};

const generatePlan = async (userInput, userId, dateStr) => {
  // Lấy dữ liệu tasks của user trong ngày target hoặc chưa hoàn thành
  const [tasks] = await pool.execute(
    "SELECT title, due_date, priority, status FROM tasks WHERE user_id = ? AND (DATE(due_date) = ? OR status != 'done')",
    [userId, dateStr]
  );

  const prompt = buildPrompt(userInput, tasks, dateStr);

  const apiKey = process.env.NVIDIA_API_KEY;
  const baseUrl = process.env.BASE_URL || 'https://integrate.api.nvidia.com/v1';

  if (!apiKey) {
    throw new Error('Thiếu API Key NVIDIA');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b', // Sử dụng model có sẵn
      messages: [
        { role: 'system', content: 'You are an AI that strictly returns JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi gọi API NVIDIA');
  }

  const data = await response.json();
  const rawReply = data.choices?.[0]?.message?.content;
  if (!rawReply) throw new Error('AI không phản hồi');

  return parseAIResponse(rawReply);
};

const commitPlan = async (blocks, userId, targetDate) => {
  const results = { tasksCreated: 0 };
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const block of blocks) {
      if (block.status !== 'accepted') continue;
      
      const finalDueDate = targetDate 
        ? (block.startTime ? `${targetDate} ${block.startTime}:00` : `${targetDate} 23:59:59`)
        : null;

      await connection.execute(
        'INSERT INTO tasks (user_id, title, description, category_id, priority, due_date, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          block.title,
          block.reason || '',
          null,
          block.priority || '2',
          finalDueDate,
          'AI'
        ]
      );
      results.tasksCreated++;
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  generatePlan,
  commitPlan
};
