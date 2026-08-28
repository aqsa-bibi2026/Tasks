# Task 12 — Custom Authentication Flow Using JWT

A complete full-stack implementation of **Task 12** from the "50 Full Stack Development Tasks" list.

## Stack
- React + Vite
- React Router
- Axios
- Node.js
- Express
- Supabase PostgreSQL
- bcryptjs password hashing
- jsonwebtoken (JWT)
- HTTP-only cookie authentication

## Features
- Professional landing page
- User registration
- User login
- Password hashing with bcrypt
- Custom JWT generation
- JWT verification middleware
- HTTP-only auth cookie
- Protected `/api/v1/auth/me` route
- Protected React dashboard
- Logout
- Persistent session check on refresh
- Supabase database schema
- Centralized backend error handling
- Helmet security headers
- CORS configured for cookie authentication
- Environment variable templates
- Windows helper scripts

## 1. Create the Supabase table
Open **Supabase > SQL Editor** and run:

`supabase/task_12_setup.sql`

## 2. Configure backend environment
Copy:

`backend/.env.example` -> `backend/.env`

Fill these values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

Use a long random JWT secret (at least 32 characters).

> The Supabase **service role key must only be used in the backend**. Never place it in the React app.

## 3. Configure frontend environment
Copy:

`frontend/.env.example` -> `frontend/.env`

The default local URL already points to:

`http://localhost:5000/api/v1`

## 4. Install
From the project root:

```bash
npm install
npm run install:all
```

## 5. Run frontend + backend together
```bash
npm run dev
```

Frontend:
- http://localhost:5173

Backend:
- http://localhost:5000

Health check:
- http://localhost:5000/api/v1/health

## API Routes
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (protected)
- `POST /api/v1/auth/logout`

## Security Design
Passwords are never stored as plain text. The backend hashes them using bcrypt. After a successful login/register, the backend creates a signed JWT and stores it in an HTTP-only cookie, so normal frontend JavaScript cannot read the token directly.

Task 13 (refresh tokens) is intentionally **not included**, because this package is only Task 12.
