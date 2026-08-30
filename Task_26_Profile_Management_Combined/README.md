# Task 26 — Profile Management System

Business-level React + Node + Express + Supabase profile-management app.

## Features
- View and edit profile
- React Hook Form + Zod validation
- Avatar upload/remove using Supabase Storage
- JPG/PNG/WebP, max 3 MB
- Profile completion percentage
- Save/cancel state
- Unsaved-change indicator
- Bio character counter
- Toast feedback
- Responsive animated dashboard

## Run
```powershell
npm install
Copy-Item .env.example .env
code .env
npm run dev
```
Before `npm run dev`, run `supabase/task_26_setup.sql` in Supabase SQL Editor.

Frontend: `http://localhost:5173`
Backend health: `http://localhost:5000/api/v1/health/db`
