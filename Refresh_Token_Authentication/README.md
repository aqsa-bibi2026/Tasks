# Task 13 — Refresh Token Authentication

Complete standalone full-stack implementation of **Task 13**.

## Stack
React + Vite + Axios + Node.js + Express + Supabase + bcrypt + JWT

## Included
- Register / Login
- Short-lived access JWT
- Long-lived refresh JWT
- HTTP-only access + refresh cookies
- Refresh-token rotation
- SHA-256 refresh-token hashes stored in Supabase
- Reuse detection and session revocation
- Protected dashboard
- Manual refresh test button
- Logout current session
- Logout all sessions
- Supabase SQL setup
- Git-safe `.gitignore`

## Setup

### 1. Supabase
Run:
`supabase/task_13_setup.sql`

### 2. Backend env
Copy `backend/.env.example` to `backend/.env` and fill the real values.

Use a backend Supabase **secret key** (`sb_secret_...`) or legacy service-role key.
Never put the secret key in React or GitHub.

### 3. Frontend env
Copy `frontend/.env.example` to `frontend/.env`.

### 4. Install
```bash
npm install
npm run install:all
```

### 5. Run both
```bash
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000  
DB test: http://localhost:5000/api/v1/health/db

## API
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- GET `/api/v1/auth/me`
- POST `/api/v1/auth/logout`
- POST `/api/v1/auth/logout-all`
