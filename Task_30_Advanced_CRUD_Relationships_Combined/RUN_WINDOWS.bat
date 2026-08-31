@echo off
title Task 30 RelateDesk
if not exist .env (
  echo Create .env first using: Copy-Item .env.example .env
  pause
  exit /b 1
)
call npm run dev
pause
