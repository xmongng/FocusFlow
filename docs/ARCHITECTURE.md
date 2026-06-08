# 🏛️ Kiến Trúc Tổng Quan Hệ Thống (System Architecture)

Hệ thống **Personal Calendar & Tasks Planner** được xây dựng theo kiến trúc **Client-Server (3-Tier Architecture)** decoupled (tách rời độc lập), cho phép mở rộng dễ dàng và vận hành độc lập. Hệ thống kết hợp quản lý lịch trình bản địa, tự động hóa nền (Background Automation), và tích hợp Trí tuệ Nhân tạo (NVIDIA LLM API) để trích xuất và tối ưu hóa thời gian biểu của người dùng.

---

## I. Sơ Đồ Kiến Trúc Tổng Thể (System Architecture Diagram)

Biểu đồ dưới đây mô tả cấu trúc phân tầng từ giao diện người dùng (Frontend UI) tới xử lý nghiệp vụ trung gian (Backend API) và lưu trữ dữ liệu (MySQL DB), kèm theo các dịch vụ tự động hóa và tích hợp AI.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef backend fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef database fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff;
    classDef external fill:#701a75,stroke:#f472b6,stroke-width:2px,color:#fff;
    classDef user fill:#7c2d12,stroke:#fb923c,stroke-width:2px,color:#fff;

    %% Nodes
    User([👤 Người Dùng]) --- FE_UI

    subgraph FE_Layer [Frontend Layer - React & Vite]
        FE_UI[💻 React SPA - Dark Mode / Glassmorphism]
        Zustand[🧠 State Management - Zustand]
        ReactQuery[🔄 Data Fetching & Cache - React Query]
        AxiosClient[🔌 Axios Client - JWT Authentication]
        
        FE_UI <--> Zustand
        FE_UI <--> ReactQuery
        ReactQuery <--> AxiosClient
    end

    subgraph BE_Layer [Backend Layer - Express.js Node]
        BE_Server[🚀 Express Server - Port 5001]
        Auth_MW[🛡️ Auth Middleware - JWT Verify]
        
        subgraph Controllers [Controllers - Logic Nghiệp Vụ]
            TaskCtrl[📋 Task Controller]
            EventCtrl[📅 Event Controller]
            AICtrl[🤖 AI Assistant Controller]
            NotifCtrl[🔔 Notification Controller]
        end

        subgraph Background_Services [Services - Tự Động Hóa Chạy Nền]
            EmailSync[📧 IMAP Email Sync]
            DiscordRemind[💬 Discord Deadlines Alert]
            DataClean[🧹 Monthly Data Cleanup]
        end

        BE_Server <--> Auth_MW
        Auth_MW <--> TaskCtrl
        Auth_MW <--> EventCtrl
        Auth_MW <--> AICtrl
        Auth_MW <--> NotifCtrl
    end

    subgraph DB_Layer [Database Layer - MySQL]
        MySQL[(🗄️ MySQL Database)]
    end

    subgraph Ext_Layer [External Services]
        NVIDIA_AI[🧠 NVIDIA AI API - LLM]
        Gmail_IMAP[✉️ Gmail IMAP Server]
        Discord_Hook[👾 Discord Webhook Channel]
    end

    %% Connections
    AxiosClient <--> |HTTP Requests & JWT| BE_Server
    
    TaskCtrl <--> MySQL
    EventCtrl <--> MySQL
    NotifCtrl <--> MySQL
    
    AICtrl <--> |API Calls| NVIDIA_AI
    
    EmailSync <--> |Quét thư chưa đọc| Gmail_IMAP
    EmailSync -.-> |Lưu việc tự động| MySQL
    
    DiscordRemind <--> |Quét deadline sát hạn| MySQL
    DiscordRemind -.-> |Gửi thông báo| Discord_Hook
    
    DataClean -.-> |Purge dữ liệu > 30 ngày| MySQL

    %% Apply Styles
    class User user;
    class FE_UI,Zustand,ReactQuery,AxiosClient frontend;
    class BE_Server,Auth_MW,TaskCtrl,EventCtrl,AICtrl,NotifCtrl,EmailSync,DiscordRemind,DataClean backend;
    class MySQL database;
    class NVIDIA_AI,Gmail_IMAP,Discord_Hook external;
