# 🛠️ TECHNICAL SPECIFICATION – Frontend & Backend MVP

> **Mục đích:** Phân tích chi tiết cấu trúc kỹ thuật để xây dựng MVP. Tài liệu này là **kim chỉ nam thực thi**, đọc xong là có thể bắt tay vào code.
>
> **Phạm vi:** Chỉ tập trung vào MVP (xem file `01_MVP_CORE_FEATURES.md`).
>
> **Stack:** Vite + React 18 + TanStack Query + Zustand + ExpressJS + MySQL 8 + Knex

---

## MỤC LỤC

1. [Tech Stack chi tiết & Lý do chọn](#1-tech-stack-chi-tiết--lý-do-chọn)
2. [Cấu trúc thư mục dự án](#2-cấu-trúc-thư-mục-dự-án)
3. [Database Schema MVP](#3-database-schema-mvp)
4. [Backend Architecture](#4-backend-architecture)
5. [API Specification chi tiết](#5-api-specification-chi-tiết)
6. [Frontend Architecture](#6-frontend-architecture)
7. [State Management Pattern](#7-state-management-pattern)
8. [Component Hierarchy](#8-component-hierarchy)
9. [Authentication Flow](#9-authentication-flow)
10. [Reminder Engine triển khai](#10-reminder-engine-triển-khai)
11. [Timezone & Datetime Handling](#11-timezone--datetime-handling)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Testing & Quality](#13-testing--quality)
14. [Deployment Plan](#14-deployment-plan)
15. [Quy trình làm việc tuần-tuần](#15-quy-trình-làm-việc-tuần-tuần)

---

## 1. TECH STACK CHI TIẾT & LÝ DO CHỌN

### 1.1 Frontend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Build tool | **Vite 5** | Nhanh hơn CRA gấp nhiều lần, HMR tức thì |
| Framework | **React 18** | Yêu cầu của dự án |
| Routing | **React Router v6** | Standard, file-based routing không cần thiết ở MVP |
| Server state | **TanStack Query v5** (React Query) | Caching tự động, loading/error/refetch built-in |
| Global UI state | **Zustand 4** | Đơn giản hơn Redux, không cần Provider |
| Forms | **React Hook Form** + **Zod** | Performance + validation type-safe |
| HTTP client | **Axios** | Interceptor cho JWT refresh dễ |
| UI components | **Shadcn/ui** + **Tailwind CSS** | Copy-paste components, tùy biến cao, không vendor lock |
| Date library | **dayjs** + **dayjs/plugin/timezone** + **utc** | Nhẹ (2KB), API quen thuộc |
| Icons | **lucide-react** | Đẹp, nhẹ, đồng bộ với Shadcn |
| Toast | **sonner** (đi kèm Shadcn) | Đẹp, đơn giản |
| Calendar grid | **Tự code** + dayjs | Tránh phụ thuộc lib lớn như FullCalendar |

### 1.2 Backend

| Layer | Lựa chọn | Lý do |
|-------|----------|-------|
| Runtime | **Node.js 20 LTS** | LTS đến 2026 |
| Framework | **Express 4** | Yêu cầu dự án, ecosystem lớn |
| Database | **MySQL 8** | Yêu cầu dự án |
| Query builder | **Knex.js** | Migration + query builder, không nặng như Prisma |
| Validation | **Zod** | Share schema với frontend |
| Auth | **jsonwebtoken** + **bcrypt** | Standard |
| Logger | **pino** + **pino-pretty** (dev) | Nhanh nhất Node, JSON log |
| Cron | **node-cron** | Đủ cho reminder engine |
| Rate limit | **express-rate-limit** | Bảo vệ endpoint auth + AI |
| Env config | **dotenv** + validate bằng Zod khi start | Fail fast nếu thiếu env |
| CORS | **cors** middleware | Cấu hình whitelist domain |

### 1.3 Dev tooling

- **ESLint** (recommended) + **Prettier** (cả 2 dự án)
- **Husky** + **lint-staged** (pre-commit hook)
- **Postman** hoặc **Bruno** (test API thủ công)
- **MySQL Workbench** hoặc **TablePlus** (view DB)

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN

### 2.1 Monorepo Structure

```
personal-calendar/
├── backend/
│   ├── src/
│   │   ├── config/           # DB connection, env loader
│   │   ├── db/
│   │   │   ├── migrations/   # Knex migrations
│   │   │   └── seeds/        # Seed default categories
│   │   ├── middlewares/      # auth, errorHandler, validate
│   │   ├── modules/          # Domain-driven structure
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.schema.js   # Zod schemas
│   │   │   ├── users/
│   │   │   ├── events/
│   │   │   ├── tasks/
│   │   │   ├── categories/
│   │   │   ├── reminders/
│   │   │   └── notifications/
│   │   ├── jobs/             # Cron jobs (reminder engine)
│   │   ├── utils/            # logger, jwt, dateHelper
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Entry point
│   ├── .env.example
│   ├── knexfile.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client + endpoints
│   │   │   ├── client.js
│   │   │   ├── events.api.js
│   │   │   ├── tasks.api.js
│   │   │   └── auth.api.js
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn primitives (button, input, dialog...)
│   │   │   ├── layout/       # Sidebar, TopBar, AppLayout
│   │   │   ├── calendar/     # MonthGrid, DayCell, EventChip, EventForm
│   │   │   ├── tasks/        # TaskCard, TaskList, TaskForm, QuickAdd
│   │   │   ├── dashboard/    # GreetingHeader, TodayEvents, TodayTasks
│   │   │   └── shared/       # ErrorBoundary, EmptyState, Skeleton
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useEvents.js
│   │   │   ├── useTasks.js
│   │   │   ├── useAuth.js
│   │   │   └── useCalendarNavigation.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── routes/
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AppRouter.jsx
│   │   ├── stores/           # Zustand stores
│   │   │   ├── authStore.js
│   │   │   └── uiStore.js
│   │   ├── lib/              # utils, dateFormat, queryClient
│   │   ├── schemas/          # Zod schemas (share với backend nếu muốn)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

### 2.2 Naming convention

- **File component:** `PascalCase.jsx` (VD: `EventForm.jsx`)
- **Hook file:** `camelCase.js` bắt đầu với `use` (VD: `useEvents.js`)
- **Backend module file:** `kebab-case.{controller|service|routes}.js`
- **DB table:** `snake_case` số nhiều (VD: `refresh_tokens`)
- **API endpoint:** `kebab-case` (VD: `/api/auth/forgot-password`)

---

## 3. DATABASE SCHEMA MVP

> Chỉ giữ các bảng cần thiết cho MVP. Bảng `recurrence_rules`, `event_exceptions`, `ai_usage_logs` hoãn đến Phase 2/3.

### 3.1 ERD đơn giản

```
users (1) ─── (N) categories
  │
  ├── (N) events
  ├── (N) tasks
  ├── (N) reminders
  ├── (N) notifications
  └── (N) refresh_tokens

tasks ─── (self FK) parent_task_id  (Phase 2 mới dùng)
events.category_id ── categories.id (nullable)
tasks.category_id  ── categories.id (nullable)
```

### 3.2 SQL Schema chi tiết (MVP only)

```sql
-- ─── USERS ─────────────────────────────────────
CREATE TABLE users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100) NOT NULL,
  timezone      VARCHAR(50)  NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP    NULL,
  INDEX idx_email (email)
);

-- ─── REFRESH TOKENS ─────────────────────────────
CREATE TABLE refresh_tokens (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, revoked_at)
);

-- ─── CATEGORIES ─────────────────────────────────
CREATE TABLE categories (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  name       VARCHAR(50)  NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#4A90D9',  -- hex
  icon       VARCHAR(10)  NOT NULL DEFAULT '📁',
  is_default BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- ─── EVENTS ─────────────────────────────────────
CREATE TABLE events (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  user_id      INT NOT NULL,
  category_id  INT NULL,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NULL,
  location     VARCHAR(500) NULL,
  start_time   DATETIME NOT NULL,   -- LƯU UTC
  end_time     DATETIME NOT NULL,   -- LƯU UTC, phải >= start_time
  is_all_day   BOOLEAN  NOT NULL DEFAULT FALSE,
  status       ENUM('upcoming','done','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at   TIMESTAMP NULL,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_start  (user_id, start_time),
  INDEX idx_user_status (user_id, status)
);

-- ─── TASKS ──────────────────────────────────────
CREATE TABLE tasks (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  category_id   INT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NULL,
  due_date      DATE NULL,
  due_time      TIME NULL,
  priority      ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status        ENUM('todo','in_progress','done')    NOT NULL DEFAULT 'todo',
  completed_at  TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP NULL,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_due      (user_id, due_date),
  INDEX idx_user_status   (user_id, status),
  INDEX idx_user_priority (user_id, priority)
);

-- ─── REMINDERS ──────────────────────────────────
CREATE TABLE reminders (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  ref_type   ENUM('event','task') NOT NULL,
  ref_id     INT NOT NULL,
  remind_at  DATETIME NOT NULL,            -- UTC
  is_sent    BOOLEAN  NOT NULL DEFAULT FALSE,
  sent_at    TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_pending (remind_at, is_sent),
  INDEX idx_ref     (ref_type, ref_id)
);

-- ─── NOTIFICATIONS ──────────────────────────────
CREATE TABLE notifications (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  type       ENUM('reminder','overdue') NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT NULL,
  ref_type   ENUM('event','task') NULL,
  ref_id     INT NULL,
  is_read    BOOLEAN  NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read, created_at)
);
```

### 3.3 Migration plan (thứ tự chạy Knex)

```
20250501_001_create_users.js
20250501_002_create_refresh_tokens.js
20250501_003_create_categories.js
20250501_004_create_events.js
20250501_005_create_tasks.js
20250501_006_create_reminders.js
20250501_007_create_notifications.js
```

### 3.4 Seed default categories (mỗi user mới)

Trigger: ngay sau khi user đăng ký thành công, transaction insert 5 records:

```javascript
const DEFAULT_CATEGORIES = [
  { name: 'Công việc',  color: '#4A90D9', icon: '💼', is_default: true },
  { name: 'Học tập',    color: '#7B68EE', icon: '🎓', is_default: true },
  { name: 'Sức khoẻ',   color: '#2ECC71', icon: '🏃', is_default: true },
  { name: 'Cá nhân',    color: '#F39C12', icon: '👤', is_default: true },
  { name: 'Tài chính',  color: '#E74C3C', icon: '💰', is_default: true },
];
```

---

## 4. BACKEND ARCHITECTURE

### 4.1 Layered Architecture (mỗi module có 3 layer)

```
┌──────────────────────────────────────┐
│  ROUTES   (auth.routes.js)          │  ← Định nghĩa endpoint, middleware
│    ↓                                 │
│  CONTROLLER (auth.controller.js)    │  ← Parse req, gọi service, format response
│    ↓                                 │
│  SERVICE   (auth.service.js)        │  ← Business logic, gọi DB
│    ↓                                 │
│  DB (Knex queries inline trong svc) │  ← Truy vấn DB qua Knex
└──────────────────────────────────────┘
```

> Không tách thêm "repository layer" vì MVP không cần. Service trực tiếp dùng Knex.

### 4.2 Ví dụ structure module Events

**`events.routes.js`**
```javascript
const router = require('express').Router();
const ctrl = require('./events.controller');
const auth = require('../../middlewares/authenticate');
const validate = require('../../middlewares/validate');
const { createEventSchema, updateEventSchema, listEventsQuerySchema } = require('./events.schema');

router.use(auth);  // Tất cả routes cần authentication
router.get('/',         validate(listEventsQuerySchema, 'query'), ctrl.list);
router.post('/',        validate(createEventSchema, 'body'),       ctrl.create);
router.get('/:id',                                                  ctrl.detail);
router.put('/:id',      validate(updateEventSchema, 'body'),        ctrl.update);
router.delete('/:id',                                               ctrl.softDelete);
router.patch('/:id/status', validate(statusSchema, 'body'),         ctrl.changeStatus);

module.exports = router;
```

**`events.controller.js`** – chỉ làm 3 việc: lấy data từ req, gọi service, trả response
```javascript
exports.create = async (req, res, next) => {
  try {
    const event = await eventService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
};
```

**`events.service.js`** – nơi chứa business logic
```javascript
exports.create = async (userId, payload) => {
  // 1. Validate: end >= start
  if (new Date(payload.end_time) < new Date(payload.start_time)) {
    throw new AppError('VALIDATION_ERROR', 'Giờ kết thúc phải >= giờ bắt đầu', 400);
  }
  // 2. Insert event
  const [id] = await db('events').insert({ user_id: userId, ...payload });
  // 3. Tạo default reminder (15 phút trước)
  await reminderService.createDefaultForEvent(id, userId, payload.start_time);
  // 4. Trả về event vừa tạo
  return db('events').where({ id }).first();
};
```

### 4.3 Middleware quan trọng

```javascript
// authenticate.js – verify JWT
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new AppError('UNAUTHORIZED', 'Missing token', 401));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 'Invalid or expired token', 401));
  }
};

// validate.js – validate request bằng Zod
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new AppError('VALIDATION_ERROR', result.error.issues, 400));
  }
  req[source] = result.data;
  next();
};

// errorHandler.js – centralized error response (đặt cuối cùng)
module.exports = (err, req, res, next) => {
  logger.error({ err, path: req.path }, 'Request failed');
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message, details: err.details }
  });
};
```

### 4.4 Custom Error Class

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(code, message, status = 400, details = null) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
module.exports = AppError;
```

Error codes chuẩn:
| Code | HTTP | Trường hợp |
|------|------|-----------|
| `VALIDATION_ERROR` | 400 | Zod validation fail |
| `UNAUTHORIZED` | 401 | Token sai/thiếu/expired |
| `FORBIDDEN` | 403 | Không phải owner của resource |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `CONFLICT` | 409 | Email đã tồn tại, category đang dùng |
| `RATE_LIMITED` | 429 | Vượt rate limit |
| `INTERNAL_ERROR` | 500 | Lỗi không lường trước |

---

## 5. API SPECIFICATION CHI TIẾT

> **Convention:**
> - Base URL: `/api`
> - Datetime trả về: ISO 8601 UTC (`2025-04-16T08:00:00.000Z`)
> - Response thành công: `{ success: true, data }` – Lỗi: `{ success: false, error: {code, message, details} }`
> - Soft delete: KHÔNG trả về record có `deleted_at != null`

### 5.1 Auth Endpoints

#### `POST /api/auth/register`
**Body:**
```json
{ "email": "user@example.com", "password": "MinhA1234", "display_name": "Minh" }
```
**Validation (Zod):**
- email: valid email
- password: min 8, có ít nhất 1 chữ + 1 số
- display_name: 1–100 ký tự

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "...", "display_name": "Minh", "timezone": "Asia/Ho_Chi_Minh" },
    "access_token": "eyJ...",
    "refresh_token": "abc123..."
  }
}
```

**Logic backend:**
1. Validate input
2. Kiểm tra email đã tồn tại → `CONFLICT`
3. Hash password (`bcrypt.hash(pw, 10)`)
4. Transaction:
   - Insert user
   - Insert 5 default categories cho user
5. Generate JWT (15 phút) + refresh token (random 64 ký tự, hash bằng bcrypt, lưu DB với expiry 30 ngày)
6. Trả về

#### `POST /api/auth/login`
**Body:** `{ email, password }`
**Response 200:** giống register

**Logic:**
1. Lookup user theo email (chưa deleted)
2. `bcrypt.compare(password, user.password_hash)`
3. Nếu sai → `UNAUTHORIZED` (KHÔNG nói rõ "email sai" hay "mật khẩu sai")
4. Generate tokens

#### `POST /api/auth/refresh`
**Body:** `{ refresh_token }`
**Response 200:** `{ access_token, refresh_token }` (rotate cả 2)

**Logic:**
1. Hash refresh_token đầu vào, tìm trong DB (chưa revoke, chưa expire)
2. Nếu không tìm thấy → `UNAUTHORIZED`
3. Revoke token cũ (set `revoked_at`)
4. Generate token mới (cả access + refresh)
5. Insert refresh token mới

#### `POST /api/auth/logout`
**Body:** `{ refresh_token }` (optional, dùng để revoke)
**Response 200:** `{ success: true }`

#### `GET /api/auth/me`
**Header:** `Authorization: Bearer <token>`
**Response 200:** `{ user: {...} }`

### 5.2 Categories Endpoints

| Method | Path | Mô tả |
|--------|------|------|
| GET | `/api/categories` | Lấy tất cả categories của user (kể cả default) |
| POST | `/api/categories` | Tạo category mới (custom) |
| PUT | `/api/categories/:id` | Sửa tên/màu/icon |
| DELETE | `/api/categories/:id` | Xóa (chỉ custom; default chặn). Nếu còn event/task dùng → `CONFLICT` |

**POST body:** `{ name, color, icon }`

### 5.3 Events Endpoints

#### `GET /api/events?start=...&end=...&category_id=...&status=...`
**Query params:**
- `start` (bắt buộc): ISO datetime UTC
- `end` (bắt buộc): ISO datetime UTC
- `category_id` (optional): single id hoặc comma-separated
- `status` (optional): `upcoming|done|cancelled`

**Logic:**
```sql
SELECT * FROM events
WHERE user_id = ?
  AND deleted_at IS NULL
  AND start_time < :end
  AND end_time   > :start
  AND (:category IS NULL OR category_id IN (...))
  AND (:status IS NULL OR status = :status)
