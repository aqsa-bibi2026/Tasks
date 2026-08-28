# Task 15 — Email Verification Workflow

This is a **single combined full-stack project**.

There are no separate frontend/backend projects. There is only one root `package.json`.

## Included

- React + Vite professional frontend
- Node.js + Express backend
- Supabase PostgreSQL
- Custom register/login
- Password hashing with bcrypt
- Email verification with 6-digit code
- SHA-256 verification-code storage
- Verification-code expiry
- Maximum verification attempts
- Resend verification code
- Resend cooldown
- Old-code invalidation
- Login blocked until email is verified
- JWT HTTP-only cookie after verified login
- Protected account route
- Verification status UI
- Console email mode for easy local testing
- SMTP email mode for real email delivery
- Git-safe `.env` setup
- One `npm install`
- One `npm run dev`

## 1. Install

```powershell
npm install
```

## 2. Create environment file

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`

For easiest testing keep:

```env
EMAIL_MODE=console
```

In console mode, the 6-digit verification code appears in the backend terminal.

## 3. Supabase

Open Supabase → SQL Editor and run:

`supabase/task_15_setup.sql`

## 4. Run frontend + backend together

```powershell
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Database health:
http://localhost:5000/api/v1/health/db

## Local verification test

1. Click **Create account**
2. Register with a real-looking email
3. The app takes you to `/verify`
4. Look at the `[SERVER]` terminal
5. You will see:
   `EMAIL VERIFICATION CODE: 123456`
6. Enter that code
7. Verification succeeds
8. Login
9. Verified dashboard opens

## Real email mode

Change:

```env
EMAIL_MODE=smtp
```

Then fill SMTP variables.

For Gmail, use a Google **App Password**, not your normal Gmail password.

Example:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
EMAIL_FROM="VerifyFlow <your_email@gmail.com>"
```

Restart:

```powershell
npm run dev
```

## Main API routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/resend-verification`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/account/verified-area`
- `GET /api/v1/health`
- `GET /api/v1/health/db`

## Security

The verification code is never stored in plain text in Supabase.
Only a SHA-256 hash is stored.

`.env` is ignored by Git.
Never upload the Supabase backend secret or SMTP password to GitHub.
