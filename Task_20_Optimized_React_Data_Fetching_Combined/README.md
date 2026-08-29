# Task 20 — Optimized React Data Fetching

Business-level combined React + Node.js + Express + Supabase project focused on efficient client data fetching.

## What this task demonstrates

- TanStack Query (`@tanstack/react-query`)
- Query caching
- Request deduplication
- `staleTime` to prevent unnecessary fetches
- `gcTime` cache retention
- Background refetching
- Retry with bounded retry delay
- Manual cache invalidation
- Optimistic-feeling mutation workflow
- Query-key separation by category
- Prefetching another category before the user opens it
- `placeholderData` to avoid UI flicker
- Server-side Supabase reads/writes
- Network request counter for demonstration

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

Set:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_REAL_BACKEND_SECRET
```

### 3. Run Supabase SQL

Run:

```text
supabase/task_20_setup.sql
```

It creates and seeds:

```text
task20_items
```

### 4. Run app

```powershell
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Health:
http://localhost:5000/api/v1/health/db

## How to test optimization

1. Open the app.
2. Switch between `All`, `Analytics`, `Operations`, `Finance`.
3. Switch back to a recently visited category.
4. Cached data should appear immediately without loading flicker.
5. Watch the **API Requests** counter. It should not increase on every UI switch while data is fresh.
6. Click **Refresh data** to invalidate and refetch.
7. Click **Add demo record**. Mutation invalidates relevant cached queries and stats.
8. Leave the tab and return; background refresh can occur based on Query settings.

## GitHub safety

`.env` is ignored.

Before push:

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The real secret scan must be blank.
