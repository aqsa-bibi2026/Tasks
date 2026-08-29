# Task 18 — File Validation System

A complete combined React + Node.js + Express + Supabase Storage project.

## Core objective

Validate files securely **before** they are saved to Supabase Storage.

## Validation implemented

1. Maximum file size check
2. Extension allow-list
3. MIME allow-list
4. File signature / magic-byte verification
5. Text-file binary/null-byte rejection
6. Dangerous double-extension detection
7. Filename sanitization
8. Empty-file rejection
9. Rejected files never reach Supabase Storage
10. Accepted validation report saved with metadata

## Allowed formats

- JPEG: `.jpg`, `.jpeg`
- PNG: `.png`
- PDF: `.pdf`
- Text: `.txt`
- CSV: `.csv`

Default maximum size: **8 MB**

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

Set:

```env
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_REAL_BACKEND_SECRET
```

### 3. Run SQL

Open Supabase SQL Editor and run:

```text
supabase/task_18_setup.sql
```

### 4. Run app

```powershell
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:5000

Storage health:
http://localhost:5000/api/v1/health/storage

## Test cases

### PASS

Upload a real:

- `.jpg`
- `.png`
- `.pdf`
- `.txt`
- `.csv`

### FAIL

Try:

- `.exe`
- file larger than 8 MB
- `photo.jpg.exe`
- rename an EXE to `photo.jpg`
- empty file
- binary file renamed to `.txt`

Rejected files should show validation reasons and must not appear in Supabase Storage.

## GitHub safety

`.env` is ignored.

Before commit:

```powershell
git check-ignore -v .env
git grep --cached -n -E "sb_secret_[A-Za-z0-9_-]{10,}"
```

The secret scan must return nothing.
