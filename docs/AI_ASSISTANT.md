# 🤖 Trợ Lý Ảo AI Lập Lịch Trình Tự Động (AI Assistant Planner)

Phân hệ **Trợ lý ảo AI** cung cấp khả năng tương tác ngôn ngữ tự nhiên để tự động hóa việc lên lịch trình và kế hoạch làm việc. AI có khả năng hiểu các câu lệnh hội thoại thông thường, đối chiếu với lịch biểu hiện tại của người dùng để đưa ra gợi ý tối ưu và tự động chuyển đổi văn bản thành các bản ghi công việc chính thức trong cơ sở dữ liệu.

---

## I. Vấn Đề Giải Quyết (Problem Solved)

1. **Nhập liệu thủ công tốn thời gian**: Việc điền tiêu đề, chọn ngày, giờ, mức độ ưu tiên cho từng đầu việc nhỏ là một rào cản lớn khiến người dùng lười lập kế hoạch.
2. **Khó sắp xếp lịch trình tối ưu**: Khi lập kế hoạch cho một chuỗi công việc (như ôn thi, chuẩn bị dự án), người dùng gặp khó khăn trong việc tự phân bổ thời gian hợp lý mà không bị trùng lịch với các công việc cũ.
3. **Thiếu khả năng trích xuất thông minh**: Các ứng dụng trò chuyện thông thường chỉ trả về câu trả lời dạng văn bản thô, bắt người dùng phải tự đọc và gõ lại từng dòng vào lịch trình.

---

## II. Sơ Đồ Quy Trình Tương Tác & Lập Lịch (AI Assistant Workflows)

Dưới đây là sơ đồ chi tiết toàn bộ luồng xử lý từ khi người dùng nhập câu lệnh hội thoại tự nhiên, qua bộ xử lý AI, trả về khối giao diện kế hoạch tương tác và lưu trực tiếp vào cơ sở dữ liệu MySQL:

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant ChatUI as AIAssistant.jsx
    participant AICtrl as aiController.js
    participant AIServ as plannerService.js
    participant NVIDIA as NVIDIA LLM API
    participant DB as MySQL Database

    User->>ChatUI: Nhập: "Hãy lên lịch học tập 3 môn Toán, Lý, Hóa vào sáng mai giúp tôi"
    activate ChatUI
    ChatUI->>AICtrl: POST /api/ai/chat { message } (Đính kèm JWT)
    deactivate ChatUI
    
    activate AICtrl
    AICtrl->>DB: SELECT title, due_date FROM tasks WHERE user_id = ? AND status != 'done'
    DB-->>AICtrl: Trả về danh sách Task hiện tại của User (Làm Context chống trùng lịch)
    
    AICtrl->>AIServ: generatePlan(message, existingTasks)
    activate AIServ
    AIServ->>AIServ: Xây dựng System Prompt cực kỳ chi tiết:<br/>- Cung cấp Ngày giờ hiện tại chính xác<br/>- Danh sách Task đang có<br/>- Quy chuẩn định dạng XML bắt buộc
    AIServ->>NVIDIA: Gửi API Request (System Prompt + Tin nhắn người dùng)
    activate NVIDIA
    NVIDIA-->>AIServ: Trả về văn bản chứa khối cấu trúc XML:<br/>&lt;plan&gt;<br/>  &lt;block&gt;<br/>    &lt;title&gt;Học Toán&lt;/title&gt;<br/>    &lt;time&gt;08:00&lt;/time&gt;...<br/>  &lt;/block&gt;<br/>&lt;/plan&gt;
    deactivate NVIDIA
    
    AIServ-->>AICtrl: Trả về dữ liệu văn bản thô (chứa XML)
    deactivate AIServ
    AICtrl-->>ChatUI: Trả về JSON { reply: "..." }
    deactivate AICtrl
    
    activate ChatUI
    ChatUI->>ChatUI: Phân tích cú pháp văn bản thô:<br/>1. Tách phần văn bản hội thoại thông thường để hiển thị dạng chat.<br/>2. Phát hiện thẻ &lt;plan&gt; để kích hoạt giao diện xem trước Lịch Trình Gợi Ý trực quan.
    ChatUI->>User: Hiển thị lời thoại AI & Hộp xem trước Lịch trình kèm nút "Lên lịch trình gợi ý"
    deactivate ChatUI

    %% Áp dụng lịch
    User->>ChatUI: Bấm chọn các đầu việc gợi ý & click nút "Lên lịch trình gợi ý" (Commit Plan)
    activate ChatUI
    ChatUI->>AICtrl: POST /api/ai/plan/commit { dateStr, blocks }
    deactivate ChatUI
    
    activate AICtrl
    loop Với mỗi block công việc được chọn
        AICtrl->>DB: INSERT INTO tasks (user_id, title, due_date, priority, source='AI')
    end
    DB-->>AICtrl: Trả về thành công
    AICtrl-->>ChatUI: Trả về JSON { success: true }
    
    activate ChatUI
    ChatUI->>User: Hiện thông báo Sonner Toast: "Đã áp dụng lịch trình thành công!"
    ChatUI->>User: Tự động chuyển hướng và cập nhật màn hình Lịch/Dashboard mới
    deactivate ChatUI
