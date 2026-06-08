# 🎯 MVP – CHỨC NĂNG CỐT LÕI

> **Mục tiêu:** Xác định **tập tối thiểu** các chức năng cần xây dựng để sản phẩm **chạy được, giải quyết đúng pain point chính**, không bị sa đà vào tính năng phụ.
>
> **Triết lý:** *Một sản phẩm "đủ dùng" tốt hơn một sản phẩm "đầy đủ tính năng nhưng không bao giờ ra mắt".*
>
> **Stack:** ReactJS (Vite) + ExpressJS + MySQL
> **Thời gian dự kiến:** 4–6 tuần làm việc nghiêm túc (1 người, part-time)

---

## 1. TIÊU CHÍ LỌC CHỨC NĂNG MVP

Một chức năng được coi là **MVP-critical** khi thoả mãn cả 3 điều kiện:

| Tiêu chí | Câu hỏi tự hỏi |
|----------|----------------|
| ✅ Giải quyết pain point cốt lõi | Nếu thiếu, người dùng có dùng được sản phẩm không? |
| ✅ Không thể workaround | Người dùng có thể "chữa cháy" bằng cách khác không? |
| ✅ Chi phí phát triển hợp lý | Có làm được trong < 1 tuần không? |

Những gì **KHÔNG vào MVP** dù hay đến mấy:
- Drag & drop trên calendar (đẹp nhưng có thể click sửa)
- Kanban board (List view đã đủ)
- Recurring events (lặp lại tay được)
- Analytics chi tiết (chưa có data để phân tích)
- LLM Assistant đầy đủ (chỉ giữ 1 use case duy nhất)
- Dark mode (light mode đủ dùng)
- Mobile responsive hoàn hảo (desktop trước)

---

## 2. BẢN ĐỒ PAIN POINT → CHỨC NĂNG MVP

| Pain Point gốc | Chức năng MVP giải quyết | Ưu tiên |
|----------------|--------------------------|---------|
| P1 – Lịch phân mảnh, thiếu tổng quan | **Unified view** (Dashboard + Calendar Month) | 🔴 Must |
| P2 – Thiếu phân loại & ưu tiên | **Category + Priority** (4 mức) | 🔴 Must |
| P3 – Nhắc nhở không đúng lúc | **Reminder cơ bản** (in-app + browser push) | 🟠 Should |
| P4 – Không biết đã làm gì | **Today summary** (đơn giản, chưa cần analytics) | 🟡 Could |
| P5 – Tạo task mất thời gian | **Quick Add** (1 dòng, Enter là xong) | 🔴 Must |

> Pain Point phụ (P6, P7, P8): hoãn sang Phase sau.

---

## 3. CHỨC NĂNG MVP – DANH SÁCH CHÍNH THỨC

### 🟦 MODULE A: Authentication (Bắt buộc)

| Chức năng | Mô tả ngắn | Lý do MVP |
|-----------|-----------|-----------|
| A1. Đăng ký tài khoản | Email + password + tên hiển thị | Không có user thì không có dữ liệu cá nhân |
| A2. Đăng nhập | Trả JWT access token + refresh token | An toàn cơ bản |
| A3. Đăng xuất | Revoke refresh token | Bắt buộc về mặt bảo mật |
| A4. Silent refresh JWT | Frontend tự gọi `/auth/refresh` khi access token hết hạn | UX không bị logout giữa chừng |

**Loại bỏ khỏi MVP:**
- ❌ Quên mật khẩu / Reset password qua email → Phase 2 (cần SMTP setup)
- ❌ Đăng nhập bằng Google OAuth → Phase 2
- ❌ Xác thực 2 lớp (2FA) → Sau cùng
- ❌ Email verification → Có thể bỏ qua, tin tưởng user nhập đúng

---

### 🟦 MODULE B: Event Management (Bắt buộc)

| Chức năng | Mô tả | Trường tối thiểu |
|-----------|------|------------------|
| B1. Tạo event đơn lẻ | Modal form mở từ nút "+" | title, start_time, end_time, category (tuỳ chọn) |
| B2. Xem event chi tiết | Click event → mở side panel hoặc modal | Hiển thị mọi field |
| B3. Sửa event | Click "Sửa" → form điền sẵn | Same fields |
| B4. Xóa event (soft delete) | Set `deleted_at`, không xóa thật | Tránh mất dữ liệu |
| B5. Đánh dấu done / cancelled | Đổi `status` (3 giá trị: upcoming/done/cancelled) | Quan trọng – user cần "tick" để cảm thấy hoàn thành |
| B6. Calendar Month View | Lưới 7 cột, hiển thị event chip trong từng ô ngày | View MẶC ĐỊNH duy nhất ở MVP |
| B7. Navigate tháng trước/sau | 2 nút mũi tên + "Hôm nay" | Cơ bản |

