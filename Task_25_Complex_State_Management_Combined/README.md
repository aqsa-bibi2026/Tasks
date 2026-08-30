# Task 25 — Complex State Management

A business-level full-stack dashboard demonstrating complex client state using React + Zustand.

## Stack

- React + Vite
- Zustand
- Node.js + Express
- Supabase PostgreSQL

## State Management Features

- Global Zustand store
- Server data + UI state separation
- Search and multi-filter state
- Selected item state
- Drawer/modal state
- Board/list view preference
- Persisted UI preferences
- Optimistic status updates
- Undo last status action
- Loading and error state
- Derived counts/selectors
- Add work item
- Delete work item
- Cross-component synchronization

## Business Demo

`OpsBoard` manages project work items across:

- Backlog
- In Progress
- Review
- Done

Changing a work item's state updates every connected part of the interface immediately.

## Animation

- Animated background
- Floating metric cards
- Board card hover movement
- Drawer transition
- Modal animation
- Success/error toast
- Status transition feedback

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

Add your Supabase URL and backend secret.

### 3. Run SQL

Run this in Supabase SQL Editor:

```text
supabase/task_25_setup.sql
```

### 4. Start

```powershell
npm run dev
```

Expected:

```text
Task 25 backend: http://localhost:5000
SUPABASE CHECK: OK
```

Frontend:

```text
http://localhost:5173
```

## Test

1. Search work items.
2. Filter by priority.
3. Switch Board/List view.
4. Open item details.
5. Move an item to another status.
6. Click Undo.
7. Add a new work item.
8. Delete a work item.
9. Refresh browser and confirm view preference persists.
10. Verify Supabase table rows.

## GitHub Safety

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

Secret scan must be blank.
