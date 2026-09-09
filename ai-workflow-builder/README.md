# AI Workflow Builder

A portfolio-level full-stack workflow builder using React, React Flow, Zustand, Express, Zod and Supabase.

## Features
- Drag workflow nodes from palette to canvas
- Connect nodes visually
- Configure node title and description in inspector
- Save workflows through Express API
- Supabase persistence when credentials are configured
- In-memory fallback when Supabase is not configured
- Run workflow simulation and view execution logs
- Responsive premium dark UI

## Run
1. Install Node.js 18+
2. From project root:
   ```bash
   npm install
   npm run dev
   ```
3. Frontend: http://localhost:5173
4. Backend: http://localhost:5000

## Supabase setup (optional)
Copy `server/.env.example` to `server/.env` and add credentials.

Create table:
```sql
create table if not exists workflows (
  id text primary key,
  name text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

If Supabase is not configured, the app still works with in-memory storage while the server is running.
