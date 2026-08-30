# Task 27 — Role-Based Dashboards

`RoleSphere` is a complete full-stack role-based dashboard application.

## Stack

- React + Vite
- Node.js + Express
- Supabase PostgreSQL
- JWT authentication
- HTTP-only cookies
- bcrypt password hashing

## Roles

- Admin
- Manager
- Member

## Core Features

- Secure login
- HTTP-only JWT authentication cookie
- Backend `requireAuth` middleware
- Backend `requireRole` middleware
- Protected dashboard API
- Different dashboard payloads by role
- Admin user directory
- Manager team workspace
- Member personal task workspace
- Role-based navigation
- 401 unauthorized handling
- 403 forbidden handling
- Logout
- Animated login page
- Animated dashboard cards
- Responsive business UI
- Supabase persistent users/tasks

## Demo Accounts

The backend automatically creates these demo accounts if they do not exist:

### Admin

```text
admin@rolesphere.dev
Admin@12345
```

### Manager

```text
manager@rolesphere.dev
Manager@12345
```

### Member

```text
member@rolesphere.dev
Member@12345
```

These are demo-only credentials for Task 27 testing.

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

### 3. Run SQL

Run in Supabase SQL Editor:

```text
supabase/task_27_setup.sql
```

### 4. Start

```powershell
npm run dev
```

Expected:

```text
Task 27 backend: http://localhost:5000
SUPABASE CHECK: OK
DEMO USERS: READY
```

Frontend:

```text
http://localhost:5173
```

## Role Tests

1. Login as Admin → admin dashboard + user directory.
2. Login as Manager → team dashboard.
3. Login as Member → personal workspace.
4. Open `/api/v1/admin/users` while logged in as Member → 403.
5. Logout → protected dashboard should no longer load.
6. Refresh while logged in → session should remain active.

## GitHub Safety

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The secret scan must be blank.
