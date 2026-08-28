# Task 14 — Protected API Routes with Middleware

This is the **combined single-folder version**.

There are no separate frontend/backend project folders and there is only **one package.json**.

## One-time run

### 1. Install
```powershell
npm install
```

### 2. Create env
```powershell
Copy-Item .env.example .env
```

Open `.env` and enter your real Supabase URL, backend secret key and a long JWT secret.

### 3. Supabase
Run:

`supabase/task_14_setup.sql`

in Supabase SQL Editor.

### 4. Start frontend + backend together
```powershell
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Database test:
http://localhost:5000/api/v1/health/db

## Main Task 14 Features
- React business-level UI
- Node.js + Express API
- Supabase database
- JWT registration/login
- HTTP-only authentication cookie
- `requireAuth` middleware
- `requireRole(...roles)` middleware
- protected profile API
- protected dashboard API
- admin-only API
- 401 Unauthorized response
- 403 Forbidden response
- public route comparison
- safe `.gitignore`
- one root `npm install`
- one root `npm run dev`

## Test account
Register from the website with any valid email and a password containing at least 8 characters, one letter and one number.

New accounts get role `user`.

To make a user admin:
```sql
update public.task14_users
set role = 'admin'
where email = 'your-email@example.com';
```

Then logout and login again.
