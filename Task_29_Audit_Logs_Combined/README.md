# Task 29 — Audit Logs

**Project:** AuditVault

A business-level append-only audit logging system using React, Node.js, Express, Supabase and JWT.

## Features
- Secure auditor login
- Automatic LOGIN_SUCCESS / LOGIN_FAILED / LOGOUT events
- Append-only PostgreSQL audit table
- Database trigger blocks UPDATE and DELETE
- SHA-256 chained event hashes
- Integrity verification endpoint
- Actor, action, entity, severity and category tracking
- IP address and user-agent capture
- Before / after / metadata JSON
- Search, severity/category filters, date filters
- Server-side pagination
- Event detail drawer
- CSV export
- Demo audit-event generator
- Animated responsive business UI

## Setup

```powershell
npm install
Copy-Item .env.example .env
code .env
```

Fill `.env`, then run `supabase/task_29_setup.sql` in Supabase SQL Editor.

```powershell
npm run dev
```

Expected:
```text
Task 29 backend: http://localhost:5000
SUPABASE CHECK: OK
DEMO AUDITOR: READY
AUDIT SEED: READY
```

Demo login:
```text
auditor@auditvault.dev
Auditor@12345
```

Frontend:
```text
http://localhost:5173
```

GitHub safety:
```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```
The secret scan must be blank.
