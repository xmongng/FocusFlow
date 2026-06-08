# Cấu trúc Cơ sở dữ liệu (Database Schema)

Dưới đây là sơ đồ thực thể kết nối (ER Diagram) mô tả toàn bộ cấu trúc các bảng và mối quan hệ trong cơ sở dữ liệu của hệ thống FocusFlow, bao gồm cả các chức năng cá nhân (Tasks, Events, Categories), người dùng (Users, Settings, Notifications, AI) và tính năng nhóm (Workspaces, Members, Invites, Task Comments).

```mermaid
erDiagram
    users {
        int id PK
        varchar google_id UK
        varchar reset_token
        datetime reset_token_expiry
        varchar username UK
        varchar email UK
        varchar password
        varchar display_name
        varchar avatar_url
        varchar timezone
        timestamp created_at
        enum plan
        int ai_request_count
        date ai_request_date
    }

    workspaces {
        int id PK
        varchar name
        text description
        int owner_id FK
        varchar color
        int max_members
        timestamp created_at
        timestamp updated_at
    }

    workspace_members {
        int id PK
        int workspace_id FK
        int user_id FK
        enum role
        timestamp joined_at
    }

    workspace_invites {
        int id PK
        int workspace_id FK
        varchar email
        int invited_by FK
        varchar token
        enum status
        timestamp created_at
        datetime expires_at
    }

    tasks {
        int id PK
        int user_id FK
        int category_id FK
        varchar title
        text description
        enum status
        varchar priority
        datetime due_date
        timestamp created_at
        tinyint discord_notified
        varchar email_uid UK
        varchar source
        timestamp updated_at
        int workspace_id FK
        int assigned_to FK
    }

    task_comments {
        int id PK
        int task_id FK
        int user_id FK
        text content
        timestamp created_at
    }

    events {
        int id PK
        int user_id FK
        int category_id FK
        varchar title
        text description
        varchar location
        datetime start_time
        datetime end_time
        tinyint is_all_day
        timestamp created_at
        varchar source
        int workspace_id FK
    }

    categories {
        int id PK
        int user_id FK
        varchar name
        varchar color
        varchar icon
    }

    notifications {
        int id PK
        int user_id FK
        varchar title
        text message
        varchar type
        tinyint is_read
        timestamp created_at
        int reference_id
        varchar reference_type
    }

    reminders {
        int id PK
        int user_id FK
        int event_id FK
        int task_id FK
        datetime remind_at
        enum method
        tinyint is_sent
    }

    recurrence_patterns {
        int id PK
        int event_id FK
        enum frequency
        int interval_value
        varchar days_of_week
        date end_date
    }

    settings {
        int user_id PK
        enum theme
        varchar language
        tinyint notifications_enabled
    }

    ai_interactions {
        int id PK
        int user_id FK
        text prompt
        text response
        json action_suggested
        timestamp created_at
    }

    %% Relationships
    users ||--o{ workspaces : "owns"
    users ||--o{ workspace_members : "joins"
    workspaces ||--o{ workspace_members : "has"
    users ||--o{ workspace_invites : "invites"
    workspaces ||--o{ workspace_invites : "has"
    
    users ||--o{ tasks : "creates"
    users ||--o{ tasks : "is assigned to"
    categories ||--o{ tasks : "contains"
    workspaces ||--o{ tasks : "has"

    users ||--o{ task_comments : "writes"
    tasks ||--o{ task_comments : "has"

    users ||--o{ events : "creates"
    categories ||--o{ events : "contains"
    workspaces ||--o{ events : "has"

    events ||--o| recurrence_patterns : "has"

    users ||--o{ categories : "creates"
    users ||--o{ notifications : "receives"
    
    users ||--o{ reminders : "sets"
    events ||--o{ reminders : "has"
    tasks ||--o{ reminders : "has"

    users ||--|| settings : "configures"
    users ||--o{ ai_interactions : "interacts"
```