ORDER BY start_time ASC
```

#### `POST /api/events`
**Body:**
```json
{
  "title": "Họp team",
  "description": "Họp tuần",
  "location": "Phòng họp A",
  "start_time": "2025-04-16T08:00:00.000Z",
  "end_time":   "2025-04-16T09:00:00.000Z",
  "is_all_day": false,
  "category_id": 1
}
```

**Validation:**
- title: 1–200 ký tự
- end_time >= start_time
- category_id: nếu có, phải thuộc user

**Side effect:** Tự tạo reminder 15 phút trước `start_time` (record vào `reminders`).

#### Các endpoint còn lại

| Endpoint | Logic note |
|----------|-----------|
| `GET /api/events/:id` | Check ownership (user_id = req.user.id) |
| `PUT /api/events/:id` | Nếu start_time đổi → delete old reminders, tạo new |
| `DELETE /api/events/:id` | Soft delete (`deleted_at = NOW()`) + delete pending reminders |
| `PATCH /api/events/:id/status` | Body: `{ status: 'done'\|'cancelled'\|'upcoming' }` |

### 5.4 Tasks Endpoints

#### `GET /api/tasks?filter=...&priority=...&status=...&sort=...`
**Query params:**
- `filter`: `today|tomorrow|this_week|overdue|no_date|all` (default: all)
- `priority`: comma-separated `urgent,high,medium,low`
- `status`: comma-separated `todo,in_progress,done`
- `category_id`: number
- `sort`: `priority|due_date|created_at` (default: priority)
- `order`: `asc|desc` (default: desc cho priority, asc cho due_date)

**Filter logic (server-side):**
```javascript
const todayStart = dayjs().tz(userTz).startOf('day').utc();
const todayEnd   = dayjs().tz(userTz).endOf('day').utc();

