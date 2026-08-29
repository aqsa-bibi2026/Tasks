# Task 24 — Reusable Input Components

Business-level full-stack project using React, React Hook Form, Zod, Node.js, Express and Supabase.

## Reusable components
- FormField
- TextInput
- EmailInput
- PasswordInput
- SelectInput
- TextareaInput
- CheckboxInput
- SearchInput
- StatusBadge

## Features
- Shared label/helper/error UI
- Icons and accessible error states
- Password show/hide
- Character counter
- Animated focus/error/success states
- Live component explorer
- Zod validation
- Supabase save flow
- Responsive glassmorphism design

## Run
```powershell
npm install
Copy-Item .env.example .env
code .env
```
Set your Supabase URL and backend secret, then run `supabase/task_24_setup.sql` in Supabase SQL Editor.

```powershell
npm run dev
```
Expected:
```text
Task 24 backend: http://localhost:5000
SUPABASE CHECK: OK
```
Frontend: `http://localhost:5173`
Health: `http://localhost:5000/api/v1/health/db`

## GitHub safety
```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```
Secret scan must be blank.
