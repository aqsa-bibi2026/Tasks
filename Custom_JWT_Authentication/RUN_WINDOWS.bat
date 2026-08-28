@echo off
title Task 12 - JWT Auth App
echo ============================================
echo Starting Backend + Frontend
echo ============================================
if not exist backend\.env (
  echo ERROR: backend\.env is missing.
  echo Copy backend\.env.example to backend\.env and add your Supabase/JWT values.
  pause
  exit /b 1
)
if not exist frontend\.env (
  echo Creating frontend\.env from example...
  copy /Y frontend\.env.example frontend\.env >nul
)
call npm run dev
pause
