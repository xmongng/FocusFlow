# 🚀 HƯỚNG PHÁT TRIỂN SAU MVP

> **Mục đích:** Định nghĩa rõ ràng các phase tiếp theo sau khi MVP đã chạy ổn định. Đảm bảo mỗi feature thêm vào đều **giải quyết một vấn đề thực**, không phải "vì có thể làm".
>
> **Nguyên tắc:** Chỉ build feature mới khi:
> 1. MVP hiện tại đã được dùng thật ít nhất 2 tuần
> 2. Có **feedback cụ thể** từ user (kể cả bản thân) chỉ ra thiếu hụt
> 3. ROI rõ ràng (effort vs giá trị mang lại)

---

## 📍 BẢN ĐỒ TỔNG QUAN CÁC PHASE

```
┌────────────────────────────────────────────────────────────┐
│  PHASE 1 – MVP (4–6 tuần)  ✅ Xem file 01_MVP             │
│  ──────────────────────────                                │
│  Auth + CRUD Event/Task + Month View + Category +          │
│  Dashboard + Reminder cơ bản                               │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│  PHASE 2 – DAILY DRIVER (3–4 tuần)                         │
│  ──────────────────────────                                │
│  Recurring + Sub-tasks + Week/Day View + Drag&Drop +       │
│  Kanban + Web Push + Quên mật khẩu + Dark mode             │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│  PHASE 3 – INTELLIGENCE (3 tuần)                           │
│  ──────────────────────────                                │
│  LLM Assistant + Analytics Dashboard + Weekly Digest +     │
│  Daily Plan + Smart Reminders                              │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│  PHASE 4 – POLISH & SCALE (2–3 tuần)                       │
│  ──────────────────────────                                │
│  Mobile responsive + Performance + Global search +         │
│  i18n + Accessibility + Error monitoring                   │
└──────────────────────────┬─────────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────────┐
│  PHASE 5+ – MỞ RỘNG (open-ended)                           │
│  ──────────────────────────                                │
│  Tags / Google Calendar Sync / Habits / Goals /            │
│  Shared Calendar / Mobile App / Integrations               │
└────────────────────────────────────────────────────────────┘
```

---

## 🟦 PHASE 2 – DAILY DRIVER (Sau MVP, ~3–4 tuần)

> **Mục tiêu:** Biến sản phẩm từ "demo chạy được" thành "tôi dùng được cả tuần".
> **Trigger để bắt đầu:** Đã dùng MVP ≥ 2 tuần, xác định được điểm thiếu hụt rõ ràng.

### 2.1 Recurring Events (Lặp lại)

**Vấn đề giải quyết:**
- Họp standup hàng ngày phải tạo 30 lần/tháng → quá khổ.

**Phạm vi triển khai:**
| Tính năng | Phase 2 | Để sau |
|-----------|---------|--------|
| DAILY (mỗi ngày, mỗi N ngày) | ✅ | |
| WEEKLY (chọn thứ trong tuần) | ✅ | |
| MONTHLY by date (ngày 15 hàng tháng) | | ➡️ Phase 3 |
| MONTHLY by day (Thứ 2 đầu mỗi tháng) | | ➡️ Phase 3 |
| YEARLY | | ➡️ Phase 3 |
| End conditions: never / count / date | ✅ | |
| Edit "Chỉ event này" / "Event này và sau" / "Tất cả" | ✅ | |

**Chiến lược kỹ thuật:**
- Lưu rule gốc + bảng `event_exceptions` cho các occurrence bị sửa/xóa lẻ
- Backend tính toán occurrences trong date range khi query (không generate sẵn)
- Library hỗ trợ: `rrule.js` (mature, theo chuẩn iCal RFC 5545)

### 2.2 Sub-tasks

**Vấn đề giải quyết:**
- Task lớn cần break down: "Hoàn thiện báo cáo Q1" có 5 bước con.

