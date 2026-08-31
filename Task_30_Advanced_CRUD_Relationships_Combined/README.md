# Task 30 — Advanced CRUD with Relationships

**Project:** RelateDesk

A spacious, responsive business dashboard for advanced relational CRUD.

## Relationship Model

```text
Clients -> Projects -> Tasks
              |
              +-> Project Members <-> Team Members
```

## Features

- JWT + HTTP-only cookie login
- Client create/read/update/delete
- Project CRUD linked to clients
- Task CRUD linked to projects
- Task assignee relation
- Project/team many-to-many relation
- Relational counts
- Parent deletion protection
- Search and status filters
- Overview metrics
- Client/project detail drawers
- Project member assignment
- Responsive Kanban task board
- Large modern UI with card, page, modal and drawer animations

## Setup

```powershell
npm install
Copy-Item .env.example .env
code .env
```

Fill Supabase URL, backend secret and JWT secret.

Run this SQL in Supabase SQL Editor:

```text
supabase/task_30_setup.sql
```

Then:

```powershell
npm run dev
```

Expected:

```text
Task 30 backend: http://localhost:5000
SUPABASE CHECK: OK
DEMO ADMIN: READY
RELATIONAL SEED: READY
```

Frontend:

```text
http://localhost:5173
```

Demo login:

```text
admin@relatedesk.dev
Admin@12345
```

GitHub safety:

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

Secret scan must be blank.