**Loại bỏ khỏi MVP:**
- ❌ **Recurring events** (lặp lại): rất phức tạp khi xử lý exception. Hoãn sang Phase 2.
- ❌ Week View & Day View: Month View đã đủ thấy tổng quan. Phase 2.
- ❌ Drag & drop kéo thả: Phase 2.
- ❌ Override màu khác category: bỏ qua, dùng màu category.
- ❌ Markdown trong description: dùng plain text trước.
- ❌ Click vào slot trống để mở form: Phase 2 (giờ chỉ có nút "+").

---

### 🟦 MODULE C: Task Management (Bắt buộc)

| Chức năng | Mô tả | Trường tối thiểu |
|-----------|------|------------------|
| C1. Quick Add Task | Chỉ cần gõ title + Enter là tạo xong | title (mặc định priority=medium, status=todo) |
| C2. Sửa task chi tiết | Click task → side panel/modal đầy đủ field | title, description, due_date, due_time, priority, category, status |
| C3. Tick checkbox để hoàn thành | Optimistic update, không chờ API | status: todo → done, set `completed_at` |
| C4. Xóa task (soft delete) | Set `deleted_at` | |
| C5. Filter cơ bản | 4 preset: Today / Overdue / All / No Date | |
| C6. Sort | Theo priority (mặc định) hoặc due_date | |
| C7. Priority indicator | 4 màu: 🔴 urgent / 🟠 high / 🟡 medium / 🟢 low | |
| C8. List View | Group by section (Overdue / Today / Upcoming) | Là view DUY NHẤT ở MVP |

**Loại bỏ khỏi MVP:**
- ❌ Sub-tasks (chỉ 1 level): Phase 2 – đa số task không cần.
- ❌ Kanban Board View: List view đã đủ.
- ❌ Drag & drop reorder: Phase 2.
- ❌ Estimated time: Phase 3 (chỉ hữu ích khi có AI gợi ý slot).
- ❌ Shortcut `#category` và `!priority` trong title: Phase 2.

---

### 🟦 MODULE D: Category System (Bắt buộc, nhưng tối giản)

| Chức năng | Mô tả |
|-----------|------|
| D1. Seed 5 default categories khi đăng ký | Công việc / Học tập / Sức khoẻ / Cá nhân / Tài chính |
| D2. Tạo category mới (custom) | Chọn tên + màu hex + emoji từ danh sách 20–30 emoji có sẵn |
| D3. Sửa tên/màu category | Default categories cũng cho sửa tên/màu, nhưng KHÔNG xóa được |
| D4. Xóa custom category | Nếu còn event/task → báo lỗi, yêu cầu chuyển trước |

**Loại bỏ khỏi MVP:**
- ❌ Drag & drop sắp xếp thứ tự category: dùng order theo `created_at`.
- ❌ Icon picker hoành tráng: chỉ cần 1 dropdown đơn giản.
- ❌ Giới hạn 20 categories: trong MVP thì cứ cho không giới hạn, ai cần thì cứ tạo.

---

### 🟦 MODULE E: Dashboard (Bắt buộc – đây là "wow page")

| Chức năng | Mô tả |
|-----------|------|
| E1. Greeting header | "Chào [tên], [ngày]" + 1 dòng tóm tắt |
| E2. Today's events | List event hôm nay (max 5, có nút "Xem thêm" → CalendarPage) |
| E3. Today's tasks | List task có due_date = hôm nay + overdue + checkbox tick nhanh |
| E4. Week progress | 1 progress bar: "X/Y task tuần này hoàn thành" |
| E5. Quick Add Bar | Ô input + nút "Thêm task" |

**Loại bỏ khỏi MVP:**
- ❌ AI Quick Insight: chưa có AI ở MVP.
- ❌ Streak counter: chưa có analytics.
- ❌ Empty states đẹp với illustration: dùng text đơn giản.

---

### 🟦 MODULE F: Reminder Cơ bản (Nên có, không bắt buộc tuyệt đối)

> 📌 **Quyết định:** MVP **CÓ** reminder cơ bản, vì pain point P3 nằm trong top 3. Nhưng chỉ làm **mức tối giản**.

| Chức năng | Mô tả |
|-----------|------|
| F1. Default reminder | Event: nhắc trước 15 phút. Task urgent/high: trước 1 giờ. |
| F2. Cron job mỗi 1 phút | Quét bảng `reminders` WHERE `remind_at <= NOW()` AND `is_sent = false` |
| F3. In-app notification | Tạo record trong bảng `notifications`, frontend polling mỗi 30s |
| F4. Bell icon + dropdown | TopBar có 🔔 với badge số chưa đọc, click hiện 5 notification gần nhất |
| F5. Mark as read | Click notification → đánh dấu đã đọc |

**Loại bỏ khỏi MVP:**
- ❌ **Browser Push Notification (Web Push API + Service Worker):** phức tạp, hoãn Phase 2.
- ❌ Quiet hours: Phase 2.
- ❌ Custom reminder (user thêm nhiều mốc): chỉ default reminder ở MVP.
- ❌ Daily digest / Weekly digest: Phase 3.
- ❌ Batch logic gom notification: Phase 2.

---

### 🟦 MODULE G: User Settings (Tối giản)