**Phạm vi:**
- Chỉ **1 level** sub-task (không cho sub của sub) – giữ đơn giản
- Hiển thị `% hoàn thành` task cha = sub-task done / tổng
- Khi tất cả sub-task done → gợi ý (không tự động) đánh dấu parent done
- Sub-task share `category_id` và `priority` từ parent

### 2.3 Week View & Day View Calendar

**Tại sao cần:**
- Month view khó thấy "khe giờ trống" trong ngày để tự sắp lịch.

**Triển khai:**
- Week View: timeline dọc 06:00–23:00, 7 cột (T2–CN)
- Day View: 1 cột chi tiết + section task của hôm nay bên dưới
- View switcher trong CalendarHeader: `[Tháng | Tuần | Ngày]`
- Lưu view mode vào localStorage (mặc định lần sau giữ nguyên)
- Click vào slot trống → mở EventForm với `start_time` điền sẵn

### 2.4 Drag & Drop

**Phạm vi:**
- Kéo event giữa các ngày trong Month View
- Kéo event đổi giờ trong Week/Day View (snap 15 phút)
- Kéo task giữa các status column trong Kanban View
- Library: **`dnd-kit`** (modern, accessible, hơn `react-dnd`)
- **Optimistic update + rollback** nếu API fail
- Hiển thị "ghost" preview khi kéo

### 2.5 Kanban Board View cho Tasks

- 3 cột: TODO / IN PROGRESS / DONE
- Drag & drop giữa các cột → đổi status
- Filter giữ nguyên giữa List View và Board View
- Toggle view: `[List | Board]` trong TaskFilterBar

### 2.6 Browser Push Notification (Web Push API)

**Triển khai kỹ thuật:**
1. Setup VAPID keys (server-side)
2. Service Worker đăng ký push subscription
3. Lưu subscription endpoint vào DB (`push_subscriptions`)
4. Khi cron job firing reminder → call `web-push` library để gửi
5. User flow: lần đầu vào app → modal xin permission, nếu deny thì fallback in-app

**Cần thêm:**
- Bảng `push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at)`
- Setting "Cho phép thông báo browser" trong Settings

### 2.7 Quên mật khẩu / Reset password

- Endpoint `POST /auth/forgot-password` → tạo reset token, gửi email
- Email service: **Resend** (free 100 email/day, đơn giản) hoặc SendGrid
- Endpoint `POST /auth/reset-password` với token có expiry 1 giờ
- Bảng `password_reset_tokens (user_id, token_hash, expires_at, used_at)`

### 2.8 Custom Reminders (Nhiều mốc)

- Cho phép user thêm N reminder cho 1 event/task
- UI: list reminder + nút "+ Thêm nhắc nhở"
- Lựa chọn: 5'/15'/30'/1h/2h/1 ngày/1 tuần trước
- Quiet hours setting trong Settings (không gửi notification từ 22:00 → 07:00)

### 2.9 Dark Mode

- CSS variables cho color tokens
- Zustand store: `theme: 'light' | 'dark' | 'system'`
- System mode: dùng `prefers-color-scheme` media query
- Lưu vào DB `users.theme` (không chỉ localStorage)

### 2.10 Shortcuts trong Quick Add

- `#cong-viec` → tự gán category "Công việc"
- `!urgent`, `!high`, `!low` → set priority
- `@today`, `@tomorrow`, `@friday` → parse due_date
- Parse client-side bằng regex đơn giản (chưa cần LLM)

---

## 🟦 PHASE 3 – INTELLIGENCE (Sau Phase 2, ~3 tuần)

> **Mục tiêu:** Thêm "lớp thông minh" giúp người dùng tiết kiệm thời gian sắp xếp.

### 3.1 LLM Assistant – Triển khai từng bước

> ⚠️ **Cảnh báo:** Đừng cố làm LLM phức tạp ngay. Bắt đầu **1 use case** đầu tiên, đo xem có thực sự dùng không, rồi mới mở rộng.

**Thứ tự triển khai khuyến nghị:**

#### Step 3.1.1 – UC-AI-01: Natural Language Parsing (làm đầu tiên)
> *Input:* "Họp với team lúc 3h chiều thứ 4 tuần sau"
> *Output:* JSON structured → preview form điền sẵn → user confirm

