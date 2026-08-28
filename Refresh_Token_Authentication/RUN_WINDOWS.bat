@echo off
title Task 13 Run
if not exist backend\.env (
  echo ERROR: backend\.env is missing.
  pause
  exit /b 1
)
if not exist frontend\.env copy /Y frontend\.env.example frontend\.env >nul
call npm run dev
pause
