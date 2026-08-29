# Task 17 — Upload Files to Supabase Storage

Complete combined React + Node.js + Express + Supabase Storage project.

## Features

- React drag-and-drop upload dashboard
- Express + Multer multipart upload API
- Supabase Storage object upload
- PostgreSQL metadata table
- File listing and search
- Temporary signed download URLs
- Delete file from Storage + metadata
- Upload progress
- Storage statistics
- Basic safe file restrictions
- One package.json / one npm install / one npm run dev

## 1. Install

```powershell
npm install
```

## 2. Create `.env`

```powershell
Copy-Item .env.example .env
code .env
```

Set your real:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_REAL_BACKEND_SECRET
```

## 3. Supabase SQL

Run this in Supabase SQL Editor:

```text
supabase/task_17_setup.sql
```

It creates the private bucket `task17-uploads` and table `task17_files`.

## 4. Run

```powershell
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
Health: http://localhost:5000/api/v1/health/storage

## APIs

- `GET /api/v1/health`
- `GET /api/v1/health/storage`
- `GET /api/v1/files`
- `POST /api/v1/files/upload`
- `GET /api/v1/files/:id/download`
- `DELETE /api/v1/files/:id`

## GitHub safety

`.env` is ignored.

Before committing:

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The real secret scan must be blank.
