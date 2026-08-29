# Task 23 — Advanced Form Validation with Zod

A business-level full-stack form validation project using:

- React + Vite
- React Hook Form
- Zod
- Node.js + Express
- Supabase PostgreSQL

## Highlights

- Shared validation philosophy on frontend and backend
- Full name validation
- Professional email validation
- Pakistan/international phone validation
- Company and job role validation
- Optional website URL validation
- Strong password rules
- Confirm-password matching
- Terms acceptance
- Inline field errors
- Error summary
- Password strength indicator
- Backend Zod validation
- Duplicate email prevention
- Supabase persistence
- Animated glassmorphism UI
- Animated progress bar
- Animated background blobs
- Error shake animation
- Success completion animation
- Responsive design

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

Add:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_REAL_BACKEND_SECRET
```

### 3. Run SQL in Supabase

```text
supabase/task_23_setup.sql
```

### 4. Start

```powershell
npm run dev
```

Expected:

```text
Task 23 backend: http://localhost:5000
SUPABASE CHECK: OK
```

Frontend:

```text
http://localhost:5173
```

Health:

```text
http://localhost:5000/api/v1/health/db
```

## Validation Test Ideas

Try invalid values:

- Name: `A`
- Email: `abc`
- Phone: `123`
- Website: `hello`
- Password: `123456`
- Confirm password different from password
- Do not accept terms

Then submit a valid form.

Try submitting the same email again — backend should return duplicate email conflict.

## GitHub Safety

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The secret scan must be blank.
