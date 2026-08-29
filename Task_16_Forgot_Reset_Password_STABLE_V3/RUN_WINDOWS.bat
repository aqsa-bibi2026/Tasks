@echo off
title Task 16 Password Recovery
if not exist .env (
  echo ERROR: .env file is missing.
  echo Create it with:
  echo Copy-Item .env.example .env
  pause
  exit /b 1
)
call npm run dev
pause
