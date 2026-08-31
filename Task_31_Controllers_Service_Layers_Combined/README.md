# Task 31 — Express Controllers & Service Layers

**Project Name:** LayerDesk

Business-level service operations dashboard demonstrating:

```text
Routes -> Controllers -> Services -> Repositories -> Supabase
```

## Features
- JWT + HTTP-only cookie login
- Service request CRUD
- Department assignment
- Search + filters
- Priority-driven SLA calculation
- Status transition rules
- Duplicate active-request protection
- In-progress delete protection
- Thin controllers
- Business logic in services
- Supabase-only repository layer
- Centralized errors
- Large responsive animated business UI
- Architecture inspector page

## Setup
```powershell
npm install
Copy-Item .env.example .env
code .env
```
Fill Supabase URL, backend secret and JWT secret.

Run `supabase/task_31_setup.sql` in Supabase SQL Editor.

Then:
```powershell
npm run dev
```
Expected:
```text
Task 31 backend: http://localhost:5000
SUPABASE CHECK: OK
DEMO ADMIN: READY
SERVICE REQUEST SEED: READY
```

Frontend: `http://localhost:5173`

Demo login:
```text
admin@layerdesk.dev
Admin@12345
```

GitHub safety:
```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```
Secret scan must be blank.
