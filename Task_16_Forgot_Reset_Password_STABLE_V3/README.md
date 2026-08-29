# Task 16 — Forgot Password & Reset Password System

Single combined full-stack project.

There are no separate frontend/backend projects. There is only one root `package.json`.

## Main features

- React + Vite professional recovery UI
- Node.js + Express backend
- Supabase PostgreSQL
- Register / Login demo
- bcrypt password hashing
- Forgot-password request
- Generic response to reduce account enumeration
- Secure 6-digit reset code
- SHA-256 reset-code hash storage
- Reset-code expiry
- Maximum incorrect attempts
- Reset request cooldown
- Old reset-code invalidation
- Short-lived signed reset ticket after code verification
- Reset ticket bound to reset request and user
- New-password validation
- Prevent reuse of current password
- Existing login JWT invalidated after password change
- Protected dashboard
- Console email mode for easy local testing
- SMTP mode for real emails
- Git-safe `.env`
- One `npm install`
- One `npm run dev`

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

Fill the real Supabase URL and backend secret key.

Use two different long secrets:

```env
JWT_SECRET=Task16AccessTokenSecret2026_ChangeThis_123456
RESET_TICKET_SECRET=Task16ResetTicketSecret2026_ChangeThis_987654
```

For easiest local testing:

```env
EMAIL_MODE=console
```

### 3. Supabase SQL

Run:

`supabase/task_16_setup.sql`

in Supabase SQL Editor.

### 4. Run everything together

```powershell
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Database check:
http://localhost:5000/api/v1/health/db

## Full test flow

### A. Create test account

Register:

```text
Name: Test User
Email: test16@gmail.com
Password: Test12345
```

### B. Forgot password

1. Logout.
2. Open **Forgot password**.
3. Enter `test16@gmail.com`.
4. In `EMAIL_MODE=console`, check the `[SERVER]` terminal.
5. You will see:

```text
PASSWORD RESET CODE: 123456
```

### C. Verify code

Enter the six-digit code.

A short-lived reset ticket is returned internally to the frontend.

### D. Reset password

Example:

```text
New password: NewTest12345
Confirm: NewTest12345
```

### E. Login test

Old password must fail:

```text
Test12345
```

New password must work:

```text
NewTest12345
```

## Real email mode

Change:

```env
EMAIL_MODE=smtp
```

Fill:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM="ResetFlow <your_email@gmail.com>"
```

For Gmail, use a Google App Password, not your normal account password.

## API routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/password/forgot`
- `POST /api/v1/password/verify-code`
- `POST /api/v1/password/reset`
- `POST /api/v1/password/resend`
- `GET /api/v1/account/security`
- `GET /api/v1/health`
- `GET /api/v1/health/db`

## GitHub safety

The root `.gitignore` excludes `.env`.

Before commit:

```powershell
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

Never commit your Supabase backend secret, SMTP password, JWT secret or reset-ticket secret.


## FIXED v2 — Local console verification

When:

```env
NODE_ENV=development
EMAIL_MODE=console
```

the backend still stores only the SHA-256 reset-code hash in Supabase, but it also returns the exact generated code to the local React app for development testing.

The Verify Reset Code page automatically prefills the exact server-generated code. Do not type `123456` or copy a sample code. Simply click **Verify reset code**.

This development helper is disabled when `NODE_ENV=production`.