```

---

## II. Ngăn Xếp Công Nghệ (Technology Stack)

| Phân tầng (Layer) | Công nghệ chính | Vai trò / Lý do lựa chọn |
| :--- | :--- | :--- |
| **Frontend UI** | React + Vite | Tốc độ tải trang siêu tốc (Vite HMR), cấu trúc SPA mượt mà. |
| **Styling (CSS)** | Tailwind CSS + Lucide Icons | Xây dựng giao diện Glassmorphism và Dark Mode hiện đại, nhất quán. |
| **State Management**| Zustand | Lưu trữ thông tin đăng nhập và trạng thái UI cực kỳ gọn nhẹ. |
| **Data Fetching** | React Query (TanStack) | Tự động cache dữ liệu, tối ưu hóa băng thông, đồng bộ realtime. |
| **Backend Server** | Node.js + Express.js | Xử lý bất đồng bộ I/O cực tốt cho đồng thời API và Worker chạy nền. |
| **Cơ sở dữ liệu** | MySQL | Quản lý quan hệ chặt chẽ giữa User, Task, Event và Categories. |
| **Tự động hóa** | Node IMAP & Webhook | Kết nối mail server và gửi thông báo Discord tự động không tốn chi phí. |
| **Trí tuệ nhân tạo** | NVIDIA API (LLM) | Mô hình xử lý ngôn ngữ tự nhiên tối ưu giúp tự động lập lịch biểu. |

---

## III. Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Cơ sở dữ liệu bao gồm 5 bảng chính, có liên kết khóa ngoại chặt chẽ để quản lý quyền sở hữu dữ liệu theo từng người dùng.

```mermaid
erDiagram
    users {
        int id PK
        string google_id UK
        string name
        string email UK
        string password
        timestamp created_at
    }
    categories {
        int id PK
        int user_id FK
        string name
        string color
        timestamp created_at
    }
    tasks {
        int id PK
        int user_id FK
        int category_id FK
        string title
        text description
        string status
        string priority
        datetime due_date
        string email_uid UK
        string source
        tinyint discord_notified
        timestamp updated_at
        timestamp created_at
    }
    events {
        int id PK
        int user_id FK
        string title
        text description
        datetime start_time
        datetime end_time
        string source
        timestamp created_at
    }
    notifications {
        int id PK
        int user_id FK
        string title
        text message
        string type
        tinyint is_read
        timestamp created_at
    }

    users ||--o{ categories : "sở hữu"
    users ||--o{ tasks : "quản lý"
    users ||--o{ events : "lập lịch"
    users ||--o{ notifications : "nhận"
    categories ||--o{ tasks : "phân loại"
```

---

## IV. Sơ Đồ Ánh Xạ Thư Mục Code (Codebase Directory Mapping)

Để đọc hiểu và bảo trì hệ thống hiệu quả, dưới đây là sơ đồ định vị các thành phần cốt lõi:

```text
├── docs/                      # Tài liệu chi tiết các phân hệ hệ thống (Mermaid & Markdown)
│   ├── ARCHITECTURE.md        # [File này] Tổng quan kiến trúc & CSDL
│   ├── CALENDAR_SYSTEM.md     # Hệ thống Lịch Dương/Lịch Âm & Ngày lễ
│   ├── TASK_MANAGEMENT.md     # Quản lý & Lọc công việc thông minh
│   ├── AI_ASSISTANT.md        # Trợ lý ảo AI & Cơ chế lập lịch tự động
│   └── AUTOMATION_SYSTEM.md   # Quét Email IMAP, Nhắc Discord & Dọn dẹp dữ liệu
│
├── frontend/                  # Mã nguồn ứng dụng Giao diện (Client)
│   ├── index.html             # Điểm neo HTML chính cho React SPA
│   ├── src/
│   │   ├── main.jsx           # Khởi tạo React & các Provider toàn cục
│   │   ├── App.jsx            # Component gốc
│   │   ├── routes/            # Quản lý định tuyến và bảo mật trang (AppRouter.jsx)
│   │   ├── stores/            # Quản lý State toàn cục bằng Zustand (authStore, uiStore)
│   │   ├── api/               # Lớp kết nối API Axios (client.js, index.js)
│   │   ├── lib/               # Tiện ích bổ sung: Âm lịch (lunarUtils.js), Định dạng (dateFormat.js)
│   │   └── pages/             # Các trang giao diện chính:
│   │       ├── DashboardPage.jsx  # Bảng điều khiển tích hợp
│   │       ├── CalendarPage.jsx   # Trang Lịch đa chức năng (Âm/Dương)
│   │       ├── TasksPage.jsx      # Quản lý & lọc danh sách công việc
│   │       └── AIAssistant.jsx    # Trò chuyện & Áp dụng lịch từ Trợ lý AI
│
└── backend/                   # Mã nguồn máy chủ & Tự động hóa (Server)
    ├── src/
    │   ├── server.js          # Khởi động máy chủ Express & Automations
    │   ├── config/            # Cấu hình Kết nối CSDL & Di cư (db.js, migrate_db.js)
    │   ├── middleware/        # Middleware xác thực bảo mật JWT (authMiddleware.js)
    │   ├── routes/            # Khai báo các Endpoint định tuyến API (taskRoutes.js, eventRoutes.js,...)
    │   ├── controllers/       # Xử lý nghiệp vụ chính (taskController.js, aiController.js,...)
    │   ├── services/          # Các dịch vụ xử lý phức tạp:
    │   │   ├── ai/            # Planner Service giao tiếp LLM & phân tách kế hoạch
    │   │   └── automationService.js # Quét Email IMAP, Nhắc nhở Discord, Dọn dẹp hàng tháng
    │   └── utils/             # Các hàm tiện ích bổ trợ lọc email, thời gian
    └── .env                   # Cấu hình biến môi trường cục bộ (Cổng, Database, Webhook, API keys)
```
