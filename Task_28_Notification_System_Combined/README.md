# Task 28 — Notification System

`PulseNotify` is a complete full-stack business notification center.

## Stack

- React + Vite
- Node.js + Express
- Supabase PostgreSQL
- JWT authentication
- HTTP-only cookies
- bcrypt password hashing

## Core Features

- Secure demo login
- Persistent notifications in Supabase
- Unread notification counter
- All / Unread / Read filters
- Type filters
- Priority filters
- Search
- Mark one notification as read
- Mark all notifications as read
- Delete notifications
- Business notification statistics
- Demo notification generator
- Priority and type badges
- Action buttons
- Responsive animated UI
- Toast feedback
- 401 protection for notification APIs

## Demo Login

```text
Email: user@pulsenotify.dev
Password: User@12345
```

## Setup

### 1. Install

```powershell
npm install
```

### 2. Create `.env`

```powershell
Copy-Item .env.example .env
code .env
```

Fill:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_REAL_BACKEND_SECRET
JWT_SECRET=put-a-long-random-secret-here-at-least-32-characters
```

### 3. Run SQL in Supabase SQL Editor

```text
supabase/task_28_setup.sql
```

### 4. Start

```powershell
npm run dev
```

Expected:

```text
Task 28 backend: http://localhost:5000
SUPABASE CHECK: OK
DEMO USER: READY
DEMO NOTIFICATIONS: READY
```

Frontend:

```text
http://localhost:5173
```

## Testing

1. Login with demo account.
2. Confirm unread count and statistics.
3. Click Unread / Read filters.
4. Search a notification.
5. Mark one notification as read.
6. Click Mark all read.
7. Generate a demo notification.
8. Delete a notification.
9. Refresh browser and confirm persistence.
10. Logout and verify protected notification data is hidden.

## GitHub Safety

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The secret scan must be blank.
