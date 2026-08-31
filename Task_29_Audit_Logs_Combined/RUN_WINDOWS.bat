@echo off
title Task 29 AuditVault
if not exist .env (
  echo Create .env first: Copy-Item .env.example .env
  pause
  exit /b 1
)
call npm run dev
pause