```

---

## III. Cơ Chế Hoạt Động & Kỹ Thuật Phân Tích Cú Pháp (Technical Details)

### 1. Kỹ thuật Kỹ nghệ Prompt (Prompt Engineering)
Để AI phản hồi ra định dạng có thể phân tách bằng code (structural parsing), `plannerService.js` sử dụng một System Prompt vô cùng nghiêm ngặt:
* **Ngữ cảnh thời gian thực (Real-time Context)**: Hệ thống chèn thời gian hiện tại của hệ thống (Ví dụ: `Hôm nay là Thứ Sáu, ngày 29/05/2026`) để AI biết chính xác "sáng mai" hoặc "thứ 2 tuần tới" là ngày tháng năm nào.
* **Ngữ cảnh công việc hiện tại (Task Context)**: Chèn danh sách các công việc chưa làm của người dùng để AI tự động sắp xếp tránh các khung giờ bận rộn hiện có.
* **Quy chuẩn XML đầu ra (Output Schema)**: Ép LLM trả về cấu trúc XML cụ thể:
  ```xml
  <plan>
    <block>
      <title>Tiêu đề việc cần làm</title>
      <time>hh:mm (Giờ bắt đầu)</time>
      <date>YYYY-MM-DD (Ngày thực hiện)</date>
      <priority>1, 2 hoặc 3 (Độ ưu tiên)</priority>
      <description>Ghi chú chi tiết</description>
    </block>
  </plan>
  ```

### 2. Bộ phân tách cú pháp thông minh ở Frontend (RegEx Parser)
Khi nhận phản hồi từ API, component [AIAssistant.jsx](file:///Users/mong/Documents/FrontEnd/personal-calendar/frontend/src/pages/AIAssistant.jsx) không hiển thị trực tiếp đoạn mã XML thô xấu xí. Thay vào đó, một bộ phân tách sử dụng biểu thức chính quy (Regular Expression) sẽ hoạt động:
* **Tách văn bản và dữ liệu**: Dùng RegEx quét tìm cặp thẻ `<plan>...</plan>`. 
  - Phần văn bản nằm **ngoài** thẻ XML được hiển thị như một tin nhắn trò chuyện thông thường của trợ lý ảo (giải thích, động viên người dùng).
  - Phần dữ liệu nằm **trong** thẻ XML được đưa vào hàm phân tích đối tượng để kết xuất (render) thành một bảng xem trước kế hoạch cực kỳ hiện đại với đầy đủ nhãn thời gian, tiêu đề, và mức độ ưu tiên.
* **Cho phép tùy chọn trước khi áp dụng**: Mỗi đầu việc gợi ý được gắn kèm một ô checkbox. Người dùng có thể chủ động bỏ chọn những việc không muốn làm trước khi bấm nút "Áp dụng lịch" lên cơ sở dữ liệu.

### 3. Giao dịch Bulk-Insert lên Cơ sở dữ liệu
Khi người dùng bấm "Áp dụng lịch", API `/api/ai/plan/commit` sẽ tiếp nhận danh sách các công việc đã chọn. Backend sẽ thực hiện vòng lặp insert nhanh các bản ghi vào bảng `tasks` với trường `source` được đặt mặc định là `'AI'` và `status = 'todo'`, giúp người dùng dễ dàng lọc và quản lý sau này.
