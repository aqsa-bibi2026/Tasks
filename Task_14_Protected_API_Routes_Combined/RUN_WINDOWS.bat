@echo off
title Task 14 Protected API Routes
if not exist .env (
  echo ERROR: .env file is missing.
  echo Run this command first:
  echo Copy-Item .env.example .env
  pause
  exit /b 1
)
call npm run dev
pause