- **Why first:** Cao nhất ROI – giải quyết pain P5 (tạo task mất thời gian)
- API endpoint: `POST /api/ai/parse`
- LLM provider: **Claude Haiku 4.5** (rẻ, đủ thông minh) hoặc GPT-4o-mini
- Rate limit: 20 request/user/ngày
- Cache: không cache (mỗi input khác nhau)

#### Step 3.1.2 – UC-AI-03: Daily Planning
> User hỏi: "Hôm nay tôi nên làm gì?"
> AI trả về list ưu tiên dựa trên: tasks overdue + tasks due today + events.

- API: `POST /api/ai/daily-plan`
- Cache 1 giờ (vì câu trả lời gần như không đổi trong 1 giờ)
- Hiển thị trên Dashboard (component `<AIQuickInsight>`)

#### Step 3.1.3 – UC-AI-02: Schedule Suggestion (sau cùng)
> Input: "Tôi cần 3 tiếng viết báo cáo, hôm nay có giờ trống không?"
> AI trả 2–3 time slot phù hợp.

- API: `POST /api/ai/suggest-slots`
- Backend tính free slots trước → gửi context tối giản lên LLM
- Phức tạp hơn UC-01 vì cần tính toán slot rảnh

#### Step 3.1.4 – UC-AI-04: Overdue Task Coach (optional)
> Khi task overdue: gợi ý Reschedule / Break down / Dismiss.

### 3.2 Analytics Dashboard

**Components cần xây:**
| Component | Data | Lib |
|-----------|------|-----|
| Overview cards | aggregate counts | – |
| Activity Heatmap (12 tuần) | tasks done by date | Recharts hoặc custom SVG |
| Line Chart 30 ngày | completion trend | Recharts |
| Pie Chart category | time distribution | Recharts |
| Streak counter | consecutive days | custom |

**API mới:**
- `GET /api/analytics/summary`
- `GET /api/analytics/heatmap`
- `GET /api/analytics/category-split`
- `GET /api/analytics/completion-trend`

**Cache strategy:** Cache 1 giờ (analytics không cần real-time).

### 3.3 Weekly Digest

- Cron Sunday 20:00: tạo digest notification cho mỗi user
- Template:
  ```
  📊 Tuần của bạn (14/04 – 20/04)
  ✅ Hoàn thành: 18/23 tasks (78%)
  📅 Sự kiện tham dự: 5
  ⚠️ Quá hạn: 2 tasks chưa xử lý
  🏆 Streak: 5 ngày liên tiếp
  ```
- Có thể gửi qua email (Phase 4) hoặc chỉ in-app

### 3.4 Daily Digest (Buổi sáng)

- Cron 8:00 sáng mỗi ngày
- Tóm tắt: "Hôm nay bạn có X sự kiện, Y task. Ưu tiên hàng đầu: ..."
- Có thể tích hợp output của AI Daily Plan

### 3.5 Recurring Events Mở Rộng

- Bổ sung MONTHLY (by date + by weekday)
- Bổ sung YEARLY
- "Birthday" event type với recurrence YEARLY tự động

---

## 🟦 PHASE 4 – POLISH & SCALE (~2–3 tuần)

### 4.1 Mobile Responsive

- Sidebar → bottom navigation bar trên < 768px
- Calendar Month View: 1 ngày 1 dòng thay vì grid (mobile-first table)
- Touch gesture: swipe left/right để chuyển tháng
- Test trên iPhone Safari + Android Chrome thật

### 4.2 Performance Optimization

- `React.memo` cho `EventChip`, `TaskCard`, `DayCell`
- `useMemo` cho calendar grid generation
- `React.lazy` + `Suspense` cho page-level code splitting
- Virtual list cho task list > 200 items (`react-window`)
- DB index review (event time range queries)
- Backend response compression (`compression` middleware)

### 4.3 Global Search

- Cmd/Ctrl + K → mở search modal
- Search across events + tasks (title + description)
- API: `GET /api/search?q=...`
- Backend: dùng MySQL FULLTEXT INDEX trên `title` và `description`

