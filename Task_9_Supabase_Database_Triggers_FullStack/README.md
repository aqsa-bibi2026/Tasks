# Task 9 — Supabase Database Triggers for Automatic Updates

## Assignment Task
Create database triggers for automatic updates.

## Stack
- HTML/CSS/JavaScript
- React.js
- Node.js
- Express.js
- Supabase

## What this project demonstrates

### Trigger 1 — Automatic updated_at
Whenever a row in `task9_projects` is updated, PostgreSQL automatically updates the `updated_at` timestamp.

### Trigger 2 — Automatic audit log
Whenever a project is inserted, updated, or deleted, a trigger automatically writes an entry into `task9_audit_logs`.

### Trigger 3 — Automatic task counter
Whenever tasks are inserted, updated, or deleted, the related project's `task_count` is automatically recalculated.

## Folder Structure

```text
Task_9_Supabase_Database_Triggers_FullStack/
├── client/
├── server/
├── supabase/
│   ├── 01_schema_and_triggers.sql
│   ├── 02_sample_data.sql
│   └── 03_verify.sql
├── package.json
└── README.md
```

## Step 1 — Supabase

Open:

Supabase Dashboard → SQL Editor → New Query

Run files in this order:

1. `supabase/01_schema_and_triggers.sql`
2. `supabase/02_sample_data.sql`
3. `supabase/03_verify.sql`

## Step 2 — Environment Variables

### server/.env

Create:

```env
PORT=5000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=YOUR_PUBLISHABLE_KEY
```

### client/.env

Create:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3 — Install

From project root:

```bash
npm install
npm run install-all
```

## Step 4 — Run

```bash
npm run dev
```

Frontend:
`http://localhost:5173`

Backend:
`http://localhost:5000`

## How to Test

1. Open the React app.
2. Create a project.
3. Edit the project name/status.
4. Check that `updated_at` changes automatically.
5. Add a task.
6. Check that `task_count` increases automatically.
7. Open Audit Logs.
8. You should see automatic INSERT/UPDATE records created by database triggers.

This package completes Task 9 only.