| Chức năng MVP | Mô tả |
|---------------|------|
| G1. Đổi tên hiển thị | Input + nút Lưu |
| G2. Đổi timezone | Dropdown chọn (mặc định Asia/Ho_Chi_Minh) |
| G3. Đổi mật khẩu | Form: mật khẩu cũ + mới + xác nhận |
| G4. Đăng xuất | Nút trong sidebar |

**Loại bỏ khỏi MVP:**
- ❌ Theme dark/light/system: Phase 4 polish.
- ❌ Quiet hours, work hours: Phase 2.
- ❌ Locale switch (vi/en): tiếng Việt là đủ.
- ❌ Xóa tài khoản: rủi ro cao, Phase sau.
- ❌ Reset AI chat history, AI daily limit setting: chưa có AI.

---

## 4. CHỨC NĂNG KHÔNG VÀO MVP (TỔNG KẾT)

| Chức năng | Lý do hoãn | Phase đề xuất |
|-----------|-----------|---------------|
| LLM Assistant (parse, suggest, daily plan) | Tốn token, phức tạp prompt, cần Phase 1 ổn định trước | Phase 3 |
| Recurring events | Phức tạp về business logic exception | Phase 2 |
| Sub-tasks | Đa số task không cần | Phase 2 |
| Week View / Day View calendar | Month view đủ tổng quan | Phase 2 |
| Drag & drop (event + task) | UX nice-to-have, không phải must | Phase 2 |
| Kanban board | List view đủ | Phase 2 |
| Browser Push notification | Web Push setup phức tạp | Phase 2 |
| Analytics dashboard (heatmap, pie, trend) | Chưa có đủ data để phân tích | Phase 3 |
| Weekly digest / Daily digest | Cron + template phức tạp | Phase 3 |
| Dark mode | Polish UX | Phase 4 |
| Mobile responsive (bottom nav) | Desktop trước | Phase 4 |
| Quên mật khẩu / Email verification | Cần SMTP setup | Phase 2 |
| Tags / Shared calendar / Google sync | Mở rộng tương lai | Sau MVP rất lâu |

---

## 5. DEFINITION OF DONE CHO MVP

MVP được coi là **"DONE"** khi tất cả những thứ sau hoạt động:

### ✅ User Journey Test

1. **Đăng ký tài khoản mới** → vào thẳng Dashboard, thấy 5 default categories trong sidebar.
2. **Tạo 1 event hôm nay** lúc 15:00 → thấy ngay trong Dashboard và Calendar Month View.
3. **Tạo 1 task urgent có deadline hôm nay** bằng Quick Add → thấy ở section "Hôm nay" trong Task page với màu đỏ.
4. **Tick checkbox task** → UI đổi ngay, refresh trang vẫn thấy task đã done.
5. **Đợi đến 15 phút trước event** → có notification trong bell icon.
6. **Đăng xuất, đăng nhập lại** → toàn bộ dữ liệu còn nguyên.
7. **Sửa tên hiển thị trong Settings** → Dashboard greeting cập nhật ngay.

### ✅ Kỹ thuật

- [ ] Tất cả 4 state (loading, error, empty, success) đã handle ở các page chính
- [ ] JWT refresh hoạt động ngầm, user không bị logout đột ngột
- [ ] Soft delete cho event/task (không mất dữ liệu)
- [ ] Cron job reminder chạy ổn định, không trùng lặp notification
- [ ] DB lưu UTC, frontend convert đúng timezone
- [ ] Form validation cả client (Zod) và server (cũng nên có Zod)
- [ ] Không có bug crashing trên Chrome desktop

### ✅ Không bắt buộc cho MVP nhưng nên có

- [ ] Toast notification khi action thành công/thất bại (`react-hot-toast` ~5KB)
- [ ] Skeleton loading thay vì spinner trắng
- [ ] Error boundary ở mỗi page (không crash cả app khi 1 page lỗi)

---

## 6. CÁC CON SỐ ƯỚC LƯỢNG

| Mục | Số lượng |
|-----|---------|
| Tổng số API endpoint cần xây | ~25 endpoint |
| Tổng số React component cần xây | ~35–40 component |
| Số trang (page route) | 5 trang: Login, Register, Dashboard, Calendar, Tasks, Settings |
| Số bảng DB | 7 bảng: users, categories, events, tasks, reminders, notifications, refresh_tokens |
| Số custom hook | ~6 hook |

---

## 7. TÓM TẮT QUYẾT ĐỊNH MVP

> **Nguyên tắc vàng:** *Mỗi feature thêm vào MVP = chậm ra mắt 3–7 ngày.*

✅ **GIỮ:** CRUD event/task, Calendar Month View, Task List View, Category, Dashboard, Reminder cơ bản (in-app), Auth.

❌ **BỎ:** Recurring, sub-tasks, drag&drop, Kanban, Week/Day view, LLM, Analytics, Web Push, dark mode, mobile.

🎯 **Kết quả kỳ vọng:** Một sản phẩm đủ để **bản thân bạn dùng hàng ngày** trong 2 tuần, từ đó thu thập feedback thật trước khi xây phase 2.