### 4.4 Internationalization (i18n)

- Library: `react-i18next`
- 2 ngôn ngữ: `vi` (default) và `en`
- Backend: thêm `Accept-Language` header handling cho error messages

### 4.5 Accessibility (A11y)

- Keyboard navigation đầy đủ (Tab, Enter, Escape)
- ARIA labels cho icon-only buttons
- Focus management trong modal/panel
- Đảm bảo contrast ratio AA (đặc biệt dark mode)

### 4.6 Error Monitoring & Logging

- **Sentry** cho frontend + backend error tracking
- Structured logging backend: `pino` + log levels
- Health check endpoint: `GET /api/health`
- Uptime monitoring: UptimeRobot (free)

### 4.7 Settings hoàn chỉnh

- Work hours (giờ làm việc) – ảnh hưởng calendar highlight
- Default reminder time
- Email notification preferences
- Xuất dữ liệu (export to JSON / iCal)
- Xóa tài khoản (yêu cầu xác nhận 2 bước + đợi 7 ngày)

---

## 🟦 PHASE 5+ – MỞ RỘNG SÂU

### 🔮 EXT-01: Tag System

**Khi nào cần:** Category đã không đủ để phân loại đa chiều.

**DB schema thêm:**
```sql
tags (id, user_id, name, color)
task_tags (task_id, tag_id)
event_tags (event_id, tag_id)
```

**UI:** Tag chips trên task/event card, filter by tag.

---

### 🔮 EXT-02: Google Calendar Sync (2 chiều)

**Khi nào cần:** User muốn lịch tổng hợp với calendar công ty.

**Triển khai:**
- Google OAuth 2.0
- Calendar API – read events from Google
- Push events từ app sang Google (CREATE/UPDATE/DELETE)
- DB thêm cột: `events.external_id`, `events.external_source` ('google'|'native')
- Job đồng bộ delta mỗi 10 phút bằng push notification của Google

**Cẩn thận:**
- Quota: Google Calendar API 1M request/day free
- Conflict resolution: "last write wins" hay "user chọn"?

---

### 🔮 EXT-03: Habit Tracking

**Khi nào cần:** User muốn track thói quen hàng ngày (uống nước, gym).

**DB:**
```sql
habits (id, user_id, name, icon, target_per_week)
habit_logs (id, habit_id, logged_date)
```

**UI:** Habit grid (GitHub-style) trên Dashboard.

---

### 🔮 EXT-04: Goal Setting & OKR

**Khi nào cần:** User muốn liên kết task hàng ngày với mục tiêu lớn.

**DB:**
```sql
goals (id, user_id, title, target_date, progress_percent)
-- tasks.goal_id (FK)
```

**UI:** Goal page với progress tự động tính từ % task hoàn thành.

---

### 🔮 EXT-05: Time Blocking & Pomodoro

- Cho phép "block" 1 đoạn giờ làm 1 việc cụ thể
- Pomodoro timer 25'/5' tích hợp
- Lưu time tracking để biết task thật sự mất bao lâu

---

### 🔮 EXT-06: Shared Calendar

**Khi nào cần:** User muốn share calendar với gia đình/đồng nghiệp.

**DB:**
```sql
calendar_shares (id, owner_id, shared_with_id, permission ENUM('view','edit'))
events.visibility ENUM('private','shared','public')
```

**Privacy:** Default privacy = private; chỉ event đánh dấu `shared` mới thấy được.

---

### 🔮 EXT-07: Mobile App (React Native)

- Reuse API RESTful đã có
- React Native + Expo
- Push notification qua FCM (Android) + APNs (iOS)
- Offline-first với local SQLite + sync khi online

---

### 🔮 EXT-08: LLM Assistant Nâng Cao

- **Proactive suggestion:** AI chủ động đề xuất khi thấy lịch trống/conflict
- **Voice input:** Speech-to-text → parse → tạo task (Web Speech API trước, sau đó Whisper API)
- **Pattern recognition:** Học thói quen user (thường gym lúc 19:00) → gợi ý slot phù hợp
- **Multi-turn conversation:** Chat dài, không chỉ single-shot

