# Task 21 — Server-Side Pagination

Complete combined React + Node.js + Express + Supabase pagination project.

## Features
- True server-side pagination with Supabase `.range(from, to)`
- Exact record count and total pages
- First / Previous / numbered / Next / Last controls
- Page sizes: 5, 10, 20, 50
- Server-side sorting
- TanStack Query cache per page
- `placeholderData` keeps old page visible during transitions
- Next-page prefetch
- Add and delete demo records with cache invalidation
- Professional responsive dashboard

## Run
```powershell
npm install
Copy-Item .env.example .env
code .env
```
Add your Supabase URL and backend secret to `.env`.

Run `supabase/task_21_setup.sql` in Supabase SQL Editor, then:
```powershell
npm run dev
```
Frontend: http://localhost:5173
Backend health: http://localhost:5000/api/v1/health/db

## Test
1. Open page 1 and click Next.
2. Click page 3 directly.
3. Change rows per page from 10 to 20.
4. Click Last page.
5. Change sorting.
6. Add demo order and confirm it appears on newest page.
7. Delete a row and verify counts/pages refresh.

## GitHub safety
```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```
Secret scan must be blank.