switch (filter) {
  case 'today':     return q.whereBetween('due_date', [todayStart, todayEnd]);
  case 'overdue':   return q.where('due_date', '<', todayStart).whereNot('status','done');
  case 'no_date':   return q.whereNull('due_date');
  // ...
}
```

#### `POST /api/tasks`
**Body:**
```json
{
  "title": "Nộp báo cáo",
  "description": "Báo cáo Q2",
  "due_date": "2025-04-18",
  "due_time": "17:00:00",
  "priority": "urgent",
  "category_id": 1
}
```

**Quick Add tối giản:** chỉ cần `{ title }` – các trường khác mặc định.

**Side effect:** Nếu `priority IN (urgent,high)` và có `due_date` → tạo reminder.

#### Các endpoint khác

| Endpoint | Logic |
|----------|-------|
| `GET /api/tasks/:id` | Bao gồm `description` đầy đủ |
| `PUT /api/tasks/:id` | Update fields, nếu `due_date` thay đổi → recreate reminders |
| `DELETE /api/tasks/:id` | Soft delete + delete pending reminders |
| `PATCH /api/tasks/:id/complete` | Set `status='done'`, `completed_at=NOW()` (idempotent) |

### 5.5 Dashboard Endpoint (Aggregated)

#### `GET /api/dashboard/today`
**Response:**
```json
{
  "success": true,
  "data": {
    "today_events": [/* event objects, max 10 */],
    "today_tasks": [/* task objects: today + overdue, max 10 */],
    "week_progress": {
      "completed": 18, "total": 23, "percentage": 78
    }
  }
}
```

> Đây là **endpoint aggregated** – frontend chỉ cần gọi 1 lần thay vì 3 lần riêng.

### 5.6 Notifications Endpoints

| Method | Path | Mô tả |
|--------|------|------|
| GET | `/api/notifications?unread_only=true&limit=20` | List notifications |
| PATCH | `/api/notifications/:id/read` | Đánh dấu đã đọc |
| PATCH | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |
| GET | `/api/notifications/unread-count` | Số chưa đọc (cho badge) |

### 5.7 Settings Endpoint

| Method | Path | Mô tả |
|--------|------|------|
| PUT | `/api/users/profile` | Update `display_name`, `timezone` |
| POST | `/api/users/change-password` | Body: `{ current_password, new_password }` |

### 5.8 Bảng tổng hợp 25 endpoint MVP

| # | Method | Path |
|---|--------|------|
| 1 | POST | /api/auth/register |
| 2 | POST | /api/auth/login |
| 3 | POST | /api/auth/refresh |
| 4 | POST | /api/auth/logout |
| 5 | GET  | /api/auth/me |
| 6 | PUT  | /api/users/profile |
| 7 | POST | /api/users/change-password |
| 8 | GET  | /api/categories |
| 9 | POST | /api/categories |
| 10 | PUT  | /api/categories/:id |
| 11 | DELETE | /api/categories/:id |
| 12 | GET  | /api/events |
| 13 | POST | /api/events |
| 14 | GET  | /api/events/:id |
| 15 | PUT  | /api/events/:id |
| 16 | DELETE | /api/events/:id |
| 17 | PATCH | /api/events/:id/status |
| 18 | GET  | /api/tasks |
| 19 | POST | /api/tasks |
| 20 | GET  | /api/tasks/:id |
| 21 | PUT  | /api/tasks/:id |
| 22 | DELETE | /api/tasks/:id |
| 23 | PATCH | /api/tasks/:id/complete |
| 24 | GET  | /api/dashboard/today |
| 25 | GET  | /api/notifications |
| (+) | PATCH | /api/notifications/:id/read, /read-all, GET /unread-count |

---

## 6. FRONTEND ARCHITECTURE

### 6.1 Routing

```jsx
// AppRouter.jsx
<BrowserRouter>
  <Routes>
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/calendar"  element={<CalendarPage />} />
      <Route path="/tasks"     element={<TasksPage />} />
      <Route path="/settings"  element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
