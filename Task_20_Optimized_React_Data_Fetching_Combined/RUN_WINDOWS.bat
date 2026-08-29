@echo off
title Task 20 QueryPulse
if not exist .env (
  echo ERROR: Root .env file is missing.
  echo Run: Copy-Item .env.example .env
  pause
  exit /b 1
)
call npm run dev
pause