**Cảnh báo privacy:** Cần document rõ data nào gửi LLM, có lưu không.

---

### 🔮 EXT-09: Integrations

- **Zapier / Make webhook:** trigger khi event/task được tạo
- **Slack notification:** push reminder qua Slack DM
- **Export iCal (.ics):** subscribe URL để import vào Apple Calendar
- **Export CSV / JSON:** backup dữ liệu
- **API public (v1):** cho developer tự xây integration

---

### 🔮 EXT-10: Team Workspace (Big Pivot)

> ⚠️ Đây là **pivot sang sản phẩm khác**, không chỉ là feature.

**Khi nào cân nhắc:** Có nhiều user yêu cầu collaborative workspace.

**Cần thêm:**
- Organization/Workspace model
- Role-based access control (admin/member/viewer)
- Shared events, assigned tasks
- Activity log

---

## 📊 MATRIX ƯU TIÊN PHASE 2 (RICE Framework)

> **RICE** = Reach × Impact × Confidence / Effort. Số càng cao càng nên làm trước.

| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|------------|--------|-----------|
| Recurring events | 95% | 3 | 90% | 5 ngày | **51** |
| Sub-tasks | 60% | 2 | 80% | 2 ngày | **48** |
| Drag & drop | 70% | 2 | 70% | 4 ngày | **24** |
| Week/Day view | 80% | 2 | 90% | 3 ngày | **48** |
| Web Push | 50% | 3 | 70% | 4 ngày | **26** |
| Quên mật khẩu | 30% | 3 | 95% | 1 ngày | **86** |
| Kanban board | 40% | 1 | 90% | 2 ngày | **18** |
| Dark mode | 60% | 1 | 95% | 1 ngày | **57** |

> Thứ tự đề xuất Phase 2:
> 1. **Quên mật khẩu** (effort thấp, value cao)
> 2. **Dark mode** (effort thấp, value vừa)
> 3. **Recurring events** (core value, làm sớm)
> 4. **Week/Day view + Sub-tasks** (cùng tuần)
> 5. **Drag & drop + Web Push** (cuối phase)
> 6. **Kanban** (cuối cùng, nếu còn thời gian)

---

## 🛑 NHỮNG GÌ KHÔNG NÊN LÀM

Để tránh feature bloat, **đừng** triển khai những thứ sau dù người dùng có yêu cầu:

| Yêu cầu thường gặp | Tại sao không nên |
|---------------------|-------------------|
| Chat real-time giữa user | Không phải mục tiêu sản phẩm (lịch cá nhân) |
| File attachment upload | Lưu trữ tốn $, cloud storage là 1 sản phẩm riêng |
| Video conferencing tích hợp | Quá nhiều competitor (Zoom, Meet) |
| Theme tự custom màu | Maintenance nightmare, dark/light đủ |
| Project management nâng cao (Gantt, dependencies) | Đã có ClickUp, Asana – đừng cạnh tranh |
| AI có thể "tự thực hiện" mà không xác nhận | Risk cao, người dùng mất kiểm soát |
| Markdown editor giàu tính năng | Plain text + simple markdown là đủ |

---

## 🎯 CHECKPOINT REVIEW MỖI PHASE

Trước khi sang phase tiếp theo, **bắt buộc** trả lời:

1. ✅ Phase hiện tại có ai dùng thật không? Bao nhiêu user active?
2. ✅ Bug critical nào còn tồn đọng?
3. ✅ Performance có vấn đề gì không? (page load, API response time)
4. ✅ Có cần refactor gì trước khi thêm feature mới?
5. ✅ Cost (LLM, server) có vấn đề không?

> *Một roadmap chỉ là giả thuyết. Sẵn sàng điều chỉnh khi có dữ liệu thật.*

---

*Document này là living document. Cập nhật mỗi cuối phase dựa trên feedback và metric thực tế.*