</BrowserRouter>
```

### 6.2 Axios Client + Interceptor

```javascript
// api/client.js
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

// Inject token vào mọi request
api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Tự refresh khi 401
let refreshPromise = null;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshToken();
      try {
        await refreshPromise;
        refreshPromise = null;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
```

### 6.3 Tailwind Setup

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',   // Chuẩn bị cho Phase 2 (chưa enable ở MVP)
  theme: {
    extend: {
      colors: {
        priority: {
          urgent: '#E74C3C',
          high:   '#F39C12',
          medium: '#F1C40F',
          low:    '#2ECC71'
        }
      }
    }
  }
};
```

---

## 7. STATE MANAGEMENT PATTERN

### 7.1 Phân tầng state (như BRD đề xuất)

```
┌──────────────────────────────────────────────────┐
│ SERVER STATE  (React Query)                      │
│  - useEvents(dateRange)                          │
│  - useTasks(filters)                             │
│  - useCategories()                               │
│  - useDashboard()                                │
│  - useNotifications() + polling 30s              │
├──────────────────────────────────────────────────┤
│ GLOBAL UI STATE  (Zustand)                       │
│  authStore: { user, accessToken, refreshToken }  │
│  uiStore:   { sidebarOpen, activeModal }         │
├──────────────────────────────────────────────────┤
│ LOCAL STATE  (useState / useReducer)             │
│  Calendar: currentDate, viewMode                 │
│  Tasks:    filter, sort                          │
│  Forms:    React Hook Form                       │
└──────────────────────────────────────────────────┘
```

### 7.2 React Query Setup

```javascript
// lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,         // 30s
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: { retry: 0 }
  }
});
```

### 7.3 Query key convention

```javascript
['events', { start, end, categoryId }]
['tasks', { filter, sort }]
['task', taskId]
['categories']
['dashboard', 'today']
['notifications', { unread: true }]
```

### 7.4 Zustand auth store

```javascript
// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    setAuth: ({ user, access_token, refresh_token }) =>
      set({ user, accessToken: access_token, refreshToken: refresh_token, isAuthenticated: true }),
    logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
  }),
  { name: 'auth-storage' }
));
```

> ⚠️ **Lưu ý bảo mật:** Lưu refresh token trong localStorage rủi ro XSS. Trong MVP chấp nhận tradeoff để đơn giản. Phase 2 cân nhắc httpOnly cookie.

### 7.5 Custom hooks chính

```javascript
// hooks/useEvents.js
export function useEvents(dateRange) {
  return useQuery({
    queryKey: ['events', dateRange],
    queryFn: () => eventsApi.list(dateRange),
    enabled: !!dateRange.start && !!dateRange.end,
  });
}

// hooks/useTasks.js
export function useTasks(filters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.list(filters),
  });
}

// hooks/useCompleteTask.js – optimistic update
export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => tasksApi.complete(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries(['tasks']);
      const snapshots = queryClient.getQueriesData(['tasks']);
      queryClient.setQueriesData(['tasks'], (old) =>
        old?.map(t => t.id === taskId ? { ...t, status: 'done', completed_at: new Date().toISOString() } : t)
      );
      return { snapshots };
    },
    onError: (err, taskId, ctx) => {
      ctx?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error('Không thể cập nhật task');
    },
    onSettled: () => queryClient.invalidateQueries(['tasks']),
  });
}
```

---

## 8. COMPONENT HIERARCHY

### 8.1 AppLayout

```
<AppLayout>
  <Sidebar />                  ← Navigation + Categories list
  <main>
    <TopBar />                  ← Search + Notification bell + Avatar
    <Outlet />                  ← Page content (React Router)
  </main>
  <Toaster />                   ← sonner toast container
</AppLayout>
```

### 8.2 DashboardPage tree

```
<DashboardPage>
  <GreetingHeader />
  <div grid-cols-2>
    <TodayEventsCard>
      <EventListItem />*
    </TodayEventsCard>
    <TodayTasksCard>
      <QuickAddInput />
      <TaskListItem />*
    </TodayTasksCard>
  </div>
  <WeekProgressCard />
</DashboardPage>
```

### 8.3 CalendarPage tree

```
<CalendarPage>
  <CalendarHeader>
    <ViewSwitcher /> [Month only ở MVP]
    <NavigationControls />   ← Prev/Today/Next
    <AddEventButton />
  </CalendarHeader>

  <MonthGrid>
    <DayCell>
      <EventChip />*
    </DayCell>
  </MonthGrid>

  <EventFormModal />          ← Đóng/mở qua uiStore
  <EventDetailPanel />        ← Side panel khi click event
</CalendarPage>
```

### 8.4 TasksPage tree

```
<TasksPage>
  <TaskFilterBar>
    <FilterChips />       ← Today / Tomorrow / Overdue / All
    <SortDropdown />
    <AddTaskButton />
  </TaskFilterBar>

  <TaskGroup title="Quá hạn">
    <TaskCard />*
  </TaskGroup>
  <TaskGroup title="Hôm nay">
    <TaskCard />*
  </TaskGroup>
  <TaskGroup title="Sắp tới">
    <TaskCard />*
  </TaskGroup>

  <QuickAddInput />         ← Sticky bottom
  <TaskFormModal />
  <TaskDetailPanel />
</TasksPage>
```

### 8.5 Reusable components

| Component | Vai trò |
|-----------|---------|
| `<Skeleton />` | Loading placeholder, dùng cho mọi data card |
| `<EmptyState illustration text action />` | Khi list rỗng |
| `<ErrorState onRetry />` | Khi API fail |
| `<ConfirmDialog />` | Xác nhận delete |
| `<DateTimePicker />` | Wrap dayjs + Shadcn calendar |
| `<CategoryBadge />` | Hiển thị category với màu + icon |
| `<PriorityIndicator />` | 🔴🟠🟡🟢 |

### 8.6 Pattern: 4-state UI cho mỗi data component

```jsx
function TodayTasks() {
  const { data, isLoading, isError, refetch } = useTasks({ filter: 'today' });

  if (isLoading) return <TaskListSkeleton />;
  if (isError)   return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState text="Chưa có task hôm nay" action="Thêm task" />;
  return data.map(t => <TaskCard key={t.id} task={t} />);
}
```

---

## 9. AUTHENTICATION FLOW

### 9.1 Sequence diagram đăng nhập

```
Browser              Frontend          Backend          DB
   |                     |                |              |
   |--- POST /login ---->|                |              |
   |   {email, pw}       |                |              |
   |                     |--- POST /api/auth/login --->  |
   |                     |    {email, pw}                |
   |                     |                |-- SELECT --->|
   |                     |                |<- user row --|
   |                     |                |-- bcrypt.compare()
   |                     |                |-- Sign JWT (15m)
   |                     |                |-- Insert refresh_token --->|
   |                     |<-- 200 OK -----|              |
   |                     |    {user, tokens}             |
   |                     |-- store tokens in localStorage|
   |                     |-- redirect /dashboard         |
   |<-- redirect --------|                               |
```

### 9.2 Silent refresh flow

```
Request bất kỳ → 401 Unauthorized
   ↓
Axios interceptor catch
   ↓
Gọi POST /api/auth/refresh với refresh_token
   ↓
Nhận access_token + refresh_token mới (rotate)
   ↓
Update authStore + localStorage
   ↓
Retry request cũ
```

**Edge case:** Nhiều request đồng thời 401 → dùng `refreshPromise` chung để chỉ refresh 1 lần.

### 9.3 PrivateRoute

```jsx
export function PrivateRoute({ children }) {
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
```

### 9.4 Security checklist MVP

- ✅ Bcrypt hash password (salt rounds = 10)
- ✅ JWT secret >= 32 ký tự, lưu trong `.env`
- ✅ Refresh token random + bcrypt hash + revoke khi rotate
- ✅ Rate limit `/auth/login`: 5 lần/phút/IP
- ✅ CORS whitelist (không dùng `*` ở prod)
- ✅ Helmet middleware (set security headers)
- ⚠️ Refresh token trong localStorage (tradeoff MVP – Phase 2 chuyển httpOnly cookie)

---

## 10. REMINDER ENGINE TRIỂN KHAI

### 10.1 Khi nào tạo reminder record

| Trigger | Reminder tạo |
|---------|--------------|
| Tạo event mới | 1 reminder: `start_time - 15 phút` |
| Sửa event (đổi start_time) | Delete pending reminders cũ + tạo mới |
| Xóa event | Delete pending reminders |
| Tạo task có `due_date` + `priority IN (urgent,high)` | `urgent`: trước 2h. `high`: trước 1 ngày 9:00 sáng |
| Update task → mark done | Delete pending reminders |

### 10.2 Cron job

```javascript
// jobs/reminder.cron.js
const cron = require('node-cron');

// Mỗi phút
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const due = await db('reminders')
    .where('is_sent', false)
    .where('remind_at', '<=', now)
    .limit(500);

  for (const r of due) {
    try {
      await processReminder(r);  // tạo notification + mark is_sent=true
    } catch (err) {
      logger.error({ err, reminderId: r.id }, 'Failed to process reminder');
    }
  }
});

async function processReminder(r) {
  // 1. Lấy event/task để build title
  const ref = r.ref_type === 'event'
    ? await db('events').where({ id: r.ref_id }).first()
    : await db('tasks').where({ id: r.ref_id }).first();

  if (!ref || ref.deleted_at) {
    // Resource đã xóa, skip
    await db('reminders').where({ id: r.id }).update({ is_sent: true, sent_at: new Date() });
    return;
  }

  // 2. Tạo notification record
  await db('notifications').insert({
    user_id:  r.user_id,
    type:     'reminder',
    title:    r.ref_type === 'event' ? `Sắp đến: ${ref.title}` : `Sắp hết hạn: ${ref.title}`,
    body:     buildBody(ref, r.ref_type),
    ref_type: r.ref_type,
    ref_id:   r.ref_id,
  });

  // 3. Mark đã gửi
  await db('reminders').where({ id: r.id }).update({ is_sent: true, sent_at: new Date() });
}
```

### 10.3 Frontend polling

```javascript
// hooks/useNotifications.js
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list({ unread_only: true }),
    refetchInterval: 30 * 1000,  // 30 giây
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30 * 1000,
  });
}
```

> Phase 2 thay polling bằng Server-Sent Events hoặc WebSocket nếu cần real-time hơn.

---

## 11. TIMEZONE & DATETIME HANDLING

> **NGUYÊN TẮC VÀNG:** DB lưu UTC. Frontend convert sang timezone của user khi hiển thị.

### 11.1 Backend

- Tất cả `DATETIME` cột lưu UTC (`new Date()` của Node.js là UTC khi `toISOString()`)
- Khi nhận datetime từ frontend (đã ISO format có `Z`) → MySQL tự parse đúng
- Khi query theo "hôm nay" cho user:
  ```javascript
  const dayjs = require('dayjs');
  require('dayjs/plugin/timezone');
  const startOfDayUTC = dayjs().tz(user.timezone).startOf('day').utc().toDate();
  const endOfDayUTC   = dayjs().tz(user.timezone).endOf('day').utc().toDate();
  ```

### 11.2 Frontend

```javascript
// lib/dateFormat.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/vi';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

export function formatTime(utcString, tz, fmt = 'HH:mm') {
  return dayjs.utc(utcString).tz(tz).format(fmt);
}
export function formatDate(utcString, tz, fmt = 'DD/MM/YYYY') {
  return dayjs.utc(utcString).tz(tz).format(fmt);
}
```

### 11.3 Form input handling

- Date picker trả về local Date object trong timezone user
- Trước khi gửi API → convert sang UTC ISO string:
  ```javascript
  const utcIso = dayjs.tz(localDate, userTz).utc().toISOString();
  ```

---

## 12. ERROR HANDLING STRATEGY

### 12.1 Backend error format chuẩn

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Giờ kết thúc phải sau giờ bắt đầu",
    "details": [
      { "path": "end_time", "message": "..." }
    ]
  }
}
```

### 12.2 Frontend xử lý lỗi

```javascript
// Trong mutation
useMutation({
  mutationFn: tasksApi.create,
  onError: (err) => {
    const code = err.response?.data?.error?.code;
    const msg  = err.response?.data?.error?.message ?? 'Có lỗi xảy ra';

    if (code === 'VALIDATION_ERROR') {
      // hiển thị lỗi cụ thể trên form
    } else if (code === 'UNAUTHORIZED') {
      // axios interceptor sẽ tự handle
    } else {
      toast.error(msg);
    }
  }
});
```

### 12.3 Error Boundary

```jsx
// components/shared/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err, info) { console.error(err, info); /* gửi Sentry Phase 4 */ }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}
```

Bọc mỗi route page với ErrorBoundary.

---

## 13. TESTING & QUALITY

### 13.1 MVP testing strategy (tối giản)

> MVP **không** đầu tư test tự động đầy đủ. Tập trung manual testing theo "Definition of Done" trong file `01_MVP_CORE_FEATURES.md`.

**Phải có:**
- Smoke test thủ công theo user journey (7 bước trong file MVP)
- Validation Zod ở cả 2 phía (free unit test)
- Browser test: Chrome desktop là đủ ở MVP

**Có thì tốt (không bắt buộc):**
- 1–2 integration test cho auth flow (`supertest` + Vitest)
- 1 e2e test happy path (Playwright)

### 13.2 Code quality

```json
// .eslintrc – cả 2 dự án
{
  "extends": ["eslint:recommended", "plugin:react-hooks/recommended"],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

```json
// .prettierrc
{ "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }
```

### 13.3 Git workflow

- Branch: `feature/xxx`, `fix/xxx`
- Commit message: Conventional Commits (`feat:`, `fix:`, `refactor:`)
- PR (nếu làm 1 mình thì self-merge nhưng vẫn tách commit logic)

---

## 14. DEPLOYMENT PLAN

### 14.1 Môi trường MVP

| Layer | Lựa chọn | Cost |
|-------|---------|-----|
| Frontend | **Vercel** (free tier) hoặc **Netlify** | $0 |
| Backend | **Railway** hoặc **Render** | $5–10/tháng |
| Database | **PlanetScale** (MySQL) hoặc Railway MySQL | $0–5/tháng |
| Domain | Optional, dùng subdomain free trước | $0 |

### 14.2 Env variables backend

```bash
# .env (backend)
NODE_ENV=production
PORT=4000

DB_HOST=...
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=personal_calendar

JWT_SECRET=<random-64-chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=https://your-frontend.vercel.app

LOG_LEVEL=info
```

### 14.3 Env variables frontend

```bash
# .env (frontend)
VITE_API_BASE_URL=https://your-backend.up.railway.app/api
```

### 14.4 CI/CD đơn giản

- Push lên `main` → Vercel/Railway tự deploy
- Pre-deploy: `npm run build` phải pass
- Pre-deploy backend: `npm run migrate:latest` (Knex)

### 14.5 Production checklist

- [ ] CORS chỉ allow domain frontend production
- [ ] Helmet middleware bật
- [ ] Rate limit middleware bật
- [ ] DB backup tự động (PlanetScale/Railway có sẵn)
- [ ] Log level = `info` ở prod
- [ ] Không commit `.env` (đã có `.gitignore`)
- [ ] Health check endpoint `GET /api/health` hoạt động
- [ ] Custom 404/500 page frontend

---

## 15. QUY TRÌNH LÀM VIỆC TUẦN-TUẦN

> Đề xuất ~5 tuần cho 1 người làm part-time (2–3h/ngày). Tuần đầu setup thường tốn thời gian hơn dự kiến – đừng nản.

### Tuần 1 – Setup & Auth

**Backend:**
- [ ] Init project, cài Express + Knex + Zod + pino + dotenv
- [ ] Setup MySQL local, viết 7 migrations
- [ ] Module Auth: register/login/refresh/logout/me
- [ ] Module Categories: CRUD + seed default
- [ ] Test thủ công bằng Postman

**Frontend:**
- [ ] Init Vite + React + Tailwind + Shadcn
- [ ] Setup React Router + React Query + Zustand
- [ ] LoginPage + RegisterPage (React Hook Form + Zod)
- [ ] Axios client + interceptor + authStore
- [ ] PrivateRoute + redirect

**Milestone:** Đăng ký, đăng nhập, vào dashboard trống.

### Tuần 2 – Event CRUD + Calendar Month View

**Backend:**
- [ ] Module Events: 6 endpoint
- [ ] Validate end >= start
- [ ] Soft delete

**Frontend:**
- [ ] AppLayout (Sidebar + TopBar)
- [ ] CalendarPage – Month View grid
- [ ] EventForm modal (RHF + Zod)
- [ ] EventChip component
- [ ] EventDetailPanel side panel
- [ ] useEvents hook (React Query)

**Milestone:** Xem lịch tháng, tạo/sửa/xóa event hoạt động.

### Tuần 3 – Task CRUD + Task List View

**Backend:**
- [ ] Module Tasks: 6 endpoint
- [ ] Filter logic (today/overdue/this_week)

**Frontend:**
- [ ] TasksPage với 3 group (Overdue/Today/Upcoming)
- [ ] TaskCard component với checkbox optimistic
- [ ] TaskFilterBar + sort
- [ ] QuickAddInput sticky
- [ ] TaskForm modal
- [ ] useCompleteTask hook (optimistic)

**Milestone:** Quản lý task đầy đủ.

### Tuần 4 – Dashboard + Reminder Engine + Notification

**Backend:**
- [ ] Endpoint `/api/dashboard/today` aggregated
- [ ] Reminder service: tạo reminder khi create event/task
- [ ] Cron job mỗi phút quét + tạo notification
- [ ] Notifications endpoints

**Frontend:**
- [ ] DashboardPage
- [ ] Notification bell + dropdown trong TopBar
- [ ] Polling 30s cho unread count
- [ ] SettingsPage (profile + đổi mật khẩu)

**Milestone:** App đủ dùng end-to-end.

### Tuần 5 – Polish + Deploy

- [ ] Error boundary mọi page
- [ ] Skeleton loading mọi data section
- [ ] Empty state minh hoạ + CTA
- [ ] Toast notifications (sonner)
- [ ] Cleanup console.log, fix warnings
- [ ] Setup Vercel + Railway
- [ ] Run migrations production
- [ ] Smoke test production
- [ ] Viết README

**Milestone:** Deployed, dùng thật được.

---

## 16. CHECKLIST CUỐI CÙNG TRƯỚC KHI BẮT ĐẦU CODE

### Backend setup

- [ ] Node.js 20 LTS đã cài
- [ ] MySQL 8 chạy local (Docker khuyến nghị: `docker run -p 3306:3306 ...`)
- [ ] Tạo DB: `CREATE DATABASE personal_calendar;`
- [ ] Cài Knex CLI: `npm i -g knex` (hoặc dùng npx)
- [ ] `.env` đầy đủ + `.gitignore`

### Frontend setup

- [ ] Vite project init: `npm create vite@latest frontend -- --template react`
- [ ] Tailwind init: `npx tailwindcss init -p`
- [ ] Shadcn init: `npx shadcn-ui@latest init`
- [ ] React Query devtools (chỉ dev)

### Quy tắc làm việc

- [ ] Commit nhỏ, message rõ ràng
- [ ] Không skip Zod validation, kể cả khi "tự tin"
- [ ] DB luôn UTC – đừng quên
- [ ] Test thủ công sau mỗi feature
- [ ] Khi gặp khó: ưu tiên giải pháp đơn giản nhất

---

## 17. ANTI-PATTERNS CẦN TRÁNH

| Đừng làm | Lý do |
|----------|-------|
| Đặt fetch trong useEffect | Dùng React Query thay vì |
| Lưu UTC datetime ở DB rồi vẫn convert manual | dayjs đã có plugin timezone |
| Validate chỉ ở 1 phía | Phải validate cả client + server |
| Try-catch ở mọi route | Dùng errorHandler middleware tập trung |
| Mock data trộn với code thật | Tách rõ, dùng MSW nếu cần |
| Cập nhật state phức tạp trong 1 useState | Tách hook hoặc dùng useReducer |
| Inline anonymous function trong list render lớn | Performance issue → useCallback |
| Không có loading state | Trông như app bị treo |
| Hardcode magic numbers/strings | Constants file |
| Lưu password plaintext (đùa, đừng) | bcrypt là tối thiểu |

---

*Document này là blueprint thực thi. Khi bắt đầu mỗi tuần, mở lại checklist tương ứng. Khi bí chỗ nào, đọc lại section đó. Sau MVP, document sẽ được update để chuyển sang Phase 2.*

*Version 1.0 – Cho MVP, May 2026*
